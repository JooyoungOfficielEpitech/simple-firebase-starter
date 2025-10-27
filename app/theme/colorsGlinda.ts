import { baseColors, createOverlays, createThemeColors } from "./colorsBase"

const glindaSpecific = {
  // Glinda Pink (primary) - Elegant rose gold tones
  primary100: "#FDF2F8", // Soft blush
  primary200: "#FCE7F3", // Light rose
  primary300: "#F9A8D4", // Warm pink
  primary400: "#F472B6", // Vibrant rose
  primary500: "#EC4899", // Strong rose (WCAG AA compliant)
  primary600: "#BE185D", // Deep rose

  // Blonde (secondary) - Golden blonde hair color
  secondary100: "#FFFDF7",
  secondary200: "#FFF9E6",
  secondary300: "#F5E6A3",
  secondary400: "#E6CC5A",
  secondary500: "#D4AF37", // Golden blonde

  // Gold accent colors
  accent100: baseColors.goldAccent100,
  accent200: baseColors.goldAccent200, 
  accent300: baseColors.goldAccent300,
  accent400: baseColors.goldAccent400,
  accent500: baseColors.goldAccent500,

  // Pink-tinted overlays
  ...createOverlays(220, 20, 60),
}

const palette = createThemeColors(glindaSpecific)

export const colors = {
  /**
   * The palette is available to use, but prefer using the name.
   * This is only included for rare, one-off cases. Try to use
   * semantic names as much as possible.
   */
  palette,
  /**
   * A helper for making something see-thru.
   */
  transparent: "rgba(0, 0, 0, 0)",
  /**
   * The default text color in many components.
   */
  text: palette.neutral800,
  /**
   * Secondary text information.
   */
  textDim: palette.neutral600,
  /**
   * The default color of the screen background.
   */
  background: palette.primary100, // Soft blush background
  /**
   * The default border color.
   */
  border: palette.neutral400,
  /**
   * The main tinting color - Elegant rose.
   */
  tint: palette.primary500,
  /**
   * The inactive tinting color.
   */
  tintInactive: palette.neutral300,
  /**
   * Primary action color (main CTA buttons, active tabs).
   */
  primaryAction: palette.primary500,
  /**
   * Secondary action color (secondary buttons, highlights, icons).
   */
  secondaryAction: palette.secondary500,
  /**
   * Selected/focused item color.
   */
  selected: palette.secondary400,
  /**
   * Icon accent color.
   */
  iconAccent: palette.secondary500,
  /**
   * A subtle color used for lines.
   */
  separator: palette.neutral300,
  /**
   * Error messages.
   */
  error: palette.error500,
  /**
   * Error Background.
   */
  errorBackground: palette.error100,
} as const