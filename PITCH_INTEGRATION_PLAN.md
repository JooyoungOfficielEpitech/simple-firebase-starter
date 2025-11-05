# 🎹 Pitch 기능 통합 방안

빌드 실패 시 또는 네이티브 모듈 링크 안될 경우 대안 방안

---

## 📊 현재 상황 분석

### ✅ 이미 완료된 것
- `expo-pitch-shift` 네이티브 모듈 구현 완료 (iOS/Android)
- `usePitchShift` hook 활성화
- `PitchControl` UI 컴포넌트
- `AudioPlayer`에 통합 완료

### ❌ 문제점
1. **네이티브 모듈 링크 실패**: `Cannot find native module 'ExpoPitchShift'`
2. **TrackPlayer 통합 없음**: `ExpoPitchShiftModule`이 `AVAudioUnitTimePitch`를 생성하지만 실제 오디오 파이프라인에 연결 안 됨

### 🔍 TrackPlayer 분석 결과
- ✅ `TrackPlayer.setRate()` 존재 (속도 조절, 템포 변경)
- ❌ `TrackPlayer.setPitch()` 없음 (음정 조절 불가)
- ✅ `pitchAlgorithm` 속성 있음 (알고리즘 타입만, 값 변경 불가)
- 내부적으로 SwiftAudioEx 사용

---

## 🎯 해결 방안 3가지

### **Plan A: TrackPlayer 네이티브 확장** (⭐ 가장 권장)

**개요**: TrackPlayer의 SwiftAudioEx에 pitch 기능 추가

**장점**:
- ✅ 완벽한 통합 (끊김 없음)
- ✅ 실시간 피치 조절
- ✅ TrackPlayer 기능 모두 유지
- ✅ 사용자 경험 최고

**단점**:
- ❌ 네이티브 코드 수정 필요 (중급 난이도)
- ❌ TrackPlayer 업데이트 시 재작업 필요

**구현 방법**:

#### 1. SwiftAudioEx 확장
```swift
// ios/Pods/SwiftAudioEx/SwiftAudioEx/Classes/AudioPlayer.swift
// 또는 로컬 복사본

import AVFoundation

extension AudioPlayer {
    // Pitch unit 추가
    private lazy var pitchUnit: AVAudioUnitTimePitch = {
        let unit = AVAudioUnitTimePitch()
        unit.pitch = 0.0
        unit.rate = 1.0
        return unit
    }()

    // AVAudioEngine에 pitch unit 연결
    func attachPitchUnit() {
        audioEngine.attach(pitchUnit)
        audioEngine.connect(playerNode, to: pitchUnit, format: nil)
        audioEngine.connect(pitchUnit, to: audioEngine.mainMixerNode, format: nil)
    }

    // Pitch 설정 메서드
    public func setPitch(_ semitones: Float) {
        pitchUnit.pitch = semitones * 100.0 // semitones → cents
    }
}
```

#### 2. RNTrackPlayer에 setPitch 추가
```swift
// node_modules/react-native-track-player/ios/RNTrackPlayer/RNTrackPlayer.swift

@objc(setPitch:resolve:reject:)
public func setPitch(pitch: Float, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    guard let player = player else {
        reject("player_not_initialized", "The player is not initialized", nil)
        return
    }

    player.setPitch(pitch)
    resolve(pitch)
}
```

#### 3. JavaScript 바인딩
```typescript
// app/services/trackPlayerPitch.ts
import { NativeModules } from 'react-native';

const { RNTrackPlayer } = NativeModules;

export async function setPitch(semitones: number): Promise<void> {
  await RNTrackPlayer.setPitch(semitones);
}

export async function getPitch(): Promise<number> {
  return await RNTrackPlayer.getPitch();
}
```

#### 4. Hook 수정
```typescript
// app/hooks/usePitchShift.ts
import { setPitch } from '@/services/trackPlayerPitch';

export const usePitchShift = ({ semitones, enabled }: UsePitchShiftProps) => {
  useEffect(() => {
    const pitch = enabled ? semitones : 0;
    setPitch(pitch);
  }, [semitones, enabled]);
};
```

---

### **Plan B: NotificationCenter 브릿지 방식** (⚖️ 중간 난이도)

**개요**: ExpoPitchShift가 보내는 NotificationCenter 알림을 TrackPlayer가 수신

**장점**:
- ✅ expo-pitch-shift 모듈 그대로 사용
- ✅ TrackPlayer 코드 최소 수정
- ✅ 두 모듈 독립적 유지

**단점**:
- ⚠️ 알림 기반이라 약간의 지연 가능
- ❌ 여전히 TrackPlayer 네이티브 수정 필요

**구현 방법**:

#### 1. RNTrackPlayer에 NotificationCenter 리스너 추가
```swift
// node_modules/react-native-track-player/ios/RNTrackPlayer/RNTrackPlayer.swift

override init() {
    super.init()

    // ExpoPitchShift 알림 구독
    NotificationCenter.default.addObserver(
        self,
        selector: #selector(handlePitchChange(_:)),
        name: Notification.Name("PitchShiftChanged"),
        object: nil
    )
}

@objc private func handlePitchChange(_ notification: Notification) {
    guard let pitch = notification.userInfo?["pitch"] as? Double else { return }

    // SwiftAudioEx에 pitch 적용
    player?.setPitch(Float(pitch))
}
```

#### 2. usePitchShift는 그대로 사용
```typescript
// app/hooks/usePitchShift.ts
import * as ExpoPitchShift from 'expo-pitch-shift';

export const usePitchShift = ({ semitones, enabled }: UsePitchShiftProps) => {
  useEffect(() => {
    const pitch = enabled ? semitones : 0;
    ExpoPitchShift.setPitch(pitch);
    // NotificationCenter를 통해 TrackPlayer로 전달됨
  }, [semitones, enabled]);
};
```

---

### **Plan C: Expo AV 전환 방식** (🚀 가장 빠름, UX 타협)

**개요**: 피치 사용 시 TrackPlayer 정지 → expo-av 재생

**장점**:
- ✅ 네이티브 코드 수정 불필요
- ✅ expo-av는 pitch 완벽 지원
- ✅ 구현 가장 간단 (1-2시간)

**단점**:
- ❌ 플레이어 전환 시 끊김 발생
- ❌ TrackPlayer 기능 (background, notification) 상실
- ❌ 사용자 경험 저하

**구현 방법**:

#### 1. Dual Player Hook 작성
```typescript
// app/hooks/useAudioPlayer.ts
import { Audio } from 'expo-av';
import TrackPlayer from 'react-native-track-player';

export const useAudioPlayer = () => {
  const [playerType, setPlayerType] = useState<'trackplayer' | 'expoav'>('trackplayer');
  const [expoSound, setExpoSound] = useState<Audio.Sound | null>(null);

  // 피치 활성화 시 expo-av로 전환
  const enablePitch = async (audioUrl: string) => {
    // 1. TrackPlayer 정지
    await TrackPlayer.pause();
    const position = await TrackPlayer.getPosition();

    // 2. expo-av 로드
    const { sound } = await Audio.Sound.createAsync(
      { uri: audioUrl },
      { positionMillis: position * 1000 }
    );

    setExpoSound(sound);
    setPlayerType('expoav');
    await sound.playAsync();
  };

  // 피치 비활성화 시 TrackPlayer로 복귀
  const disablePitch = async () => {
    if (!expoSound) return;

    // 1. expo-av 위치 가져오기
    const status = await expoSound.getStatusAsync();
    const position = status.isLoaded ? status.positionMillis / 1000 : 0;

    // 2. expo-av 정지
    await expoSound.unloadAsync();
    setExpoSound(null);

    // 3. TrackPlayer 재개
    await TrackPlayer.seekTo(position);
    await TrackPlayer.play();
    setPlayerType('trackplayer');
  };

  return { playerType, enablePitch, disablePitch, expoSound };
};
```

#### 2. AudioPlayer 수정
```typescript
// app/components/AudioPlayer.tsx
const { playerType, enablePitch, disablePitch, expoSound } = useAudioPlayer();

// 피치 토글 시
const handlePitchToggle = async () => {
  const newEnabled = !pitchEnabled;
  setPitchEnabled(newEnabled);

  if (newEnabled) {
    await enablePitch(audioUrl);
  } else {
    await disablePitch();
  }
};

// expo-av 피치 적용
useEffect(() => {
  if (playerType === 'expoav' && expoSound && pitchEnabled) {
    expoSound.setRateAsync(1.0, true, { pitch: pitchSemitones / 12 });
  }
}, [pitchSemitones, expoSound, pitchEnabled, playerType]);
```

---

## 📋 권장 선택 기준

| 상황 | 권장 방안 |
|------|-----------|
| 네이티브 개발 가능 + 최고 품질 원함 | **Plan A** |
| expo-pitch-shift 모듈 활용하고 싶음 | **Plan B** |
| 빠르게 프로토타입 만들고 싶음 | **Plan C** |
| 시간이 없음 | **Plan C** |

---

## 🚀 다음 단계

### 빌드 성공 시:
1. expo-pitch-shift 모듈이 제대로 링크되었는지 확인
2. 실제 피치 조절이 작동하는지 테스트
3. 작동 안 하면 → Plan A 또는 Plan B 실행

### 빌드 실패 시:
1. Plan C로 빠르게 프로토타입 구현
2. 나중에 시간 있을 때 Plan A로 업그레이드

---

## 📝 메모

- TrackPlayer는 `setRate()`만 지원 (템포 변경)
- Pitch(음정)와 Rate(속도)는 다름
  - Rate 2.0 = 2배 빠르게 + 음정도 2배 높아짐
  - Pitch +12 semitones = 음정만 1옥타브 높아짐, 속도 유지
- AVAudioUnitTimePitch는 둘 다 독립적으로 조절 가능
