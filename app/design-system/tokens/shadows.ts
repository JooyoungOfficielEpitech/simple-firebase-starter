/**
 * Design System - Shadow Tokens
 *
 * Consistent elevation system using shadows.
 * Platform-specific shadow handling (iOS vs Android).
 *
 * Elevation levels:
 * - Level 0: No shadow (flat surface)
 * - Level 1: 1dp - Slightly elevated (cards)
 * - Level 2: 2dp - Low elevation (buttons)
 * - Level 3: 4dp - Medium elevation (dropdowns)
 * - Level 4: 8dp - High elevation (modals)
 * - Level 5: 16dp - Very high elevation (tooltips)
 */

import { Platform, ViewStyle } from "react-native"

/**
 * Shadow configuration interface
 */
interface ShadowConfig {
  ios: {
    shadowColor: string
    shadowOffset: { width: number; height: number }
    shadowOpacity: number
    shadowRadius: number
  }
  android: {
    elevation: number
  }
}

/**
 * Generate platform-specific shadow styles
 */
const createShadow = (
  offsetY: number,
  opacity: number,
  radius: number,
  elevation: number,
  color: string = "#000000",
): ViewStyle => {
  if (Platform.OS === "ios") {
    return {
      shadowColor: color,
      shadowOffset: {
        width: 0,
        height: offsetY,
      },
      shadowOpacity: opacity,
      shadowRadius: radius,
    }
  }

  return {
    elevation,
  }
}

/**
 * Shadow elevation tokens
 * Each level represents increasing visual depth
 */
export const shadowTokens = {
  // No shadow - flat surface
  none: createShadow(0, 0, 0, 0),

  // Level 1 - Slightly elevated (cards, tiles)
  sm: createShadow(1, 0.08, 2, 1),

  // Level 2 - Low elevation (buttons, small cards)
  md: createShadow(2, 0.12, 4, 2),

  // Level 3 - Medium elevation (dropdowns, popovers)
  lg: createShadow(4, 0.16, 8, 4),

  // Level 4 - High elevation (modals, dialogs)
  xl: createShadow(8, 0.20, 16, 8),

  // Level 5 - Very high elevation (tooltips, notifications)
  "2xl": createShadow(16, 0.24, 24, 16),
} as const

/**
 * Semantic shadow tokens
 * Pre-configured shadows for specific UI elements
 */
export const semanticShadows = {
  // Card shadows
  card: {
    default: shadowTokens.sm,         // Default card shadow
    hover: shadowTokens.md,           // Card hover state
    active: shadowTokens.none,        // Card pressed state
  },

  // Button shadows
  button: {
    default: shadowTokens.sm,         // Default button shadow
    hover: shadowTokens.md,           // Button hover state
    active: shadowTokens.none,        // Button pressed state
    floating: shadowTokens.lg,        // Floating action button
  },

  // Input shadows
  input: {
    default: shadowTokens.none,       // Default input (no shadow)
    focus: shadowTokens.sm,           // Focused input
    error: shadowTokens.sm,           // Error input
  },

  // Modal shadows
  modal: {
    default: shadowTokens.xl,         // Modal overlay shadow
    sheet: shadowTokens["2xl"],       // Bottom sheet shadow
  },

  // Dropdown shadows
  dropdown: {
    default: shadowTokens.lg,         // Dropdown menu shadow
    nested: shadowTokens.xl,          // Nested dropdown shadow
  },

  // Tooltip shadow
  tooltip: shadowTokens["2xl"],       // Tooltip shadow

  // Navigation shadows
  navigation: {
    header: shadowTokens.sm,          // Header shadow
    tabBar: shadowTokens.md,          // Tab bar shadow
    drawer: shadowTokens.xl,          // Drawer shadow
  },
} as const

/**
 * Custom colored shadows
 * For special cases requiring colored shadows (iOS only)
 */
export const coloredShadows = {
  // Primary color shadow
  primary: (color: string) => createShadow(4, 0.2, 8, 4, color),

  // Accent color shadow
  accent: (color: string) => createShadow(2, 0.15, 4, 2, color),

  // Error color shadow
  error: (color: string) => createShadow(2, 0.2, 4, 2, color),

  // Success color shadow
  success: (color: string) => createShadow(2, 0.2, 4, 2, color),
} as const

/**
 * Inner shadow effect
 * Simulated using border and background (works on both platforms)
 */
export const innerShadow = {
  sm: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
    borderLeftColor: "rgba(0, 0, 0, 0.05)",
  },
  md: {
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: "rgba(0, 0, 0, 0.08)",
    borderLeftColor: "rgba(0, 0, 0, 0.08)",
  },
} as const

/**
 * TypeScript types for shadow tokens
 */
export type ShadowToken = keyof typeof shadowTokens
export type SemanticShadowCategory = keyof typeof semanticShadows

/**
 * Shadow token documentation
 *
 * USAGE EXAMPLES:
 *
 * 1. Basic shadow:
 * ```tsx
 * <View style={[styles.card, shadowTokens.md]} />
 * ```
 *
 * 2. Semantic shadow:
 * ```tsx
 * <View style={[styles.button, semanticShadows.button.default]} />
 * ```
 *
 * 3. Colored shadow (iOS only):
 * ```tsx
 * <View style={[styles.card, coloredShadows.primary(theme.colors.tint)]} />
 * ```
 *
 * 4. Inner shadow:
 * ```tsx
 * <View style={[styles.input, innerShadow.sm]} />
 * ```
 *
 * PLATFORM NOTES:
 * - iOS: Uses shadowColor, shadowOffset, shadowOpacity, shadowRadius
 * - Android: Uses elevation (simpler, but less control)
 * - Colored shadows only work on iOS
 * - Inner shadows are simulated using borders (both platforms)
 */
