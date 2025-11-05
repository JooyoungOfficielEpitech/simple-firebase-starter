# Music Player User Guide

## Overview

The Music Player provides professional music practice features including:
- **Metronome**: Adjustable tempo with visual beat indicator
- **Pitch Control**: Transpose songs to match your vocal range
- **A-B Loop**: Repeat specific sections for practice

---

## Features

### 1. Metronome

Practice with a steady tempo that stays in sync with your music.

#### How to Use
1. **Enable Metronome**: Tap the "Metronome ON/OFF" button
2. **Adjust BPM**: Use the slider to set tempo (40-240 BPM)
   - 40-60 BPM: Slow practice
   - 80-120 BPM: Moderate tempo
   - 140-240 BPM: Fast practice
3. **Adjust Volume**: Use the volume slider (0-100%)
4. **Visual Feedback**: Watch the beat indicator show current beat

#### Features
- ✅ Strong beat (first beat) plays a high-pitched click
- ✅ Weak beats play a lower-pitched click
- ✅ Visual beat counter shows position in measure (1/4, 2/4, etc.)
- ✅ Syncs with A-B loop restart

#### Tips
- Use lower BPM for learning difficult sections
- Gradually increase BPM as you improve
- The metronome continues even when paused

---

### 2. Pitch Control

Transpose songs to match your vocal range without changing tempo.

#### How to Use
1. **Enable Pitch**: Tap the "Pitch ON/OFF" button
2. **Adjust Semitones**: Use the +/- buttons
   - Negative values: Lower pitch (male key)
   - Positive values: Raise pitch (female key)
   - Range: -6 to +6 semitones
3. **Reset**: Tap "Reset" to return to original pitch (0 semitones)

#### Platform Compatibility
- **iOS**: ✅ High-quality pitch shifting (PitchCorrectionQuality.High)
- **Android**: ⚠️ Basic pitch shifting (audio quality may vary)

#### Important Notes
- 🎵 Switching to pitch mode changes the audio engine from TrackPlayer to expo-av
- ⚠️ A-B loop is **not available** in pitch mode (technical limitation)
- 💡 Disable pitch to re-enable A-B loop functionality

#### Recommended Settings
- **For Male Singers**: -2 to -4 semitones
- **For Female Singers**: +2 to +4 semitones
- **Extreme Ranges**: ±6 semitones (may affect audio quality)

---

### 3. A-B Loop

Repeat specific sections of a song for focused practice.

#### How to Use
1. **Play the Song**: Start playback first
2. **Set Point A**: Tap "A 설정" at the start of the section
3. **Set Point B**: Tap "B 설정" at the end of the section
4. **Enable Loop**: Tap "루프 OFF" to activate (changes to "백그라운드 루프 ON")
5. **Clear Loop**: Tap "루프 해제" to reset both points

#### Visual Indicators
- **Red Marker**: Point A (loop start)
- **Green Marker**: Point B (loop end)
- **Progress Bar**: Shows current position

#### Features
- ✅ **Background Support**: Loop continues even when app is in background
- ✅ **Metronome Sync**: Metronome beat resets when loop restarts
- ✅ **Precise Control**: Set points to the second

#### Tips
- Set A and B points while listening to find the perfect loop
- Use with metronome for rhythm practice
- Use without pitch control (pitch mode disables A-B loop)

---

## Feature Combinations

### Recommended Combinations

#### 1. Rhythm Practice
- ✅ Metronome + A-B Loop
- **Use Case**: Master timing and rhythm
- **How**: Loop a challenging section, practice with metronome

#### 2. Key Adjustment Practice
- ✅ Pitch + Metronome
- **Use Case**: Sing in comfortable key with steady tempo
- **How**: Adjust pitch to your range, use metronome for timing

#### 3. Basic Loop Practice
- ✅ A-B Loop Only
- **Use Case**: Repeat sections without additional tools
- **How**: Focus on melody or lyrics

### Unavailable Combinations

#### ❌ Pitch + A-B Loop
- **Status**: Not supported
- **Reason**: Pitch mode uses expo-av (no A-B loop support)
- **Workaround**: Practice with A-B loop first, then practice with pitch

#### ⚠️ Metronome + Pitch + A-B Loop
- **Status**: Partially supported
- **Available**: Metronome + Pitch
- **Unavailable**: A-B loop when pitch is active

---

## Playback Controls

### Play/Pause Button
- **Icon**: ▶️ (Play) / ⏸️ (Pause)
- **Function**: Start/stop playback
- **Works in**: Both normal mode and pitch mode

### Progress Bar
- Shows current playback position
- Displays total duration
- Shows A-B loop markers (red and green)

### Status Display
- **Initialization Status**: Shows player setup progress
- **Playback State**: Current player state
- **Active Features**: Shows which features are enabled
  - 🎵 Metronome active (XXX BPM)
  - 🎹 Pitch adjustment active (±X semitones)
  - 🔄 A-B loop active (A - B seconds)

---

## Troubleshooting

### Metronome Issues

**Problem**: No metronome sound
- **Solution 1**: Check volume slider is not at 0
- **Solution 2**: Check device volume
- **Solution 3**: Metronome may work in silent mode (visual only)

**Problem**: Metronome timing is off
- **Solution**: This is expected with JavaScript timers (±5-10ms variance)
- **Note**: Professional metronomes use Web Audio API (not available in React Native)

### Pitch Issues

**Problem**: Poor audio quality on Android
- **Explanation**: Android has limited pitch correction support
- **Solution**: Use iOS device for best results, or accept reduced quality

**Problem**: A-B loop disappeared when pitch enabled
- **Explanation**: This is expected behavior (technical limitation)
- **Solution**: Disable pitch to restore A-B loop

### A-B Loop Issues

**Problem**: Loop not working
- **Check 1**: Both A and B points are set
- **Check 2**: Loop is enabled (button shows "백그라운드 루프 ON")
- **Check 3**: Pitch mode is disabled

**Problem**: Metronome doesn't reset at loop point
- **Check**: Metronome is enabled
- **Note**: Reset occurs when playback jumps from B to A (may take 1 second)

---

## FAQ

### General Questions

**Q: Can I use this in the background?**
A: Yes, A-B loop works in background. Metronome and pitch work in foreground.

**Q: Why can't I use pitch and A-B loop together?**
A: Technical limitation - they use different audio engines (TrackPlayer vs expo-av).

**Q: Does the metronome use phone resources?**
A: Yes, minimal CPU/battery. Designed to be efficient with interval timers.

### Feature-Specific Questions

**Q: What's the most accurate BPM range for metronome?**
A: All BPMs are equally accurate (±5ms), but slower BPMs are more noticeable if off.

**Q: Can I save my pitch settings?**
A: Not in current version. Settings reset when you close the player.

**Q: How precise are the A-B loop points?**
A: Precise to 1 second. Set while playing for best accuracy.

**Q: Can I change A-B points while looping?**
A: Yes, just tap A or B again to update the point.

---

## Best Practices

### For Music Practice
1. **Start Slow**: Use low BPM metronome
2. **Loop Small Sections**: 4-8 bars at a time
3. **Gradually Increase**: Add 5-10 BPM when comfortable
4. **Match Your Key**: Adjust pitch before starting practice

### For Vocal Training
1. **Find Your Range**: Use pitch control to find comfortable key
2. **Practice with Metronome**: Build timing and pitch together
3. **Record Progress**: Note which pitch works best
4. **Warm Up**: Start with easier sections

### Battery Optimization
- Disable metronome when not needed
- Use lower metronome volume
- Avoid rapid on/off toggling

---

## Keyboard Shortcuts / Quick Actions

### Metronome
- **Enable**: Tap ON/OFF button
- **Quick BPM**: Common BPMs (60, 80, 100, 120, 140) - future feature

### Pitch
- **Quick Reset**: Tap "Reset" button
- **Fine Tune**: Use +/- buttons for single semitone adjustments

### A-B Loop
- **Quick Clear**: Tap "루프 해제" button
- **Quick Toggle**: Tap loop button to enable/disable

---

## Version Information

**Current Version**: 0.1.0

**New in This Version**:
- ✅ Metronome with BPM control (40-240)
- ✅ Pitch shift (-6 to +6 semitones)
- ✅ A-B loop background support
- ✅ Metronome-loop synchronization

**Known Limitations**:
- A-B loop unavailable in pitch mode
- Android pitch quality lower than iOS
- Metronome timing accuracy ±5-10ms

---

## Support

For technical issues or feature requests, please check:
- Developer documentation: `DEVELOPER_GUIDE.md`
- Project completion report: `PROJECT_COMPLETION_REPORT.md`
- Phase documentation in `/docs` folder

---

**Last Updated**: November 4, 2025
**Version**: 0.1.0
