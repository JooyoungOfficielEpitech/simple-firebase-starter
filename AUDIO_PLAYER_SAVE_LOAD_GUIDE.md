# AudioPlayer 저장/불러오기 기능 가이드

## 📋 개요

AudioPlayer의 A/B 구간 저장 및 불러오기 기능이 완전히 구현되었습니다.

### ✅ 구현된 기능
1. **저장 기능** - A/B 구간을 이름과 함께 MMKV 로컬 스토리지에 저장
2. **불러오기 기능** - 저장된 구간을 선택하면 A/B 마커가 자동으로 설정되고 A점으로 이동
3. **삭제 기능** - 저장된 구간을 삭제하고 로컬 스토리지에서도 제거

---

## 🔧 사용 방법

### 1. 기본 설정

부모 컴포넌트에서 AudioPlayer와 SavedSectionsList를 함께 사용:

```tsx
import { useState } from 'react'
import { AudioPlayer, SavedSection } from '@/components/AudioPlayer'
import { SavedSectionsList } from '@/components/SavedSectionsList'

export const MyScreen = () => {
  const [savedSections, setSavedSections] = useState<SavedSection[]>([])
  const [loadSection, setLoadSection] = useState<SavedSection | null>(null)

  return (
    <View>
      {/* 오디오 플레이어 */}
      <AudioPlayer
        audioFile="sample.mp3"
        savedSections={savedSections}
        onSavedSectionsChange={setSavedSections}
        onLoadSection={(section) => {
          console.log('구간 로드됨:', section.name)
        }}
        onDeleteSection={(sectionId) => {
          console.log('구간 삭제됨:', sectionId)
        }}
        loadSection={loadSection}
      />

      {/* 저장된 구간 목록 */}
      <SavedSectionsList
        sections={savedSections}
        onLoadSection={(section) => {
          // 간단하게 설정만 하면 됨 (중복 로드 자동 방지)
          setLoadSection(section)
        }}
        onDeleteSection={(sectionId) => {
          const updated = savedSections.filter(s => s.id !== sectionId)
          setSavedSections(updated)
        }}
      />
    </View>
  )
}
```

---

## 📦 Props 설명

### AudioPlayer Props

| Prop | Type | 설명 |
|------|------|------|
| `savedSections` | `SavedSection[]` | 저장된 구간 배열 |
| `onSavedSectionsChange` | `(sections: SavedSection[]) => void` | 구간 추가/삭제 시 호출 |
| `onLoadSection` | `(section: SavedSection) => void` | 구간 로드 완료 시 호출 (선택사항) |
| `onDeleteSection` | `(sectionId: string) => void` | 구간 삭제 시 호출 (선택사항) |
| `loadSection` | `SavedSection \| null` | 로드할 구간 (변경되면 자동 로드) |

### SavedSectionsList Props

| Prop | Type | 설명 |
|------|------|------|
| `sections` | `SavedSection[]` | 표시할 구간 배열 |
| `onLoadSection` | `(section: SavedSection) => void` | "로드" 버튼 클릭 시 호출 |
| `onDeleteSection` | `(sectionId: string) => void` | "삭제" 버튼 클릭 시 호출 |

### SavedSection 타입

```typescript
interface SavedSection {
  id: string          // 고유 ID
  name: string        // 사용자가 입력한 구간 이름
  pointA: number      // A점 (초 단위)
  pointB: number      // B점 (초 단위)
  createdAt: Date     // 생성 시간
}
```

---

## 🎬 동작 흐름

### 저장 흐름
1. 사용자가 A, B 마커 설정
2. "구간 저장하기" 버튼 클릭
3. 모달에서 구간 이름 입력
4. `AudioPlayer.saveSection()` 호출
5. MMKV 로컬 스토리지에 저장
6. `onSavedSectionsChange` 콜백 호출 → 부모 state 업데이트
7. `SavedSectionsList`에 새 구간 표시

### 불러오기 흐름
1. 사용자가 `SavedSectionsList`에서 "로드" 버튼 클릭
2. `onLoadSection` 콜백 호출 → 부모가 `loadSection` prop 업데이트
3. `AudioPlayer`의 `useEffect`가 감지
4. `actions.loadSection()` 호출 → A/B 마커 설정
5. `safeSeekTo(pointA)` 호출 → A점으로 이동
6. `onLoadSection` 콜백 호출 (선택사항) → 부모에 알림

### 삭제 흐름
1. 사용자가 `SavedSectionsList`에서 "삭제" 버튼 클릭
2. 확인 다이얼로그 표시
3. 확인 시 `onDeleteSection` 콜백 호출
4. 부모가 배열에서 제거 → `setSavedSections`
5. `AudioPlayer.handleDeleteSection()` 호출 (내부)
6. MMKV 로컬 스토리지에서 제거
7. `SavedSectionsList` 자동 업데이트

---

## 💾 로컬 스토리지

### MMKV 사용
```typescript
const storage = new MMKV()
const SAVED_SECTIONS_KEY = "audio_player_saved_sections"

// 저장
storage.set(SAVED_SECTIONS_KEY, JSON.stringify(sections))

// 로드
const sectionsString = storage.getString(SAVED_SECTIONS_KEY)
const sections = JSON.parse(sectionsString)
```

### 자동 저장/로드
- **앱 시작 시**: `loadSavedSections()` 자동 호출
- **구간 추가 시**: `saveSectionsToStorage()` 자동 호출
- **구간 삭제 시**: `saveSectionsToStorage()` 자동 호출

---

## 🐛 디버깅 로그

개발 모드(`__DEV__ = true`)에서 다음 로그 확인 가능:

```
📥 구간 로드: "인트로" [0.00s ~ 15.30s]
✅ 구간 로드 완료

✅ 구간을 로컬 스토리지에 저장 완료: 3개

🗑️ 구간 삭제: 1234567890
✅ 구간 삭제 완료
```

---

## ⚠️ 주의사항

1. **중복 로드 방지**: 같은 구간을 연속으로 선택하면 무시됨 (자동 중복 방지 기능)
   - 같은 구간을 다시 로드하려면 다른 구간을 먼저 선택 후 다시 선택

2. **플레이어 초기화 확인**: `state.isPlayerInitialized`가 `true`일 때만 로드 가능

3. **로컬 스토리지 한계**: MMKV는 앱 삭제 시 데이터 삭제됨 (클라우드 백업 필요 시 별도 구현)

4. **무한 루프 방지**: `loadSection.id`를 추적하여 동일 구간 중복 로드 차단

---

## 🎯 개선 제안 (선택사항)

### Firebase 연동
```tsx
// 클라우드에 저장
await firestore()
  .collection('userSections')
  .doc(userId)
  .collection('sections')
  .add(section)

// 클라우드에서 로드
const snapshot = await firestore()
  .collection('userSections')
  .doc(userId)
  .collection('sections')
  .get()
```

### 구간 내보내기/가져오기
```tsx
// JSON 내보내기
const json = JSON.stringify(savedSections)
await Share.share({ message: json })

// JSON 가져오기
const imported = JSON.parse(jsonString)
setSavedSections(imported)
```

---

## 📝 요약

| 기능 | 상태 | 위치 |
|------|------|------|
| 저장 | ✅ 완료 | `AudioPlayer.saveSection()` |
| 불러오기 | ✅ 완료 | `AudioPlayer` useEffect (270-285줄) |
| 삭제 | ✅ 완료 | `AudioPlayer.handleDeleteSection()` |
| 로컬 저장소 | ✅ 완료 | MMKV (자동) |
| UI 목록 | ✅ 완료 | `SavedSectionsList` |

모든 기능이 정상 작동합니다! 🎉
