/**
 * Design System - Spacing Tokens
 *
 * Consistent spacing scale based on 4px base unit.
 * Provides semantic spacing tokens for layout consistency.
 *
 * Base unit: 4px
 * Scale: xs (4) → sm (8) → md (12) → lg (16) → xl (20) → 2xl (24) → 3xl (32) → 4xl (48) → 5xl (64)
 *
 * Usage:
 * - Use semantic tokens for consistent spacing
 * - Prefer named tokens over raw numbers
 * - Maintains 8px grid system for visual rhythm
 */

/**
 * Base spacing unit (4px)
 */
const BASE_UNIT = 4

/**
 * Core spacing scale
 * All values are multiples of BASE_UNIT (4px)
 */
export const spacingTokens = {
  // Micro spacing - for tight layouts and fine adjustments
  micro: BASE_UNIT * 1,        // 4px

  // Extra small - minimal spacing
  xs: BASE_UNIT * 2,           // 8px

  // Small - compact spacing
  sm: BASE_UNIT * 3,           // 12px

  // Medium - default spacing
  md: BASE_UNIT * 4,           // 16px

  // Large - comfortable spacing
  lg: BASE_UNIT * 5,           // 20px

  // Extra large - generous spacing
  xl: BASE_UNIT * 6,           // 24px

  // 2X large - section spacing
  "2xl": BASE_UNIT * 8,        // 32px

  // 3X large - major section spacing
  "3xl": BASE_UNIT * 10,       // 40px

  // 4X large - page section spacing
  "4xl": BASE_UNIT * 12,       // 48px

  // 5X large - major page spacing
  "5xl": BASE_UNIT * 16,       // 64px

  // Zero - for reset purposes
  none: 0,
} as const

/**
 * Semantic spacing tokens - use these for specific purposes
 */
export const semanticSpacing = {
  // Component internal spacing
  component: {
    paddingXs: spacingTokens.xs,      // 8px - tight component padding
    paddingSm: spacingTokens.sm,      // 12px - small component padding
    paddingMd: spacingTokens.md,      // 16px - default component padding
    paddingLg: spacingTokens.lg,      // 20px - large component padding
    paddingXl: spacingTokens.xl,      // 24px - extra large component padding
  },

  // Gap between elements
  gap: {
    xs: spacingTokens.xs,             // 8px - tight gap
    sm: spacingTokens.sm,             // 12px - small gap
    md: spacingTokens.md,             // 16px - default gap
    lg: spacingTokens.lg,             // 20px - large gap
    xl: spacingTokens.xl,             // 24px - extra large gap
  },

  // Screen and container spacing
  screen: {
    paddingHorizontal: spacingTokens.md,  // 16px - screen side padding
    paddingVertical: spacingTokens.lg,    // 20px - screen top/bottom padding
    sectionGap: spacingTokens["2xl"],     // 32px - gap between sections
    headerHeight: spacingTokens["4xl"],   // 48px - header height
  },

  // Typography spacing
  typography: {
    paragraphGap: spacingTokens.md,       // 16px - gap between paragraphs
    headingGap: spacingTokens.lg,         // 20px - gap after headings
    lineGap: spacingTokens.xs,            // 8px - gap between lines
  },

  // Interactive element spacing
  interactive: {
    buttonPaddingVertical: spacingTokens.sm,     // 12px
    buttonPaddingHorizontal: spacingTokens.lg,   // 20px
    inputPaddingVertical: spacingTokens.sm,      // 12px
    inputPaddingHorizontal: spacingTokens.md,    // 16px
    iconMargin: spacingTokens.xs,                // 8px
  },

  // Card and container spacing
  container: {
    paddingXs: spacingTokens.sm,          // 12px - tight container
    paddingSm: spacingTokens.md,          // 16px - small container
    paddingMd: spacingTokens.lg,          // 20px - default container
    paddingLg: spacingTokens.xl,          // 24px - large container
    paddingXl: spacingTokens["2xl"],      // 32px - extra large container
    gap: spacingTokens.md,                // 16px - gap between container items
  },
} as const

/**
 * Layout grid system
 * For creating consistent grid-based layouts
 */
export const gridTokens = {
  // Column gaps
  columnGap: {
    sm: spacingTokens.xs,                 // 8px
    md: spacingTokens.md,                 // 16px
    lg: spacingTokens.lg,                 // 20px
  },

  // Row gaps
  rowGap: {
    sm: spacingTokens.xs,                 // 8px
    md: spacingTokens.md,                 // 16px
    lg: spacingTokens.lg,                 // 20px
  },

  // Grid gutters
  gutter: {
    sm: spacingTokens.sm,                 // 12px
    md: spacingTokens.md,                 // 16px
    lg: spacingTokens.lg,                 // 20px
  },
} as const

/**
 * Border radius tokens
 * Consistent rounding for UI elements
 */
export const radiusTokens = {
  none: 0,
  xs: 2,                                  // 2px - subtle rounding
  sm: 4,                                  // 4px - small rounding
  md: 8,                                  // 8px - default rounding
  lg: 12,                                 // 12px - large rounding
  xl: 16,                                 // 16px - extra large rounding
  "2xl": 20,                              // 20px - very large rounding
  "3xl": 24,                              // 24px - maximum rounding
  full: 9999,                             // Full circle/pill shape
} as const

/**
 * TypeScript types for spacing tokens
 */
export type SpacingToken = keyof typeof spacingTokens
export type SemanticSpacingCategory = keyof typeof semanticSpacing
export type RadiusToken = keyof typeof radiusTokens

/**
 * Spacing token documentation
 *
 * USAGE EXAMPLES:
 *
 * 1. Basic spacing:
 * ```tsx
 * <View style={{ padding: spacingTokens.md }} />
 * ```
 *
 * 2. Semantic spacing:
 * ```tsx
 * <View style={{
 *   paddingHorizontal: semanticSpacing.screen.paddingHorizontal,
 *   paddingVertical: semanticSpacing.screen.paddingVertical,
 * }} />
 * ```
 *
 * 3. Border radius:
 * ```tsx
 * <View style={{ borderRadius: radiusTokens.md }} />
 * ```
 *
 * 4. Grid layout:
 * ```tsx
 * <View style={{
 *   gap: gridTokens.columnGap.md,
 *   padding: gridTokens.gutter.md,
 * }} />
 * ```
 */
