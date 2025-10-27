# Design System

A comprehensive design system for React Native applications with consistent design tokens, component library, and theming support.

## 📁 Structure

```
design-system/
├── tokens/              # Design tokens (primitives)
│   ├── colors.ts       # Color tokens
│   ├── spacing.ts      # Spacing and layout tokens
│   ├── typography.ts   # Typography tokens
│   ├── shadows.ts      # Shadow and elevation tokens
│   └── index.ts        # Token exports
├── components/         # Component library
│   └── index.ts        # Component registry
└── README.md          # This file
```

## 🎨 Design Tokens

Design tokens are the visual design atoms of the design system. They're named entities that store visual design attributes.

### Color Tokens

Semantic color tokens that map to theme-specific values:

```tsx
import { colorTokens } from "@/design-system/tokens"

// Surface colors
colorTokens.surface.primary        // Main background
colorTokens.surface.elevated       // Cards, modals

// Content colors
colorTokens.content.primary        // Primary text
colorTokens.content.secondary      // Secondary text

// Interactive colors
colorTokens.interactive.primary    // Buttons, links
colorTokens.interactive.hover      // Hover state
```

**Categories:**
- `surface` - Background and container colors
- `content` - Text and icon colors
- `border` - Border and divider colors
- `interactive` - Button and link colors
- `feedback` - Status and alert colors
- `overlay` - Modal and dialog backgrounds
- `accent` - Special accent colors

### Spacing Tokens

Consistent spacing scale based on 4px base unit:

```tsx
import { spacingTokens, semanticSpacing } from "@/design-system/tokens"

// Base spacing scale
spacingTokens.xs      // 8px
spacingTokens.md      // 16px
spacingTokens.xl      // 24px

// Semantic spacing
semanticSpacing.screen.paddingHorizontal  // 16px
semanticSpacing.component.paddingMd       // 16px
semanticSpacing.gap.md                    // 16px
```

**Scales:**
- `micro` (4px) → `xs` (8px) → `sm` (12px) → `md` (16px) → `lg` (20px) → `xl` (24px) → `2xl` (32px) → `3xl` (40px) → `4xl` (48px) → `5xl` (64px)

**Semantic Categories:**
- `component` - Component internal spacing
- `gap` - Gap between elements
- `screen` - Screen and container spacing
- `typography` - Typography spacing
- `interactive` - Interactive element spacing
- `container` - Card and container spacing

### Typography Tokens

Consistent typography scale with platform-specific font handling:

```tsx
import { typographyPresets, getTypographyPreset } from "@/design-system/tokens"

// Typography presets
<Text style={typographyPresets.headingLarge}>Heading</Text>
<Text style={typographyPresets.bodyMedium}>Body text</Text>

// Korean text optimization
<Text style={getTypographyPreset("bodyMedium", true)}>한글 텍스트</Text>
```

**Preset Categories:**
- `display` - Hero sections (32-48px)
- `heading` - Section headers (18-28px)
- `body` - Content text (13-18px)
- `label` - UI labels and captions (10-12px)
- `code` - Code snippets

### Shadow Tokens

Platform-specific elevation system:

```tsx
import { shadowTokens, semanticShadows } from "@/design-system/tokens"

// Basic shadows
<View style={shadowTokens.md} />

// Semantic shadows
<View style={semanticShadows.card.default} />
<View style={semanticShadows.button.floating} />
```

**Elevation Levels:**
- `none` - Flat surface
- `sm` - Cards, tiles (1dp)
- `md` - Buttons, small cards (2dp)
- `lg` - Dropdowns, popovers (4dp)
- `xl` - Modals, dialogs (8dp)
- `2xl` - Tooltips, notifications (16dp)

## 🧩 Component Library

Centralized component registry organized by category:

```tsx
import { Button, Text, TextField, Card } from "@/design-system/components"
```

### Component Categories

**Core Components:**
- `Button` - Interactive button
- `Text` - Styled text
- `Icon` - Icon component

**Layout Components:**
- `Screen` - Full screen container
- `Card` - Card container
- `Header` - Page header
- `ScreenContainer`, `ScreenHeader`, `ContentSection`

**Form Components:**
- `TextField` - Text input
- `FormTextField` - Form-integrated input
- `Toggle`, `Checkbox`, `Radio`, `Switch`
- `Dropdown` - Selection dropdown
- `SearchBar` - Search input

**Feedback Components:**
- `AlertModal` - Alert dialog
- `NotificationBadge`, `StatusBadge` - Badges
- `LoadingSpinner`, `LoadingOverlay` - Loading states
- `EmptyState`, `ErrorState` - Placeholder states
- `NotificationBanner` - Toast notifications

**Navigation Components:**
- `BackButton`, `HeaderBackButton`
- `TabBarIcon`
- `ScreenHeader`

**Media Components:**
- `AutoImage` - Responsive image
- `OptimizedImage` - Performance-optimized image

**Overlay Components:**
- `BaseModal` - Base modal
- `ProfileCompletionModal` - Profile modal

**List Components:**
- `ListItem` - Generic list item
- `ListView` - Optimized list view
- `PostCard`, `OptimizedPostCard` - Post cards

**Utility Components:**
- `ErrorBoundary` - Error boundary
- `KeyboardAwareView` - Keyboard handling
- `PermissionGate`, `PermissionMessage` - Permissions
- `DebugInfo`, `DevFloatingButton` - Dev tools

## 🎯 Usage Guide

### Basic Usage

```tsx
import { useAppTheme } from "@/theme/context"
import {
  colorTokens,
  spacingTokens,
  typographyPresets,
  shadowTokens
} from "@/design-system/tokens"
import { Button, Text, Card } from "@/design-system/components"

function MyComponent() {
  const { theme } = useAppTheme()

  return (
    <Card style={[
      {
        backgroundColor: theme.colors[colorTokens.surface.elevated],
        padding: spacingTokens.md,
        borderRadius: radiusTokens.md,
      },
      shadowTokens.md,
    ]}>
      <Text style={typographyPresets.headingMedium}>
        Design System Example
      </Text>
      <Button preset="default">Click Me</Button>
    </Card>
  )
}
```

### Theme Integration

All design tokens automatically work with the theme system:

```tsx
const { theme } = useAppTheme()

// Colors resolve from theme
theme.colors[colorTokens.surface.primary]  // → theme.colors.background

// Spacing is theme-agnostic
spacingTokens.md  // → 16 (same across all themes)

// Typography adapts to platform
typographyPresets.bodyMedium  // → Platform-specific fonts
```

### Korean Typography

Design system includes optimized Korean typography:

```tsx
import { getTypographyPreset } from "@/design-system/tokens"

// Automatically adjusts line height and letter spacing
<Text style={getTypographyPreset("bodyMedium", true)}>
  한글 텍스트는 자동으로 최적화됩니다
</Text>
```

### Responsive Design

Use semantic spacing for responsive layouts:

```tsx
import { semanticSpacing } from "@/design-system/tokens"

<View style={{
  paddingHorizontal: semanticSpacing.screen.paddingHorizontal,
  gap: semanticSpacing.gap.md,
}}>
  {/* Content adapts to screen size */}
</View>
```

## 🏗️ Architecture

### Token Hierarchy

1. **Base Tokens** (Primitives)
   - Raw values: colors, font sizes, spacing units
   - Example: `baseColors.neutral100`, `BASE_UNIT = 4`

2. **Semantic Tokens** (Purpose)
   - Purpose-based naming: surface.primary, content.primary
   - Example: `colorTokens.surface.primary` → "background"

3. **Component Tokens** (Specific)
   - Component-specific variants: button.primary, input.focus
   - Example: `semanticShadows.button.default`

### Design Principles

1. **Semantic Naming** - Use purpose-based names, not literal values
2. **Theme Agnostic** - Tokens work across all themes
3. **Type Safe** - Full TypeScript support
4. **Accessible** - WCAG 2.1 AA compliance
5. **Consistent** - Based on mathematical scales
6. **Platform Aware** - Adapts to iOS/Android differences

### Accessibility

All design tokens prioritize accessibility:

- **Colors**: WCAG 2.1 AA contrast ratios (4.5:1 minimum)
- **Typography**: Platform-specific font handling, Korean optimization
- **Spacing**: Touch target minimums (44pt on iOS, 48dp on Android)
- **Shadows**: Sufficient elevation for focus indicators

## 🚀 Migration Guide

### From Legacy Theme

Replace hardcoded values with design tokens:

```tsx
// Before
<View style={{ backgroundColor: "#FFFFFF", padding: 16 }} />

// After
import { colorTokens, spacingTokens } from "@/design-system/tokens"
const { theme } = useAppTheme()

<View style={{
  backgroundColor: theme.colors[colorTokens.surface.primary],
  padding: spacingTokens.md,
}} />
```

### Component Migration

Update components to use design system:

```tsx
// Before
<Text style={{ fontSize: 16, color: "#000" }}>Text</Text>

// After
import { typographyPresets } from "@/design-system/tokens"
<Text style={typographyPresets.bodyLarge}>Text</Text>
```

## 📚 Best Practices

### DO ✅

- Use semantic tokens (`colorTokens.surface.primary`)
- Import from design system (`@/design-system/tokens`)
- Leverage TypeScript types for type safety
- Follow 8px grid system for spacing
- Use typography presets for text styles
- Apply semantic shadows for elevation

### DON'T ❌

- Hardcode hex colors directly
- Use arbitrary spacing values
- Skip semantic token layer
- Ignore accessibility guidelines
- Mix design token systems
- Override token values in components

## 🔧 Customization

### Extending Tokens

Add project-specific tokens while maintaining consistency:

```tsx
// Custom color tokens
export const customColorTokens = {
  ...colorTokens,
  brand: {
    primary: "brandPrimary",
    secondary: "brandSecondary",
  },
}

// Custom spacing tokens
export const customSpacingTokens = {
  ...spacingTokens,
  custom: 28,  // Custom spacing value
}
```

### Theme-Specific Overrides

Override tokens in theme files:

```tsx
// In theme file
export const customTheme = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,
    [colorTokens.surface.primary]: "#F5F5F5",  // Override
  },
}
```

## 📖 Documentation

- [Color Tokens Documentation](./tokens/colors.ts)
- [Spacing Tokens Documentation](./tokens/spacing.ts)
- [Typography Tokens Documentation](./tokens/typography.ts)
- [Shadow Tokens Documentation](./tokens/shadows.ts)
- [Component Library Documentation](./components/index.ts)

## 🤝 Contributing

When adding new components or tokens:

1. Follow existing naming conventions
2. Add TypeScript types
3. Include JSDoc comments
4. Update this README
5. Add usage examples
6. Maintain accessibility standards

## 📝 Version History

- **v1.0.0** - Initial design system foundation
  - Color tokens
  - Spacing tokens
  - Typography tokens
  - Shadow tokens
  - Component library registry
  - Documentation

---

**Last Updated**: 2025-10-27
**Maintainer**: Frontend Architecture Team
