# User Management Documentation

Comprehensive UX documentation for user profile and organization management features.

---

## Table of Contents

1. [ProfileScreen - Profile Hub](#profilescreen---profile-hub)
2. [EditProfileScreen - Profile Editor](#editprofilescreen---profile-editor)
3. [CreateOrganizationScreen - Organization Management](#createorganizationscreen---organization-management)
4. [Cross-Screen Patterns](#cross-screen-patterns)

---

## ProfileScreen - Profile Hub

### Screen Purpose

Central hub for viewing and managing user account information. Displays complete profile data, account status, and provides access to all profile-related actions including editing, email verification, organizer conversion, and account deletion.

### UI Components by Section

#### 1. Basic Information Card
**Purpose**: Display core user profile data in read-only format

**Components**:
- Section title: "기본 정보" (Basic Information)
- Information rows with label-value pairs:
  - Name (`name` field)
  - Email (from Firebase auth)
  - Phone number (`phoneNumber` field)
  - Gender (`gender` field - male/female)
  - Birthday (`birthday` field)
  - Height (`heightCm` field with "cm" suffix)
  - User type (`userType` field - general/organizer)

**Display Logic**:
- Missing values show "미설정" (Not set)
- Gender displays as "남성"/"여성" (Male/Female) or "미설정"
- User type displays as "운영자"/"일반회원" (Organizer/General User)
- Height formatted with "cm" unit

#### 2. Account Status Card
**Purpose**: Display account health metrics and verification status

**Components**:
- Section title: "계정 상태" (Account Status)
- Email verification status:
  - Shows "✅ 인증됨" (Verified) or "❌ 미인증" (Unverified)
- Profile completion percentage:
  - Displays percentage value (0-100%)
  - Interactive tap area with hint: "📊 탭하여 상세보기"
  - Calculation based on 5 required fields: name, phone, gender, birthday, height
- Email verification resend button (conditional):
  - Only displayed if email is unverified
  - Text: "이메일 인증 재발송"
  - Disabled during update operations

**Interaction Logic**:
- Tapping completion percentage shows detailed modal with:
  - Completed items list with current values
  - Missing items list with "미설정" status
  - Option to navigate to EditProfile
  - Success message if 100% complete

#### 3. Profile Editing Card
**Purpose**: Quick access to profile modification features

**Components**:
- Section title: "프로필 편집" (Profile Editing)
- "프로필 편집" button → navigates to EditProfile screen
- "비밀번호 변경" button → placeholder (not yet implemented)

#### 4. Account Management Card
**Purpose**: Critical account operations and role management

**Components**:
- Section title: "계정 관리" (Account Management)
- "이메일 변경" button → placeholder (not yet implemented)
- "운영자 계정으로 만들기" button (conditional):
  - Only visible for `userType === "general"`
  - Triggers organizer conversion flow
- "로그아웃" button → logs out user
- "회원 탈퇴" button (destructive):
  - Red background color
  - Shows comprehensive deletion warning
  - Disabled during operations

### User Interactions & Actions

#### Profile Completion Click
1. User taps on completion percentage
2. System calculates missing vs. completed fields
3. If 100%: Shows success message
4. If incomplete: Shows modal with:
   - Completed items count and values
   - Missing items count and placeholders
   - "확인" button to navigate to EditProfile

#### Organizer Conversion Flow
1. User clicks "운영자 계정으로 만들기"
2. System checks if user already owns an organization
3. If owns organization: Shows alert blocking duplicate ownership
4. If not: Attempts auto-conversion:
   - Checks `hasBeenOrganizer` flag
   - If true: Auto-restores previous organization
   - If false: Navigates to CreateOrganization with `isOrganizerConversion: true`

#### Account Deletion Flow
1. User clicks "회원 탈퇴" (Delete Account)
2. System shows destructive confirmation modal with:
   - Warning title: "회원 탈퇴"
   - Detailed deletion message listing all data to be deleted:
     - Profile information
     - Posted content
     - Applications
     - Notifications
     - Owned organizations
   - Warning: "이 작업은 되돌릴 수 없습니다" (Cannot be undone)
   - "회원 탈퇴" (Delete) button in red
3. On confirmation:
   - Calls `userService.deleteUserAccount()`
   - Automatically logs out user
   - Shows completion message

### Information Architecture

**Data Flow**:
```
ProfileScreen Load
↓
Check user authentication
↓
Load user profile from Firestore
↓
If no profile → Create default profile
↓
Calculate completion percentage (memoized)
↓
Display all sections
```

**Profile Completion Calculation**:
```javascript
Fields Checked (5 total):
1. name: exists && not empty string
2. phoneNumber: exists && not empty string
3. gender: exists && is "male" or "female"
4. birthday: exists && not empty string
5. heightCm: is number && > 0

Percentage = (completed fields / 5) * 100
```

### Navigation Connections

**Incoming**:
- Main tab navigation (always accessible)
- Returns from EditProfile (reloads profile on focus)

**Outgoing**:
- → EditProfile: Profile editing form
- → CreateOrganization (with `isOrganizerConversion: true`): Organizer conversion
- System logout: Returns to authentication flow

### State Variations

#### Loading State
- Shows loading container with "프로필 로딩 중..." text
- Blocks interaction until profile loads

#### Default State
- All sections visible
- Buttons enabled
- Profile data populated or showing "미설정"

#### Updating State
- During operations (email verification, deletion):
  - Relevant buttons disabled
  - `isUpdating` flag prevents multiple actions

#### User Type Variations

**General User** (`userType: "general"`):
- Shows "운영자 계정으로 만들기" button
- User type displays as "일반회원"

**Organizer User** (`userType: "organizer"`):
- Hides organizer conversion button
- User type displays as "운영자"
- Includes organization name if available

#### Email Verification Variations

**Unverified Email**:
- Shows "❌ 미인증" status
- Displays "이메일 인증 재발송" button

**Verified Email**:
- Shows "✅ 인증됨" status
- Hides resend button

### User Type Differences

#### General Users
- Can convert to organizer (if no existing organization)
- Standard profile management
- Limited to basic profile fields

#### Organizer Users
- Cannot see conversion button
- Display includes organization association
- May have additional organization management access elsewhere

### Critical Design Considerations

#### Data Integrity
- Profile auto-creation if missing during load
- Real-time refresh on screen focus (catches EditProfile changes)
- Memoized completion calculation prevents unnecessary recalculation

#### User Safety
- Multi-step confirmation for destructive actions
- Comprehensive deletion warnings
- Cannot revert account deletion
- Prevents duplicate organization ownership

#### Accessibility
- Clear visual status indicators (✅/❌)
- Label-value pairs for screen reader support
- Interactive hints ("📊 탭하여 상세보기")
- Descriptive button text

#### Performance
- `useMemo` for completion calculation (depends only on `userProfile`)
- Focus-triggered reload (not continuous polling)
- Conditional rendering for optional features

#### Error Handling
- Graceful handling of missing profile data
- Console logging for debugging
- Alert messages for operation failures
- Loading states during async operations

---

## EditProfileScreen - Profile Editor

### Screen Purpose

Form-based editor for modifying personal profile information. Provides structured input fields for all editable user data with validation and save/cancel actions.

### UI Components by Section

#### Screen Header
- Title: "프로필 편집" (Profile Editing)
- Back button: Returns to ProfileScreen
- No notification icon

#### Form Container
Single card-style container with all editable fields

**Section Title**: "기본 정보" (Basic Information)

**Input Fields**:

1. **Name Field** (Required)
   - Label: "이름" (Name)
   - Placeholder: "이름을 입력하세요" (Enter name)
   - Text input type
   - Cannot be empty on save

2. **Phone Number Field** (Optional)
   - Label: "전화번호" (Phone Number)
   - Placeholder: "전화번호를 입력하세요" (Enter phone number)
   - Keyboard: `phone-pad`
   - Optional field

3. **Gender Field** (Optional)
   - Label: "성별" (Gender)
   - Dropdown component with options:
     - "남성" (Male) → value: "male"
     - "여성" (Female) → value: "female"
   - Placeholder: "성별을 선택하세요" (Select gender)

4. **Birthday Field** (Optional)
   - Label: "생년월일" (Birthday)
   - Placeholder: "YYYY-MM-DD 형식으로 입력" (Enter in YYYY-MM-DD format)
   - Text input with date format hint
   - No validation on format

5. **Height Field** (Optional)
   - Label: "키 (cm)" (Height in cm)
   - Placeholder: "키를 입력하세요" (Enter height)
   - Keyboard: `numeric`
   - Validation: Must be positive number if provided

#### Button Container
Two buttons in vertical stack:

1. **Save Button** ("저장")
   - Primary CTA style
   - Disabled during save operation
   - Triggers validation and save

2. **Cancel Button** ("취소")
   - Default style (outlined)
   - Returns to ProfileScreen without saving
   - Always enabled

### User Interactions & Actions

#### Form Loading Flow
1. Screen mounts → loads current user profile
2. Populates all fields with existing values:
   - Name from `profile.name`
   - Phone from `profile.phoneNumber`
   - Gender from `profile.gender`
   - Birthday from `profile.birthday`
   - Height from `profile.heightCm` (converted to string)
3. Empty fields show placeholders

#### Save Flow
1. User clicks "저장" button
2. System validates:
   - Name must not be empty/whitespace only
   - Height must be valid positive number if provided
3. If validation fails: Shows alert with error message
4. If validation passes:
   - Constructs update object with trimmed values
   - Only includes non-empty fields
   - Converts height string to number
   - Calls `userService.updateUserProfile(updateData)`
5. On success:
   - Shows "성공" alert: "프로필이 업데이트되었습니다"
   - Returns to ProfileScreen on alert dismiss
6. On error:
   - Shows "오류" alert: "프로필 업데이트에 실패했습니다"
   - Remains on edit screen

#### Cancel Flow
1. User clicks "취소" button
2. Immediately returns to ProfileScreen
3. No confirmation modal (changes are discarded)

### Information Architecture

**Form State Management**:
```javascript
Local State:
- name: string (required)
- phoneNumber: string (optional)
- gender: UserGender | "" (optional)
- birthday: string (optional)
- heightCm: string (optional, converted from number)

Update Object Construction:
- Always includes: name (trimmed)
- Conditionally includes if not empty:
  - phoneNumber (trimmed)
  - gender
  - birthday
  - heightCm (parsed as number)
```

**Validation Rules**:
1. Name: Required, cannot be empty/whitespace
2. Phone: Optional, no format validation
3. Gender: Optional, must be "male" or "female" if provided
4. Birthday: Optional, no format validation
5. Height: Optional, must be positive integer if provided

### Navigation Connections

**Incoming**:
- From ProfileScreen → "프로필 편집" button

**Outgoing**:
- → ProfileScreen (on save success or cancel)
- Alert modal displays (non-navigational)

### State Variations

#### Loading State
- Shows loading container: "프로필 로딩 중..."
- Back button still functional
- Form not displayed

#### Default Edit State
- All fields populated or empty
- Both buttons enabled
- No alerts visible

#### Saving State
- Save button disabled (`isSaving: true`)
- Cancel button remains enabled
- User can still cancel during save

#### Error State
- Alert modal shows error message
- Form remains editable
- User can retry save or cancel

### User Type Differences

No differences - same functionality for all user types. The form only edits personal profile fields, not user type or organization data.

### Critical Design Considerations

#### Data Validation
- Client-side validation before API call
- Type conversion (string → number for height)
- Trimming whitespace from text inputs
- Partial updates (only changed fields)

#### User Experience
- No confirmation on cancel (quick exit)
- Loading states during async operations
- Clear success/error feedback
- Remains on screen on error (allows retry)
- Auto-navigates on success

#### Accessibility
- Clear field labels
- Appropriate keyboard types (phone-pad, numeric)
- Dropdown for constrained choices (gender)
- Placeholder text as hints
- Required field indicators in labels (*)

#### Error Prevention
- Required field validation
- Number parsing validation
- Empty string handling
- Network error handling

#### Performance
- Single load on mount
- No auto-save or real-time updates
- Explicit save action
- Efficient update object construction

---

## CreateOrganizationScreen - Organization Management

### Screen Purpose

Multi-purpose form for creating new organizations, editing existing organizations, or converting general users to organizers. Supports three distinct operational modes with context-aware UI and validation.

### UI Components by Section

#### Screen Header
**Dynamic Title**:
- Create mode: "단체 등록" (Organization Registration)
- Edit mode: "단체 수정" (Organization Editing)
- Organizer conversion: "운영자 계정 전환" (Organizer Account Conversion)

**Navigation**:
- Back button (always present)
- No notification icon

#### 1. Basic Information Section
**Component**: `BasicInfoSection`

**Purpose**: Core organization identity and contact information

**Fields**:
1. **Organization Name** (Required)
   - Label: "단체명 *"
   - Placeholder: "극단명을 입력해주세요" (Enter theater company name)
   - Text input

2. **Description** (Required)
   - Label: "단체 소개 *"
   - Placeholder: "단체에 대한 간단한 소개를 입력해주세요" (Enter brief introduction)
   - Multiline text input (4 lines)

3. **Contact Email** (Required)
   - Label: "연락처 이메일 *"
   - Placeholder: "contact@example.com"
   - Email keyboard type
   - No auto-capitalization

4. **Contact Phone** (Optional)
   - Label: "연락처 전화번호"
   - Placeholder: "02-1234-5678"
   - Phone pad keyboard

5. **Website** (Optional)
   - Label: "웹사이트"
   - Placeholder: "https://example.com"
   - URL keyboard type
   - No auto-capitalization

6. **Location** (Required)
   - Label: "소재지 *"
   - Placeholder: "서울특별시 강남구"
   - Text input

7. **Established Date** (Optional)
   - Label: "설립일"
   - Placeholder: "2020-01-01"
   - Text input (date format expected)

#### 2. Social Media Section
**Component**: `SocialMediaSection`

**Purpose**: Organization's social media presence

**Section Title**: "소셜 미디어" (Social Media)

**Fields** (All Optional):
1. **Instagram**
   - Label: "인스타그램"
   - Placeholder: "https://instagram.com/your_theater"
   - URL keyboard

2. **YouTube**
   - Label: "유튜브"
   - Placeholder: "https://youtube.com/@your_theater"
   - URL keyboard

3. **Facebook**
   - Label: "페이스북"
   - Placeholder: "https://facebook.com/your_theater"
   - URL keyboard

4. **Twitter**
   - Label: "트위터"
   - Placeholder: "https://twitter.com/your_theater"
   - URL keyboard

#### 3. Detailed Information Section
**Component**: `DetailedInfoSection`

**Purpose**: Rich narrative and metadata about organization

**Section Title**: "상세 정보" (Detailed Information)

**Fields**:

1. **Founding Story** (Optional)
   - Label: "창립 스토리"
   - Placeholder: "단체가 어떻게 시작되었나요?" (How did the organization start?)
   - Multiline text (4 lines)

2. **Vision and Goals** (Optional)
   - Label: "비전과 목표"
   - Placeholder: "단체의 비전과 목표를 입력해주세요" (Enter vision and goals)
   - Multiline text (3 lines)

3. **Specialties** (Array, Optional)
   - Label: "전문 분야"
   - Component: `TagInputField`
   - Placeholder: "뮤지컬, 연극, 드라마 등" (Musical, drama, etc.)
   - Add/remove individual specialty tags

4. **Past Works** (Array, Optional)
   - Label: "대표 작품"
   - Component: `TagInputField`
   - Placeholder: "대표 작품명을 입력해주세요" (Enter representative works)
   - Add/remove individual work titles

5. **Facilities** (Optional)
   - Label: "보유 시설"
   - Placeholder: "연습실, 소극장, 의상실 등" (Practice room, small theater, costume room, etc.)
   - Multiline text (3 lines)

6. **Recruitment Info** (Optional)
   - Label: "모집 안내"
   - Placeholder: "배우/스태프 모집 시 참고할 정보" (Reference info for actor/staff recruitment)
   - Multiline text (3 lines)

7. **Tags** (Array, Optional)
   - Label: "태그"
   - Component: `TagInputField`
   - Placeholder: "태그를 입력하고 추가 버튼을 눌러주세요" (Enter tag and press add button)
   - Add/remove individual tags

#### Submit Button
**Dynamic Text**:
- Create mode: "등록하기" (Register)
- Edit mode: "수정하기" (Update)
- Organizer conversion: "운영자로 전환하기" (Convert to Organizer)

**Style**: Primary CTA
**Position**: Below all form sections

#### Alert Modal
Standard AlertModal component for success/error feedback

### User Interactions & Actions

#### Form Initialization
**Create Mode** (default):
- Empty form
- All fields set to defaults (empty strings/arrays)

**Edit Mode** (`isEdit: true`, `organizationId` provided):
- Loads existing organization data
- Populates all fields with current values
- `useOrganizationForm` hook fetches data

**Organizer Conversion Mode** (`isOrganizerConversion: true`):
- Empty form
- Special success message on completion
- Automatically converts user type to "organizer"

#### TagInputField Interaction
**Component Behavior**:
- Text input field with "추가" (Add) button
- Enter text → click "추가" or press Enter key
- Tag appears as chip with × remove button
- Clicking × removes individual tag
- Tags display in wrapped row layout

**Visual Design**:
- Gray background chips
- Circular × button with darker gray
- Wrapped layout for multiple tags

#### Validation Rules (Client-side)
Required fields enforced by `useOrganizationForm` hook:
- Organization name
- Description
- Contact email
- Location

Optional fields can be empty without error.

#### Submission Flow
1. User clicks submit button
2. Hook validates required fields
3. If validation fails: Shows error alert with missing fields
4. If validation passes:
   - Constructs organization object
   - In create/conversion mode: Creates new organization + updates user
   - In edit mode: Updates existing organization
5. On success:
   - Shows context-appropriate success message:
     - Create: "단체가 등록되었습니다"
     - Edit: "단체 정보가 수정되었습니다"
     - Conversion: "운영자 계정으로 전환되고 단체가 등록되었습니다"
   - Navigates back to previous screen
6. On error:
   - Shows error alert with message
   - Remains on form for corrections

### Information Architecture

**Form Data Structure**:
```typescript
CreateOrganization {
  // Basic Info (Required)
  name: string
  description: string
  contactEmail: string
  location: string

  // Basic Info (Optional)
  contactPhone?: string
  website?: string
  establishedDate?: string

  // Social Media (All Optional)
  instagramUrl?: string
  youtubeUrl?: string
  facebookUrl?: string
  twitterUrl?: string

  // Detailed Info (Optional)
  foundingStory?: string
  vision?: string
  facilities?: string
  recruitmentInfo?: string

  // Arrays (Optional)
  specialties: string[]
  pastWorks: string[]
  tags: string[]
}
```

**Mode Detection Logic**:
```javascript
const {
  organizationId,      // Presence indicates edit mode
  isEdit = false,      // Explicit edit flag
  isOrganizerConversion = false  // Conversion mode flag
} = route.params || {}

Priority: isEdit > isOrganizerConversion > create (default)
```

### Navigation Connections

**Incoming**:
- From ProfileScreen → "운영자 계정으로 만들기" (with `isOrganizerConversion: true`)
- From SettingsScreen → organizer conversion (with `isOrganizerConversion: true`)
- From organization management → edit existing (with `isEdit: true`, `organizationId`)

**Outgoing**:
- Success → navigates back (typically to previous screen)
- Back button → returns to previous screen (form discarded)

### State Variations

#### Loading State
- Shows loading container: "단체 정보를 불러오는 중..."
- Header still visible with correct title
- Form hidden during load

#### Default Form State
- All sections visible
- Submit button enabled
- Fields populated (edit mode) or empty (create mode)

#### Error State
- Alert modal shows error message
- Form remains editable
- User can correct and resubmit

#### Success State
- Alert modal shows success message
- On dismissal, navigates away
- Form data saved to Firestore

### User Type Differences

#### General Users (Pre-Conversion)
- Can only access in conversion mode
- After successful submission:
  - User type changes to "organizer"
  - Organization is created and associated
  - User profile updated with organization reference

#### Organizer Users
- Can access in edit mode
- Can create additional organizations (if permitted)
- Edits update existing organization data

### Context-Aware Modes

#### Create Mode (Default)
**When**: No route parameters, or explicit create action
**Behavior**:
- Empty form
- "단체 등록" title
- "등록하기" button
- Creates new organization
- Does NOT change user type

#### Edit Mode
**When**: `isEdit: true` and `organizationId` provided
**Behavior**:
- "단체 수정" title
- "수정하기" button
- Loads existing organization data
- Updates existing organization
- Does NOT change user type

#### Organizer Conversion Mode
**When**: `isOrganizerConversion: true`
**Behavior**:
- "운영자 계정 전환" title
- "운영자로 전환하기" button
- Empty form (new organization)
- Creates organization AND changes user type to "organizer"
- Special success message
- One-time conversion flow

### Critical Design Considerations

#### Form Complexity Management
- Broken into three logical sections
- Progressive disclosure (basic → social → detailed)
- Optional vs. required fields clearly marked
- Specialized components (TagInputField, Dropdown)

#### Data Validation
- Required fields enforced at submission
- Email format validation (client + server)
- URL format expectations (placeholders as guidance)
- Array item uniqueness (tags, specialties)

#### User Guidance
- Contextual placeholders for all fields
- Clear section titles
- "추가" button for array items
- Visual feedback for tag addition/removal

#### Error Prevention
- Required field indicators (*)
- Validation before server call
- Clear error messages
- Ability to retry after error

#### State Management
- Custom `useOrganizationForm` hook
- Centralized form state
- Array manipulation helpers
- Mode-aware submission logic

#### Accessibility
- Appropriate keyboard types
- Clear field labels
- Visual separation of sections
- Action buttons at bottom (thumb-friendly)

#### Performance
- Lazy loading in edit mode
- Efficient array updates
- Memoized calculations in hook
- Single submission call

---

## Cross-Screen Patterns

### Common UI Components

#### AlertModal Pattern
**Usage**: ProfileScreen, EditProfileScreen, CreateOrganizationScreen

**Purpose**: Themed, consistent modal dialogs for alerts, confirmations, and errors

**Features**:
- Replaces native Alert API
- Theme-aware styling
- Flexible button configuration
- Optional backdrop dismissal
- Destructive action support

**Button Styles**:
- `default`: Standard action (outlined)
- `destructive`: Dangerous action (red background)
- `cancel`: Dismissive action (outlined, gray)

**Common Patterns**:
```javascript
// Simple alert
alert("Title", "Message")

// Confirm action
confirm("Title", "Message", onConfirm)

// Destructive confirm
confirmDestructive("Title", "Warning message", "Action", onConfirm)
```

#### ContentSection Pattern
**Usage**: SettingsScreen (referenced pattern)

**Purpose**: Unified content grouping with consistent styling

**Variants**:
- `default`: Semi-transparent background
- `card`: Solid background with border
- `flat`: Minimal padding, no background

**Structure**:
```jsx
<ContentSection title="Title" subtitle="Optional" variant="default">
  {children}
</ContentSection>
```

#### TagInputField Pattern
**Usage**: CreateOrganizationScreen (DetailedInfoSection)

**Purpose**: Array-based input with add/remove functionality

**Features**:
- Text input with "추가" button
- Enter key support
- Visual tag chips
- Individual × remove buttons
- Wrapped layout

**Interaction Flow**:
1. User types in text field
2. Clicks "추가" or presses Enter
3. Tag appears as chip below
4. Click × to remove individual tag
5. Empty input validation (no empty tags)

### Navigation Flow

```
Main Tab Navigation
    ↓
ProfileScreen (Hub)
    ↓
    ├→ EditProfileScreen
    │      ↓
    │   [Save] → Back to ProfileScreen (reload)
    │      ↓
    │   [Cancel] → Back to ProfileScreen (no change)
    │
    ├→ CreateOrganizationScreen (Conversion Mode)
    │      ↓
    │   [Submit] → Converts user type + creates org → Back to ProfileScreen
    │      ↓
    │   [Cancel] → Back to ProfileScreen (no change)
    │
    └→ Logout → Auth Flow

SettingsScreen
    ↓
    ├→ CreateOrganizationScreen (Conversion Mode)
    │      ↓
    │   [Submit] → Converts user type + creates org → Back to Settings
    │
    └→ CreateOrganizationScreen (Edit Mode - if organizer)
           ↓
       [Submit] → Updates org → Back to Settings
```

### Shared Design Principles

#### Visual Consistency
- Card-based layouts with rounded corners
- Consistent spacing (theme.spacing values)
- Shadow/elevation for depth
- Border colors from theme
- Section titles at 18px bold

#### Form Design
- Labels above fields
- Placeholders as input hints
- Required field indicators (*)
- Multiline for long content
- Appropriate keyboard types
- TextField component standardization

#### Button Hierarchy
- Primary actions: CTA style (solid background)
- Secondary actions: Default style (outlined)
- Destructive actions: Red/error color
- Disabled state during operations
- Consistent sizing and spacing

#### Loading States
- Centered loading containers
- Descriptive loading text
- Header remains visible
- Content hidden during load
- User can still navigate back

#### Empty States
- Centered content
- Large emoji icon
- Clear title text
- Explanatory message
- Call-to-action where appropriate

#### Error Handling
- Alert modals for errors
- Descriptive error messages
- Retry opportunities
- Console logging for debugging
- Graceful degradation

#### Information Display
- Label-value pairs for read-only data
- Semantic formatting (units, dates)
- "미설정" for missing optional data
- Visual status indicators (✅/❌)
- Clear section separation

#### Accessibility Considerations
- Semantic component usage
- Clear, descriptive labels
- Interactive hint text
- Appropriate touch targets
- Screen reader support
- Color contrast compliance

#### Performance Optimization
- Memoized calculations
- Conditional rendering
- Focus-triggered reloads (not polling)
- Efficient state updates
- Lazy loading where appropriate

#### User Safety
- Confirmation for destructive actions
- Clear warning messages
- Irreversible action indicators
- Double-check flows
- Disabled state during operations

#### Data Integrity
- Required field validation
- Type conversion (string ↔ number)
- Whitespace trimming
- Empty value handling
- Partial update support

---

## Summary

The user management flow provides a comprehensive system for profile and organization management with three main screens:

1. **ProfileScreen**: Central hub for viewing account information and accessing management features
2. **EditProfileScreen**: Simple form-based editor for personal data
3. **CreateOrganizationScreen**: Multi-mode organization management (create/edit/convert)

All screens share consistent UI patterns, validation logic, and user safety measures while maintaining clear separation of concerns and intuitive navigation flows.
