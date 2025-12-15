# Orphi - 완전한 디자인 스펙 리포트

> 뮤지컬 배우를 위한 플랫폼 | 웹 디자인 완벽 분석 및 React Native 구현 가이드

**수집 날짜**: 2025-12-11
**총 스크린샷**: 13개
**소스 URL**: https://mobile-app-design-1uruno.lumi.ing

---

## 📱 앱 개요

**Orphi**는 뮤지컬 배우들을 위한 플랫폼으로, 다음 기능을 제공합니다:
- 🎭 **공고 게시판**: 뮤지컬 오디션 공고 확인
- 🎵 **연습실**: 개인 음악 연습 관리
- 👤 **프로필**: 배우 프로필 및 계정 관리
- ⚙️ **설정**: 앱 설정 및 계정 옵션

---

## 🎨 디자인 시스템

### 색상 팔레트

#### Primary Colors (Green)
```typescript
const colors = {
  // Main Green
  green600: '#2e7d32',      // rgb(46, 125, 50) - Primary brand color
  green400: '#66bb6a',      // rgb(102, 187, 106) - Lighter variant

  // Green Opacity
  green100: 'rgba(46, 125, 50, 0.082)',   // Very light green background
  green400_10: 'rgba(102, 187, 106, 0.082)', // Light green accent
}
```

#### Neutral Colors
```typescript
const neutrals = {
  // Gray Scale
  gray900: '#111827',       // rgb(17, 24, 39) - Darkest text
  gray700: '#374151',       // rgb(55, 65, 81) - Dark text
  gray600: '#4b5563',       // rgb(75, 85, 99) - Medium dark
  gray500: '#6b7280',       // rgb(107, 114, 128) - Medium gray
  gray400: '#9ca3af',       // rgb(156, 163, 175) - Light gray
  gray200: '#e5e7eb',       // rgb(229, 231, 235) - Very light gray
  gray50: '#f9fafb',        // rgb(249, 250, 251) - Lightest gray

  // White variations
  white: '#ffffff',         // rgb(255, 255, 255)
  white95: 'rgba(255, 255, 255, 0.95)',  // Header backdrop
  white80: 'rgba(255, 255, 255, 0.8)',   // Card backdrop
}
```

#### Accent Colors
```typescript
const accents = {
  // Red (Error/Delete)
  red500: '#ef4444',        // rgb(239, 68, 68)

  // Orange (Badge/Warning)
  orange300: '#fbbf24',     // rgb(251, 191, 36) - 20% badge
  orange600: '#ea580c',     // rgb(234, 88, 12)
  orange800: '#9a3412',     // rgb(154, 58, 18)

  // Yellow
  yellow50: '#fffbeb',      // rgb(255, 251, 235) - Light background
}
```

### 그라데이션

```typescript
const gradients = {
  // Primary Header Gradient
  greenPrimary: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)',
  // rgb(46, 125, 50) → rgb(102, 187, 106)

  // Background Gradient
  grayBackground: 'linear-gradient(to right bottom, #f9fafb, #f3f4f6)',
  // rgb(249, 250, 251) → rgb(243, 244, 246)

  // Alternative gradients
  greenHorizontal: 'linear-gradient(90deg, #2e7d32, #66bb6a)',
  grayDark: 'linear-gradient(135deg, #9ca3af, #6b7280)',
}
```

### 타이포그래피

```typescript
const typography = {
  fontSizes: {
    xs: 12,    // Small labels, badges
    sm: 14,    // Secondary text, captions
    base: 16,  // Body text
    lg: 18,    // Large text, section titles
  },

  fontWeights: {
    regular: '400',  // Body text
    medium: '500',   // Emphasized text
    bold: '700',     // Headings, buttons
  },

  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  }
}
```

### 간격 (Spacing)

```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
}

// Common spacing patterns
const spacingPatterns = {
  cardPadding: '20px',              // Card internal padding
  sectionPadding: '16px 24px',      // Section padding
  listItemPadding: '12px 16px',     // List item padding
  buttonPadding: '8px 12px',        // Button padding
  screenPadding: '16px',            // Screen horizontal padding
}
```

### Border Radius

```typescript
const borderRadius = {
  sm: 12,         // Small elements, badges
  md: 16,         // Cards, modals
  lg: 24,         // Large cards, bottom sheets
  full: 9999,     // Pills, circles

  // Special cases
  bottomSheet: '24px 24px 0px 0px',  // Bottom navigation
  header: '0px 0px 24px 24px',       // Header bottom rounded
}
```

### 그림자 (Shadows)

```typescript
const shadows = {
  // Small shadow - Buttons, small cards
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Medium shadow - Cards
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  // Large shadow - Modals, large cards
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },

  // Extra large shadow - Navigation, floating buttons
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 50,
    elevation: 25,
  },
}
```

---

## 📐 화면 구조

### 1. 공고 게시판 (홈 탭)

**레이아웃**:
```
┌─────────────────────────────────────┐
│  Header (Green Gradient)            │ Sticky
│  ├─ Title: "공고 게시판"              │
│  ├─ Subtitle: "✨ 새로운 기회를..."   │
│  └─ Bell Icon (알림, badge)          │
├─────────────────────────────────────┤
│  Tab Switcher (공고 | 단체)          │ Sticky
├─────────────────────────────────────┤
│  Scrollable Content                  │
│  ├─ 공고 Card 1                      │
│  │  ├─ Badge: 모집중, D-day          │
│  │  ├─ Title                         │
│  │  ├─ Organization                  │
│  │  ├─ Role Tags                     │
│  │  └─ Location, Applicants          │
│  ├─ 공고 Card 2                      │
│  └─ ...                              │
├─────────────────────────────────────┤
│  FAB (+) Button                      │ Fixed
├─────────────────────────────────────┤
│  Bottom Navigation (4 tabs)          │ Fixed
└─────────────────────────────────────┘
```

**공고 카드 구조**:
```typescript
<Card> // White bg, rounded-2xl, shadow-lg
  <Header>
    <Badge status="모집중" /> // Green, with clock icon
    <Badge dDay="D--330" />   // Light green background
  </Header>

  <Content>
    <Title>뮤지컬 <위키드> 배우 모집</Title>
    <Organization>브로드웨이 뮤지컬단</Organization>

    <RoleTags> // Green bordered pills
      <Tag>엘파바</Tag>
      <Tag>글린다</Tag>
      <Tag>#주연</Tag>  // Gray background
      <Tag>#여성</Tag>
    </RoleTags>
  </Content>

  <Footer>
    <Location>서울 강남구</Location>
    <Applicants>12명</Applicants> // Green color
  </Footer>
</Card>
```

### 2. 연습실 탭

**레이아웃**:
```
┌─────────────────────────────────────┐
│  Header: "연습실"                     │
│  Subtitle: "🎵 나만의 무대를..."      │
├─────────────────────────────────────┤
│  Search Bar                          │
│  "곡명/뮤지컬명 검색"                  │
├─────────────────────────────────────┤
│  Section Title: "곡 리스트 (4)"      │
├─────────────────────────────────────┤
│  Song Card 1                         │
│  ├─ Album Art (Emoji/Icon)           │
│  ├─ Title: "Defying Gravity"        │
│  ├─ Musical: "위키드"                 │
│  ├─ Artist: "Idina Menzel"           │
│  ├─ Duration: 4:35                   │
│  └─ Play Button                      │
│  Song Card 2...                      │
└─────────────────────────────────────┘
```

**음악 카드**:
- 왼쪽: 앨범 아트 (이모지 또는 아이콘, 라운드 박스)
- 중앙: 제목, 뮤지컬명, 아티스트
- 오른쪽: 재생 버튼 (녹색), 재생 시간

### 3. 프로필 탭

**레이아웃**:
```
┌─────────────────────────────────────┐
│  Header: "프로필"                     │
├─────────────────────────────────────┤
│  Profile Card                        │
│  ├─ Avatar (Green circles)           │
│  ├─ Name: "2000jooyoung"             │
│  └─ Role: "배우"                      │
├─────────────────────────────────────┤
│  기본 정보 Section                    │
│  ├─ 이메일                            │
│  ├─ 전화번호 (미입력)                  │
│  ├─ 성별 (미입력)                     │
│  ├─ 생년월일 (미입력)                  │
│  └─ 키 (미입력)                       │
├─────────────────────────────────────┤
│  계정 상태 Section                    │
│  ├─ 이메일 인증 ✓ 완료                │
│  └─ 프로필 완성도: 20% (Orange bar)   │
├─────────────────────────────────────┤
│  프로필 편집 Button (Green)           │
│  비밀번호 변경 Button                 │
│  로그아웃 Button (Red)                │
└─────────────────────────────────────┘
```

### 4. 설정 탭

일반적인 설정 화면 (스크린샷에서 확인)

### 5. 공고 상세 화면

공고 카드 클릭 시 표시되는 상세 정보

### 6. 알림 화면

**알림 카드**:
- 왼쪽: 아이콘 (타입별 색상)
- 내용: 제목 + 설명
- 오른쪽: 시간 (상대 시간)
- 하단: "읽음 표시" / "삭제" 버튼

---

## 🧩 주요 컴포넌트

### Header Component

```typescript
<Header
  title="공고 게시판"
  subtitle="✨ 새로운 기회를 찾아보세요"
  showBell={true}
  bellBadge={2}  // 알림 개수
  gradient={true}
/>
```

**스타일**:
- Background: Green gradient (135deg)
- Padding: 16px 24px
- Border radius: 0 0 24px 24px (bottom rounded)
- Position: Sticky top
- Backdrop blur + opacity

### Bottom Navigation

```typescript
const tabs = [
  { name: '홈', icon: 'house', href: '#/' },
  { name: '연습실', icon: 'music', href: '#/music' },
  { name: '프로필', icon: 'user', href: '#/profile' },
  { name: '설정', icon: 'settings', href: '#/settings' },
]
```

**스타일**:
- Background: White 95% + backdrop blur
- Border top: Gray 200
- Padding: 32px horizontal, 16px vertical
- Border radius: 24px 24px 0 0 (top rounded)
- Shadow: xl
- Position: Fixed bottom

### Card Component

```typescript
<Card
  variant="elevated"  // shadow-lg
  rounded="2xl"       // 16px
  padding="20px"
  hover={true}        // shadow-xl on hover
  active={true}       // scale-98 on press
>
  {children}
</Card>
```

### Badge Component

```typescript
<Badge
  variant="success"   // Green background
  size="sm"          // 12px text
  rounded="full"     // Pill shape
  icon="clock"       // Optional icon
>
  모집중
</Badge>
```

### Button Component

```typescript
<Button
  variant="primary"   // Green gradient
  size="lg"          // Large
  fullWidth={true}
  rounded="lg"       // 12px
  shadow="md"
>
  프로필 편집 →
</Button>
```

### Floating Action Button (FAB)

```typescript
<FAB
  icon="plus"
  gradient={true}    // Green gradient
  size={64}          // 64x64
  rounded={16}       // Rounded square
  position="bottomRight"
  offset={{ right: 24, bottom: 96 }}  // Above nav bar
  shadow="xl"
/>
```

---

## 🎬 애니메이션 & 인터랙션

### Transitions

```typescript
const transitions = {
  // Default smooth transition
  default: '200ms cubic-bezier(0.4, 0, 0.2, 1)',

  // Fast transition for buttons
  fast: '150ms ease-out',

  // Slow transition for modals
  modal: '300ms ease-in-out',
}
```

### 인터랙션 패턴

**Button Press**:
```typescript
// Active state
transform: 'scale(0.95)',  // Slightly shrink
transition: '150ms'
```

**Card Hover** (웹):
```typescript
// Hover state
boxShadow: 'xl',          // Increase shadow
transition: '200ms'
```

**Tab Switch**:
```typescript
// Active tab
- Color: Green 600
- Bottom border: 4px green
- Transition: 200ms

// Inactive tab
- Color: Gray 500
- Opacity: 0.6
- Hover opacity: 0.8
```

### 애니메이션

**Page Enter** (`animate-slide-up`):
```typescript
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
// Duration: 300ms, easing: ease-out
```

**Page Exit** (`animate-slide-down`):
```typescript
@keyframes slideDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

**Pulse** (알림 뱃지):
```typescript
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
// Duration: 2s, infinite
```

---

## 📱 React Native 구현 가이드

### 1. 디자인 토큰 설정

`app/design-system/tokens/orphi.ts`:

```typescript
export const orphiTokens = {
  colors: {
    // Primary
    green600: '#2e7d32',
    green400: '#66bb6a',
    green100: 'rgba(46, 125, 50, 0.082)',

    // Neutrals
    gray900: '#111827',
    gray700: '#374151',
    gray500: '#6b7280',
    gray200: '#e5e7eb',
    gray50: '#f9fafb',
    white: '#ffffff',

    // Accents
    red500: '#ef4444',
    orange300: '#fbbf24',
  },

  gradients: {
    greenPrimary: ['#2e7d32', '#66bb6a'],
    grayBg: ['#f9fafb', '#f3f4f6'],
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
  },

  borderRadius: {
    sm: 12,
    md: 16,
    lg: 24,
    full: 9999,
  },

  typography: {
    sizes: { xs: 12, sm: 14, base: 16, lg: 18 },
    weights: { regular: '400', medium: '500', bold: '700' },
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
      elevation: 10,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 25 },
      shadowOpacity: 0.25,
      shadowRadius: 50,
      elevation: 25,
    },
  },
}
```

### 2. 공통 컴포넌트

#### Header Component

```typescript
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Bell } from 'lucide-react-native'
import { orphiTokens } from '../design-system/tokens/orphi'

interface HeaderProps {
  title: string
  subtitle?: string
  showBell?: boolean
  bellBadgeCount?: number
  onBellPress?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBell = false,
  bellBadgeCount = 0,
  onBellPress,
}) => {
  return (
    <LinearGradient
      colors={orphiTokens.gradients.greenPrimary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {showBell && (
          <TouchableOpacity
            style={styles.bellButton}
            onPress={onBellPress}
            activeOpacity={0.7}
          >
            <Bell size={22} color={orphiTokens.colors.white} />
            {bellBadgeCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{bellBadgeCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: orphiTokens.spacing.xl,
    paddingVertical: orphiTokens.spacing.base,
    borderBottomLeftRadius: orphiTokens.borderRadius.lg,
    borderBottomRightRadius: orphiTokens.borderRadius.lg,
    ...orphiTokens.shadows.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: orphiTokens.typography.sizes.lg * 1.33, // 24px
    fontWeight: orphiTokens.typography.weights.bold,
    color: orphiTokens.colors.white,
  },
  subtitle: {
    fontSize: orphiTokens.typography.sizes.sm,
    color: orphiTokens.colors.white,
    opacity: 0.9,
    marginTop: orphiTokens.spacing.xs,
  },
  bellButton: {
    padding: orphiTokens.spacing.sm,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: orphiTokens.colors.red500,
    borderRadius: orphiTokens.borderRadius.full,
    width: 10,
    height: 10,
    borderWidth: 2,
    borderColor: orphiTokens.colors.white,
  },
  badgeText: {
    display: 'none', // 작은 점만 표시
  },
})
```

#### Card Component

```typescript
import React from 'react'
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native'
import { orphiTokens } from '../design-system/tokens/orphi'

interface CardProps {
  children: React.ReactNode
  onPress?: () => void
  style?: ViewStyle
}

export const Card: React.FC<CardProps> = ({ children, onPress, style }) => {
  const Container = onPress ? TouchableOpacity : View

  return (
    <Container
      onPress={onPress}
      activeOpacity={0.98}
      style={[styles.card, style]}
    >
      {children}
    </Container>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: orphiTokens.colors.white,
    borderRadius: orphiTokens.borderRadius.md,
    padding: orphiTokens.spacing.lg,
    ...orphiTokens.shadows.lg,
    borderWidth: 1,
    borderColor: orphiTokens.colors.gray200,
  },
})
```

#### Bottom Navigation

```typescript
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Home, Music, User, Settings } from 'lucide-react-native'
import { orphiTokens } from '../design-system/tokens/orphi'

const tabs = [
  { name: '홈', icon: Home, route: 'Home' },
  { name: '연습실', icon: Music, route: 'Practice' },
  { name: '프로필', icon: User, route: 'Profile' },
  { name: '설정', icon: Settings, route: 'Settings' },
]

export const BottomNavigation: React.FC<{ activeRoute: string; onNavigate: (route: string) => void }> = ({
  activeRoute,
  onNavigate,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {tabs.map((tab) => {
          const isActive = activeRoute === tab.route
          const Icon = tab.icon

          return (
            <TouchableOpacity
              key={tab.route}
              style={styles.tab}
              onPress={() => onNavigate(tab.route)}
              activeOpacity={0.8}
            >
              <Icon
                size={24}
                color={isActive ? orphiTokens.colors.green600 : orphiTokens.colors.gray500}
              />
              <Text style={[
                styles.tabText,
                isActive && styles.tabTextActive
              ]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: orphiTokens.colors.gray200,
    paddingHorizontal: orphiTokens.spacing['2xl'],
    paddingVertical: orphiTokens.spacing.base,
    borderTopLeftRadius: orphiTokens.borderRadius.lg,
    borderTopRightRadius: orphiTokens.borderRadius.lg,
    ...orphiTokens.shadows.xl,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: orphiTokens.spacing.xs,
    opacity: 0.6,
  },
  tabText: {
    fontSize: orphiTokens.typography.sizes.xs,
    fontWeight: orphiTokens.typography.weights.medium,
    color: orphiTokens.colors.gray500,
  },
  tabTextActive: {
    color: orphiTokens.colors.green600,
    opacity: 1,
  },
})
```

---

## 📦 필요한 의존성

```json
{
  "dependencies": {
    "expo-linear-gradient": "^13.0.2",
    "lucide-react-native": "^0.309.0",
    "react-native-reanimated": "^3.6.1"
  }
}
```

설치:
```bash
npx expo install expo-linear-gradient
npm install lucide-react-native
npx expo install react-native-reanimated
```

---

## 🚀 다음 단계

### 1단계: 디자인 시스템 구축
- ✅ `orphi.tokens.ts` 생성
- ✅ 공통 컴포넌트 생성 (Header, Card, BottomNav)
- ⏳ Badge, Button, FAB 컴포넌트

### 2단계: 화면 구현
- ⏳ 홈 탭 (공고 게시판)
- ⏳ 연습실 탭
- ⏳ 프로필 탭
- ⏳ 설정 탭

### 3단계: 기능 통합
- ⏳ 현재 앱 로직 연결
- ⏳ 데이터 바인딩
- ⏳ 네비게이션 설정

### 4단계: 폴리싱
- ⏳ 애니메이션 적용
- ⏳ 반응형 대응
- ⏳ 접근성 개선

---

## 📸 스크린샷 인덱스

### 기본 플로우
- `000-landing.png` - 랜딩 페이지
- `001-login-form.png` - 로그인 폼
- `002-login-filled.png` - 로그인 입력 완료

### 탭 화면
- `003-tab-0-홈.png` - 홈 탭 (공고 게시판)
- `004-tab-1-연습실.png` - 연습실 탭
- `005-tab-2-프로필.png` - 프로필 탭
- `006-tab-2-프로필-scrolled.png` - 프로필 스크롤
- `007-tab-3-설정.png` - 설정 탭
- `008-tab-3-설정-scrolled.png` - 설정 스크롤

### 상세 화면
- `009-card-0-detail.png` - 공고 상세 1
- `010-card-1-detail.png` - 공고 상세 2
- `011-fab-modal.png` - FAB 모달
- `012-notifications.png` - 알림 화면

---

## 💡 구현 팁

### 1. 그라데이션 구현
```typescript
import { LinearGradient } from 'expo-linear-gradient'

// 135deg = { x: 0, y: 0 } → { x: 1, y: 1 }
<LinearGradient
  colors={['#2e7d32', '#66bb6a']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.container}
/>
```

### 2. 아이콘 사용
```typescript
import { Home, Music, User, Settings, Bell, Plus } from 'lucide-react-native'

<Home size={24} color="#2e7d32" strokeWidth={2} />
```

### 3. 애니메이션
```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'

const scale = useSharedValue(1)

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: withSpring(scale.value) }],
}))

// Press 시
scale.value = 0.95
```

### 4. 그림자 iOS/Android
```typescript
// iOS
shadowColor: '#000',
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.1,
shadowRadius: 6,

// Android
elevation: 4,
```

---

**생성일**: 2025-12-11
**도구**: Playwright Design Scraper
**플랫폼**: React Native (Expo)
