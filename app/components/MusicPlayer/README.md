# MusicPlayer Components

## MetronomeControl

메트로놈 컨트롤 UI 컴포넌트입니다.

### Props

```typescript
interface MetronomeControlProps {
  enabled: boolean;        // 메트로놈 활성화 여부
  bpm: number;             // 현재 BPM (40-240)
  volume: number;          // 볼륨 (0.0-1.0)
  currentBeat: number;     // 현재 박자 (0부터 시작)
  totalBeats: number;      // 전체 박자 수
  isReady: boolean;        // 준비 상태
  error: string | null;    // 에러 메시지
  onToggle: () => void;    // ON/OFF 토글
  onBpmChange: (bpm: number) => void;      // BPM 변경
  onVolumeChange: (volume: number) => void; // 볼륨 변경
}
```

### 사용 예시

```tsx
import { MetronomeControl } from './MusicPlayer/MetronomeControl';
import { useMetronome } from '../hooks/useMetronome';

function MyPlayer() {
  const [enabled, setEnabled] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [volume, setVolume] = useState(0.7);

  const { currentBeat, totalBeats, isReady, error } = useMetronome({
    bpm,
    enabled,
    volume,
  });

  return (
    <MetronomeControl
      enabled={enabled}
      bpm={bpm}
      volume={volume}
      currentBeat={currentBeat}
      totalBeats={totalBeats}
      isReady={isReady}
      error={error}
      onToggle={() => setEnabled(!enabled)}
      onBpmChange={setBpm}
      onVolumeChange={setVolume}
    />
  );
}
```

### 기능

- **ON/OFF 토글**: 메트로놈 활성화/비활성화
- **BPM 슬라이더**: 40-240 범위에서 1단위로 조절
- **볼륨 슬라이더**: 0-100% 범위에서 1% 단위로 조절
- **박자 표시기**: 현재 박자를 시각적으로 표시
  - 활성 박자: 파란색 + 확대 효과
  - 첫 박자: 빨간 테두리
- **상태 표시**: 로딩 중, 에러 상태 표시

### 스타일링

컴포넌트는 기본 스타일을 포함하고 있습니다:
- 배경: 밝은 회색 (#f9f9f9)
- 활성 색상: 파란색 (#007AFF)
- 첫 박자 강조: 빨간색 (#FF3B30)
- 활성화 버튼: 녹색 (#34C759)

---

## useMetronome Hook

메트로놈 로직을 처리하는 Hook입니다.

### Parameters

```typescript
interface UseMetronomeProps {
  bpm: number;                 // 분당 박자수 (40-240)
  enabled: boolean;            // 활성화 여부
  volume?: number;             // 볼륨 (기본값: 0.7)
  timeSignature?: {            // 박자 (기본값: 4/4)
    beats: number;
    noteValue: number;
  };
}
```

### Returns

```typescript
interface UseMetronomeReturn {
  currentBeat: number;   // 현재 박자 (0부터 시작)
  totalBeats: number;    // 전체 박자 수
  isReady: boolean;      // 준비 상태
  error: string | null;  // 에러 메시지
}
```

### 사용 예시

```tsx
import { useMetronome } from '../hooks/useMetronome';

function MyComponent() {
  const { currentBeat, totalBeats, isReady, error } = useMetronome({
    bpm: 120,
    enabled: true,
    volume: 0.7,
    timeSignature: { beats: 4, noteValue: 4 },
  });

  return (
    <View>
      <Text>현재 박자: {currentBeat + 1} / {totalBeats}</Text>
      {!isReady && <Text>로딩 중...</Text>}
      {error && <Text>에러: {error}</Text>}
    </View>
  );
}
```

### 기능

- **정확한 타이밍**: BPM 기반 정밀 타이밍 (setInterval 사용)
- **사운드 재생**: expo-av를 통한 오디오 재생
- **강박/약박 구분**:
  - 첫 박자(강박): metronome-high.mp3
  - 나머지(약박): metronome-low.mp3
- **볼륨 조절**: 실시간 볼륨 업데이트
- **에러 핸들링**: 사운드 파일 없이도 동작
- **자동 정리**: 컴포넌트 언마운트 시 리소스 정리

### 주의사항

1. **사운드 파일**:
   - 경로: `app/assets/sounds/metronome-high.mp3`, `metronome-low.mp3`
   - 없어도 동작 (무음 모드)
   - 추가 방법: `app/assets/sounds/README.md` 참고

2. **타이밍 정확도**:
   - JavaScript setInterval 사용 (±10ms 오차)
   - 음악 연습용으로 충분한 수준
   - 향후 Web Audio API로 개선 가능

3. **퍼포먼스**:
   - 사운드 로드: 초기 1회만
   - 재생: 박자마다 호출
   - 메모리: 사운드 객체 2개 유지

---

## 사운드 파일 추가 방법

### 1. 다운로드

**Freesound.org** (무료, CC0 라이선스)
1. https://freesound.org/search/?q=metronome 접속
2. "metronome click" 검색
3. CC0 라이선스 필터 적용
4. 강박용/약박용 2개 다운로드

### 2. 직접 생성 (Audacity)

**강박용 (high)**:
```
1. Audacity 열기
2. Generate > Tone
3. Frequency: 1000 Hz
4. Duration: 0.1 초
5. Waveform: Square
6. File > Export > Export as MP3
7. 파일명: metronome-high.mp3
```

**약박용 (low)**:
```
1-5. 동일
6. Frequency: 500 Hz
7. 파일명: metronome-low.mp3
```

### 3. 파일 배치

```bash
app/assets/sounds/
  ├── metronome-high.mp3  # 강박용
  ├── metronome-low.mp3   # 약박용
  └── README.md
```

### 4. 확인

앱을 재시작하면 자동으로 사운드가 로드되어 재생됩니다.

---

## 타이밍 테스트

정확도를 테스트하려면:

```typescript
import { runStandardTests } from '../utils/metronomeTest';

// 40, 120, 240 BPM 테스트
const results = await runStandardTests();

// 커스텀 BPM 테스트
import { testMetronomeTiming } from '../utils/metronomeTest';
const result = await testMetronomeTiming(120, 20); // 120 BPM, 20박자
```

콘솔에서 타이밍 정보를 확인할 수 있습니다.
