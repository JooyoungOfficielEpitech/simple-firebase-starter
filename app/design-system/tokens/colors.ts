/**
 * Design System - Color Tokens
 *
 * Semantic color tokens that map to theme-specific values.
 * These tokens provide a consistent color language across the application.
 * All colors meet WCAG 2.1 AA accessibility standards.
 *
 * Usage:
 * - Use semantic tokens (e.g., colorTokens.surface.primary) in components
 * - Theme context will automatically resolve to correct theme colors
 * - Avoid hardcoding hex values directly in components
 */

import { baseColors } from "@/theme/colorsBase"

/**
 * Semantic Color Token Structure
 *
 * Categories:
 * - surface: Background and container colors
 * - content: Text and icon colors
 * - border: Border and divider colors
 * - interactive: Button and link colors
 * - feedback: Status and alert colors
 * - overlay: Modal and dialog backgrounds
 */

export const colorTokens = {
  // Surface colors - backgrounds and containers
  surface: {
    primary: "background",           // Main background
    secondary: "backgroundSecondary", // Secondary background
    tertiary: "backgroundTertiary",   // Tertiary background
    elevated: "backgroundElevated",   // Elevated surfaces (cards, modals)
    inverse: "backgroundInverse",     // Inverse surface for contrast
  },

  // Content colors - text and icons
  content: {
    primary: "text",                  // Primary text
    secondary: "textDim",             // Secondary/dimmed text
    tertiary: "textDisabled",         // Disabled text
    inverse: "textInverse",           // Text on dark/inverse backgrounds
    link: "tint",                     // Links and interactive text
    accent: "accent",                 // Accent/highlight text
  },

  // Border colors - borders and dividers
  border: {
    default: "border",                // Default border
    subtle: "borderSubtle",           // Subtle borders
    strong: "borderStrong",           // Strong emphasis borders
    inverse: "borderInverse",         // Borders on inverse backgrounds
    focus: "tint",                    // Focus indicator borders
  },

  // Interactive colors - buttons, links, inputs
  interactive: {
    primary: "tint",                  // Primary interactive elements
    secondary: "accentSecondary",     // Secondary interactive elements
    tertiary: "accentTertiary",       // Tertiary interactive elements
    disabled: "textDisabled",         // Disabled interactive elements
    hover: "tintHover",               // Hover state
    active: "tintActive",             // Active/pressed state
  },

  // Feedback colors - status indicators
  feedback: {
    error: "error",                   // Error states
    errorBackground: "errorBackground", // Error backgrounds
    success: "success",               // Success states
    successBackground: "successBackground", // Success backgrounds
    warning: "warning",               // Warning states
    warningBackground: "warningBackground", // Warning backgrounds
    info: "info",                     // Info states
    infoBackground: "infoBackground", // Info backgrounds
  },

  // Overlay colors - modals, dialogs, tooltips
  overlay: {
    light: "overlay20",               // Light overlay (25% opacity)
    medium: "overlay50",              // Medium overlay (55% opacity)
    dark: "overlayDark",              // Dark overlay for modals
  },

  // Special accent colors
  accent: {
    gold: baseColors.goldAccent300,   // Gold accent
    goldLight: baseColors.goldAccent100, // Light gold
    goldDark: baseColors.goldAccent500,  // Dark gold
    silver: baseColors.silverAccent300,  // Silver accent
    silverLight: baseColors.silverAccent100, // Light silver
    silverDark: baseColors.silverAccent500,  // Dark silver
  },
} as const

/**
 * Color token type for TypeScript
 */
export type ColorToken = typeof colorTokens
export type SurfaceToken = keyof typeof colorTokens.surface
export type ContentToken = keyof typeof colorTokens.content
export type BorderToken = keyof typeof colorTokens.border
export type InteractiveToken = keyof typeof colorTokens.interactive
export type FeedbackToken = keyof typeof colorTokens.feedback
export type OverlayToken = keyof typeof colorTokens.overlay
export type AccentToken = keyof typeof colorTokens.accent

/**
 * Helper function to get color token value
 *
 * @param theme - Current theme object
 * @param token - Color token path (e.g., "surface.primary")
 * @returns Resolved color value from theme
 */
export const getColorToken = (theme: any, token: string): string => {
  const [category, variant] = token.split(".")

  if (category in colorTokens && variant) {
    const tokenValue = colorTokens[category as keyof typeof colorTokens][variant]
    return theme.colors[tokenValue as keyof typeof theme.colors] || tokenValue
  }

  return token
}

/**
 * Color token documentation
 *
 * USAGE EXAMPLES:
 *
 * 1. In components with theme:
 * ```tsx
 * const { theme } = useAppTheme()
 * <View style={{ backgroundColor: theme.colors[colorTokens.surface.primary] }} />
 * ```
 *
 * 2. With styled components:
 * ```tsx
 * const Container = styled.View`
 *   background-color: ${({ theme }) => theme.colors[colorTokens.surface.primary]};
 * `
 * ```
 *
 * 3. Direct token usage:
 * ```tsx
 * <Button color={colorTokens.interactive.primary} />
 * ```
 */
