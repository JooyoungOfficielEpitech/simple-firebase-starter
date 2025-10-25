# AudioPlayer → TrackPlayer 마이그레이션 플랜

## 📋 현재 상황 분석

### 기존 AudioPlayer.tsx (Expo AV 기반)
- ✅ A-B 루프 기능 완벽 구현
- ✅ 저장된 구간 관리 (MMKV)
- ✅ 드래그 가능한 A/B 마커
- ✅ 진행바 및 시간 표시
- ✅ 구간 저장/불러오기
- ❌ 백그라운드 재생 제한적
- ❌ iOS 백그라운드 A-B 루프 불가능

### 준비된 TrackPlayer 인프라
- ✅ service.js 백그라운드 서비스 등록됨
- ✅ A-B 루프 백그라운드 로직 구현됨
- ✅ iOS Info.plist 설정 완료
- ✅ 글로벌 상태 관리 준비됨

## 🎯 마이그레이션 목표

1. **기능 완전 보존**: 기존 모든 A-B 루프 기능 유지
2. **백그라운드 재생**: iOS에서 완벽한 백그라운드 A-B 루프
3. **UI 일관성**: 기존 사용자 경험 유지
4. **데이터 보존**: 저장된 구간 데이터 유지

---

## 📅 단계별 마이그레이션 계획

### 🔍 Phase 1: 준비 및 분석 (30분)

#### 1.1 기존 코드 백업
```bash
cp app/components/AudioPlayer.tsx app/components/AudioPlayer.tsx.backup
```

#### 1.2 핵심 기능 분석 및 정리
- A-B 루프 상태 관리 로직
- 저장된 구간 MMKV 관리
- UI 컴포넌트 스타일
- 이벤트 핸들러 목록

#### 1.3 TrackPlayer 기본 테스트
- MusicPlayer 컴포넌트로 TrackPlayer 정상 작동 확인
- service.js A-B 루프 백그라운드 기능 확인

---

### 🔄 Phase 2: 기본 재생 기능 교체 (45분)

#### 2.1 import 및 기본 상태 변경
```typescript
// 제거할 것들
- import { Audio, AVPlaybackStatus } from "expo-av"
- const [sound, setSound] = useState<Audio.Sound | null>(null)

// 추가할 것들
+ import TrackPlayer, { State, usePlaybackState, useProgress } from 'react-native-track-player'
+ const playbackState = usePlaybackState()
+ const progress = useProgress()
```

#### 2.2 TrackPlayer 초기화 로직 추가
- MusicPlayer.tsx에서 검증된 초기화 로직 적용
- 중복 초기화 방지 메커니즘 적용
- 에러 처리 및 상태 표시

#### 2.3 기본 재생/일시정지 기능 구현
```typescript
const togglePlayback = async () => {
  try {
    if (playbackState === State.Playing) {
      await TrackPlayer.pause()
    } else {
      await TrackPlayer.play()
    }
  } catch (error) {
    console.error('재생 오류:', error)
  }
}
```

#### 2.4 진행바 및 시간 표시 연동
- `progress.position`, `progress.duration` 사용
- 기존 formatTime 함수 유지

**✅ Phase 2 완료 기준**: 기본 재생/일시정지, 진행바가 TrackPlayer로 정상 작동

---

### 🎯 Phase 3: A-B 루프 핵심 로직 이식 (60분)

#### 3.1 A-B 상태 관리 유지
```typescript
// 기존 loopState 구조 유지
const [loopState, setLoopState] = useState<LoopState>({
  pointA: null,
  pointB: null,
  isLooping: true,
  currentSection: null,
})
```

#### 3.2 A-B 지점 설정 기능
```typescript
const setPointAToCurrentTime = () => {
  const currentTime = progress.position / 1000
  setLoopState(prev => ({ ...prev, pointA: currentTime }))
  // service.js와 동기화
  if (typeof global.setABLoop === 'function') {
    global.setABLoop(true, currentTime, loopState.pointB)
  }
}
```

#### 3.3 TrackPlayer 기반 A-B 루프 구현
```typescript
useEffect(() => {
  if (loopState.pointA !== null && loopState.pointB !== null) {
    const currentTime = progress.position / 1000
    if (currentTime >= loopState.pointB) {
      TrackPlayer.seekTo(loopState.pointA * 1000)
    }
  }
}, [progress.position, loopState.pointA, loopState.pointB])
```

#### 3.4 service.js와 실시간 동기화
- A-B 설정 변경 시 즉시 service.js 업데이트
- 백그라운드 루프와 포그라운드 루프 일치 보장

**✅ Phase 3 완료 기준**: A-B 루프가 포그라운드/백그라운드 모두에서 정상 작동

---

### 💾 Phase 4: 저장된 구간 기능 연동 (30분)

#### 4.1 MMKV 저장 로직 유지
- 기존 `saveSectionsToStorage`, `loadSavedSections` 함수 유지
- SavedSection 인터페이스 유지

#### 4.2 구간 로드 기능 구현
```typescript
const loadSection = (section: SavedSection) => {
  setLoopState(prev => ({
    ...prev,
    pointA: section.pointA,
    pointB: section.pointB,
    currentSection: section,
  }))
  // TrackPlayer로 즉시 이동
  TrackPlayer.seekTo(section.pointA * 1000)
  // service.js 동기화
  global.setABLoop(true, section.pointA, section.pointB)
}
```

**✅ Phase 4 완료 기준**: 저장/불러오기 기능이 TrackPlayer와 완벽 연동

---

### 🎨 Phase 5: UI 컴포넌트 정리 (30분)

#### 5.1 불필요한 상태 제거
- `sound`, `isPlaying`, `isLoading`, `duration`, `position` 등 Expo AV 관련 상태 제거
- TrackPlayer hooks로 대체

#### 5.2 이벤트 핸들러 업데이트
- `handlePlaybackStatusUpdate` 제거
- `seekToPosition` TrackPlayer API로 변경
- 드래그 핸들러들 TrackPlayer 기반으로 수정

#### 5.3 스타일 및 레이아웃 유지
- 기존 모든 스타일 컴포넌트 유지
- UI 레이아웃 변경 없음

**✅ Phase 5 완료 기준**: UI가 기존과 동일하게 작동, 불필요한 코드 정리 완료

---

### 🧪 Phase 6: 통합 테스트 및 최적화 (45분)

#### 6.1 기능 테스트 체크리스트
- [ ] 기본 재생/일시정지
- [ ] A-B 지점 설정 ("A 여기로", "B 여기로" 버튼)
- [ ] A-B 루프 자동 반복
- [ ] 진행바 드래그로 A-B 조정
- [ ] 구간 저장/불러오기
- [ ] 모달 UI 정상 작동
- [ ] 백그라운드 재생 지속
- [ ] 백그라운드 A-B 루프 작동

#### 6.2 성능 최적화
- 불필요한 useEffect 정리
- 메모리 누수 방지
- 에러 처리 강화

#### 6.3 TestFlight 배포 테스트
- 실제 기기에서 모든 기능 검증
- 백그라운드 전환 시나리오 테스트
- 장시간 A-B 루프 안정성 테스트

**✅ Phase 6 완료 기준**: TestFlight에서 모든 기능이 완벽하게 작동

---

## 🚨 주의사항 및 위험 요소

### 1. 호환성 이슈
- **오디오 소스**: Expo AV와 TrackPlayer의 오디오 파일 로딩 방식 차이
- **해결책**: `getAudioSource()` 함수를 TrackPlayer 형식으로 수정

### 2. 상태 동기화
- **문제**: 포그라운드(AudioPlayer)와 백그라운드(service.js) 상태 불일치
- **해결책**: 글로벌 상태 관리로 실시간 동기화

### 3. 메모리 관리
- **문제**: TrackPlayer와 Expo AV 동시 사용 시 메모리 충돌
- **해결책**: Expo AV 완전 제거 후 TrackPlayer로 교체

### 4. iOS 백그라운드 제약
- **문제**: iOS의 백그라운드 앱 실행 시간 제한
- **해결책**: TrackPlayer의 네이티브 백그라운드 오디오 모드 활용

---

## 📦 예상 변경 파일 목록

### 수정할 파일
1. **app/components/AudioPlayer.tsx** (메인 작업)
   - Expo AV → TrackPlayer 완전 교체
   - 모든 기능 유지하면서 내부 구현만 변경

2. **service.js** (미세 조정)
   - A-B 루프 로직 AudioPlayer와 정확히 일치시키기

### 변경하지 않을 파일
- **UI 스타일**: 모든 스타일 컴포넌트 유지
- **MMKV 저장 로직**: 저장된 구간 데이터 구조 유지
- **index.tsx**: TrackPlayer 서비스 등록 유지
- **Info.plist**: iOS 백그라운드 설정 유지

---

## ⏱️ 예상 소요 시간

| Phase | 작업 내용 | 예상 시간 | 누적 시간 |
|-------|-----------|-----------|-----------|
| 1 | 준비 및 분석 | 30분 | 30분 |
| 2 | 기본 재생 기능 교체 | 45분 | 1시간 15분 |
| 3 | A-B 루프 핵심 로직 이식 | 60분 | 2시간 15분 |
| 4 | 저장된 구간 기능 연동 | 30분 | 2시간 45분 |
| 5 | UI 컴포넌트 정리 | 30분 | 3시간 15분 |
| 6 | 통합 테스트 및 최적화 | 45분 | **4시간** |

---

## 🎯 최종 목표

### 기능적 목표
1. ✅ **백그라운드 A-B 루프**: iOS에서 앱을 백그라운드로 보내도 A-B 루프 지속
2. ✅ **기능 완전 보존**: 기존 모든 기능 100% 유지
3. ✅ **성능 향상**: TrackPlayer의 네이티브 성능 활용
4. ✅ **안정성 향상**: 메모리 누수 없는 안정적인 재생

### 사용자 경험 목표
1. ✅ **UI 일관성**: 기존과 동일한 사용자 인터페이스
2. ✅ **데이터 보존**: 저장된 구간 데이터 손실 없음
3. ✅ **성능 개선**: 더 빠른 로딩과 부드러운 재생
4. ✅ **안정성**: 크래시 없는 안정적인 백그라운드 재생

---

## 🚀 시작 준비

현재 모든 인프라(service.js, iOS 설정, TrackPlayer 등록)가 준비되어 있으므로, **즉시 Phase 1부터 시작 가능**합니다.

**준비 완료되면 "Phase 1 시작"이라고 말씀해주세요!**