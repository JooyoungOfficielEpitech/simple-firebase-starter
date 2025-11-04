# 뮤직 플레이어 고급 기능 추가 기획

## 📋 개요

음악 플레이어에 메트로놈과 키 조절 기능을 추가하여 음악 연습 및 학습 경험을 향상시킵니다.

---

## 🎯 기능 요구사항

### 1. 메트로놈 기능

#### 기능 설명
- 음악 재생 중 메트로놈 소리를 동시 재생
- 박자에 맞춰 정확한 타이밍으로 틱 소리 제공
- 시각적 표시기로 박자를 눈으로도 확인 가능

#### 세부 스펙
- **템포 범위**: 40 BPM ~ 240 BPM
  - 기본값: 120 BPM
  - 조절 단위: 1 BPM
- **박자**: 4/4 박자 (기본), 향후 3/4, 6/8 등 확장 가능
- **소리 종류**:
  - 강박 (첫 박): 높은 톤 비프음
  - 약박 (나머지): 낮은 톤 비프음
- **활성/비활성**: 토글 버튼
- **볼륨 조절**: 0% ~ 100% (음악 재생음과 독립적)

#### UI/UX 요구사항
```
┌─────────────────────────────────┐
│  메트로놈                        │
│  [ON/OFF 토글]                  │
│                                 │
│  템포: [40] ━━●━━━━━━━ [240]    │
│         120 BPM                 │
│                                 │
│  볼륨: [0%] ━━━●━━━━━ [100%]    │
│         70%                     │
│                                 │
│  박자 표시기: ● ○ ○ ○           │
│  (현재 박 강조)                 │
└─────────────────────────────────┘
```

---

### 2. 키(Pitch) 조절 기능

#### 기능 설명
- 음원의 전체 키를 반음 단위로 조절
- 템포는 변경하지 않고 피치만 변경 (Time-stretching)
- 악기 연습이나 노래 연습 시 본인의 음역대에 맞춰 조절 가능

#### 세부 스펙
- **조절 범위**: -6 ~ +6 반음 (semitone)
  - 기본값: 0 (원본)
  - 조절 단위: 1 반음
- **표시 형식**:
  - -6: "♭♭♭♭♭♭" 또는 "-6 반음"
  - 0: "원본 키"
  - +6: "♯♯♯♯♯♯" 또는 "+6 반음"
- **실시간 적용**: 슬라이더 조절 시 즉시 반영

#### UI/UX 요구사항
```
┌─────────────────────────────────┐
│  키 조절                         │
│                                 │
│  [-6] ━━━━━━●━━━━━━ [+6]        │
│         0 (원본 키)              │
│                                 │
│  프리셋:                        │
│  [남성 -2] [여성 +2] [초기화]   │
└─────────────────────────────────┘
```

---

## 🏗️ 기술 아키텍처

### 현재 기술 스택
- **오디오 재생**: `react-native-track-player` v4.1.2
- **추가 오디오**: `expo-av` v15.1.7

### 구현 방식

#### 1. 메트로놈 구현

**방법 A: expo-av 사용 (추천)**
```typescript
// 장점: 추가 라이브러리 불필요, 정확한 타이밍
// 단점: 메인 음악과 별도 관리 필요

import { Audio } from 'expo-av';

const metronomeSound = new Audio.Sound();
await metronomeSound.loadAsync(require('./assets/metronome-tick.mp3'));

// setInterval로 BPM에 맞춰 재생
const interval = 60000 / bpm; // ms
```

**방법 B: Web Audio API (웹 플랫폼용)**
```typescript
// 장점: 정밀한 타이밍, 지연 없음
// 단점: 웹 플랫폼만 지원

const audioContext = new AudioContext();
// Oscillator를 사용한 비프음 생성
```

#### 2. 키 조절 구현

**방법 A: expo-av의 pitchCorrectionQuality (제한적)**
```typescript
// react-native-track-player는 pitch 조절 미지원
// expo-av로 전환하거나 병행 필요

import { Audio } from 'expo-av';

const sound = new Audio.Sound();
await sound.loadAsync({ uri: audioUrl });

// Pitch 조절 (iOS만 완벽 지원)
await sound.setRateAsync(1.0, true, Audio.PitchCorrectionQuality.High);
```

**방법 B: 추가 라이브러리 도입 검토**
```
react-native-sound - pitch 조절 지원
또는
톤.js (Tone.js) - 웹 플랫폼용 고급 오디오 처리
```

**⚠️ 제약사항**:
- `react-native-track-player`는 기본적으로 pitch shift 미지원
- iOS: `expo-av` + `AVAudioTimePitchAlgorithm` 사용 가능
- Android: 네이티브 모듈 또는 FFmpeg 활용 필요

**권장 방안**:
1. **단기**: `expo-av`로 오디오 재생 전환 (pitch 지원)
2. **중기**: Pitch shift 전용 라이브러리 도입
3. **장기**: 네이티브 모듈 개발 (최적 성능)

---

## 📁 파일 구조

```
app/
├── components/
│   ├── MusicPlayer/
│   │   ├── MusicPlayer.tsx (기존)
│   │   ├── MetronomeControl.tsx (신규)
│   │   ├── PitchControl.tsx (신규)
│   │   └── styles.ts
│   └── Metronome/
│       ├── Metronome.tsx (신규)
│       ├── MetronomeBeatIndicator.tsx (신규)
│       └── useMetronome.ts (신규)
├── hooks/
│   ├── useMetronome.ts (신규)
│   └── usePitchShift.ts (신규)
├── services/
│   ├── metronomeService.ts (신규)
│   └── audioProcessingService.ts (신규)
├── assets/
│   └── sounds/
│       ├── metronome-high.mp3 (신규)
│       └── metronome-low.mp3 (신규)
└── types/
    └── audio.types.ts (확장)
```

---

## 🔄 상태 관리

### Metronome State
```typescript
interface MetronomeState {
  enabled: boolean;
  bpm: number;          // 40 ~ 240
  volume: number;       // 0 ~ 1
  timeSignature: {
    beats: number;      // 4 (4/4 박자)
    noteValue: number;  // 4
  };
  currentBeat: number;  // 0 ~ 3 (현재 박자)
}
```

### Pitch State
```typescript
interface PitchState {
  semitones: number;    // -6 ~ +6
  enabled: boolean;
}
```

### Combined Player State
```typescript
interface MusicPlayerState {
  // 기존
  playback: PlaybackState;
  abLoop: ABLoopState;

  // 신규
  metronome: MetronomeState;
  pitch: PitchState;
}
```

---

## 🎨 UI 컴포넌트 설계

### 1. MetronomeControl 컴포넌트
```typescript
interface MetronomeControlProps {
  enabled: boolean;
  bpm: number;
  volume: number;
  onToggle: () => void;
  onBpmChange: (bpm: number) => void;
  onVolumeChange: (volume: number) => void;
}
```

### 2. PitchControl 컴포넌트
```typescript
interface PitchControlProps {
  semitones: number;
  onPitchChange: (semitones: number) => void;
  onReset: () => void;
}
```

### 3. MetronomeBeatIndicator 컴포넌트
```typescript
interface MetronomeBeatIndicatorProps {
  currentBeat: number;
  totalBeats: number;
}

// UI: ● ○ ○ ○ (첫 박 강조)
```

---

## 🔧 핵심 로직

### 1. 메트로놈 타이밍 로직
```typescript
// useMetronome.ts
const useMetronome = (bpm: number, enabled: boolean) => {
  const [currentBeat, setCurrentBeat] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const interval = 60000 / bpm; // ms per beat
    const timer = setInterval(() => {
      // 비프음 재생
      playMetronomeTick(currentBeat === 0 ? 'high' : 'low');

      // 박자 업데이트
      setCurrentBeat((prev) => (prev + 1) % 4);
    }, interval);

    return () => clearInterval(timer);
  }, [bpm, enabled, currentBeat]);

  return { currentBeat };
};
```

### 2. Pitch Shift 로직 (expo-av 방식)
```typescript
// usePitchShift.ts
const usePitchShift = (soundObject: Audio.Sound, semitones: number) => {
  useEffect(() => {
    const applyPitchShift = async () => {
      // 반음 = 2^(1/12) 비율
      const rate = Math.pow(2, semitones / 12);

      await soundObject.setRateAsync(
        rate,
        true, // shouldCorrectPitch
        Audio.PitchCorrectionQuality.High
      );
    };

    applyPitchShift();
  }, [semitones, soundObject]);
};
```

---

## 📊 데이터 흐름

```
User Interaction
    ↓
UI Component (MetronomeControl / PitchControl)
    ↓
Custom Hook (useMetronome / usePitchShift)
    ↓
Service Layer (metronomeService / audioProcessingService)
    ↓
Native Audio API (expo-av / react-native-track-player)
    ↓
Audio Output
```

---

## 🧪 테스트 계획

### 단위 테스트
- [ ] `useMetronome`: BPM 변경 시 interval 정확도
- [ ] `usePitchShift`: semitone 계산 정확도
- [ ] `metronomeService`: 타이밍 정확도 (±5ms 오차 허용)

### 통합 테스트
- [ ] 메트로놈 + 음악 재생 동시 작동
- [ ] Pitch 변경 시 템포 유지 확인
- [ ] A-B 루프 + 메트로놈 동작

### 사용자 테스트
- [ ] 다양한 BPM (40, 120, 240)에서 정확도 체감
- [ ] Pitch 조절 시 음질 저하 여부
- [ ] UI 직관성 및 반응 속도

---

## ⚠️ 기술적 고려사항

### 1. 성능
- **메트로놈 타이밍**: `setInterval` 대신 `requestAnimationFrame` + Web Audio API 고려
- **메모리**: 메트로놈 사운드 파일 사전 로드 및 캐싱
- **배터리**: 백그라운드에서 메트로놈 비활성화 옵션

### 2. 플랫폼 차이
- **iOS**: `expo-av` pitch 조절 네이티브 지원 ✅
- **Android**: 제한적 지원, 추가 라이브러리 필요할 수 있음 ⚠️
- **Web**: Web Audio API 활용 가능 ✅

### 3. 오디오 동기화
- 메트로놈과 음악 재생의 타이밍 동기화
- A-B 루프 재시작 시 메트로놈 박자 리셋

### 4. 사운드 파일
- 메트로놈 비프음 2개 필요:
  - `metronome-high.mp3` (강박용, ~100ms)
  - `metronome-low.mp3` (약박용, ~100ms)
- 용량 최소화 (각 5KB 이하)

---

## 🚀 구현 우선순위

### Phase 1: 기본 메트로놈 (1-2일)
1. [ ] 메트로놈 사운드 파일 준비
2. [ ] `useMetronome` hook 구현
3. [ ] `MetronomeControl` UI 컴포넌트
4. [ ] BPM 조절 슬라이더
5. [ ] ON/OFF 토글

### Phase 2: 메트로놈 고도화 (1일)
6. [ ] 박자 시각적 표시기
7. [ ] 볼륨 조절
8. [ ] A-B 루프와 동기화

### Phase 3: Pitch 조절 기술 검증 (1-2일)
9. [ ] `expo-av`로 pitch 조절 테스트
10. [ ] iOS/Android 플랫폼별 동작 확인
11. [ ] 음질 평가

### Phase 4: Pitch 조절 구현 (2-3일)
12. [ ] `usePitchShift` hook 구현
13. [ ] `PitchControl` UI 컴포넌트
14. [ ] 반음 단위 슬라이더 (-6 ~ +6)
15. [ ] 프리셋 버튼 (남성/여성 음역)
16. [ ] 초기화 버튼

### Phase 5: 통합 & 최적화 (1일)
17. [ ] 전체 UI 통합
18. [ ] 성능 최적화
19. [ ] 버그 수정 및 테스트

**총 예상 기간**: 6-9일

---

## 📝 추가 개선 아이디어 (향후)

### 메트로놈
- [ ] 다양한 박자 지원 (3/4, 6/8, 5/4 등)
- [ ] 메트로놈 소리 커스터마이징 (클릭, 우드블럭, 전자음 등)
- [ ] 강약 패턴 설정 (accent pattern)
- [ ] 템포 자동 증가 (연습 모드)

### Pitch
- [ ] 음계 표시 (C, D, E 등)
- [ ] 코드 표시 (현재 키에서의 코드 진행)
- [ ] Formant 보존 옵션 (목소리 자연스럽게)
- [ ] 실시간 피치 시각화

### 통합 기능
- [ ] 연습 세션 녹음
- [ ] 구간 반복 + 템포 점진적 증가
- [ ] 멜로디 추출 및 악보 표시
- [ ] 박자/키 자동 감지

---

## 📚 참고 자료

### 라이브러리 문서
- [react-native-track-player](https://react-native-track-player.js.org/)
- [expo-av Audio API](https://docs.expo.dev/versions/latest/sdk/audio/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

### Pitch Shift 알고리즘
- WSOLA (Waveform Similarity Overlap-Add)
- Phase Vocoder
- Time-domain PSOLA

### 메트로놈 정확도
- [Timing Accuracy in Web Audio](https://www.html5rocks.com/en/tutorials/audio/scheduling/)
- JavaScript Timer 한계와 대안

---

## ✅ 체크리스트

### 기술 검증
- [ ] `expo-av` pitch 조절 기능 확인
- [ ] Android/iOS 플랫폼 호환성 테스트
- [ ] 메트로놈 타이밍 정확도 측정 (±5ms 목표)

### 디자인
- [ ] 메트로놈 UI 디자인 확정
- [ ] Pitch 컨트롤 UI 디자인 확정
- [ ] 전체 레이아웃 통합 디자인

### 개발
- [ ] 사운드 에셋 준비
- [ ] 컴포넌트 구현
- [ ] Hook 로직 구현
- [ ] 통합 테스트

### 문서화
- [ ] API 문서 작성
- [ ] 사용자 가이드 작성
- [ ] 코드 주석 추가

---

**작성일**: 2025-11-04
**작성자**: Development Team
**문서 버전**: 1.0
