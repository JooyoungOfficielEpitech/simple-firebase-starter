# 뮤직 플레이어 고급 기능 구현 가이드

## 🚀 빠른 시작

### 1. 필요한 패키지 확인
```bash
# 이미 설치됨
expo-av: ^15.1.7  ✅
react-native-track-player: ^4.1.2  ✅
```

### 2. 메트로놈 사운드 파일 다운로드
```bash
# assets/sounds/ 디렉토리 생성
mkdir -p app/assets/sounds

# 메트로놈 사운드 파일 추가 필요
# - metronome-high.mp3 (강박용)
# - metronome-low.mp3 (약박용)
```

**사운드 파일 추천 소스**:
- Freesound.org
- 직접 생성 (Audacity 사용)

---

## 📦 Phase 1: 메트로놈 기본 구현

### Step 1: 메트로놈 Hook 생성

**파일**: `app/hooks/useMetronome.ts`

```typescript
import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

interface UseMetronomeProps {
  bpm: number;
  enabled: boolean;
  volume?: number;
  timeSignature?: { beats: number; noteValue: number };
}

export const useMetronome = ({
  bpm,
  enabled,
  volume = 0.7,
  timeSignature = { beats: 4, noteValue: 4 },
}: UseMetronomeProps) => {
  const [currentBeat, setCurrentBeat] = useState(0);
  const highTick = useRef<Audio.Sound | null>(null);
  const lowTick = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 사운드 로드
  useEffect(() => {
    const loadSounds = async () => {
      try {
        const high = new Audio.Sound();
        const low = new Audio.Sound();

        await high.loadAsync(require('../assets/sounds/metronome-high.mp3'));
        await low.loadAsync(require('../assets/sounds/metronome-low.mp3'));

        highTick.current = high;
        lowTick.current = low;

        await high.setVolumeAsync(volume);
        await low.setVolumeAsync(volume);
      } catch (error) {
        console.error('메트로놈 사운드 로드 실패:', error);
      }
    };

    loadSounds();

    return () => {
      highTick.current?.unloadAsync();
      lowTick.current?.unloadAsync();
    };
  }, []);

  // 볼륨 업데이트
  useEffect(() => {
    highTick.current?.setVolumeAsync(volume);
    lowTick.current?.setVolumeAsync(volume);
  }, [volume]);

  // 메트로놈 실행
  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setCurrentBeat(0);
      return;
    }

    const interval = 60000 / bpm; // ms per beat

    const playTick = async () => {
      try {
        const sound = currentBeat === 0 ? highTick.current : lowTick.current;
        if (sound) {
          await sound.setPositionAsync(0);
          await sound.playAsync();
        }

        setCurrentBeat((prev) => (prev + 1) % timeSignature.beats);
      } catch (error) {
        console.error('메트로놈 재생 오류:', error);
      }
    };

    // 초기 즉시 재생
    playTick();

    // 이후 interval로 반복
    timerRef.current = setInterval(playTick, interval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, bpm, currentBeat, timeSignature.beats]);

  return { currentBeat, totalBeats: timeSignature.beats };
};
```

### Step 2: 메트로놈 컨트롤 UI

**파일**: `app/components/MusicPlayer/MetronomeControl.tsx`

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

interface MetronomeControlProps {
  enabled: boolean;
  bpm: number;
  volume: number;
  currentBeat: number;
  totalBeats: number;
  onToggle: () => void;
  onBpmChange: (bpm: number) => void;
  onVolumeChange: (volume: number) => void;
}

export const MetronomeControl: React.FC<MetronomeControlProps> = ({
  enabled,
  bpm,
  volume,
  currentBeat,
  totalBeats,
  onToggle,
  onBpmChange,
  onVolumeChange,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>메트로놈</Text>
        <TouchableOpacity
          style={[styles.toggleButton, enabled && styles.toggleButtonActive]}
          onPress={onToggle}
        >
          <Text style={styles.toggleText}>{enabled ? 'ON' : 'OFF'}</Text>
        </TouchableOpacity>
      </View>

      {/* BPM 슬라이더 */}
      <View style={styles.control}>
        <Text style={styles.label}>템포</Text>
        <Slider
          style={styles.slider}
          minimumValue={40}
          maximumValue={240}
          step={1}
          value={bpm}
          onValueChange={onBpmChange}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#ddd"
          disabled={!enabled}
        />
        <Text style={styles.value}>{bpm} BPM</Text>
      </View>

      {/* 볼륨 슬라이더 */}
      <View style={styles.control}>
        <Text style={styles.label}>볼륨</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          step={0.01}
          value={volume}
          onValueChange={onVolumeChange}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#ddd"
          disabled={!enabled}
        />
        <Text style={styles.value}>{Math.round(volume * 100)}%</Text>
      </View>

      {/* 박자 표시기 */}
      {enabled && (
        <View style={styles.beatIndicator}>
          {Array.from({ length: totalBeats }, (_, i) => (
            <View
              key={i}
              style={[
                styles.beat,
                i === currentBeat && styles.beatActive,
                i === 0 && styles.beatFirst,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleButton: {
    backgroundColor: '#ccc',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toggleButtonActive: {
    backgroundColor: '#34C759',
  },
  toggleText: {
    color: 'white',
    fontWeight: 'bold',
  },
  control: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  value: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  beatIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  beat: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
  },
  beatActive: {
    backgroundColor: '#007AFF',
    transform: [{ scale: 1.3 }],
  },
  beatFirst: {
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
});
```

### Step 3: MusicPlayer에 통합

**파일**: `app/components/MusicPlayer.tsx` (수정)

```typescript
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { MetronomeControl } from './MusicPlayer/MetronomeControl';
import { useMetronome } from '../hooks/useMetronome';

const MusicPlayer = () => {
  // 기존 상태들...

  // 메트로놈 상태
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const [metronomeBpm, setMetronomeBpm] = useState(120);
  const [metronomeVolume, setMetronomeVolume] = useState(0.7);

  const { currentBeat, totalBeats } = useMetronome({
    bpm: metronomeBpm,
    enabled: metronomeEnabled,
    volume: metronomeVolume,
  });

  return (
    <View style={styles.container}>
      {/* 기존 컴포넌트들... */}

      {/* 메트로놈 컨트롤 추가 */}
      <MetronomeControl
        enabled={metronomeEnabled}
        bpm={metronomeBpm}
        volume={metronomeVolume}
        currentBeat={currentBeat}
        totalBeats={totalBeats}
        onToggle={() => setMetronomeEnabled(!metronomeEnabled)}
        onBpmChange={setMetronomeBpm}
        onVolumeChange={setMetronomeVolume}
      />
    </View>
  );
};
```

---

## 🎼 Phase 2: Pitch 조절 구현

### Step 1: Pitch Shift Hook

**파일**: `app/hooks/usePitchShift.ts`

```typescript
import { useEffect } from 'react';
import { Audio } from 'expo-av';

interface UsePitchShiftProps {
  sound: Audio.Sound | null;
  semitones: number; // -6 ~ +6
  enabled: boolean;
}

export const usePitchShift = ({ sound, semitones, enabled }: UsePitchShiftProps) => {
  useEffect(() => {
    if (!sound || !enabled) return;

    const applyPitchShift = async () => {
      try {
        // 반음(semitone) = 2^(1/12) 비율
        const rate = Math.pow(2, semitones / 12);

        // pitch correction을 활성화하여 템포는 그대로, 피치만 변경
        await sound.setRateAsync(
          rate,
          true, // shouldCorrectPitch
          Audio.PitchCorrectionQuality.High
        );

        console.log(`Pitch shifted by ${semitones} semitones (rate: ${rate.toFixed(3)})`);
      } catch (error) {
        console.error('Pitch shift 적용 오류:', error);
      }
    };

    applyPitchShift();
  }, [sound, semitones, enabled]);
};
```

### Step 2: Pitch 컨트롤 UI

**파일**: `app/components/MusicPlayer/PitchControl.tsx`

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

interface PitchControlProps {
  semitones: number;
  onPitchChange: (semitones: number) => void;
  onReset: () => void;
}

export const PitchControl: React.FC<PitchControlProps> = ({
  semitones,
  onPitchChange,
  onReset,
}) => {
  const renderPitchLabel = (semitones: number) => {
    if (semitones === 0) return '원본 키';
    const symbol = semitones > 0 ? '♯' : '♭';
    const count = Math.abs(semitones);
    return `${semitones > 0 ? '+' : ''}${semitones} (${symbol.repeat(count)})`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>키 조절</Text>
        <TouchableOpacity style={styles.resetButton} onPress={onReset}>
          <Text style={styles.resetText}>초기화</Text>
        </TouchableOpacity>
      </View>

      {/* Pitch 슬라이더 */}
      <View style={styles.control}>
        <View style={styles.labelRow}>
          <Text style={styles.rangeLabel}>-6</Text>
          <Text style={styles.currentValue}>{renderPitchLabel(semitones)}</Text>
          <Text style={styles.rangeLabel}>+6</Text>
        </View>

        <Slider
          style={styles.slider}
          minimumValue={-6}
          maximumValue={6}
          step={1}
          value={semitones}
          onValueChange={onPitchChange}
          minimumTrackTintColor="#FF9500"
          maximumTrackTintColor="#ddd"
        />
      </View>

      {/* 프리셋 버튼 */}
      <View style={styles.presets}>
        <TouchableOpacity
          style={styles.presetButton}
          onPress={() => onPitchChange(-2)}
        >
          <Text style={styles.presetText}>남성 -2</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.presetButton}
          onPress={() => onPitchChange(2)}
        >
          <Text style={styles.presetText}>여성 +2</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.presetButton}
          onPress={() => onPitchChange(-12)}
          disabled={true} // 1옥타브는 향후 지원
        >
          <Text style={[styles.presetText, styles.presetTextDisabled]}>
            1옥타브 하 (준비 중)
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>
        💡 반음 단위로 키를 조절할 수 있습니다. 템포는 변하지 않습니다.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  resetText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  control: {
    marginBottom: 15,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  rangeLabel: {
    fontSize: 12,
    color: '#999',
  },
  currentValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  presets: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  presetButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
  },
  presetText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  presetTextDisabled: {
    color: '#999',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
});
```

---

## ⚠️ 중요 제약사항 및 해결방안

### 1. Pitch 조절 제약
**문제**: `react-native-track-player`는 pitch shift를 네이티브로 지원하지 않음

**해결방안**:
- **Option A**: `expo-av`로 오디오 재생 전환
  ```typescript
  const sound = new Audio.Sound();
  await sound.loadAsync({ uri: audioUrl });
  await sound.setRateAsync(rate, true, Audio.PitchCorrectionQuality.High);
  ```

- **Option B**: 두 라이브러리 병행 사용
  ```typescript
  // TrackPlayer: 백그라운드 재생, A-B 루프
  // expo-av: Pitch 조절이 필요한 경우
  ```

- **Option C**: 추가 라이브러리 도입
  ```bash
  # react-native-sound (pitch 지원)
  npm install react-native-sound
  ```

### 2. 메트로놈 타이밍 정확도
**문제**: `setInterval`은 정확하지 않음 (±10ms 오차)

**해결방안**:
```typescript
// Web Audio API 사용 (웹 플랫폼)
const audioContext = new AudioContext();
const scheduleAheadTime = 0.1; // 100ms 미리 스케줄링

// 또는 react-native-metronome 라이브러리 검토
```

### 3. 플랫폼별 차이
**iOS**: expo-av pitch 조절 완벽 지원 ✅
**Android**: 제한적 지원, 음질 저하 가능 ⚠️
**Web**: Web Audio API 사용 권장 ✅

---

## 🧪 테스트 체크리스트

### 메트로놈
- [ ] BPM 40, 120, 240에서 정확도 확인
- [ ] 볼륨 조절 동작 확인
- [ ] A-B 루프 재시작 시 박자 리셋 확인
- [ ] 백그라운드에서 메트로놈 중지 확인

### Pitch
- [ ] -6 ~ +6 반음 모두 테스트
- [ ] 템포 변화 없이 피치만 변경 확인
- [ ] 음질 저하 여부 평가
- [ ] iOS/Android 플랫폼 차이 확인

---

## 📚 다음 단계

1. **Phase 1 완료 후**: 메트로놈 기능 사용자 테스트
2. **Phase 2 완료 후**: Pitch 기술 검증 (플랫폼별)
3. **통합 테스트**: 모든 기능 동시 사용
4. **최적화**: 성능 및 배터리 소모 개선

---

**작성일**: 2025-11-04
**업데이트**: 구현 진행 시 수정 예정
