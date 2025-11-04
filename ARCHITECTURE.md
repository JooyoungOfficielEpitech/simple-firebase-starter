
# Refactored Architecture Diagram

## Component Hierarchy

```
ApplicationManagementScreen (121 lines)
│
├── useApplicationManagement (custom hook)
│   ├── Application data fetching
│   ├── Filter logic
│   ├── Status management
│   └── User interaction handlers
│
├── StatusFilterBar Component
│   └── Filter tabs with counts
│
└── ApplicationCard Component (for each application)
    ├── Applicant header
    ├── Contact information
    ├── Portfolio link
    ├── Experience section
    └── Application message
```

## Data Flow

```
┌─────────────────────────────────────────────────────┐
│         ApplicationManagementScreen                  │
│                                                      │
│  ┌───────────────────────────────────────────────┐ │
│  │     useApplicationManagement Hook             │ │
│  │                                               │ │
│  │  • Firestore subscription                    │ │
│  │  • Filter state management                   │ │
│  │  • Event handlers                            │ │
│  └───────────────────────────────────────────────┘ │
│                      ↓                               │
│  ┌───────────────────────────────────────────────┐ │
│  │         StatusFilterBar                       │ │
│  │  [All] [Pending] [Accepted] [Rejected]       │ │
│  └───────────────────────────────────────────────┘ │
│                      ↓                               │
│  ┌───────────────────────────────────────────────┐ │
│  │         ApplicationCard (mapped)              │ │
│  │  ┌─────────────────────────────────────────┐ │ │
│  │  │ Name                        [Status]    │ │ │
│  │  │ email@example.com                       │ │ │
│  │  │ Applied: 2024-11-03                     │ │ │
│  │  ├─────────────────────────────────────────┤ │ │
│  │  │ 📞 Phone Number                         │ │ │
│  │  │ 🔗 Portfolio                            │ │ │
│  │  │ ⚙️ Role Preference                      │ │ │
│  │  ├─────────────────────────────────────────┤ │ │
│  │  │ Experience text...                      │ │ │
│  │  │ Application message...                  │ │ │
│  │  └─────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## File Organization

```
app/
├── screens/
│   ├── ApplicationManagementScreen.tsx (121 lines) ← Main screen
│   └── ApplicationManagementScreen.styles.ts (95 lines)
│
├── components/
│   └── ApplicationManagement/
│       ├── index.ts
│       ├── ApplicationCard.tsx (134 lines)
│       ├── ApplicationCard.styles.ts (104 lines)
│       ├── StatusFilterBar.tsx (47 lines)
│       └── StatusFilterBar.styles.ts (40 lines)
│
└── hooks/
    └── useApplicationManagement.ts (193 lines)
```

## Responsibilities

### ApplicationManagementScreen
- Screen layout and structure
- Integration of components
- Navigation handling
- Alert modal management

### useApplicationManagement Hook
- Firestore subscription
- Application state management
- Filtering logic
- Status update operations
- User action handlers (call, portfolio, options)

### ApplicationCard Component
- Individual application display
- Contact information rendering
- Status badge display
- User interaction triggers

### StatusFilterBar Component
- Filter tab rendering
- Active state management
- Filter change handling
- Count display
