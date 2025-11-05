# Music Player Developer Guide

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Component Structure](#component-structure)
3. [Hook Documentation](#hook-documentation)
4. [State Management](#state-management)
5. [Audio Engine Details](#audio-engine-details)
6. [Integration Points](#integration-points)
7. [Testing Strategy](#testing-strategy)
8. [Performance Considerations](#performance-considerations)
9. [Known Issues & Limitations](#known-issues--limitations)
10. [Future Improvements](#future-improvements)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      MusicPlayer.tsx                         │
│  (Main Component - Orchestration & State Management)        │
└───────────────┬──────────────────┬──────────────────────────┘
                │                  │
    ┌───────────▼─────────┐   ┌────▼───────────────┐
    │  MetronomeControl   │   │   PitchControl     │
    │   (UI Component)    │   │   (UI Component)   │
    └───────────┬─────────┘   └────┬───────────────┘
                │                  │
    ┌───────────▼─────────┐   ┌────▼───────────────┐
    │   useMetronome      │   │   usePitchShift    │
    │   (Hook)            │   │   (Hook)           │
    └───────────┬─────────┘   └────┬───────────────┘
                │                  │
    ┌───────────▼─────────┐   ┌────▼───────────────┐
    │   expo-av (Audio)   │   │   expo-av (Sound)  │
    │   Metronome Sounds  │   │   Pitch Shifting   │
    └─────────────────────┘   └────────────────────┘

    ┌──────────────────────────────────────────────┐
    │        react-native-track-player            │
    │        (TrackPlayer + service.js)            │
    │        A-B Loop Background Support           │
    └──────────────────────────────────────────────┘
```

### Audio Engine Strategy

The player uses **two audio engines** depending on active features:

1. **TrackPlayer Mode** (Default)
   - Used when: No pitch adjustment active
   - Features: A-B loop, background playback, standard controls
   - Implementation: `react-native-track-player` with `service.js`

2. **expo-av Mode** (Pitch Active)
   - Used when: Pitch control enabled
   - Features: Pitch shifting, tempo preservation
   - Limitation: No A-B loop support (expo-av limitation)

3. **Metronome** (Independent)
   - Always uses expo-av Sound
   - Runs independently of main playback
   - Syncs with A-B loop restart events

---

## Component Structure

### 1. MusicPlayer.tsx (Main Component)

**Responsibilities**:
- Initialize TrackPlayer and expo-av Sound
- Manage global state (metronome, pitch, A-B loop)
- Synchronize between TrackPlayer and expo-av
- Coordinate feature interactions

**Key State Variables**:
```typescript
// Metronome
const [metronomeEnabled, setMetronomeEnabled] = useState(false);
const [metronomeBpm, setMetronomeBpm] = useState(120);
const [metronomeVolume, setMetronomeVolume] = useState(0.7);

// Pitch
const [pitchEnabled, setPitchEnabled] = useState(false);
const [pitchSemitones, setPitchSemitones] = useState(0);
const [expoSound, setExpoSound] = useState<Audio.Sound | null>(null);

// A-B Loop
const [abLoop, setAbLoop] = useState({
  a: null,
  b: null,
  enabled: false
});
```

**Critical Effects**:
1. **TrackPlayer Initialization** (lines 52-171)
   - Checks if already initialized (prevents duplicates)
   - Sets up capabilities and options
   - Loads sample track
   - Cleanup on unmount

2. **expo-av Sound Loading** (lines 174-211)
   - Loads same audio for pitch control
   - Sets audio mode for mixing
   - Cleanup on unmount

3. **Pitch Sync** (lines 214-251)
   - Switches between TrackPlayer ↔ expo-av
   - Preserves playback position
   - Handles play/pause state

4. **A-B Loop Detection** (lines 262-279)
   - Monitors progress.position
   - Detects backward jumps (B → A)
   - Triggers metronome reset

### 2. MetronomeControl.tsx

**Location**: `app/components/MusicPlayer/MetronomeControl.tsx`

**Purpose**: UI controls for metronome settings

**Props**:
```typescript
interface MetronomeControlProps {
  enabled: boolean;
  bpm: number;
  volume: number;
  currentBeat: number;
  totalBeats: number;
  isReady: boolean;
  error: string | null;
  onToggle: () => void;
  onBpmChange: (bpm: number) => void;
  onVolumeChange: (volume: number) => void;
}
```

**Features**:
- ON/OFF toggle button
- BPM slider (40-240)
- Volume slider (0-100%)
- Visual beat indicator
- Ready state display
- Error message display

### 3. PitchControl.tsx

**Location**: `app/components/MusicPlayer/PitchControl.tsx`

**Purpose**: UI controls for pitch adjustment

**Props**:
```typescript
interface PitchControlProps {
  enabled: boolean;
  semitones: number;
  onPitchChange: (semitones: number) => void;
  onReset: () => void;
  onToggle: () => void;
}
```

**Features**:
- ON/OFF toggle button
- +/- buttons for semitone adjustment
- Current semitone display
- Reset button
- Platform warning (Android quality notice)

---

## Hook Documentation

### useMetronome Hook

**File**: `app/hooks/useMetronome.ts`

**Purpose**: Manages metronome timing, sound playback, and beat counting

**Parameters**:
```typescript
interface UseMetronomeProps {
  bpm: number;              // 40-240 BPM
  enabled: boolean;         // Activation state
  volume?: number;          // 0.0-1.0 (default: 0.7)
  timeSignature?: {         // Default: 4/4
    beats: number;
    noteValue: number;
  };
}
```

**Return Value**:
```typescript
interface UseMetronomeReturn {
  currentBeat: number;      // Current beat (0-indexed)
  totalBeats: number;       // Total beats in measure
  isReady: boolean;         // Sound loaded successfully
  error: string | null;     // Error message if any
  resetBeat: () => void;    // Reset to beat 0 (for A-B loop)
}
```

**Implementation Details**:

1. **Sound Loading** (useEffect, lines 63-151)
   - Loads metronome-high.wav and metronome-low.wav
   - Sets up audio session for mixing
   - Graceful fallback if files missing (visual-only mode)
   - Cleanup on unmount

2. **Volume Control** (useEffect, lines 154-171)
   - Updates volume when prop changes
   - Applies to both high/low sounds

3. **Metronome Execution** (useEffect, lines 174-233)
   - Calculates interval: `60000 / bpm` milliseconds
   - Uses `setInterval` for timing
   - Plays high tick on first beat (强拍)
   - Plays low tick on other beats (弱拍)
   - Updates currentBeat state
   - Wraps around at timeSignature.beats

**Key Design Decisions**:
- Uses `useRef` for sound objects (prevents re-creation)
- Uses `beatCounterRef` instead of state (avoids closure issues)
- Immediate first beat on enable (`playTick()` before interval)
- Robust error handling (continues counting even if sound fails)

**Timing Accuracy**:
- JavaScript `setInterval` accuracy: ±5-10ms
- Acceptable for music practice
- For sub-millisecond accuracy, Web Audio API required (not available in React Native)

### usePitchShift Hook

**File**: `app/hooks/usePitchShift.ts`

**Purpose**: Applies pitch shifting to expo-av Sound using rate adjustment

**Parameters**:
```typescript
interface UsePitchShiftProps {
  sound: Audio.Sound | null;  // expo-av Sound instance
  semitones: number;          // -6 to +6 recommended
  enabled: boolean;           // Activation state
}
```

**Return Value**: None (side effect only)

**Implementation Details**:

1. **Pitch Calculation** (line 41)
   ```typescript
   const rate = Math.pow(2, semitones / 12);
   ```
   - Based on equal temperament tuning
   - Examples:
     - +2 semitones: 2^(2/12) ≈ 1.122 (12.2% faster)
     - -2 semitones: 2^(-2/12) ≈ 0.891 (10.9% slower)

2. **setRateAsync Call** (lines 45-49)
   ```typescript
   await sound.setRateAsync(
     rate,
     true,  // shouldCorrectPitch: maintain tempo
     Audio.PitchCorrectionQuality.High
   );
   ```

3. **Platform Differences**:
   - **iOS**: Full support with high quality
   - **Android**: Basic support, quality may vary

**Limitations**:
- expo-av doesn't support A-B loop natively
- Extreme pitch shifts (>6 semitones) may reduce quality
- No real-time pitch analysis (just simple rate adjustment)

---

## State Management

### Component-Level State

All state is managed in **MusicPlayer.tsx** (no global store needed):

```typescript
// Local state (useState)
- metronomeEnabled, metronomeBpm, metronomeVolume
- pitchEnabled, pitchSemitones
- abLoop { a, b, enabled }
- expoSound, isPitchReady
- isInitialized, initStatus

// Refs (useRef)
- prevPositionRef: Tracks previous playback position for loop detection

// TrackPlayer Hooks
- playbackState: usePlaybackState()
- progress: useProgress()

// Custom Hooks
- { currentBeat, totalBeats, isReady, error, resetBeat } = useMetronome(...)
- usePitchShift(...) // Side effect only
```

### Global State (service.js)

TrackPlayer service maintains:
- A-B loop state: `global.abLoop`
- Loop check interval: `global.abLoopCheckInterval`
- Initialization flag: `global.isPlayerInitialized`

**Why global?**: Background playback requires service-level state

---

## Audio Engine Details

### TrackPlayer (react-native-track-player)

**Pros**:
- ✅ Native performance
- ✅ Background playback support
- ✅ Lock screen controls
- ✅ A-B loop via service.js

**Cons**:
- ❌ No built-in pitch shifting
- ❌ Complex setup (requires service registration)
- ❌ Platform-specific issues (Android/iOS differences)

**Key Configuration** (MusicPlayer.tsx lines 102-116):
```typescript
await TrackPlayer.updateOptions({
  capabilities: [
    Capability.Play,
    Capability.Pause,
    Capability.SeekTo,
  ],
  progressUpdateEventInterval: 1,  // 1 second updates
});
```

### expo-av (Audio & Sound)

**Audio (Metronome)**:
- Simple sound playback
- Low latency
- Easy to use

**Sound (Pitch Shifting)**:
- Supports `setRateAsync` with pitch correction
- `shouldCorrectPitch: true` maintains tempo
- `PitchCorrectionQuality.High` for best results

**Key Configuration** (MusicPlayer.tsx lines 180-185):
```typescript
await Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  playsInSilentModeIOS: true,
  staysActiveInBackground: true,
  shouldDuckAndroid: true,  // Lower other audio
});
```

---

## Integration Points

### 1. Metronome ↔ A-B Loop Sync

**Problem**: Metronome should restart beat count when A-B loop restarts

**Solution**: Position jump detection (lines 262-279)

```typescript
useEffect(() => {
  if (!abLoop.enabled || !metronomeEnabled) return;

  const currentPosition = progress.position;

  // Detect backward jump (B → A)
  if (currentPosition < prevPositionRef.current - 1 &&
      Math.abs(currentPosition - abLoop.a) < 2) {
    resetBeat();  // Reset metronome to beat 0
  }

  prevPositionRef.current = currentPosition;
}, [progress.position, abLoop, metronomeEnabled, resetBeat]);
```

**Algorithm**:
1. Monitor `progress.position` every render
2. Detect position decrease >1 second
3. Check if new position is near A point (±2 seconds)
4. If both true, call `resetBeat()`

### 2. TrackPlayer ↔ expo-av Switch

**Problem**: Pitch requires expo-av, but A-B loop requires TrackPlayer

**Solution**: Dynamic switching (lines 214-251)

```typescript
useEffect(() => {
  const syncPlayback = async () => {
    if (pitchEnabled) {
      // Save TrackPlayer position
      const currentPosition = progress.position;
      await TrackPlayer.pause();

      // Resume on expo-av
      await expoSound.setPositionAsync(currentPosition * 1000);
      await expoSound.playAsync();
    } else {
      // Save expo-av position
      const status = await expoSound.getStatusAsync();
      const expoPosition = status.positionMillis / 1000;
      await expoSound.pauseAsync();

      // Resume on TrackPlayer
      await TrackPlayer.seekTo(expoPosition);
      if (playbackState?.state === State.Playing) {
        await TrackPlayer.play();
      }
    }
  };

  syncPlayback();
}, [pitchEnabled]);
```

**Trade-off**: A-B loop unavailable in pitch mode

### 3. service.js Integration

**File**: `service.js` (project root)

**Purpose**: Background A-B loop processing

**Key Functions**:
```typescript
global.setABLoop = (enabled, a, b) => {
  global.abLoop = { enabled, a, b };
  if (enabled) {
    startABLoopCheck();
  } else {
    stopABLoopCheck();
  }
};

global.isPlayerInitialized = () => {
  return global.playerInitialized === true;
};
```

**A-B Loop Check** (runs every 500ms):
```typescript
function startABLoopCheck() {
  global.abLoopCheckInterval = setInterval(async () => {
    const position = await TrackPlayer.getPosition();
    if (position >= global.abLoop.b) {
      await TrackPlayer.seekTo(global.abLoop.a);
    }
  }, 500);
}
```

---

## Testing Strategy

### Unit Testing

**Target**: Individual hooks

```typescript
// Test useMetronome
describe('useMetronome', () => {
  it('should increment currentBeat every interval', async () => {
    const { result } = renderHook(() =>
      useMetronome({ bpm: 120, enabled: true })
    );

    await waitFor(() => {
      expect(result.current.currentBeat).toBe(1);
    }, { timeout: 600 }); // 120 BPM = 500ms interval
  });

  it('should reset beat when resetBeat() called', () => {
    // ... test implementation
  });
});
```

### Integration Testing

**Scenarios**:
1. ✅ Metronome only
2. ✅ Pitch only
3. ✅ A-B loop only
4. ✅ Metronome + A-B loop (with reset sync)
5. ✅ Pitch + Metronome
6. ⚠️ Pitch + A-B loop (unavailable, should show warning)
7. ⚠️ All three (should gracefully disable A-B loop)

### Manual Testing Checklist

See `docs/METRONOME_TESTING_GUIDE.md` and `docs/PITCH_TEST_GUIDE.md`

---

## Performance Considerations

### Memory Management

**Metronome Sounds**:
- Loaded once on mount
- Reused via `setPositionAsync(0)`
- Properly unloaded on unmount

**expo-av Sound**:
- Created once for pitch control
- Large audio file kept in memory
- Trade-off: Memory vs. loading time

**Optimization Opportunity**:
- Stream audio instead of full load
- Use smaller metronome samples
- Lazy load pitch sound only when needed

### Timing Accuracy

**setInterval Drift**:
- JavaScript timers drift over time
- Acceptable for BPM 40-240 (±5-10ms per beat)
- Cumulative drift over long sessions

**Better Solution (Future)**:
- Use Web Audio API (not available in React Native)
- Use native modules for timing
- Implement drift correction algorithm

### Battery Usage

**Current Impact**:
- Metronome: Minimal (interval timer + small sounds)
- Pitch: Moderate (continuous playback)
- A-B loop: Minimal (background service)

**Optimization**:
- Stop interval when metronome disabled
- Release audio resources when inactive
- Use lower quality pitch on Android (save CPU)

---

## Known Issues & Limitations

### 1. Pitch + A-B Loop Incompatibility

**Issue**: Can't use both simultaneously

**Root Cause**:
- A-B loop requires TrackPlayer (service.js)
- Pitch requires expo-av (setRateAsync)
- Can't use two players on same audio simultaneously

**Workaround**: User must choose one or the other

**Future Fix**:
- Implement A-B loop in expo-av (custom logic)
- OR find TrackPlayer pitch plugin
- OR use Web Audio API (if available)

### 2. Metronome Timing Variance

**Issue**: ±5-10ms timing inaccuracy

**Root Cause**: JavaScript `setInterval` not real-time

**Impact**: Minimal for music practice, but not pro-grade

**Future Fix**: Native module or Web Audio API

### 3. Android Pitch Quality

**Issue**: Lower quality than iOS

**Root Cause**: Android audio stack differences

**Impact**: Acceptable for practice, not for production

**Mitigation**: Document in user guide, show warning in UI

### 4. TypeScript Errors in e2e Tests

**Issue**: Detox types not found (e2e/examples/auth.e2e.ts)

**Root Cause**: Missing @types/detox or improper setup

**Impact**: Doesn't affect runtime, only compilation

**Fix**: Install proper types or exclude e2e from tsconfig.json

### 5. ESLint Not Configured

**Issue**: `npm run lint` fails (no config file)

**Root Cause**: Missing .eslintrc.js

**Impact**: Can't enforce code style automatically

**Fix**: Run `npm init @eslint/config` (see next section)

---

## Future Improvements

### Short-Term (v0.2.0)

1. **Fix TypeScript Errors**
   - Add Detox types
   - Fix compilation warnings

2. **Add ESLint Config**
   - Install eslint-config
   - Add .eslintrc.js
   - Enforce consistent code style

3. **Add JSDoc Comments**
   - Complete documentation for all public APIs
   - Generate API docs

4. **Improve Error Handling**
   - User-friendly error messages
   - Graceful degradation on audio failures

5. **Add Loading States**
   - Show spinner during sound loading
   - Disable controls until ready

### Mid-Term (v0.3.0)

1. **Implement expo-av A-B Loop**
   - Custom loop logic for pitch mode
   - Enable pitch + A-B loop combo

2. **Add Metronome Patterns**
   - Different time signatures (3/4, 6/8)
   - Accent patterns
   - Subdivisions

3. **Persist Settings**
   - Save BPM, volume, pitch preferences
   - Restore on next launch

4. **Add Visualizer**
   - Waveform display
   - Real-time beat animation

### Long-Term (v1.0.0)

1. **Native Metronome Module**
   - Sub-millisecond accuracy
   - Lower battery usage

2. **Professional Pitch Shifting**
   - Phase vocoder algorithm
   - Formant preservation
   - Higher quality

3. **Multiple Track Support**
   - Separate vocal/instrument tracks
   - Per-track volume control

4. **Cloud Sync**
   - Save songs and settings to cloud
   - Cross-device synchronization

---

## Development Setup

### Prerequisites
```bash
node >= 20.0.0
npm >= 9.0.0
expo-cli
```

### Installation
```bash
cd simple-firebase-starter
npm install
```

### Run Development Build
```bash
# iOS
npm run ios

# Android
npm run android
```

### TypeScript Check
```bash
npx tsc --noEmit
```

### Add ESLint (Not yet configured)
```bash
npm init @eslint/config
# Choose: React Native, TypeScript, Expo presets
```

### Add Metronome Sounds

**Required Files**:
- `app/assets/sounds/metronome-high.wav`
- `app/assets/sounds/metronome-low.wav`

**Format**: WAV, mono, 44.1kHz, <100KB

**How to Generate**:
1. Use online metronome sound generator
2. Export high pitch (800-1200 Hz) as metronome-high.wav
3. Export low pitch (400-600 Hz) as metronome-low.wav
4. Place in `app/assets/sounds/`

---

## Code Style Guide

### File Organization
```
app/
  components/
    MusicPlayer.tsx          # Main component
    MusicPlayer/
      MetronomeControl.tsx   # Sub-components
      PitchControl.tsx
  hooks/
    useMetronome.ts          # Custom hooks
    usePitchShift.ts
  assets/
    sounds/
      metronome-high.wav     # Audio files
      metronome-low.wav
```

### Naming Conventions
- **Components**: PascalCase (MusicPlayer, MetronomeControl)
- **Hooks**: camelCase with "use" prefix (useMetronome, usePitchShift)
- **Files**: Match component name (MusicPlayer.tsx, useMetronome.ts)
- **Props interfaces**: ComponentNameProps (MetronomeControlProps)

### TypeScript Best Practices
- Always define interfaces for props
- Use explicit types for state
- Avoid `any` type
- Document complex types

### React Best Practices
- Use functional components
- Extract logic to custom hooks
- Use `useCallback` for event handlers
- Use `useRef` for non-visual state
- Clean up effects (return cleanup function)

---

## Debugging Tips

### Metronome Issues

**Problem**: Sounds not loading
```typescript
// Check logs
console.log('✅ 메트로놈 사운드 로드 완료');  // Success
console.warn('⚠️ 메트로놈 사운드 파일 로드 실패');  // Warning
```

**Solution**: Check file paths, ensure files exist

### Pitch Issues

**Problem**: No pitch change
```typescript
// Check logs
console.log(`✅ Pitch shifted by ${semitones} semitones (rate: ${rate})`);
console.error('❌ Pitch shift 적용 오류');
```

**Solution**: Verify expo-av Sound is loaded, check platform support

### A-B Loop Issues

**Problem**: Loop not working
```typescript
// Check global state
console.log(global.abLoop);  // { enabled, a, b }
console.log(typeof global.setABLoop);  // 'function'
```

**Solution**: Ensure service.js loaded, check TrackPlayer initialization

---

## API Reference

### useMetronome

```typescript
const {
  currentBeat,   // number: Current beat index (0-based)
  totalBeats,    // number: Total beats in measure
  isReady,       // boolean: Sounds loaded successfully
  error,         // string | null: Error message
  resetBeat,     // () => void: Reset to beat 0
} = useMetronome({
  bpm: 120,              // number (40-240)
  enabled: true,         // boolean
  volume: 0.7,           // number (0.0-1.0), optional
  timeSignature: {       // optional
    beats: 4,
    noteValue: 4,
  },
});
```

### usePitchShift

```typescript
usePitchShift({
  sound: expoSound,      // Audio.Sound | null
  semitones: 2,          // number (-6 to +6)
  enabled: true,         // boolean
});
// No return value (side effect only)
```

---

## Contributing

### Pull Request Process
1. Create feature branch
2. Implement feature with tests
3. Update documentation
4. Run TypeScript check
5. Run linter
6. Submit PR with description

### Commit Message Format
```
feat: Add metronome volume control
fix: Fix A-B loop reset timing
docs: Update developer guide
refactor: Extract pitch logic to hook
test: Add metronome timing tests
```

---

**Last Updated**: November 4, 2025
**Version**: 0.1.0
**Maintainer**: Development Team
