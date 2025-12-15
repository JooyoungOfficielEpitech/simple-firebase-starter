# Part 5: Supporting Features - UX Documentation

**Document Version**: 1.0
**Last Updated**: 2025-12-04
**Scope**: NotificationCenterScreen, SettingsScreen, DevSettingsScreen (development-only)

---

## Table of Contents
1. [NotificationCenterScreen](#1-notificationcenterscreen)
2. [SettingsScreen](#2-settingsscreen)
3. [DevSettingsScreen](#3-devsettingsscreen-development-only)
4. [Cross-Screen Patterns Summary](#4-cross-screen-patterns-summary)
5. [Recommended Next Steps for Designer](#5-recommended-next-steps-for-designer)

---

## 1. NotificationCenterScreen

### Screen Purpose
Central hub for viewing all user notifications with real-time updates, supporting both organizers (application management) and general users (post updates). Provides contextual navigation to relevant content.

### UI Components

#### Header
- **Component**: `ScreenHeader`
- **Title**: Dynamic with unread count badge
  - Format: `"알림"` or `"알림 (count)"` when unread notifications exist
- **Notification Icon**: Hidden on this screen (`showNotificationIcon={false}`)
- **Position**: Fixed, always visible at top

#### Loading State
- **Indicator**: `ActivityIndicator` (large, primary color)
- **Text**: "알림을 불러오는 중..."
- **Layout**: Centered in viewport with padding
- **Duration**: Until Firestore subscription resolves

#### Empty State
- **Icon**: 🔔 emoji (48px)
- **Title**: "알림이 없습니다" (18px, semiBold)
- **Subtitle**: "새로운 알림이 있으면 여기에 표시됩니다" (14px, textDim)
- **Layout**: Vertically centered, minimum height 400px

#### Notification Cards
Each notification is displayed as a card containing:

**1. Icon + Title Row** (Header Section)
- Type-specific emoji icon (left)
- Notification title (18px bold, wraps if needed)
- Relative timestamp (12px textDim, right-aligned)

**2. Message Content** (Body Section)
- Message text (15px, textDim)
- Line height: 22px for readability

**3. Unread Indicator**
- Red dot (8px diameter, `#FF3B30`)
- Position: Top-right corner
- Visibility: Only for unread notifications

### Information Architecture

#### Notification Types & Icons

| Type | Icon | Audience | Description |
|------|------|----------|-------------|
| `application_received` | 👤 | Organizer | New application submitted |
| `application_accepted` | ✅ | General User | Application approved |
| `application_rejected` | ❌ | General User | Application declined |
| `application_cancelled` | 🚫 | Organizer | User cancelled application |
| `post_status_changed` | 📝 | General User | Post status updated |
| `post_updated` | ✏️ | General User | Post content modified |
| `default` | 🔔 | All | Generic notification |

#### Notification Data Structure
```typescript
{
  id: string
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  postId?: string
  postTitle?: string
  createdAt: Timestamp
}
```

#### Time Display Logic

| Condition | Display |
|-----------|---------|
| < 1 minute | "방금 전" |
| < 60 minutes | "N분 전" |
| < 24 hours | "N시간 전" |
| ≥ 24 hours | "N일 전" |
| Error | "시간 알 수 없음" / "시간 오류" |

### User Interactions

#### Tap Notification Card
1. **Auto-read**: Marks unread notifications as read automatically
2. **Navigation**: Routes based on type and user role (see table below)

#### Real-time Updates
- Automatic refresh when new notifications arrive
- Live subscription via Firestore
- Unread count updates instantly in header

#### Pull to Refresh
- Available via `Screen preset="scroll"`
- Standard iOS/Android pull gesture

#### Scroll
- Vertical list of notification cards
- Gap: 16px between cards

### Navigation

#### Entry Points
- **ScreenHeader bell icon**: Available from any screen except NotificationCenter
  - Shows unread count badge
  - Tappable when notifications exist
  - Hidden on NotificationCenter screen itself
- **Direct navigation**: `navigate("NotificationCenter")`

#### Exit Points & Destinations

| User Type | Notification Type | Destination | Parameters |
|-----------|------------------|-------------|------------|
| Organizer | `application_received` | ApplicationManagement | `postId`, `postTitle` |
| Organizer | `application_cancelled` | ApplicationManagement | `postId`, `postTitle` |
| General User | All others | PostDetail | `postId` |

### State Variations

#### 1. Loading State
- **Trigger**: Initial data fetch, no user logged in
- **UI**: Centered spinner + loading text
- **Duration**: Until Firestore subscription resolves

#### 2. Empty State
- **Trigger**: User has no notifications
- **UI**: Bell icon + empty message
- **User Action**: No interactions available

#### 3. Notifications List State
- **Trigger**: User has 1+ notifications
- **UI**: Scrollable card list
- **Dynamic Elements**:
  - Unread count in header title
  - Visual distinction for unread cards

#### 4. Read vs Unread Visual States

| State | Background | Border | Red Dot |
|-------|-----------|--------|---------|
| **Unread** | `colors.palette.neutral100` (light blue tint) | 1px `colors.palette.primary500` (accent color) | Visible (top-right, 8px) |
| **Read** | `colors.background` (white/default) | 1px `colors.border` (subtle gray) | Hidden |

### Integration with Core Features

#### Authentication Integration
- **Dependency**: Requires authenticated user
- **Behavior**: Auto-clears notifications when user logs out
- **Real-time Sync**: Subscription tied to `user.uid`

#### Firestore Integration
- **Service**: `notificationService.subscribeToUserNotifications`
- **Update Mechanism**: Real-time callback on changes
- **Cleanup**: Unsubscribes on component unmount

#### Navigation Integration
- **Global Access**: `ScreenHeader` provides bell icon across app
- **Badge System**: Shows unread count throughout app
- **Deep Linking**: Notifications navigate to specific posts/applications

#### Theme Integration
- Fully themed components
- Responds to theme changes
- Consistent color palette usage

### Critical Considerations

#### Visual Hierarchy & Readability
- **Card Spacing**: 16px vertical gap (`spacing.md`)
- **Padding**: 16px internal (`spacing.lg`)
- **Border Radius**: 12px for friendly, modern feel
- **Minimum Card Height**: 120px ensures touch target accessibility

#### Touch Target Accessibility
- **Entire Card Tappable**: `TouchableOpacity` wrapper
- **Minimum Size**: 44x44pt touch targets (iOS HIG compliance)
- **No Nested Interactives**: Prevents gesture conflicts

#### Information Density Balance
- **Header Row**: Icon + title + time (horizontal layout)
- **Message**: Separate line below for breathing room
- **Line Heights**: 24px (title), 22px (message) for readability

#### Visual Feedback States
- **Unread State**: Clear differentiation (color + border + dot)
- **Read State**: Subtle neutral appearance
- **Active Press**: Implicit via TouchableOpacity opacity change

#### Empty State UX
- **Clear Messaging**: Users understand what to expect
- **Visual Consistency**: Large icon + centered text pattern
- **No Dead Ends**: Explains purpose even when empty

#### Performance Considerations
- **Real-time Updates**: Efficient Firestore subscriptions
- **Cleanup**: Unsubscribes on unmount to prevent memory leaks
- **Error Handling**: Graceful degradation with error messages

#### Content Overflow Handling
- **Title**: Wraps to multiple lines if needed (`flex: 1`)
- **Message**: Wraps with consistent line height
- **Timestamp**: Fixed width, right-aligned, never wraps

#### Notification Persistence
- **Read Status**: Persists across sessions
- **Navigation State**: Users can return to notification center
- **Scroll Position**: Not preserved, resets on re-entry

---

## 2. SettingsScreen

### Screen Purpose
User settings hub for account type management (organizer ↔ general user conversion) and theme personalization. Features theatrical curtain animation for theme changes.

### UI Components

#### Header
- **Component**: `ScreenHeader`
- **Title**: "Settings"
- **Back Button**: Hidden (`showBackButton={false}`)
- **Notification Icon**: Standard, visible

#### Content Sections
Uses `ContentSection` component for consistent styling:

##### Section 1: User Type Management
- **Current User Type Display**: 16px, centered
  - Format: `"현재: 운영자 (OrganizationName)"` or `"현재: 일반 사용자"`
- **Primary Action Button**: Conditional based on `userType`
  - **General User**: "운영자 계정으로 만들기" (primary action color)
  - **Organizer**: "일반 사용자로 전환" (theme-specific color)
  - Loading state support

##### Section 2: Theme Selection
- **Title**: "테마 선택" (18px, semiBold, centered)
- **Subtitle**: "좋아하는 캐릭터의 테마를 선택해보세요" (14px, textDim)
- **Radio Button Group**: 4 character themes, each containing:
  - Radio button (left, theme-colored)
  - Character emoji icon
  - Character name (16px, medium)
  - Character quote/description (13px, textDim)
- **Layout**: Vertical stack, 16px gap between options
- **Disabled State**: During theme transition animation

#### Footer Actions
- **Logout Button**: Filled preset, primary theme color
- **Position**: Below sections
- **Minimum Width**: 120px

#### Modal Components
- **AlertModal**: Conditional rendering
  - Multi-button support for complex flows
  - Customizable title, message, buttons
  - Dismissable configuration

#### Animation Components: Theatrical Curtain Effect

##### Curtain Overlay
- **Position**: Absolute, `z-index: 1000`
- **Left Curtain Panel**: 50% width
- **Right Curtain Panel**: 50% width
- **Curtain Rod**: Top 20px height, brown/border color
- **Curtain Rings**: 8 rings per panel (decorative)
- **Fold Effects**: 5 vertical stripes per panel (darker shade)

##### Animation States
1. **Hidden**: Opacity 0, panels off-screen
2. **Appearing**: Fade in, scale up (200ms)
3. **Closing**: Panels slide to center (400ms)
4. **Theme Change**: Instant change behind curtain
5. **Opening**: Panels slide to edges (400ms)
6. **Hidden**: Fade out

**Total Animation Duration**: ~1.2 seconds

### Information Architecture

#### User Type States

| Current Type | Display | Action Button | Navigation Target |
|--------------|---------|---------------|-------------------|
| General (no history) | "일반 사용자" | "운영자 계정으로 만들기" | CreateOrganization (new) |
| General (with history) | "일반 사용자" | "운영자 계정으로 만들기" | CreateOrganization OR auto-restore previous |
| Organizer | "운영자 (OrgName)" | "일반 사용자로 전환" | In-place conversion |

#### Theme Options: 4 Character Themes

| Theme ID | Character | Icon | Quote | Color Code |
|----------|-----------|------|-------|------------|
| `elphaba` | 엘파바 (Elphaba) | 🟢 | "누구나 세상을 날아오를 수 있어 (Defying Gravity)" | Green `#2E7D32` |
| `glinda` | 글린다 (Glinda) | 🌸 | "인기가 많아질거야! 넌 인기가 많아질 거라고! (Popular)" | Pink `#C2185B` |
| `gwynplaine` | 그윈플렌 (Gwynplaine) | 🍷 | "부자들의 낙원은 가난한 자들의 지옥으로 세워진 것이니까요" | Brown `#8D6E63` |
| `johanna` | 조안나 (Johanna) | 🕊️ | "날 수 없는 난 노래해" | Sky Blue `#3F7CAC` |

#### Curtain Colors: Theme-Specific

| Theme | Curtain Color | Fold Color (Darker) |
|-------|---------------|---------------------|
| Elphaba | `#2E7D32` (deep green) | `#1B5E20` |
| Glinda | `#C2185B` (deep pink) | `#880E4F` |
| Gwynplaine | `#8D6E63` (deep brown) | `#5D4037` |
| Johanna | `#3F7CAC` (dark sky blue) | `#2E5984` |

### User Interactions

#### User Type Conversion Flows

##### Flow 1: General → Organizer (No History)
1. Tap button
2. Navigate to `CreateOrganization`
3. Complete setup
4. Return (auto-refresh profile)

##### Flow 2: General → Organizer (With History)
1. Tap button
2. `AlertModal` with 3 options:
   - "취소" (cancel)
   - "새로운 운영자 계정 만들기" → `CreateOrganization`
   - "이전 단체로 복귀" → Attempt auto-conversion
3. If auto-conversion succeeds:
   - Success alert + refresh
4. If auto-conversion fails:
   - Error alert + option to create new

##### Flow 3: Organizer → General
1. Tap button
2. Confirmation `AlertModal`: "일반 사용자로 전환하시겠습니까? 운영자 권한이 사라집니다."
3. Confirm
4. Execute conversion
5. Success alert
6. Refresh profile
7. UI updates

#### Theme Change Flow
1. Tap radio button for different theme
2. Check if theme already active (early return if same)
3. Disable all radio buttons (`isThemeChanging = true`)
4. **Animation Sequence**:
   - Curtain appears (fade in, scale up, 200ms)
   - Curtains close to center (slide, 400ms)
   - Theme change executes (instant)
   - Wait 200ms
   - Curtains open (slide out, 400ms)
   - Re-enable radio buttons (`isThemeChanging = false`)
5. **Total Duration**: ~1.2 seconds

#### Logout Flow
1. Tap "로그아웃" button
2. Execute logout (async)
3. Navigate to authentication flow (handled by `AuthContext`)

### Navigation

#### Entry Points
- **Bottom Tab Navigation**: Settings tab
- **Deep Link**: Direct navigation

#### Exit Points
- **CreateOrganization**: `{ isOrganizerConversion: true }` (for "convert to organizer" new)
- **In-place**: For "convert to organizer" restore (auto-conversion)
- **In-place**: For "revert to general" conversion
- **Authentication Flow**: For logout

#### Auto-Refresh on Focus
- **Hook**: `useFocusEffect`
- **Trigger**: On screen focus
- **Action**: Reloads user profile automatically
- **Benefit**: Ensures data freshness when returning to screen

### State Variations

#### 1. Loading
- **Trigger**: Initial profile fetch
- **UI**: Buttons show loading spinners
- **Duration**: Until Firestore fetch completes

#### 2. General User State
- **User Type Section**: Shows "일반 사용자" + conversion button
- **Button**: "운영자 계정으로 만들기" (primary action color)

#### 3. Organizer User State
- **User Type Section**: Shows "운영자 (OrgName)" + revert button
- **Button**: "일반 사용자로 전환" (theme-specific danger color)

#### 4. Theme Transition State
- **Trigger**: User selects different theme
- **UI Changes**:
  - All radio buttons disabled
  - Curtain overlay visible (`z-index: 1000`)
  - Animation sequence plays
  - App theme changes mid-animation
  - UI elements re-render with new theme

#### 5. Converting State
- **Trigger**: User initiated conversion action
- **UI**: Button shows loading spinner (`isLoading={converting}`)
- **Duration**: Until Firestore operation completes

### Integration with Core Features

#### Authentication Integration
```typescript
const { user } = useAuth()
const { logout } = useAuth()
```
- User profile loaded via `userService.getUserProfile()`
- Logout triggers app-wide authentication state change

#### Theme System Integration
```typescript
const { wickedCharacterTheme, setWickedCharacterTheme } = useAppTheme()
```
- Theme state managed globally
- Theme change triggers app-wide re-render
- Curtain animation synchronized with theme transition

#### Navigation Integration
- `useFocusEffect`: Auto-refresh on screen focus
- `navigation.navigate()`: Deep linking to CreateOrganization
- Tab navigation: No back button needed

#### User Service Integration
- `userService.attemptAutoOrganizerConversion()`
- `userService.revertToGeneralUser()`
- `userService.getUserProfile()`

#### Alert System Integration
```typescript
const { alertState, alert, confirm, hideAlert } = useAlert()
```
- Replaces native alerts with themed modals
- Supports multi-button complex flows
- Dismissable configuration

### Critical Considerations

#### Theatrical Theme Change Animation

**Purpose**: Delightful, brand-appropriate transition for musical theatre theme

**Key Design Decisions**:
- **Curtain Metaphor**: Aligns with theatrical setting
- **Color-coded Curtains**: Preview incoming theme color
- **Smooth Timing**: 1.2s total feels deliberate, not sluggish
- **Disabled Interaction**: Prevents mid-animation conflicts
- **Z-index Layering**: Curtain appears above all content

**Technical Implementation**:
- `Animated.View` with transform animations
- Parallel animations for synchronized movement
- Theme change hidden behind closed curtain
- Sequential timing with callbacks

#### User Type Conversion Safety

**Risk Mitigation**:
- Confirmation dialog prevents accidental conversions
- Clear messaging warns about permission loss
- Restore option allows returning to previous organization
- Auto-detection checks for prior organizer history

**UX Flow Optimization**:
- Multi-button alerts for complex choices
- Loading states during async operations
- Success/error feedback
- Auto-refresh after conversion

#### Theme Selection UX

**Discoverability**:
- Visual radio buttons (not just text)
- Character quotes create emotional connection
- Emoji icons for quick recognition
- Preview via curtain color before completion

**Interaction Clarity**:
- Disabled state during animation (no double-tap issues)
- Selected state visually distinct (theme-colored outline + fill)
- Entire row tappable (not just radio button)

#### ContentSection Component Pattern

**Benefits**:
- Consistent section styling app-wide
- Centered content (max-width 400px)
- Title + subtitle pattern
- Variant support (default/card/flat)

#### Radio Button Theming

**Challenge**: 4 different color schemes for radio buttons

**Solution**:
- Per-theme style overrides
- `inputDetailStyle`: Inner circle color
- `inputOuterStyle`: Border color when selected
- `colors.secondaryAction`: Uses theme-specific accent color

#### Accessibility Considerations
- **Touch Targets**: Full row tappable (not just 24px radio)
- **Loading States**: Buttons disabled during operations
- **Clear Labels**: Descriptive text for screen readers
- **Visual Feedback**: Color + icon + text (multiple modalities)

#### Performance Considerations
- **useFocusEffect**: Only refreshes when screen gains focus
- **Conditional Rendering**: `AlertModal` only renders when needed
- **Animation Optimization**: `useNativeDriver` for smooth 60fps
- **State Management**: Minimal re-renders during theme change

#### Error Handling
- **Conversion Failures**: Show error alert + retry option
- **Network Issues**: Graceful error messages
- **Auto-conversion Fallback**: Offers manual creation as backup

---

## 3. DevSettingsScreen (Development Only)

### Production Relevance Assessment

**⚠️ EXCLUDE FROM PRODUCTION REDESIGN**

This screen is **purely for development/debugging purposes** and contains no user-facing features that should be in the final app.

### Brief Summary

**Purpose**: Developer debugging interface for push notifications, performance monitoring, and TrackPlayer status.

**Why NOT Production-Ready**:
1. **Sensitive Information**: Exposes FCM tokens, database internals
2. **Dangerous Operations**: Deactivate all tokens, cleanup functions
3. **Technical Jargon**: Performance metrics, debug logs, token statistics
4. **No User Value**: All features are for developer troubleshooting only
5. **Security Risk**: Exposes internal system state and configuration

**Key Sections**:
- Push notification status & FCM token display
- Performance monitoring (app state transitions, memory usage)
- TrackPlayer debugging (playback state, queue status)
- Token management (cleanup, deactivation, duplicate removal)
- Debug logs viewer

### Recommendation for Designer

**Do NOT include in production UX redesign.**

If debugging features are needed post-launch, implement via:
- **Hidden Gesture**: Shake device or multi-tap on Settings screen
- **Separate Admin Build**: Developer-only app variant
- **Backend Dashboard**: Web-based admin interface (not in-app)

---

## 4. Cross-Screen Patterns Summary

### AlertModal Pattern
- **Usage**: SettingsScreen, NotificationCenterScreen (indirect via navigation)
- **Pattern**: Unified alert system across app (replaces native alerts)
- **Design Consistency**:
  - Themed appearance
  - Multi-button support (1-3 buttons)
  - Customizable title + message
  - Dismissable configuration

### ContentSection Pattern
- **Usage**: SettingsScreen (extensively)
- **Pattern**: Consistent section styling
  - Centered content (max 400px)
  - Flexible variants (default/card/flat)
  - Title + optional subtitle
- **Benefits**: Unified visual language, easy maintenance

### Empty State Pattern
- **Usage**: NotificationCenterScreen
- **Pattern**:
  - Large emoji icon (48px)
  - Bold title (18px)
  - Explanatory subtitle (14px, textDim)
  - Centered vertically and horizontally
  - Minimum height constraint
- **Consistency**: Follows iOS/Android platform conventions

### Loading State Pattern
- **Usage**: NotificationCenter, Settings
- **Pattern**:
  - `ActivityIndicator` (large, primary color)
  - Optional descriptive text
  - Centered in container
  - Disables interactions during loading
- **User Benefit**: Clear feedback during async operations

### ScreenHeader Pattern
- **Usage**: All screens
- **Features**:
  - Consistent title styling
  - Optional back button
  - Optional notification bell icon
  - Unread badge integration
  - Safe area handling
- **Flexibility**: Customizable per-screen needs

---

## 5. Recommended Next Steps for Designer

### NotificationCenterScreen Redesign

#### 1. Visual Refinement of Notification Cards
- **Read/Unread State Differentiation**:
  - Consider more dramatic visual distinction
  - Alternative: Subtle background animation for unread?
  - Test color contrast ratios for accessibility
- **Icon Styling**:
  - Custom icons vs emoji (emoji currently used)
  - Consider iconography system (Feather, Ionicons, custom set)
  - Size and spacing optimization
- **Typography Hierarchy Polish**:
  - Refine font weights and sizes
  - Test readability on small screens
  - Consider dynamic type support

#### 2. Empty State Illustration
- **Current**: Emoji 🔔
- **Alternatives**:
  - Custom illustration (theatrical theme?)
  - Animated SVG (gentle pulse, fade in/out)
  - Lottie animation
- **Brand Alignment**: Should match app's musical theatre theme

#### 3. Loading State Enhancement
- **Skeleton Loading**:
  - Replace spinner with skeleton cards
  - Smoother perceived performance
  - Maintains layout stability
- **Progressive Loading**:
  - Fade in notifications as they load
  - Staggered animation for list
  - Long list optimization

#### 4. Interaction Micro-Animations
- **Card Tap Feedback**:
  - Spring animation on press
  - Subtle scale effect
  - Haptic feedback consideration
- **Swipe-to-Delete** (Optional):
  - iOS-style swipe actions
  - Mark as read/unread, delete
  - Red background reveal
- **Badge Number Transitions**:
  - Animated counter increment/decrement
  - Badge pop effect when new notification arrives

---

### SettingsScreen Redesign

#### 1. Curtain Animation Refinement
- **Easing Curves**:
  - Current: Linear timing
  - Suggestion: Custom easing for theatrical feel
  - Reference: Stage curtain physics
- **Sound Effects** (Optional):
  - Curtain swoosh sound
  - Subtle audio cue for theme change
  - Brand-appropriate sound design
- **Curtain Texture/Gradient**:
  - Add fabric-like texture
  - Subtle gradient for depth
  - Shadow refinement

#### 2. Theme Selection Visual Design
- **Character Imagery/Illustrations**:
  - Beyond emoji icons
  - Character silhouettes or portraits
  - Themed backgrounds
- **Preview Cards**:
  - Show theme colors in miniature
  - Sample UI elements
  - Before/after comparison
- **Radio Button Redesign**:
  - More theatrical styling?
  - Custom checkmark/selection indicator
  - Animation on selection

#### 3. Conversion Flow Clarity
- **Visual Wizard/Stepper**:
  - Multi-step flow visualization
  - Progress indication (step 1 of 3)
  - Breadcrumb navigation
- **Clearer Consequences Messaging**:
  - Iconography for warnings
  - Highlight important information
  - "What happens next" preview

#### 4. Button Hierarchy
- **Primary vs Secondary Actions**:
  - Visual weight differentiation
  - Color coding consistency
  - Size variation
- **Danger State Visual Language**:
  - Red accent for destructive actions
  - Warning iconography
  - Confirmation requirement
- **Loading State Animations**:
  - Spinner style consistency
  - Progress indication
  - Subtle pulse effect

---

### Cross-Screen Consistency

#### 1. Component Library Alignment
- **AlertModal Styling**:
  - Consistent border radius
  - Shadow/elevation standards
  - Button spacing and hierarchy
- **ContentSection Variants**:
  - Card variant refinement
  - Padding/margin system
  - Background color options
- **Empty State Pattern**:
  - Iconography consistency
  - Typography scale
  - Layout proportions
- **Loading State Pattern**:
  - Spinner style (size, color, animation)
  - Positioning rules
  - Text styling

#### 2. Animation Language
- **Transition Timing Consistency**:
  - Standard durations (200ms, 300ms, 500ms)
  - Easing curve library
  - Platform-specific defaults
- **Easing Curve Standards**:
  - Entry animations (ease-out)
  - Exit animations (ease-in)
  - Interactive animations (ease-in-out)
- **Micro-interaction Patterns**:
  - Button press feedback
  - Card tap effects
  - List item animations

#### 3. Accessibility Audit
- **Color Contrast Ratios**:
  - WCAG AA compliance minimum (4.5:1 for text)
  - Test all theme variants
  - High contrast mode support
- **Touch Target Sizes**:
  - Minimum 44x44pt (iOS)
  - Minimum 48x48dp (Android)
  - Spacing between targets
- **Screen Reader Optimization**:
  - Semantic labeling
  - Focus order
  - Dynamic announcements
- **Dynamic Type Support**:
  - Text size scaling
  - Layout reflow
  - Minimum/maximum sizes

---

## Design System Recommendations

### Typography Scale
Suggested scale for consistency across all screens:

| Style | Size | Weight | Use Case |
|-------|------|--------|----------|
| Heading 1 | 24px | Bold | Screen titles |
| Heading 2 | 18px | SemiBold | Section headers |
| Body Large | 16px | Regular | Primary content |
| Body | 15px | Regular | Secondary content |
| Caption | 14px | Regular | Supporting text |
| Small | 13px | Regular | Descriptions, hints |
| Tiny | 12px | Medium | Timestamps, metadata |

### Spacing System
Consistent spacing tokens:

| Token | Value | Use Case |
|-------|-------|----------|
| `xs` | 4px | Tight spacing |
| `sm` | 8px | Compact spacing |
| `md` | 16px | Standard spacing |
| `lg` | 24px | Generous spacing |
| `xl` | 32px | Section separation |
| `2xl` | 48px | Major divisions |

### Color Roles
Semantic color system:

| Role | Purpose | Example Usage |
|------|---------|---------------|
| `primaryAction` | Main CTAs | Theme-specific buttons |
| `secondaryAction` | Supporting actions | Radio buttons, links |
| `text` | Primary text | Titles, body text |
| `textDim` | Secondary text | Descriptions, timestamps |
| `border` | Dividers, outlines | Card borders, inputs |
| `background` | Canvas | Screen background |
| `surface` | Elevated elements | Cards, modals |

---

## Korean Text Preservation

All Korean text has been preserved exactly as it appears in the codebase:

- "알림" / "알림 (count)"
- "알림을 불러오는 중..."
- "알림이 없습니다"
- "새로운 알림이 있으면 여기에 표시됩니다"
- "방금 전" / "N분 전" / "N시간 전" / "N일 전"
- "현재: 운영자 (OrganizationName)" / "현재: 일반 사용자"
- "운영자 계정으로 만들기"
- "일반 사용자로 전환"
- "테마 선택"
- "좋아하는 캐릭터의 테마를 선택해보세요"
- Character names and quotes (Elphaba, Glinda, Gwynplaine, Johanna)
- "로그아웃"

---

## Implementation Notes for Developers

### NotificationCenterScreen
- **Real-time Subscription**: Firestore `onSnapshot` listener
- **Memory Management**: Cleanup unsubscribe on unmount
- **Error Handling**: Graceful fallback for timestamp parsing
- **Navigation**: Conditional routing based on notification type

### SettingsScreen
- **Animation Performance**: `useNativeDriver` for transforms
- **State Management**: Local state for conversion + global for theme
- **Auto-refresh**: `useFocusEffect` hook ensures fresh data
- **Curtain Effect**: Complex multi-stage animation sequence

### Cross-Screen
- **AlertModal**: Custom hook `useAlert` for consistent alerts
- **ContentSection**: Reusable layout component
- **ScreenHeader**: Standardized header with optional elements
- **Theme Context**: Global theme state with character-specific colors

---

**End of Part 5: Supporting Features**
