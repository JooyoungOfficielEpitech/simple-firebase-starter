/**
 * Color Tokens - Colored Sheep Community Design System
 *
 * All color values from REACT_NATIVE_DESIGN_SPEC.json
 * Light mode colors are active, dark mode is planned for future release.
 */

/**
 * Palette - Base color tokens for light theme
 * These map to semantic colors and provide compatibility with existing components
 */
const palette = {
  neutral100: "#FFFFFF",
  neutral200: "#F9FAFB",
  neutral300: "#E5E7EB",
  neutral400: "#D1D5DB",
  neutral500: "#9CA3AF",
  neutral600: "#6B7280",
  neutral700: "#4B5563",
  neutral800: "#111111",
  neutral900: "#000000",

  primary100: "#FFF4E6",
  primary200: "#FFE4B3",
  primary300: "#FFD480",
  primary400: "#F29A2E",
  primary500: "#D77E1E",
  primary600: "#C06818",

  accent100: "#FFF8F0",
  accent200: "#FFCBC0",

  angry100: "#FEE2E2",
  angry500: "#EF4444",

  overlay20: "rgba(0, 0, 0, 0.2)",
  overlay50: "rgba(0, 0, 0, 0.5)",
} as const

export const colors = {
  /**
   * Base palette for semantic color mapping
   */
  palette,

  /**
   * Gradient colors for background elements
   * Usage: Background gradients, hero sections
   */
  gradient: {
    from: '#F5B740',
    to: '#F2A93F',
    angle: 180,
  },

  /**
   * Primary brand colors with interaction states
   * Usage: Buttons, links, primary actions
   */
  primary: {
    default: '#F29A2E',
    hover: '#F4A33F',
    active: '#D77E1E',
    pressed: '#D77E1E',
    disabled: 'rgba(242, 154, 46, 0.35)',
  },

  /**
   * Text colors with hierarchy levels
   * Usage: All text content across the app
   */
  text: {
    primary: '#111111',
    secondary: '#222222',
    muted: '#666666',
    disabled: '#999999',
  },

  /**
   * Sheep character colors
   * Usage: SheepCharacter component variants
   */
  sheep: {
    whiteBody: '#FFF8F0',
    blackBody: '#2F2F32',
    horns: '#C49159',
    blush: '#FFCBC0',
    border: '#111111',
  },

  /**
   * UI element colors
   * Usage: Backgrounds, borders, status indicators
   */
  ui: {
    white: '#FFFFFF',
    border: '#E5E7EB',
    background: '#F9FAFB',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
  },

  /**
   * Legacy theme compatibility
   * These provide compatibility with components expecting the old theme structure
   */
  transparent: 'rgba(0, 0, 0, 0)',
  background: palette.neutral200,
  border: palette.neutral300,
  tint: palette.primary400,
  tintInactive: palette.neutral400,
  error: palette.angry500,
  errorBackground: palette.angry100,
} as const

/**
 * Dark mode colors (planned for future release)
 * Status: Not yet implemented
 */
export const darkColors = {
  // TODO: Implement dark mode color tokens
  // Reference: REACT_NATIVE_DESIGN_SPEC.json > designSystem.colors.dark
} as const

export type Colors = typeof colors
export type ColorKey = keyof Colors
