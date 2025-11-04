# CreateOrganizationScreen Refactoring Structure

## Before (720 lines - Single File)
```
CreateOrganizationScreen.tsx
├── Imports (20 lines)
├── State Management (30 lines)
├── useEffect & Data Loading (60 lines)
├── Validation Logic (30 lines)
├── Submit Handler (60 lines)
├── Tag/Array Handlers (60 lines)
├── JSX - Basic Info Fields (60 lines)
├── JSX - Social Media Fields (40 lines)
├── JSX - Detailed Info Fields (120 lines)
├── JSX - Tag Input (repeated 3x) (180 lines)
└── Styles (60 lines)
```

## After (126 lines - Main File + Supporting Files)

```
CreateOrganizationScreen.tsx (126 lines)
├── Imports (20 lines)
├── Navigation & Route Setup (10 lines)
├── Hook Usage (15 lines)
├── Event Handlers (10 lines)
├── Helper Functions (15 lines)
├── Loading State JSX (15 lines)
└── Main JSX (41 lines)
    ├── <BasicInfoSection />
    ├── <SocialMediaSection />
    ├── <DetailedInfoSection />
    └── <Button />

useOrganizationForm.ts (199 lines)
├── Interface Definition (10 lines)
├── State Initialization (40 lines)
├── useEffect (10 lines)
├── loadUserProfile (15 lines)
├── loadOrganization (35 lines)
├── validateForm (25 lines)
├── handleSubmit (45 lines)
├── updateFormData (5 lines)
├── addArrayItem (10 lines)
└── removeArrayItem (4 lines)

BasicInfoSection.tsx (78 lines)
├── Interface & Imports (15 lines)
├── Component (55 lines)
│   ├── Name Field
│   ├── Description Field
│   ├── Contact Email Field
│   ├── Contact Phone Field
│   ├── Website Field
│   ├── Location Field
│   └── Established Date Field
└── Styles (8 lines)

SocialMediaSection.tsx (69 lines)
├── Interface & Imports (15 lines)
├── Component (45 lines)
│   ├── Section Title
│   ├── Instagram URL Field
│   ├── YouTube URL Field
│   ├── Facebook URL Field
│   └── Twitter URL Field
└── Styles (9 lines)

DetailedInfoSection.tsx (101 lines)
├── Interface & Imports (20 lines)
├── Component (70 lines)
│   ├── Section Title
│   ├── Founding Story Field
│   ├── Vision Field
│   ├── <TagInputField label="전문 분야" />
│   ├── <TagInputField label="대표 작품" />
│   ├── Facilities Field
│   ├── Recruitment Info Field
│   └── <TagInputField label="태그" />
└── Styles (11 lines)

TagInputField.tsx (146 lines)
├── Interface & Imports (15 lines)
├── State Management (5 lines)
├── Component Logic (30 lines)
└── Styles (96 lines)
    ├── Tag Section
    ├── Tag Label
    ├── Tag Input Container
    ├── Tag Input
    ├── Add Tag Button
    ├── Add Tag Button Text
    ├── Tags Container
    ├── Tag
    ├── Tag Text
    ├── Remove Tag Button
    └── Remove Tag Text

CreateOrganizationScreen.styles.ts (25 lines)
├── $container
├── $form
├── $loadingContainer
├── $loadingText
└── $submitButton

organization/index.ts (4 lines)
└── Component Exports
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  CreateOrganizationScreen                   │
│                        (126 lines)                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              useOrganizationForm Hook                 │  │
│  │                  (199 lines)                          │  │
│  │  • Form State                                         │  │
│  │  • Validation                                         │  │
│  │  • Submit Logic                                       │  │
│  │  • Array Operations                                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ BasicInfoSection │  │ SocialMediaSection│               │
│  │   (78 lines)     │  │    (69 lines)     │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           DetailedInfoSection (101 lines)            │  │
│  │  ┌────────────────┐  ┌────────────────┐             │  │
│  │  │ TagInputField  │  │ TagInputField  │  ...        │  │
│  │  │  (146 lines)   │  │  (reused 3x)   │             │  │
│  │  └────────────────┘  └────────────────┘             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Styles: CreateOrganizationScreen.styles.ts (25 lines)     │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
Screen
└── CreateOrganizationScreen (126 lines)
    ├── ScreenHeader
    ├── View (Container)
    │   └── View (Form)
    │       ├── BasicInfoSection (78 lines)
    │       │   ├── TextField × 7
    │       │   └── Themed Styles
    │       │
    │       ├── SocialMediaSection (69 lines)
    │       │   ├── Text (Section Title)
    │       │   ├── TextField × 4
    │       │   └── Themed Styles
    │       │
    │       ├── DetailedInfoSection (101 lines)
    │       │   ├── Text (Section Title)
    │       │   ├── TextField × 4
    │       │   ├── TagInputField (Specialties)
    │       │   ├── TagInputField (Past Works)
    │       │   ├── TagInputField (Tags)
    │       │   └── Themed Styles
    │       │
    │       └── Button (Submit)
    │
    └── AlertModal

TagInputField (146 lines - Reusable)
├── Text (Label)
├── View (Input Container)
│   ├── TextField
│   └── Button (Add)
└── View (Tags Container)
    └── Tag Items × N
        ├── Text (Tag Name)
        └── TouchableOpacity (Remove)
```

## Data Flow

```
User Input
    ↓
Form Sections (BasicInfo, SocialMedia, DetailedInfo)
    ↓
updateFormData / addArrayItem / removeArrayItem
    ↓
useOrganizationForm Hook
    ↓
formData State
    ↓
handleSubmit
    ↓
Validation
    ↓
Firestore Service (organizationService / userService)
    ↓
Success/Error Callback
    ↓
Alert Modal & Navigation
```

## File Organization

```
app/
├── screens/
│   ├── CreateOrganizationScreen.tsx        (126 lines) ⭐ MAIN
│   └── CreateOrganizationScreen.styles.ts  (25 lines)
│
├── components/
│   └── organization/
│       ├── index.ts                        (4 lines)
│       ├── BasicInfoSection.tsx            (78 lines)
│       ├── SocialMediaSection.tsx          (69 lines)
│       ├── DetailedInfoSection.tsx         (101 lines)
│       └── TagInputField.tsx               (146 lines)
│
└── hooks/
    └── useOrganizationForm.ts              (199 lines)
```

## Benefits Summary

### Code Organization
- ✅ Single Responsibility: Each file has one clear purpose
- ✅ Separation of Concerns: UI, Logic, Styles separated
- ✅ Reusability: TagInputField used 3 times, sections reusable

### Maintainability
- ✅ Easy to locate issues (component-level isolation)
- ✅ Simple to test (unit test each component/hook)
- ✅ Clear dependencies (import tree is explicit)

### Developer Experience
- ✅ Faster navigation (small, focused files)
- ✅ Better IntelliSense (smaller context per file)
- ✅ Easier code reviews (changes isolated to specific files)

### Performance
- ✅ Same runtime performance
- ✅ Potential for future optimization (React.memo per section)
- ✅ Better tree-shaking (only import what's needed)
