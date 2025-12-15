# Part 2: Bulletin Board Feature - UX Documentation

## Overview

The Musical Gathering Announcements feature (Bulletin Board System) is a comprehensive platform for connecting musical organizations with performers. It enables organizations to post audition announcements and manage applications, while actors can browse opportunities and submit applications.

---

## Feature Summary

| Aspect | Description |
|--------|-------------|
| **Primary Purpose** | Connect musical theater organizations with performers through structured announcements |
| **Target Users** | Organizations (posters) and Actors (applicants) |
| **Key Screens** | 4 main screens + supporting components |
| **Data Model** | Posts, Applications, Organizations, User Profiles |
| **Permission Model** | Role-based (Organizer vs Actor) |

---

## 1. BulletinBoardScreen - Central Bulletin Board Hub

### Screen Purpose
Central hub for browsing musical announcements and organizations. Serves as the entry point to the entire bulletin board feature with dual-tab navigation.

### UI Components

#### Header
- **Component**: `ScreenHeader`
- **Dynamic Title Behavior**:
  - Default: "공고 게시판" (Bulletin Board)
  - Filtered View: Organization name from selected organization
- **Back Button**:
  - Visible: Only when `selectedOrganizationId` is set (filtered view)
  - Action: Clears organization filter, returns to Organizations tab
  - Hidden: In default all-posts view

#### Tab Navigation System
- **Component**: `TabBar`
- **Tab 1**: "공고" (Announcements) - Default active tab
- **Tab 2**: "단체" (Organizations)
- **Styling**:
  - Container: `backgroundColor: neutral100`, `borderRadius: 8px`, `padding: 4px`
  - Active tab: `backgroundColor: background`, highlighted
  - Inactive tab: `color: textDim`
- **Smart Behavior**: Tab bar hidden when viewing filtered posts (organization-specific view)
- **Auto-refresh**: Updates `activePostCount` for all organizations on Organizations tab activation

#### Create Post Section (Organizer Only)
- **Button Label**: "새 공고 작성" (New Announcement)
- **Icon**: Plus icon (`more` icon, size 20)
- **Position**: Between tab bar and content list
- **Visibility Logic**: `isOrganizer === true`
- **Permission Handling**:
  - Non-organizers: Shows alert "권한 없음 - 게시글 작성은 관리자만 가능합니다"
  - Navigation blocked for non-organizers
- **Styling**:
  - `backgroundColor: colors.tint`
  - `paddingHorizontal: md`, `paddingVertical: sm`
  - `marginBottom: md`

#### Post List (Announcements Tab)
- **Component**: `FlatList` with `PostCard` items
- **Performance Optimization**:
  ```javascript
  maxToRenderPerBatch: 5
  windowSize: 5
  initialNumToRender: 3
  removeClippedSubviews: false (stability)
  showsVerticalScrollIndicator: false
  ```
- **PostCard Display Data** (per card):
  - **Status Badge**: "모집중" (green) / "마감" (red)
  - **Deadline**: Format "~YYYY-MM-DD까지"
  - **Title**: `preset: subheading`, bold
  - **Production Name**: Secondary line, `fontWeight: 600`
  - **Organization Name**: `color: secondaryAction`, `fontWeight: 600`
  - **Applicant Count**: "지원자 N명" (if > 0)
  - **Location**: With location context
  - **Rehearsal Schedule**: Timeline information
  - **Role Preview**: First 2 roles, e.g., "주인공(1명), 조연(2명)"
    - Shows "+N more" badge if more than 2 roles
  - **Tags**: First 3 tags shown, "+N" badge for additional
  - **Image Preview** (if images exist):
    - First image displayed, 120px height
    - Image count badge: "+N" overlay on top-right

- **Card Styling** (Secondary Color Theme):
  ```javascript
  backgroundColor: secondaryAction + '20'  // Light secondary tint
  borderRadius: 12px
  padding: md (12px)
  marginBottom: md
  borderWidth: 2px
  borderColor: secondaryAction + '60'  // Stronger border
  ```

#### Organization List (Organizations Tab)
- **Component**: `FlatList` with `OrganizationCard` items
- **OrganizationCard Display Data**:
  - **Organization Name**: `color: secondaryAction`, `fontWeight: 600`
  - **Verified Badge**: "인증됨" if `isVerified === true`
    - `backgroundColor: tint + '20'`
    - `color: tint`, `fontWeight: bold`
  - **Description**: `numberOfLines: 2`, `color: textDim`
  - **Location**: Bottom-left
  - **Active Post Count**: "활성 공고 N개" in tint color, bottom-right
  - **Tags**: First 3 tags with "+N" overflow indicator

- **Card Styling** (Same Secondary Theme):
  ```javascript
  backgroundColor: secondaryAction + '20'
  borderRadius: 12px
  padding: md
  marginBottom: md
  borderWidth: 2px
  borderColor: secondaryAction + '60'
  ```

### User Interactions

#### Navigation Actions
| User Action | Result | User Type | Technical Notes |
|-------------|--------|-----------|-----------------|
| Tap post card | Navigate to PostDetailScreen with `postId` | All users | Uses `handlePostPress` callback |
| Tap organization card | Filter posts by `organizationId`, auto-switch to Announcements tab | All users | Sets `selectedOrganizationId`, triggers `setActiveTab('announcements')` |
| Tap "새 공고 작성" | Navigate to CreatePostScreen with `isEdit: false` | Organizer only | Permission check runs before navigation |
| Tap back button | Clear filter (`setSelectedOrganizationId(null)`), switch to Organizations tab | All users | Appears only in filtered view |
| Switch to Organizations tab | Trigger `organizationService.updateAllActivePostCounts()` | All users | Updates all org post counts |

#### Empty States

**Announcements Tab - No Posts**
- **Icon**: 📝
- **Message**: "아직 공고가 없습니다"
- **Subtitle**: "새로운 공고를 작성하거나 기다려주세요"
- **Actions**:
  - "단체 둘러보기" button → switches to Organizations tab
  - "샘플 데이터 추가" button (dev mode only, `__DEV__ === true`)
    - Calls `testDataService.addTestData()`
    - Shows success/error alert

**Announcements Tab - No Posts for Organization (Filtered)**
- **Different message indicating filter is active**
- **"단체 둘러보기" action available**

**Organizations Tab - No Organizations**
- **Icon**: 🏢
- **Message**: "아직 등록된 단체가 없습니다"
- **No actions available**

#### Loading State
- **LoadingState Component**:
  - Center-aligned spinner
  - Message: "데이터를 불러오는 중..."
  - Replaces entire content area
- **Trigger Condition**: `loading === true && posts.length === 0`

### Information Architecture

```
BulletinBoardScreen
├── Header (Dynamic title, conditional back button)
├── Tab Bar (Announcements | Organizations) [Hidden when filtered]
├── Create Post Button (Organizer only)
└── Content (FlatList)
    ├── Announcements Tab
    │   ├── Post Cards (All or Filtered)
    │   │   ├── Status Badge
    │   │   ├── Deadline
    │   │   ├── Title
    │   │   ├── Image Preview (if images exist)
    │   │   ├── Production
    │   │   ├── Organization + Applicant Count
    │   │   ├── Location + Schedule
    │   │   ├── Role Preview (first 2)
    │   │   └── Tags (first 3)
    │   └── Empty State Component
    └── Organizations Tab
        ├── Organization Cards
        │   ├── Name + Verified Badge
        │   ├── Description (2 lines)
        │   ├── Location + Active Post Count
        │   └── Tags (first 3)
        └── Empty State Component
```

### State Variations

#### 1. Default View (All Posts)
```javascript
{
  activeTab: 'announcements',
  selectedOrganizationId: null,
  showBackButton: false,
  headerTitle: "공고 게시판"
}
```

#### 2. Filtered by Organization
```javascript
{
  activeTab: 'announcements',  // Auto-switched
  selectedOrganizationId: 'org-id-123',
  showBackButton: true,
  headerTitle: organizations.find(org => org.id === selectedOrganizationId)?.name
}
```

#### 3. Loading State
```javascript
{
  loading: true,
  posts: [],
  // Shows LoadingState component
  // Hides TabBar, PostList, CreateButton
}
```

### User Type Differences

#### Actor Users
- **Cannot see**: "새 공고 작성" button
- **Can**: Browse all posts, view organizations, apply to posts (in PostDetailScreen)
- **Cannot**: Create posts, manage applications

#### Organizer Users
- **Can see**: "새 공고 작성" button
- **Can**: All actor actions + create/edit posts, view all applicants, manage application status
- **Permission Check**: Real-time verification via `usePostList` hook's `isOrganizer` value

### Critical Design Considerations

1. **Tab Bar Visibility**
   - Hidden in filtered view to reduce clutter
   - Organization name becomes header title for context
   - Back button provides clear exit from filter

2. **Performance Optimization**
   - FlatList virtualization essential for 50+ posts
   - `removeClippedSubviews: false` for render stability
   - `maxToRenderPerBatch: 5` balances performance and smoothness

3. **Permission UX**
   - Create button hidden (not disabled) for actors
   - Alert modal for clarity if somehow triggered
   - No exposed organizer UI to actors

4. **Data Freshness**
   - Organization post counts update on tab switch
   - Real-time Firestore listeners for instant updates
   - Auto-refresh list on post creation/deletion

5. **Secondary Color Theme**
   - PostCard and OrganizationCard use secondary color for visual distinction
   - Organization name in secondary color for brand association
   - Creates visual hierarchy and thematic consistency

6. **Visual Hierarchy in PostCard**
   - Status badge + deadline: Top priority (recruitment status)
   - Title + production: Primary content
   - Organization name: Secondary action color (standout)
   - Meta info (location, schedule): Supporting details
   - Role preview: Quick scanning
   - Tags: Categorization

---

## 2. PostDetailScreen - Full Announcement View & Application

### Screen Purpose
Display complete announcement details with rich information cards, application functionality, and role-based action buttons.

### UI Components

#### Header
- **Component**: `ScreenHeader`
- **Title**: "모집 공고" (static)
- **Back Button**: Always visible, navigates to BulletinBoardScreen

#### Hero Card Section
- **Component**: `HeroCard`
- **Layout Structure**:

**Status Header Row**
- **Status Badge**:
  - Active: `backgroundColor: green`, text "모집중"
  - Closed: `backgroundColor: red`, text "마감"
- **Deadline**: Format "마감일 YYYY-MM-DD" (right-aligned)

**Title Section**
- **Post Title**: `preset: heading`, large bold text
- **Production Name**: `fontSize: 16`, `fontWeight: 600`
- **Organization Name**: Secondary text style

**Key Info Row** (Icon + Text pairs)
- **Location**: 📍 icon + location text
- **Rehearsal Schedule**: 📅 icon + schedule text
- **Layout**: Horizontal flex row, space-between

**Stats Row**
- **View Count**: 👁️ "조회 N" (always visible)
- **Application Count**: 👥 "지원자 N"
  - Visible to post owner with actual count
  - Hidden to actors (shows 0)

**Action Buttons** (Dynamic based on user type and application status)

**Actor View - Not Applied**
```javascript
<TouchableOpacity style={$applyButton}>
  <Text>지원하기</Text>
</TouchableOpacity>
// Disabled if post.status !== "active"
```

**Actor View - Application Pending**
```javascript
<TouchableOpacity style={$withdrawButton}>
  <Text>{submittingApplication ? "철회 중..." : "지원 취소"}</Text>
</TouchableOpacity>
```

**Actor View - Final Status (Accepted/Rejected/Withdrawn)**
```javascript
<TouchableOpacity style={$statusButton(status)} disabled>
  <Text>{statusText}</Text>  // 승인됨 | 거절됨 | 철회됨
</TouchableOpacity>
```

**Owner View**
```javascript
<TouchableOpacity style={$manageButton}>
  <Text>👥 지원자 관리 ({applicationsCount})</Text>
</TouchableOpacity>
```

**Contact Button** (All users if contact exists)
```javascript
<TouchableOpacity style={$contactButton}>
  <Text>📞 문의하기</Text>
</TouchableOpacity>
```

#### Image Gallery Section (Conditional)
- **Component**: `ImageGallery`
- **Visibility**: `(post.postType === 'images' || post.images?.length > 0) && post.images?.length > 0`
- **Display**: Full-width horizontal scrollable gallery
- **Style**: `$fullWidthImageSection` with margin

#### Description Section
- **Section Title**: "상세 설명" (`preset: subheading`)
- **Content**: `post.description` with readable typography
- **Style**: Multi-line text with line height

#### Role Cards Section
- **Component**: `RoleCard` (receives `roles` array)
- **Each Role Displays**:
  - Role name
  - Number of openings (count)
  - Gender requirement: "남성" | "여성" | "성별무관"
  - Age range (e.g., "20-30대")
  - Role description (optional)
- **Layout**: Vertical stack of individual role cards

#### Audition Info Section
- **Component**: `AuditionCard`
- **Display Fields**:
  - Audition date (formatted)
  - Audition location
  - Required preparation/notes
  - Result announcement date

#### Performance Info Section
- **Component**: `PerformanceCard`
- **Display Fields**:
  - Performance dates (date range)
  - Performance venue
  - Schedule details

#### Benefits Section
- **Component**: `BenefitsCard`
- **Display Fields**:
  - Compensation details
  - Additional benefits (bulleted list)
  - Perks

#### Contact Section
- **Component**: `ContactCard`
- **Display Fields**:
  - Contact person name
  - Email address (linkable)
  - Phone number (callable)
  - Contact methods
  - Additional info

#### Tags Section
- **Section Title**: "태그"
- **Display**: Horizontal flexWrap container
- **Tag Styling**:
  ```javascript
  backgroundColor: palette.neutral200
  paddingHorizontal: xs
  paddingVertical: 2
  borderRadius: 4
  marginRight: xs
  color: palette.neutral600
  fontSize: 12
  ```

#### Admin Actions Section (Owner Only)
**Visibility**: `isMyPost === true`

**Edit Button**
- Icon: "✏️"
- Text: "수정"
- Action: Navigate to CreatePostScreen with `{ postId: post.id, isEdit: true }`

**Delete Button**
- Icon: "🗑️"
- Text: "삭제"
- Action: Show confirmation alert → `handleDelete()` → navigate back

**Layout**: Horizontal row, space-between

### Application Modal (Full-Screen Slide-Up)

**Modal Properties**:
```javascript
visible={showApplicationModal}
animationType="slide"
transparent={true}
onRequestClose={() => setShowApplicationModal(false)}
```

**Header**
- Title: "지원하기" (`preset: subheading`)
- Close Button: "✕" (top-right)

**Post Info (Read-Only)**
- Post title
- Organization name

**Roles List** (if multiple roles)
- Display format: "• 역할명 (N명)"
- Details: "성별, 연령대"
- Informational, not interactive

**Form Fields**

1. **Contact Phone Number** (Required)
   - Label: "연락처 *"
   - Placeholder: "전화번호를 입력해주세요"
   - Keyboard: `phone-pad`
   - State: `applicationPhoneNumber`

2. **Role Preference** (Optional, shown if >1 role)
   - Label: "지원하고자 하는 역할"
   - Placeholder: "희망하는 역할을 선택하거나 입력해주세요"
   - State: `applicationRolePreference`

3. **Experience** (Optional)
   - Label: "관련 경력 및 경험"
   - Placeholder: "연기, 노래, 춤 등 관련 경험을 작성해주세요"
   - Multiline: 3 rows
   - State: `applicationExperience`

4. **Application Message** (Optional)
   - Label: "지원 동기 및 자기소개"
   - Placeholder: "지원 동기나 자기소개를 작성해주세요"
   - Multiline: 4 rows
   - State: `applicationMessage`

**Action Buttons**
- **Cancel Button**: "취소" → closes modal
- **Submit Button**: "지원하기" → `handleApply()`
  - Loading state: "지원 중..." with `disabled={submittingApplication}`

### User Interactions

#### Application Flow (Actor Users)

**Step 1: Click Apply**
```javascript
User clicks "지원하기" button
  → handleApplyButtonClick()
  → setShowApplicationModal(true)
```

**Step 2: Fill Form**
```
User enters:
  - Phone number (required)
  - Role preference (if multiple roles)
  - Experience (optional)
  - Message (optional)
```

**Step 3: Submit**
```javascript
User clicks "지원하기" in modal
  → handleApply()
  → Validation (phone number required)
  → submittingApplication = true
  → applicationService.createApplication(...)
  → Success: setShowApplicationModal(false), refresh application state
  → Error: Show alert modal
```

**Step 4: Update UI**
```
Button changes to "지원 취소"
Application status: pending
```

#### Withdrawal Flow

**Step 1: Click Withdraw**
```javascript
User clicks "지원 취소"
  → handleWithdrawApplication()
  → Show confirmation alert
```

**Step 2: Confirm**
```
Alert: "정말 지원을 취소하시겠습니까?"
User confirms
  → applicationService.updateApplicationStatus(applicationId, 'withdrawn')
  → Success: Update UI to show "철회됨" badge
```

#### Owner Actions

**View Applications**
```javascript
Click "👥 지원자 관리 (N)"
  → handleViewApplications()
  → Navigate to ApplicationManagementScreen
     with params: { postId, postTitle }
```

**Edit Post**
```javascript
Click "✏️ 수정"
  → Navigate to CreatePostScreen
     with params: { postId, isEdit: true }
```

**Delete Post**
```javascript
Click "🗑️ 삭제"
  → handleDelete()
  → Show confirmation alert: "정말 삭제하시겠습니까?"
  → User confirms
  → postService.deletePost(postId)
  → Navigate back to BulletinBoardScreen
```

### Information Architecture

```
PostDetailScreen
├── Header ("모집 공고")
├── Hero Card
│   ├── Status Badge + Deadline
│   ├── Title + Production + Organization
│   ├── Key Info Row (Location, Schedule)
│   ├── Stats Row (Views, Applications)
│   └── Action Buttons (Dynamic based on user/status)
│       ├── Actor: 지원하기 | 지원 취소 | Status Badge
│       ├── Owner: 지원자 관리 (N)
│       └── All: 문의하기 (if contact exists)
├── Image Gallery (if images)
├── Description Section
├── Role Cards (array)
├── Audition Card
├── Performance Card
├── Benefits Card
├── Contact Card
├── Tags Section
├── Admin Actions (Owner only)
│   ├── Edit Button
│   └── Delete Button
└── Application Modal (Full-screen)
    ├── Header (Title + Close)
    ├── Post Info (Read-only)
    ├── Roles List (Read-only)
    ├── Form Fields
    │   ├── Phone (Required)
    │   ├── Role Preference (Optional)
    │   ├── Experience (Optional)
    │   └── Message (Optional)
    └── Action Buttons (Cancel, Submit)
```

### State Variations

#### 1. Loading State
```javascript
loading === true
// Display: Center "로딩 중..."
// Hidden: All content sections
```

#### 2. Not Found State
```javascript
post === null && !loading
// Display: "게시글을 찾을 수 없습니다"
```

#### 3. Actor - Not Applied
```javascript
{
  isMyPost: false,
  hasApplied: false,
  myApplication: null
}
// Shows: Green "지원하기" button
// Disabled if: post.status !== "active"
```

#### 4. Actor - Application Pending
```javascript
{
  isMyPost: false,
  hasApplied: true,
  myApplication: { status: 'pending' }
}
// Shows: Red "지원 취소" button
```

#### 5. Actor - Application Final Status
```javascript
{
  isMyPost: false,
  hasApplied: true,
  myApplication: { status: 'accepted' | 'rejected' | 'withdrawn' }
}
// Shows: Disabled status badge with text
```

#### 6. Owner View
```javascript
{
  isMyPost: true,
  applicationsCount: N
}
// Shows: "지원자 관리 (N)" button
// Shows: Edit and Delete buttons at bottom
// Hides: Application actions
```

#### 7. Modal Open
```javascript
showApplicationModal === true
// Full-screen modal with form
// Background content slightly visible
```

### User Type Differences

#### Actor Users
- **See**: Application status-based buttons (지원하기/지원 취소/Status badge)
- **Can**: Submit applications, withdraw pending applications
- **Cannot**: See actual applicant count (shows 0), edit/delete posts, manage applications
- **Application Modal**: Available

#### Organizer Users (Post Owners)
- **See**: "지원자 관리 (N)" button with actual count, Edit/Delete buttons
- **Can**: View all applications, edit own posts, delete own posts
- **Cannot**: Apply to own posts
- **Application Modal**: Not available

### Critical Design Considerations

1. **Dynamic Button State Logic**
   - Real-time application status tracking via `usePostDetail` hook
   - Immediate UI updates on status changes
   - Clear visual feedback for each status (color-coded)

2. **Application Modal UX**
   - Smooth slide-up animation
   - Scrollable content for long forms (ScrollView)
   - Clear close actions (X button + Cancel button + backdrop tap)
   - Form validation before submission (phone required)
   - Loading state during submission prevents double-submit

3. **Information Density Management**
   - Structured cards for scanability
   - Progressive disclosure (optional sections hidden if no data)
   - Clear visual hierarchy with icons
   - Icon-enhanced readability (📍📅👁️👥📞)

4. **Permission Enforcement**
   - Owner-only actions completely hidden for non-owners
   - Application actions hidden for post owners
   - Status-appropriate actions only (no "apply" if already applied)

5. **Error Prevention**
   - Confirmation alerts for destructive actions (delete, withdraw)
   - Disabled buttons when action not available (closed posts, final status)
   - Clear messaging for why action unavailable

6. **Real-Time Data Sync**
   - Application count updates immediately
   - Status changes reflected without manual refresh
   - Firestore listeners maintain data freshness

7. **Console Logging for Debugging**
   - HeroCard logs render state with timestamps
   - Application status tracking visible in dev console

---

## 3. CreatePostScreen - Multi-Section Form with Progress Tracking

### Screen Purpose
Comprehensive form for creating and editing musical announcements with structured sections, template system, image upload, and progress tracking.

### UI Components

#### Header
- **Component**: `ScreenHeader`
- **Title**: Dynamic based on mode
  - Create: "게시글 작성"
  - Edit: "게시글 수정"
- **Back Button**: Navigate back (should handle unsaved changes)

#### Mode Selector Section
- **Component**: `ModeSelector`
- **Two Modes**:
  - **Text Mode**: Structured form with all fields
  - **Images Mode**: Image-based announcement with minimal text
- **Visual**: Segmented control or toggle buttons
- **Visibility**: Hidden during edit mode (`isEdit === true`)
- **Default**: Text mode
- **Behavior**: Mode selection locked after initial choice in edit mode

#### Template System (Text Mode Only)

**Template Section Header**: "⚡ 빠른 작성"

**Template Selection Button**
- **Button Text**: "📝 템플릿 선택하기"
- **Subtitle**: "미리 만들어진 양식으로 쉽게 작성하세요"
- **Styling**:
  ```javascript
  backgroundColor: light secondary tint
  borderRadius: 8
  padding: md
  ```
- **Action**: Opens template modal (`setShowTemplateModal(true)`)

**Selected Template Indicator** (conditional)
- **Display**: `{template.icon} {template.name} 적용됨`
- **Remove Button**: "✖" to clear (`setSelectedTemplate(null)`)
- **Visibility**: Only when `selectedTemplate !== null`
- **Note**: Removing template keeps filled data, only removes indicator

**Template Modal**
- **Animation**: Slide from bottom
- **Modal Properties**:
  ```javascript
  visible={showTemplateModal}
  transparent
  animationType="slide"
  ```

- **Header**:
  - Title: "📝 템플릿 선택"
  - Close button: "✖" (top-right)

- **Template List** (ScrollView):
  - Each item shows:
    - Icon (emoji)
    - Name
    - Category
    - Preview (first 100 chars of description)
  - Action: Tap to apply (`applyTemplate(item)`)

- **Template Data Structure**:
  ```javascript
  {
    id: string,
    name: string,
    category: string,
    icon: emoji,
    template: {
      title: string,
      production: string,
      description: string,
      roles: Role[],
      audition: AuditionInfo,
      performance: PerformanceInfo,
      benefits: BenefitsInfo,
      contact: ContactInfo
    }
  }
  ```

#### Image Upload Section (Images Mode Only)
- **Component**: `ImageUpload`
- **Pick Images Button**:
  - Opens camera/gallery picker
  - Supports multiple image selection
- **Image Preview Grid**:
  - Horizontal scrollable list
  - Each image shows:
    - Preview thumbnail
    - Remove button ("X" overlay)
    - Upload progress indicator (if uploading)
- **States**:
  - `selectedImages`: Array of local image URIs
  - `uploadingImages`: Boolean loading state
- **Actions**:
  - `onPickImages()`: Launch image picker
  - `onRemoveImage(index)`: Remove from array

#### Progress Tracking Section

**Progress Header**
- **Display**: "📊 작성 진행률: {completeness}%"
- **Calculation**: `calculateCompleteness()` function
  - Based on 5 required fields:
    1. Title
    2. Production
    3. Description
    4. Location
    5. Rehearsal Schedule
  - Formula: `(filledFields / 5) * 100`

**Progress Bar**
- **Visual**: Horizontal bar container
- **Fill Bar**:
  ```javascript
  width: `${completeness}%`
  backgroundColor: gradient (red → yellow → green)
  height: 8px
  borderRadius: 4px
  transition: smooth width change
  ```

**Progress Tips** (conditional messaging)
- **< 100%**: "💡 모든 필수 정보를 입력하면 더 많은 지원자를 모집할 수 있어요!"
- **100%**: "✨ 완벽해요! 이제 게시글을 작성할 준비가 되었습니다."

#### Basic Info Section
- **Component**: `BasicInfoSection`
- **Section Header**: "⚡ 기본 정보"

**Fields (Text Mode)**:
1. **Title** (Required)
   - Placeholder: "예: 뮤지컬 '지킬앤하이드' 캐스팅"
   - Field: `formData.title`

2. **Production** (Required)
   - Placeholder: "작품명을 입력하세요"
   - Field: `formData.production`

3. **Description** (Required)
   - Multiline: 10 rows
   - Placeholder: "자세한 설명을 작성해주세요"
   - Field: `formData.description`

4. **Location** (Required)
   - Icon: 📍
   - Placeholder: "장소를 입력하세요"
   - Field: `formData.location`

5. **Rehearsal Schedule** (Required)
   - Icon: 📅
   - Placeholder: "일정을 입력하세요"
   - Field: `formData.rehearsalSchedule`

6. **Deadline** (Optional)
   - Date Picker Modal
   - Display: Formatted date or "선택하지 않음"
   - Field: `formData.deadline`
   - State: `showDeadlinePicker`

**Fields (Images Mode)**:
- Title (Required)
- Basic description (Required)
- Contact info (Required)
- Limited fields only

#### Role Section (Text Mode Only)
- **Component**: `RoleSection`
- **Section Header**: "👥 모집 역할"
- **Dynamic Role Cards Array**: `formData.roles`

**Each Role Card**:
1. **Role Name**: Text input
2. **Number of Openings**: Number input
3. **Gender**: Picker
   - Options: "Male" | "Female" | "Any"
   - Display: "남성" | "여성" | "성별무관"
4. **Age Range**: Text input (e.g., "20-30대")
5. **Role Description**: Multiline text
6. **Remove Button**: "🗑️" - Removes this role from array

**Add Role Button**:
- Text: "+ 역할 추가"
- Action: Appends new empty role object to `formData.roles`
- Position: Below role list

#### Audition Section (Text Mode Only)
- **Component**: `AuditionSection`
- **Section Header**: "🎭 오디션 정보"

**Fields**:
1. **Audition Date**: Date picker modal
2. **Audition Location**: Text input
3. **Required Preparation**: Multiline text
4. **Result Announcement Date**: Date picker modal

**States**:
- `showAuditionDatePicker`
- `showAuditionResultPicker`

#### Benefits Section (Text Mode Only)
- **Component**: `BenefitsSection`
- **Section Header**: "💰 혜택"

**Fields**:
1. **Compensation**: Text input (e.g., "1회 공연당 30만원")
2. **Additional Benefits**: Multiline text, bulleted list format
3. **Perks**: Text input

#### Contact Section (Both Modes)
- **Component**: `ContactSection`
- **Section Header**: "📞 연락처"

**Fields**:
1. **Contact Person**: Text input
2. **Email**: Email keyboard input
3. **Phone**: Phone-pad keyboard input
4. **Contact Methods**: Text input
5. **Additional Info**: Multiline text

#### Recruitment Settings Section
- **Section Header**: "⚙️ 모집 설정"

**Status Toggle**:
- **Label**: "모집 상태"
- **Display Text**:
  - Active: "🟢 모집중"
  - Closed: "🔴 모집마감"
- **Control**: Switch component
  ```javascript
  value={formData.status === "active"}
  onValueChange={(value) => updateFormData("status", value ? "active" : "closed")}
  trackColor={{ false: neutral300, true: primary200 }}
  thumbColor={active ? primary500 : neutral400}
  ```
- **Hint Text** (dynamic):
  - Active: "💡 지원자들이 이 게시글을 볼 수 있습니다"
  - Closed: "⏸️ 지원을 받지 않는 상태입니다"

#### Save Section
- **Save Button**:
  - Text: "게시글 작성" (create) or "수정 완료" (edit)
  - Component: `Button`
  - Props:
    ```javascript
    onPress={handleSave}
    isLoading={loading}
    style={$saveButton}  // Full-width primary button
    ```
  - Loading State: Spinner replaces text during save

### User Interactions

#### Form Interactions

| Action | Behavior | Technical Details |
|--------|----------|-------------------|
| Type in field | Real-time progress calculation | `calculateCompleteness()` runs on every `updateFormData()` |
| Switch mode | Mode locked in edit; confirmation dialog in create if data exists | `isEdit` prop controls visibility |
| Pick template | Auto-fill form with template data | `applyTemplate()` → `setFormData(template.template)` |
| Add role | Append new role card to list | `setFormData(prev => ({ ...prev, roles: [...prev.roles, emptyRole] }))` |
| Remove role | Delete role card | Array filter operation |
| Pick date | Show date picker modal | `setShowDeadlinePicker(true)` |
| Upload images | Open camera/gallery, show upload progress | `pickImages()` → `ImagePicker.launchImageLibraryAsync()` |
| Remove image | Delete from selected images | `removeImage(index)` → array splice |
| Toggle status | Switch between active/closed | `updateFormData("status", value)` |
| Save | Validate → Submit → Navigate back | `handleSave()` → Firestore operation → `navigation.goBack()` |

#### Validation Rules

| Field | Rules | Error Handling |
|-------|-------|----------------|
| Title | Required, min 5 chars, max 100 chars | Alert on submit if invalid |
| Production | Required | Alert on submit |
| Description | Required, min 20 chars | Alert on submit |
| Location | Required | Alert on submit |
| Rehearsal schedule | Required | Alert on submit |
| Roles (text mode) | At least 1 role required | Alert on submit |
| Role name | Required if role added | Per-role validation |
| Role count | Required, min 1 | Per-role validation |
| Images (image mode) | At least 1 image required | Alert on submit |
| Contact email | Valid email format if provided | Email regex validation |
| Contact phone | Valid phone format if provided | Phone regex validation |

#### Template Application Flow

**Step 1: Open Modal**
```javascript
User clicks "📝 템플릿 선택하기"
  → setShowTemplateModal(true)
```

**Step 2: Select Template**
```javascript
User taps a template item
  → applyTemplate(template)
```

**Step 3: Auto-Fill Form**
```javascript
applyTemplate(template) {
  setFormData({
    ...formData,
    title: template.template.title,
    production: template.template.production,
    description: template.template.description,
    roles: template.template.roles,
    audition: template.template.audition,
    performance: template.template.performance,
    benefits: template.template.benefits,
    contact: template.template.contact
  })
  setSelectedTemplate(template)
  setShowTemplateModal(false)
}
```

**Step 4: Template Applied State**
```
Selected indicator appears: "{icon} {name} 적용됨"
Form fields pre-filled
User can modify any field
Remove button available (removes indicator, keeps data)
```

### Information Architecture

```
CreatePostScreen
├── Header (Dynamic title: 작성 | 수정)
├── Mode Selector (Create only)
│   ├── Text Mode (default)
│   └── Images Mode
├── Template System (Text mode, create only)
│   ├── Template Section Header
│   ├── Template Selection Button
│   ├── Template Modal
│   │   ├── Header (Title + Close)
│   │   └── Template List (ScrollView)
│   └── Selected Template Indicator
│       └── Remove Button
├── Image Upload Section (Images mode)
│   ├── Pick Images Button
│   └── Image Preview Grid
│       └── Remove Buttons
├── Progress Section
│   ├── Progress Header (N%)
│   ├── Progress Bar (Visual fill)
│   └── Progress Tips (Conditional)
├── Basic Info Section
│   ├── Title *
│   ├── Production *
│   ├── Description * (multiline)
│   ├── Location *
│   ├── Rehearsal Schedule *
│   └── Deadline (date picker)
├── Role Section (Text mode)
│   ├── Role Cards (Dynamic array)
│   │   ├── Role Name
│   │   ├── Count
│   │   ├── Gender (Picker)
│   │   ├── Age Range
│   │   ├── Description
│   │   └── Remove Button
│   └── Add Role Button
├── Audition Section (Text mode)
│   ├── Audition Date (picker)
│   ├── Audition Location
│   ├── Preparation
│   └── Result Date (picker)
├── Benefits Section (Text mode)
│   ├── Compensation
│   ├── Benefits (multiline)
│   └── Perks
├── Contact Section (Both modes)
│   ├── Contact Person
│   ├── Email
│   ├── Phone
│   ├── Methods
│   └── Additional Info
├── Recruitment Settings
│   ├── Status Toggle (Active | Closed)
│   └── Hint Text
└── Save Section
    └── Save Button (Loading state)
```

### State Variations

#### 1. Loading User Profile
```javascript
userProfile === null
// Display: Center loading message
// Text: "사용자 정보를 불러오는 중..."
// Form: Hidden
```

#### 2. Non-Organizer State
```javascript
userProfile.userType !== "organizer"
// Display: Error message
// Text: "단체 운영자만 게시글을 작성할 수 있습니다."
// Additional: Current user type displayed
// Action: "설정에서 운영자로 전환" button
// Navigation: To Settings screen
```

#### 3. Create Mode - Text
```javascript
{
  isEdit: false,
  postMode: 'text'
}
// Header: "게시글 작성"
// Mode selector: Visible
// Template system: Visible
// All text sections: Visible
// Image upload: Hidden
// Form: Empty
// Save button: "게시글 작성"
```

#### 4. Create Mode - Images
```javascript
{
  isEdit: false,
  postMode: 'images'
}
// Header: "게시글 작성"
// Mode selector: Visible
// Template system: Hidden
// Image upload: Visible
// Limited sections: Basic info, Contact, Settings
// Form: Empty
// Save button: "게시글 작성"
```

#### 5. Edit Mode
```javascript
{
  isEdit: true,
  postId: 'existing-post-id',
  postMode: originalPost.postType
}
// Header: "게시글 수정"
// Mode selector: Hidden (locked to original mode)
// Template system: Hidden
// Form: Pre-filled with existing data
// All sections: Visible based on original post type
// Save button: "수정 완료"
```

#### 6. Template Applied
```javascript
{
  selectedTemplate: templateObject,
  formData: { ...pre-filled from template }
}
// Selected indicator: Visible
// Remove button: Visible
// Form: Pre-filled
// User can edit any field
```

#### 7. Saving State
```javascript
loading === true
// Save button: Disabled, shows spinner
// Button text: "작성 중..." or "수정 중..."
// Form: User interactions continue (not disabled)
```

#### 8. Image Uploading
```javascript
uploadingImages === true
// Upload progress indicators on each image
// Disable save until upload complete
```

### User Type Differences

#### Only Organizers Can Access
- **Access Control**:
  - Navigation blocked at BulletinBoardScreen (no create button for actors)
  - Additional check at screen mount (redirects if not organizer)
  - Shows error state with user type and conversion CTA

#### Actors
- **Cannot access**: Redirected to error state or blocked from navigation
- **Message**: "단체 운영자만 게시글을 작성할 수 있습니다."
- **Action Available**: "설정에서 운영자로 전환" button

### Critical Design Considerations

1. **Progressive Disclosure**
   - Start simple: Mode selection first
   - Template shortcuts reduce initial friction
   - Progress bar motivates completion
   - Sections revealed based on mode
   - Tips guide user through process

2. **Form Validation Strategy**
   - Real-time progress calculation (not validation)
   - Validation on submit to avoid frustration
   - Clear error messages in alerts
   - Required field indicators (asterisks)
   - Prevent submission with loading state

3. **Multi-Step Form UX**
   - Section headers for visual organization
   - Progress bar for completion awareness
   - Estimated completion via percentage
   - Tips change based on progress
   - No artificial step pagination (single scroll)

4. **Template System Benefits**
   - Reduces form fatigue for repeat users
   - Quick start for experienced organizers
   - All fields remain editable after template application
   - Clear indication of applied template
   - Easy to remove without losing data

5. **Dynamic Role Management**
   - Unlimited roles (no artificial limit)
   - Easy add/remove with clear buttons
   - Each role self-contained in card
   - Visual distinction between roles
   - Validation per role

6. **Image Upload UX**
   - Multiple image support
   - Preview before final save
   - Individual upload progress indicators
   - Easy removal per image
   - Handles upload failures gracefully

7. **Mode Switching Logic**
   - Mode locked after initial save (edit mode)
   - Create mode allows switching (with confirmation if data exists)
   - Clear visual mode indicator
   - Different field sets per mode
   - Template only available in text mode

8. **Data Persistence Considerations**
   - No auto-save (intentional to avoid clutter)
   - Unsaved changes warning on back (future enhancement)
   - Template data persists until cleared
   - Edit mode pre-fills all existing data

9. **Mobile Optimization**
   - Keyboard types: phone-pad, email-keyboard, default
   - Multiline text areas with adequate rows
   - Scrollable form (not paginated)
   - Touch-friendly date pickers
   - Adequate spacing between fields

10. **Progress Calculation Logic**
    ```javascript
    calculateCompleteness() {
      const requiredFields = ['title', 'production', 'description', 'location', 'rehearsalSchedule']
      const filledCount = requiredFields.filter(field => formData[field]?.trim()).length
      return Math.round((filledCount / requiredFields.length) * 100)
    }
    ```

---

## 4. ApplicationManagementScreen - Application Review & Status Management

### Screen Purpose
Enable post owners to view, filter, and manage applications submitted for their announcements with efficient status updates and communication tools.

### UI Components

#### Header
- **Component**: `ScreenHeader`
- **Title**: "지원서 확인" (static)
- **Back Button**: Navigate to PostDetailScreen
- **Props**:
  ```javascript
  backButtonProps={{
    onPress: () => navigation.goBack()
  }}
  ```

#### Post Info Section
- **Post Title Display**:
  - Text: `postTitle` from route params
  - Style: Heading/subheading text
  - Field: `$postTitle` style

- **Stats Display**:
  - Text: `총 ${applications.length}명의 지원자`
  - Style: `$statsText`
  - Dynamic: Updates with filter changes

#### Filter Bar Section
- **Component**: `StatusFilterBar`
- **Filter Tabs** (Horizontal scrollable):

**Tab Structure**:
```javascript
filterTabs = [
  { key: 'all', label: '전체', count: totalCount },
  { key: 'pending', label: '대기중', count: pendingCount },
  { key: 'accepted', label: '승인됨', count: acceptedCount },
  { key: 'rejected', label: '거절됨', count: rejectedCount },
]
```

**Tab Styling**:
- **Active Tab**:
  ```javascript
  backgroundColor: tint color
  color: white
  fontWeight: bold
  ```
- **Inactive Tab**:
  ```javascript
  backgroundColor: neutral100
  color: textDim
  ```

**Count Badges**: `(N)` displayed with each tab label

**Interaction**: `onFilterChange(filter)` → `setSelectedFilter(filter)`

#### Applications List Section
- **Component**: `ApplicationCard` (for each application)
- **Layout**: Vertical list (implicit FlatList or ScrollView)

**ApplicationCard Display Data**:

**Header Row**:
- **Applicant Name**: `preset: subheading`, bold
- **Status Badge**: Color-coded pill
  - Pending: `backgroundColor: secondary500 (yellow-ish)`
  - Accepted: `backgroundColor: primary500 (green)`
  - Rejected: `backgroundColor: error (red)`
  - Withdrawn: `backgroundColor: neutral400 (gray)`
- **Status Text**: "대기중" | "승인됨" | "거절됨" | "철회됨"

**Applicant Info**:
- **Email**: `$applicantEmail` style
- **Application Date**: "지원일: YYYY-MM-DD" format from Firestore timestamp

**Contact Info Section** (if available):
- **Phone Number**:
  - Display with bell icon
  - Clickable (calls `onCall(phoneNumber)`)
  - Style: `$linkText` (tint color)
- **Portfolio Link**:
  - Display: "포트폴리오 보기" with caret-right icon
  - Clickable (calls `onOpenPortfolio(url)`)
  - Style: `$linkText`
- **Role Preference**:
  - Display: "희망 역할: {preference}" with settings icon
  - Style: `$infoText`

**Experience Section** (if provided):
- **Label**: "경력 및 경험"
- **Text**: `application.experience`
- **Style**: `$messageText`, multiline

**Application Message Section** (if provided):
- **Label**: "지원 동기"
- **Text**: `application.message`
- **Style**: `$messageText`, multiline

**Card Interaction**:
- **Tap Card**: Opens action sheet with status change options
  - `onPress={() => onPress(application)}`
- **Tap Phone**: Direct phone dialer
  - `onCall(phoneNumber)` → `Linking.openURL('tel:...')`
- **Tap Portfolio**: Opens browser/webview
  - `onOpenPortfolio(url)` → `Linking.openURL(url)`
- **Disabled State**: Card disabled if `status === 'withdrawn'`

**Card Styling**:
```javascript
backgroundColor: background
borderRadius: 12px
padding: md
marginBottom: md
borderWidth: 1px
borderColor: border
```

#### Empty State
- **Empty Container** (when `filteredApplications.length === 0`)
  - **Icon**: "📝" (large emoji)
  - **Message**: "아직 지원자가 없습니다."
  - **Subtitle**: "지원자가 있으면 여기에 표시됩니다."
  - **Style**: Center-aligned, gray text

#### Loading State
- **Loading Container** (during initial load)
  - **Icon**: "📋" (large emoji)
  - **Message**: "지원서를 불러오는 중..."
  - **Spinner**: Activity indicator
  - **Condition**: `loading === true && applications.length === 0`

### User Interactions

#### Filter Actions

| Filter Tab | Behavior | Technical Implementation |
|-----------|----------|-------------------------|
| "전체" | Show all applications | `setSelectedFilter('all')` → `filteredApplications = applications` |
| "대기중" | Show pending only | Filter: `application.status === 'pending'` |
| "승인됨" | Show accepted only | Filter: `application.status === 'accepted'` |
| "거절됨" | Show rejected only | Filter: `application.status === 'rejected'` |

**Filter Logic**:
```javascript
const filteredApplications = useMemo(() => {
  if (selectedFilter === 'all') return applications
  return applications.filter(app => app.status === selectedFilter)
}, [applications, selectedFilter])
```

**Count Calculation**:
```javascript
const filterTabs = useMemo(() => [
  { key: 'all', label: '전체', count: applications.length },
  { key: 'pending', label: '대기중', count: applications.filter(a => a.status === 'pending').length },
  { key: 'accepted', label: '승인됨', count: applications.filter(a => a.status === 'accepted').length },
  { key: 'rejected', label: '거절됨', count: applications.filter(a => a.status === 'rejected').length },
], [applications])
```

#### Application Card Actions

**Direct Actions** (no confirmation):
| Action | UI Element | Behavior |
|--------|-----------|----------|
| Call Applicant | Phone number row with bell icon | `Linking.openURL(\`tel:\${phoneNumber}\`)` |
| View Portfolio | "포트폴리오 보기" row with caret icon | `Linking.openURL(portfolioUrl)` |

**Status Management Actions** (via action sheet):

**Tap Card Flow**:
```javascript
User taps ApplicationCard
  → showApplicationOptions(application)
  → Opens action sheet/alert with options
```

**Action Sheet Options** (dynamic based on current status):
1. **"승인하기" (Accept)**:
   - Visible if status !== 'accepted'
   - Changes status to 'accepted'
   - Shows confirmation: "승인하시겠습니까?"

2. **"거절하기" (Reject)**:
   - Visible if status !== 'rejected'
   - Changes status to 'rejected'
   - Shows confirmation: "거절하시겠습니까?"

3. **"대기 상태로" (Reset to Pending)**:
   - Visible if status !== 'pending'
   - Changes status to 'pending'
   - Allows re-evaluation

4. **"전화하기" (Call)**:
   - Always visible if phone exists
   - Direct dial action

5. **"취소" (Cancel)**:
   - Closes action sheet
   - No changes made

**Status Update Flow**:
```javascript
User selects status change option
  → Confirmation alert shown
  → User confirms
  → updateApplicationStatus(applicationId, newStatus)
  → Firestore update
  → Real-time listener updates UI
  → Badge color/text changes immediately
  → Filter counts recalculate
```

#### Communication Actions

**Call Applicant**:
```javascript
handleCall(phoneNumber) {
  const url = `tel:${phoneNumber}`
  Linking.canOpenURL(url)
    .then(supported => {
      if (supported) {
        return Linking.openURL(url)
      } else {
        alert('오류', '전화를 걸 수 없습니다.')
      }
    })
}
```

**Open Portfolio**:
```javascript
handleOpenPortfolio(portfolioUrl) {
  Linking.canOpenURL(portfolioUrl)
    .then(supported => {
      if (supported) {
        return Linking.openURL(portfolioUrl)
      } else {
        alert('오류', '링크를 열 수 없습니다.')
      }
    })
}
```

### Information Architecture

```
ApplicationManagementScreen
├── Header ("지원서 확인")
├── Post Info Section
│   ├── Post Title
│   └── Total Applicant Count
├── Filter Bar (StatusFilterBar)
│   ├── 전체 Tab (count)
│   ├── 대기중 Tab (count)
│   ├── 승인됨 Tab (count)
│   └── 거절됨 Tab (count)
└── Applications List / Empty State
    └── Application Cards
        ├── Header Row
        │   ├── Applicant Name
        │   └── Status Badge
        ├── Applicant Info
        │   ├── Email
        │   └── Application Date
        ├── Contact Section
        │   ├── Phone (callable)
        │   ├── Portfolio (linkable)
        │   └── Role Preference
        ├── Experience Section
        │   ├── Label
        │   └── Experience Text
        └── Message Section
            ├── Label
            └── Message Text
```

### State Variations

#### 1. Loading State (Initial)
```javascript
loading === true && applications.length === 0
// Display: Center loading container
// Icon: "📋"
// Message: "지원서를 불러오는 중..."
// List: Hidden
```

#### 2. Empty State - No Applications at All
```javascript
applications.length === 0 && !loading
// Display: Empty container
// Message: "아직 지원자가 없습니다."
// Subtitle: "지원자가 있으면 여기에 표시됩니다."
// Filter bar: Visible, all counts = 0
```

#### 3. Empty State - Filtered Result
```javascript
filteredApplications.length === 0 && applications.length > 0
// Display: Empty container
// Message: "해당 상태의 지원자가 없습니다."
// Filter bar: Visible with other tabs showing counts
// User can switch tabs to see other applications
```

#### 4. Populated List
```javascript
filteredApplications.length > 0
// Filter bar: Active with count badges
// Application cards: Displayed vertically
// Scroll: Enabled
// All interactive elements active
```

#### 5. Action Sheet Open
```javascript
User tapped application card
// Overlay: Semi-transparent backdrop (if modal)
// Options: Status change actions + call + cancel
// Based on current application status
```

#### 6. Status Update in Progress
```javascript
Updating application status
// Optimistic UI update (immediate badge change)
// Loading indicator on specific card (optional)
// Other cards remain interactive
// Firestore operation in background
```

### User Type Differences

#### Only Post Owners Can Access
- **Access Control**:
  - Navigation only available from PostDetailScreen "지원자 관리" button
  - Button only visible to post owner (`isMyPost === true`)
  - No direct route available to non-owners
  - Screen requires `postId` and `postTitle` from navigation params

#### Post Owner Permissions
- **Can**:
  - View all applications for their own posts
  - Change application status (accept, reject, reset to pending)
  - Contact applicants directly (phone, portfolio)
  - Filter applications by status
  - See all applicant personal information

#### Privacy Considerations
- **Protected Data**:
  - Phone numbers only visible to post owners
  - Email addresses only visible to post owners
  - Application messages and experience only visible to post owners
  - Other users cannot access this screen at all

### Critical Design Considerations

1. **Real-Time Status Updates**
   - Firestore listeners for immediate updates
   - Optimistic UI updates for perceived speed
   - Status badge changes reflect instantly
   - Count badges recalculate automatically
   - Filter counts update on any status change

2. **Quick Communication Actions**
   - One-tap phone call from card
   - Direct portfolio link opening
   - No nested navigation for common actions
   - Phone/portfolio in prominent position

3. **Filter Bar UX**
   - Visual count badges for quick scanning
   - Active filter clearly highlighted
   - Smooth transitions between filters
   - All counts visible regardless of selected filter
   - Counts update in real-time

4. **Information Density & Scannability**
   - Key info (name, status, date) at top
   - Contact actions prominently displayed
   - Experience and message expandable/collapsible (future)
   - Preview shows essential details
   - Card action opens full details on demand

5. **Status Management Workflow**
   - Clear confirmation for status changes
   - Easy to undo via "대기 상태로"
   - Visual feedback (badge color change)
   - No accidental status changes (confirmation required)
   - Multiple paths to same action (card tap or quick action)

6. **Empty State Guidance**
   - Contextual messages based on filter
   - Friendly, encouraging tone
   - Clear next steps if no applications yet
   - Filter bar remains visible for context

7. **Performance Optimization**
   - List virtualization for large application sets
   - Memoized filter calculations
   - Efficient Firestore queries (indexed by postId)
   - Cached application data

8. **Accessibility**
   - All interactive elements have accessibility labels
   - Touch targets meet minimum size (44x44 points)
   - Status colors supplemented with text
   - Screen reader support for all content

9. **Contact Privacy & Safety**
   - Phone numbers displayed but call action explicit
   - Portfolio links validated before opening
   - No automatic contact (user-initiated only)
   - Clear indication of external link/action

10. **Error Handling**
    - Linking failures handled gracefully
    - Firestore errors show clear alerts
    - Network issues don't break UI
    - Retry mechanisms for failed operations

---

## Cross-Feature Summary

### Common UI Patterns

#### 1. Modal Behavior
- **Slide-Up Animation**: All modals use `animationType="slide"` from bottom
- **Semi-Transparent Backdrop**: `transparent={true}` with overlay
- **Close Options**:
  - X button (top-right)
  - Cancel button (bottom)
  - Backdrop tap (some modals)
- **Scrollable Content**: ScrollView for long content
- **Consistent Header**: Title (left/center) + Close button (right)

#### 2. Alert System
- **Component**: `AlertModal` used across all screens
- **Use Cases**:
  - Permission denied (actor trying to create post)
  - Confirmation dialogs (delete post, withdraw application, change status)
  - Success messages (post created, application submitted)
  - Error feedback (network errors, validation failures)
- **Props**:
  ```javascript
  visible={alertState.visible}
  title={alertState.title}
  message={alertState.message}
  buttons={alertState.buttons}  // Array of button configs
  onDismiss={hideAlert}
  dismissable={alertState.dismissable}
  ```

#### 3. Empty State Design
- **Pattern**: Icon (emoji) + Primary message + Secondary message (optional) + Action button (optional)
- **Contexts**:
  - BulletinBoardScreen: No posts, no organizations, filtered with no results
  - ApplicationManagementScreen: No applications, filtered with no results
- **Tone**: Friendly, encouraging, actionable
- **Examples**:
  - "아직 공고가 없습니다" → "단체 둘러보기" action
  - "아직 지원자가 없습니다" → "지원자가 있으면 여기에 표시됩니다"

#### 4. Loading States
- **Pattern**: Center-aligned container + Icon + Descriptive text (+ spinner optional)
- **Consistency**: Same style across all screens
- **Messages**:
  - "데이터를 불러오는 중..."
  - "지원서를 불러오는 중..."
  - "로딩 중..."
  - "사용자 정보를 불러오는 중..."
- **Replacement Strategy**: Loading state replaces content, not overlays

#### 5. Status Badge System
- **Recruitment Status**:
  - Active: 🟢 "모집중" (green background)
  - Closed: 🔴 "마감" (red background)
- **Application Status**:
  - Pending: "대기중" (yellow/secondary color)
  - Accepted: "승인됨" (green/primary color)
  - Rejected: "거절됨" (red/error color)
  - Withdrawn: "철회됨" (gray/neutral color)
- **Styling**: Pill-shaped, padding 4-8px, rounded corners, bold text

### Design System Observations

#### Typography Hierarchy
- **Heading** (`preset: heading`): Post titles, screen headers
- **Subheading** (`preset: subheading`): Production names, section labels, card titles
- **Body** (default): Descriptions, detail text, messages
- **Caption** (small, textDim): Hints, metadata, timestamps, counts

#### Color System Usage
- **Primary Color (Tint)**:
  - Action buttons (지원하기, 새 공고 작성)
  - Active tab indicators
  - Links (phone, portfolio)
  - Active post count

- **Secondary Action Color**:
  - Organization names (throughout)
  - PostCard and OrganizationCard backgrounds (20% opacity)
  - Card borders (60% opacity)
  - Brand identity elements

- **Success/Green**:
  - Active recruitment status
  - Accepted applications
  - Apply button

- **Error/Red**:
  - Closed recruitment status
  - Rejected applications
  - Withdraw button
  - Delete button

- **Warning/Yellow**:
  - Pending application status

- **Neutral**:
  - Backgrounds
  - Borders
  - Disabled states
  - Withdrawn status

#### Spacing System
- **xs**: 4px (tag padding, small gaps)
- **sm**: 8px (section internal spacing)
- **md**: 12px (card padding, default margins)
- **lg**: 16px (section spacing, tab bar margin)
- **xl**: 24px (major section gaps)
- **xxl**: 32px (screen-level spacing)

**Consistent Application**:
- Card padding: `md` (12px)
- Card margins: `md` (12px)
- Section spacing: `lg` (16px)
- Button padding: `sm` (8px) vertical, `md` (12px) horizontal

#### Interactive Element Standards
- **Minimum Touch Target**: 44x44 points (iOS HIG standard)
- **Button Height**: Standard buttons ~48-56 points
- **Icon Size**:
  - Standard: 20-24 points
  - Primary actions: 32 points
  - Emoji icons: 32-48 points
- **Loading States**: Spinner replaces button text, disabled state active
- **Disabled States**: Opacity reduction + pointer-events disabled

#### Card Design System
- **PostCard & OrganizationCard**:
  - `backgroundColor: secondaryAction + '20'` (light tint)
  - `borderRadius: 12px`
  - `padding: md` (12px)
  - `borderWidth: 2px`
  - `borderColor: secondaryAction + '60'` (stronger border)
  - `marginBottom: md`

- **ApplicationCard**:
  - `backgroundColor: background`
  - `borderRadius: 12px`
  - `padding: md`
  - `borderWidth: 1px`
  - `borderColor: border`
  - `marginBottom: md`

**Visual Distinction**:
- Organization-related cards: Secondary color theme (stronger presence)
- Application cards: Neutral theme (information focus)

### Performance Considerations

#### FlatList Optimization (BulletinBoardScreen)
```javascript
maxToRenderPerBatch: 5        // Render 5 items per batch
windowSize: 5                 // Size of render window
initialNumToRender: 3         // Initial render count
removeClippedSubviews: false  // Stability over memory (important for Android)
showsVerticalScrollIndicator: false
```

**Why These Settings**:
- `maxToRenderPerBatch: 5`: Balances smooth scrolling with render load
- `windowSize: 5`: 5 screen heights in render window (2.5 above + 2.5 below)
- `initialNumToRender: 3`: Fast initial load, good first impression
- `removeClippedSubviews: false`: Prevents clipping bugs on Android, slight memory trade-off

#### React.memo Usage
- **PostCard**: Memoized with custom comparison function
  - Only re-renders if critical display fields change
  - Prevents unnecessary re-renders on parent updates
- **Comparison Fields**: `id`, `status`, `title`, `production`, `organizationName`, `totalApplicants`, `deadline`, `location`, `rehearsalSchedule`, image/role/tag lengths

#### Real-Time Updates
- **Firestore Listeners**: Used for live data (posts, applications, organizations)
- **Optimistic Updates**: Status changes apply immediately in UI, then sync with Firestore
- **Debounced Operations**: Search and filter (future enhancement)

#### Image Handling
- **Lazy Loading**: Images load on-demand in gallery
- **Preview Images**: Smaller thumbnails in PostCard
- **Caching**: React Native Image component handles caching
- **Upload Progress**: Individual progress indicators during image upload

### User Flow Diagrams

#### Actor Journey: Browse → Apply
```
1. Open App → Tab to BulletinBoard
2. View BulletinBoardScreen (Announcements tab active)
3. Browse PostCards or switch to Organizations tab
4. Optional: Tap OrganizationCard → Filter posts by organization
5. Tap PostCard → Navigate to PostDetailScreen
6. Read full details (Hero, Description, Roles, etc.)
7. Tap "지원하기" button → Application modal slides up
8. Fill form:
   - Phone number (required)
   - Role preference (if multiple roles)
   - Experience (optional)
   - Message (optional)
9. Tap "지원하기" in modal → Submit
10. Modal closes, button changes to "지원 취소"
11. Can withdraw later by tapping "지원 취소" → Confirm
```

#### Organizer Journey: Post → Manage
```
1. Open App → Tab to BulletinBoard
2. View BulletinBoardScreen (Announcements tab)
3. Tap "새 공고 작성" button → Navigate to CreatePostScreen
4. Select mode (Text or Images)
5. Optional: Select template (Text mode)
6. Fill form sections progressively
   - Basic info (required fields)
   - Roles (add multiple)
   - Audition info
   - Benefits
   - Contact
   - Recruitment settings
7. Monitor progress bar (0% → 100%)
8. Tap "게시글 작성" → Save
9. Return to BulletinBoardScreen → See new post in list
10. Later: Tap own PostCard → PostDetailScreen
11. See "지원자 관리 (N)" button
12. Tap "지원자 관리 (N)" → ApplicationManagementScreen
13. Filter by status (전체, 대기중, 승인됨, 거절됨)
14. View ApplicationCards
15. Tap card → Action sheet with status change options
16. Select "승인하기" or "거절하기" → Confirm
17. Status badge updates immediately
18. Optional: Tap phone to call applicant
19. Optional: Tap portfolio to view details
```

#### Organizer Journey: Edit Post
```
1. PostDetailScreen (own post) → See Edit and Delete buttons
2. Tap "✏️ 수정" → Navigate to CreatePostScreen (edit mode)
3. Form pre-filled with existing data
4. Mode locked to original (Text or Images)
5. Template system hidden (not applicable in edit)
6. Modify any fields
7. Tap "수정 완료" → Save changes
8. Return to PostDetailScreen → See updated details
```

---

## Technical Notes for Designers

### Component Reusability Map

| Component | Used In | Props | Purpose |
|-----------|---------|-------|---------|
| `ScreenHeader` | All screens | `title`, `showBackButton`, `backButtonProps` | Consistent header |
| `PostCard` | BulletinBoardScreen | `post`, `onPress`, `variant` | Post preview in list |
| `OrganizationCard` | BulletinBoardScreen | `organization`, `onPress` | Organization preview |
| `HeroCard` | PostDetailScreen | `post`, `isMyPost`, `applicationsCount`, `hasApplied`, `myApplication`, action callbacks | Post header with actions |
| `RoleCard` | PostDetailScreen | `roles` | Display multiple roles |
| `AuditionCard` | PostDetailScreen | `audition` | Audition details |
| `PerformanceCard` | PostDetailScreen | `performance` | Performance details |
| `BenefitsCard` | PostDetailScreen | `benefits` | Benefits details |
| `ContactCard` | PostDetailScreen | `contact` | Contact information |
| `ImageGallery` | PostDetailScreen | `images` | Swipeable image gallery |
| `ApplicationCard` | ApplicationManagementScreen | `application`, `onPress`, `onCall`, `onOpenPortfolio` | Application preview |
| `StatusFilterBar` | ApplicationManagementScreen | `filterTabs`, `selectedFilter`, `onFilterChange` | Status filter tabs |
| `AlertModal` | All screens | `visible`, `title`, `message`, `buttons`, `onDismiss`, `dismissable` | Alerts and confirmations |
| `TabBar` | BulletinBoardScreen | `activeTab`, `onTabChange` | Tab navigation |
| `EmptyState` | BulletinBoardScreen | `type`, `hasOrganizationFilter`, callbacks | Empty state messages |
| `LoadingState` | BulletinBoardScreen | None | Loading indicator |

### State Management Architecture

**Data Flow**:
```
Firestore (Cloud)
  ↓ (Real-time listeners)
Custom Hooks (usePostList, usePostDetail, useApplicationManagement, useCreatePostForm)
  ↓ (State + computed values)
Screen Components
  ↓ (Props)
Presentational Components
```

**Key Custom Hooks**:
1. **`usePostList`**:
   - Fetches posts and organizations
   - Provides filtered posts based on organization
   - Exposes `isOrganizer` flag

2. **`usePostDetail`**:
   - Fetches single post details
   - Manages application state (hasApplied, myApplication)
   - Provides application submission/withdrawal logic
   - Handles modal state

3. **`useApplicationManagement`**:
   - Fetches applications for a post
   - Provides filtering logic
   - Manages status update operations
   - Exposes communication actions (call, portfolio)

4. **`useCreatePostForm`**:
   - Manages complex form state
   - Handles template application
   - Provides progress calculation
   - Manages image upload
   - Validates and submits form data

5. **`useAlert`**:
   - Centralized alert state management
   - Provides `alert()` function and `hideAlert()` callback
   - Used across all screens for consistent alert UX

**State Updates**:
- Real-time via Firestore listeners
- Optimistic updates for user actions (status changes, applications)
- Immediate UI feedback before network confirmation

### Accessibility Implementation

**Accessibility Labels** (throughout codebase):
```javascript
accessibilityLabel="게시글 제목 - 작품명 모집공고"
accessibilityHint="터치하여 상세정보 보기"
accessibilityRole="button"
accessibilityState={{ selected: isActive }}
```

**Touch Targets**:
- All buttons meet 44x44 point minimum
- Card tap areas cover full card surface
- Icon buttons have adequate padding

**Color Contrast**:
- Text on backgrounds: 4.5:1 ratio minimum (WCAG AA)
- Status badges: Color + text for redundancy (not color-only)
- Disabled states: Reduced opacity but still readable

**Screen Reader Support**:
- All interactive elements labeled
- Status changes announced
- Loading states have descriptive text
- Empty states provide context

**Keyboard Navigation** (future consideration):
- Tab order for web version
- Focus management for modals
- Enter/Space for button activation

### Localization Support

**Translation System**:
- All UI strings use `translate()` function
- Translation keys organized by feature:
  - `bulletinBoard:title`
  - `bulletinBoard:tabs.announcements`
  - `bulletinBoard:tabs.organizations`
  - `bulletinBoard:status.recruiting`
  - `bulletinBoard:posts.deadline`
  - `bulletinBoard:actions.edit`

**Date/Time Formatting**:
- Firestore timestamps converted to locale dates
- Format: `YYYY-MM-DD` or `toLocaleDateString('ko-KR')`
- Future: Respect user's locale preference

**Number Formatting**:
- Counts: `"N명의 지원자"`
- Application count: `"지원자 N명"`
- Future: Locale-specific number formatting

**RTL Layout** (future consideration):
- FlexDirection adjustments
- Icon positioning
- Text alignment

---

## Future Enhancement Opportunities

### Feature Additions

1. **Advanced Search & Filters**
   - Search by production name, organization, keywords
   - Multi-select filters (location, role type, compensation range, deadline)
   - Saved searches for quick access
   - Search history

2. **Notifications System**
   - Push notifications for:
     - New posts matching saved searches
     - Application status changes (accepted/rejected)
     - Deadline reminders (3 days, 1 day before)
     - New applications received (organizers)
   - Notification preferences in settings
   - In-app notification center

3. **Favorites & Bookmarks**
   - Save posts for later (bookmark)
   - Follow organizations for updates
   - Application history view
   - Saved search alerts

4. **Enhanced Communication**
   - In-app messaging between organizer and applicant
   - Video audition submissions (upload or link)
   - Portfolio attachments (PDF, images)
   - Scheduling integration (calendar invites for auditions)

5. **Analytics Dashboard** (Organizers)
   - View count tracking over time
   - Application conversion rates
   - Popular posts insights
   - Best-performing tags and categories
   - Applicant demographics (aggregated, privacy-safe)

6. **Profile Enhancements**
   - Actor profiles with portfolio, resume, reel links
   - Organization profiles with past productions, reviews
   - Verified badges for established organizations
   - Rating/review system (post-production)

7. **Calendar Integration**
   - View all deadlines in calendar view
   - Audition schedule conflicts detection
   - Export to Google Calendar, iCal
   - Rehearsal schedule visibility

### UX Improvements

1. **Onboarding Flow**
   - First-time user guide with tooltips
   - Feature discovery hints
   - Role selection wizard (actor vs organizer)
   - Sample data walkthrough

2. **Responsive Design**
   - Tablet-optimized layouts (side-by-side views)
   - Desktop web version with expanded real estate
   - Adaptive card grids (1 column on mobile, 2-3 on tablet/desktop)
   - Split-view for large screens (list + detail)

3. **Offline Support**
   - View cached posts offline
   - Draft applications offline (auto-sync when online)
   - Sync status indicator
   - Conflict resolution on reconnect

4. **Performance Enhancements**
   - Pagination for very long lists (load more)
   - Infinite scroll with windowing
   - Image compression and optimization
   - Progressive image loading (blur-up)

5. **Accessibility Improvements**
   - Voice control support
   - High contrast mode
   - Dyslexia-friendly font option
   - Adjustable text size

6. **Form UX Enhancements**
   - Auto-save drafts (local storage or cloud)
   - Unsaved changes warning on navigation
   - Field-level validation with inline errors
   - Rich text editor for descriptions
   - Address autocomplete for location
   - Date range picker for multiple dates

7. **Application Management**
   - Bulk status updates (multi-select)
   - Export applications to CSV
   - Filter by name, role preference, date
   - Sort by application date, name
   - Notes on applications (organizer-only)
   - Star/flag important applications

### Technical Improvements

1. **Caching Strategy**
   - Aggressive caching for static content
   - Cache invalidation on data changes
   - Offline-first architecture

2. **Error Boundaries**
   - Graceful error handling
   - Error reporting (Sentry integration)
   - Fallback UI for component crashes

3. **Performance Monitoring**
   - Analytics integration (Firebase Analytics)
   - Performance metrics (React Native Performance)
   - Crash reporting
   - User behavior tracking

4. **Testing**
   - Unit tests for custom hooks
   - Integration tests for user flows
   - E2E tests for critical paths
   - Accessibility testing

5. **Security Enhancements**
   - Input sanitization (XSS prevention)
   - Rate limiting for API calls
   - Spam detection for applications
   - Content moderation for inappropriate posts

---

## Summary

The Musical Gathering Announcements feature (Bulletin Board System) provides a comprehensive, role-based platform for connecting musical theater performers with opportunities. The four core screens work together seamlessly to support two distinct user journeys while maintaining consistent design patterns and exceptional user experience.

### Key Strengths

1. **Clear Role-Based Permissions**
   - Actors and organizers see different UI elements
   - Permission checks at multiple levels (navigation, screen mount, action buttons)
   - Graceful permission denial with clear messaging

2. **Rich, Structured Information Architecture**
   - PostCard previews show essential info for quick scanning
   - PostDetailScreen uses specialized cards for each data type
   - Progressive disclosure prevents information overload

3. **Streamlined Application Workflow**
   - One-tap to apply from post detail
   - Full-screen modal with focused form
   - Real-time status tracking and updates
   - Easy withdrawal for pending applications

4. **Efficient Management Tools**
   - ApplicationManagementScreen with status filters
   - One-tap status changes with confirmation
   - Direct communication actions (call, portfolio)
   - Real-time count updates

5. **Responsive, Real-Time Updates**
   - Firestore listeners for instant data sync
   - Optimistic UI updates for perceived speed
   - No manual refresh needed

6. **Accessible, User-Friendly Design**
   - Consistent UI patterns across screens
   - Clear empty and loading states
   - Contextual alerts and confirmations
   - Touch-optimized interactions

7. **Template System for Efficiency**
   - Pre-built templates reduce friction
   - Quick start for experienced organizers
   - All fields remain editable after template application

8. **Progress Tracking**
   - Visual progress bar motivates completion
   - Real-time percentage calculation
   - Contextual tips guide users

### Design Philosophy

- **Progressive Disclosure**: Information revealed as needed, not all at once
- **Contextual Empty States**: Friendly, actionable guidance when no content
- **Confirmation for Important Actions**: Delete, withdraw, status changes all require confirmation
- **Real-Time Feedback**: Immediate UI updates on user actions
- **Mobile-First Design**: Touch-optimized interactions, appropriate keyboard types
- **Secondary Color Brand Identity**: Organization-related elements use secondary color for visual distinction and brand association
- **Performance Optimization**: FlatList virtualization, memoization, efficient Firestore queries

### Visual Hierarchy Principles

1. **Status First**: Recruitment/application status badges at top (highest priority)
2. **Content Second**: Titles, production names, key info prominently displayed
3. **Actions Third**: Buttons clearly visible but not overwhelming
4. **Supporting Details Fourth**: Location, schedule, tags provide context
5. **Secondary Actions Fifth**: Edit, delete, contact buttons less prominent

### Measurement Notes

- Card padding: 12px (md spacing)
- Card border radius: 12px
- Card border width: 2px (PostCard/OrganizationCard), 1px (ApplicationCard)
- Button height: ~48-56 points
- Icon size: 20-24 points (standard), 32+ points (large/primary)
- Minimum touch target: 44x44 points
- Progress bar height: 8px
- Tag padding: 4px horizontal, 2px vertical
- Section spacing: 16px (lg) between major sections

---

**File Created**: `/Users/mmecoco/Desktop/simple-firebase-starter/UX_DOCS/02_BULLETIN_BOARD.md`

This comprehensive documentation provides designers with deep insights into the Bulletin Board feature's UX patterns, user flows, state variations, and design system usage. All information is based on actual implementation code.
