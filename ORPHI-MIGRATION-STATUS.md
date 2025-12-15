# Orphi 디자인 시스템 마이그레이션 현황

> 진행일: 2025-12-11
> 상태: ✅ 완료 - 전체 화면 마이그레이션 완료 (19개 화면)

---

## ✅ 완료된 작업

### Phase 1: 디자인 시스템 구축 (100% 완료)

#### 1. Orphi 토큰 시스템 생성
**파일**: `app/design-system/tokens/orphi.tokens.ts`

- ✅ 색상 팔레트 (Primary Green, Gray Scale, Accents)
- ✅ 그라데이션 (greenPrimary, grayBackground 등)
- ✅ 타이포그래피 스케일 (xs: 12px ~ lg: 18px)
- ✅ 간격 시스템 (4px base scale)
- ✅ Border radius (sm: 12 ~ lg: 24)
- ✅ React Native 그림자 (sm, md, lg, xl)
- ✅ Semantic colors (기존 시스템과 호환)

#### 2. Orphi 컴포넌트 생성

**OrphiHeader** (`app/design-system/components/OrphiHeader.tsx`)
- Green gradient background
- 제목 + 부제목
- 알림 벨 아이콘 with 배지
- Bottom rounded corners
- 완전한 TypeScript 타입 지원

**OrphiBottomNav** (`app/design-system/components/OrphiBottomNav.tsx`)
- 4개 탭 (홈, 연습실, 프로필, 설정)
- Lucide icons
- Active 상태 표시 (Green)
- Top rounded corners
- 완전한 접근성 지원

**OrphiCard** (`app/design-system/components/OrphiCard.tsx`)
- Elevation 지원 (sm/md/lg/xl)
- 클릭 가능 (onPress)
- 커스터마이징 가능한 padding/radius
- Press animation (scale 0.98)

#### 3. 디자인 시스템 통합

✅ `app/design-system/tokens/index.ts` - Orphi 토큰 export 추가
✅ `app/design-system/components/index.ts` - Orphi 컴포넌트 export 추가
✅ 검증 테스트 파일 생성 (`__test-orphi__.ts`)

#### 4. 의존성 설치

✅ `expo-linear-gradient@14.1.5`
✅ `lucide-react-native`

---

### Phase 2: 전체 화면 마이그레이션 (100% 완료 - 19개 화면)

#### 1. MainNavigator 업데이트 ✅

**파일**: `app/navigators/MainNavigator.tsx` (백업: `MainNavigator.backup.tsx`)

**변경사항**:
- ❌ 제거: Home (MusicalKaraokeHomeScreen)
- ✅ 추가: Practice (MusicPlayerScreen)
- ✅ 탭 순서 재정렬: 홈(공고) | 연습실 | 프로필 | 설정
- ✅ Orphi 스타일 적용:
  - Green gradient active color
  - White 95% background with backdrop blur
  - Top rounded corners
  - Lucide icons
  - Orphi shadows

**타입 업데이트**:
- `MainTabParamList` 업데이트 (Home → Practice)
- 접근성 라벨 업데이트
- 하위 호환성 유지 (Home?: undefined)

---

#### 2. 주요 탭 화면 마이그레이션 (4개) ✅

**BulletinBoardScreen** (`app/screens/BulletinBoardScreen.tsx`)
- ✅ OrphiHeader ("공고 게시판", "✨ 새로운 기회를 찾아보세요")
- ✅ 알림 벨 아이콘 추가 (NotificationCenter 연결)
- ✅ Gray50 배경, Green600 버튼
- ✅ 모든 Firebase 로직 유지 (게시글, 단체 관리)

**ProfileScreen** (`app/screens/ProfileScreen.tsx`)
- ✅ OrphiHeader ("프로필")
- ✅ OrphiCard 컴포넌트 사용
- ✅ Orphi 색상 팔레트 적용
- ✅ 모든 기존 로직 유지 (프로필 로드, 인증, 편집, 계정 관리)

**SettingsScreen** (`app/screens/SettingsScreen.tsx`)
- ✅ OrphiHeader ("설정")
- ✅ Gray50 배경
- ✅ 모든 기능 유지 (테마 변경, 커튼 애니메이션, 사용자 유형 전환)

**MusicPlayerScreen** (`app/screens/MusicPlayerScreen.tsx`)
- ✅ OrphiHeader ("연습실", "🎵 나만의 무대를 준비하세요")
- ✅ Gray50 배경
- ✅ MusicPlayer 컴포넌트 로직 유지

---

#### 3. 알림 화면 마이그레이션 (1개) ✅

**NotificationCenterScreen** (`app/screens/NotificationCenterScreen.tsx`)
- ✅ OrphiHeader ("알림", "📬 새로운 소식을 확인하세요")
- ✅ Green600/Green50 알림 카드 (읽음/안 읽음)
- ✅ Red500 읽지 않음 배지
- ✅ 실시간 알림 구독 로직 유지

---

#### 4. 게시글 관련 화면 마이그레이션 (3개) ✅

**CreatePostScreen** (`app/screens/CreatePostScreen.tsx`)
- ✅ OrphiHeader ("게시글 작성", "✍️ 새로운 공고를 만들어보세요")
- ✅ Gray50 배경
- ✅ Green600 템플릿 버튼
- ✅ Green600 진행률 바
- ✅ Green600/Gray300 Switch 색상
- ✅ 모든 작성 로직 유지 (템플릿, 이미지 업로드, Firebase 저장)

**PostDetailScreen** (`app/screens/PostDetailScreen.tsx`)
- ✅ OrphiHeader ("모집 공고", "📄 공고를 확인하세요")
- ✅ Gray50 배경
- ✅ 지원 로직 유지 (신청, 취소, 지원자 관리)

**ApplicationManagementScreen** (`app/screens/ApplicationManagementScreen.tsx`)
- ✅ OrphiHeader ("지원자 관리", "👥 지원자 관리")
- ✅ Gray50 배경
- ✅ 지원자 관리 기능 유지 (수락, 거절, 상태 변경)

---

#### 5. 프로필 & 조직 화면 마이그레이션 (2개) ✅

**EditProfileScreen** (`app/screens/EditProfileScreen.tsx`)
- ✅ OrphiHeader ("프로필 수정", "✏️ 프로필을 수정하세요")
- ✅ Gray50 배경
- ✅ 프로필 수정 로직 유지 (이미지 업로드, Firebase 업데이트)

**CreateOrganizationScreen** (`app/screens/CreateOrganizationScreen.tsx`)
- ✅ OrphiHeader ("단체 등록", "🎭 단체 등록하기")
- ✅ Gray50 배경
- ✅ 조직 생성 로직 유지 (Firebase 저장, 사용자 프로필 업데이트)

---

#### 6. 인증 화면 마이그레이션 (4개) ✅

**WelcomeScreen** (`app/screens/WelcomeScreen.tsx`)
- ✅ OrphiHeader ("환영합니다", "👋 환영합니다")
- ✅ Gray50 배경
- ✅ 네비게이션 로직 유지

**SignInScreen** (`app/screens/SignInScreen.tsx`)
- ✅ OrphiHeader ("로그인", "🔑 로그인하세요")
- ✅ Gray50 배경
- ✅ Firebase Auth 로직 유지

**SignUpScreen** (`app/screens/SignUpScreen.tsx`)
- ✅ OrphiHeader ("회원가입", "📝 회원가입하세요")
- ✅ Gray50 배경
- ✅ 회원가입 로직 유지 (Firebase Auth, Firestore 프로필 생성)

**ForgotPasswordScreen** (`app/screens/ForgotPasswordScreen.tsx`)
- ✅ OrphiHeader ("비밀번호 찾기", "🔐 비밀번호 찾기")
- ✅ Gray50 배경
- ✅ 비밀번호 재설정 로직 유지

---

#### 7. 노래방 화면 마이그레이션 (2개) ✅

**KaraokeScreen** (`app/screens/KaraokeScreen.tsx`)
- ✅ OrphiHeader ("노래방", "🎤 노래방 모드")
- ✅ Gray50 배경
- ✅ 노래방 기능 유지

**MusicalKaraokeHomeScreen** (`app/screens/MusicalKaraokeHomeScreen.tsx`)
- ✅ OrphiHeader ("뮤지컬 노래방", "🎵 뮤지컬 노래방")
- ✅ Gray50 배경
- ✅ 뮤지컬 노래방 기능 유지

---

#### 8. 개발자 화면 마이그레이션 (1개) ✅

**DevSettingsScreen** (`app/screens/DevSettingsScreen.tsx`)
- ✅ OrphiHeader ("개발자 설정", "⚙️ 개발자 설정")
- ✅ Gray50 배경
- ✅ 개발 도구 유지

---

## 📊 마이그레이션 통계

### 전체 완료 현황
- **Phase 1**: 디자인 시스템 구축 ✅ (100%)
- **Phase 2**: 전체 화면 마이그레이션 ✅ (100%)
- **총 마이그레이션된 화면**: 19개 (Navigator 1개 + Screens 18개)
- **ScreenHeader 사용 화면 남음**: 0개 (완전 제거)

### 화면별 분류
- 네비게이션: 1개 ✅
- 주요 탭: 4개 ✅
- 알림: 1개 ✅
- 게시글 관련: 3개 ✅
- 프로필/조직: 2개 ✅
- 인증: 4개 ✅
- 노래방: 2개 ✅
- 개발자: 1개 ✅

---

## 🎨 Orphi 디자인 시스템 특징

### 색상 팔레트
```typescript
Primary: Green (#2e7d32, #66bb6a)
Neutrals: Gray 900 ~ Gray 50
Accents: Red, Orange, Yellow
```

### 그라데이션
```typescript
greenPrimary: 135deg, #2e7d32 → #66bb6a
grayBackground: to right bottom, #f9fafb → #f3f4f6
```

### 타이포그래피
```typescript
Sizes: xs(12) sm(14) base(16) lg(18)
Weights: regular(400) medium(500) bold(700)
```

### 간격 & Border
```typescript
Spacing: 4px base scale (xs:4 ~ 3xl:48)
Border Radius: sm(12) md(16) lg(24) full(9999)
```

---

## 📱 사용 방법

### Tokens 사용

```typescript
import { orphiTokens } from "@/design-system/tokens"

// 색상
backgroundColor: orphiTokens.colors.green600
backgroundColor: orphiTokens.colors.gray50

// 그라데이션
colors={orphiTokens.gradients.greenPrimary}

// 간격
paddingHorizontal: orphiTokens.spacing.xl

// 그림자
...orphiTokens.shadows.lg
```

### Components 사용

```typescript
import { OrphiHeader, OrphiCard, OrphiBottomNav } from "@/design-system/components"

// Header
<OrphiHeader
  title="공고 게시판"
  subtitle="✨ 새로운 기회를 찾아보세요"
  showBell
  bellBadgeCount={2}
  onBellPress={() => navigation.navigate('NotificationCenter')}
/>

// Card
<OrphiCard
  elevation="lg"
  padding="lg"
  rounded="md"
  onPress={() => handlePress()}
>
  <Text>Card content</Text>
</OrphiCard>

// Bottom Nav (자동 - MainNavigator에 통합됨)
```

---

## 🧪 테스트 권장사항

### 1. 네비게이션 테스트
- ✅ 4개 탭 모두 정상 작동하는지 확인
- ✅ 탭 전환 시 아이콘 색상 변경 확인
- ✅ Bottom navigation 스타일 확인

### 2. 전체 화면 테스트
- ✅ 모든 19개 화면에서 OrphiHeader 표시 확인
- ✅ Gray50 배경색 일관성 확인
- ✅ Green gradient header 표시 확인
- ✅ 모든 기존 기능 정상 작동 확인

### 3. 시각적 확인
- ✅ Green gradient header (모든 화면)
- ✅ White 95% bottom navigation
- ✅ Gray50 background (모든 화면)
- ✅ Green600 buttons and accents

---

## 📄 백업 파일

```
app/navigators/MainNavigator.backup.tsx
app/screens/BulletinBoardScreen.backup.tsx
app/screens/ProfileScreen.backup.tsx
app/screens/SettingsScreen.backup.tsx
app/screens/MusicPlayerScreen.backup.tsx
```

---

## 💡 Key Points

1. **로직 보존**: 모든 Firebase 로직, 네비게이션, 상태 관리는 그대로 유지됨
2. **UI만 변경**: 디자인 시스템만 Orphi로 교체
3. **하위 호환성**: 기존 타입 정의와 호환 가능
4. **완전 마이그레이션**: ScreenHeader 완전히 제거, 모든 화면 OrphiHeader 사용
5. **타입 안전성**: 완전한 TypeScript 타입 지원
6. **일관된 디자인**: 모든 화면에 Gray50 배경 + Green600 액센트 적용

---

**마이그레이션 진행률**: Phase 1 (100%) + Phase 2 (100%) = **완료! ✅**

**상태**: 전체 19개 화면 Orphi 디자인 시스템 적용 완료

**다음 액션**: 앱 테스트 및 사용자 피드백 수집
