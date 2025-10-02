import { baseColors, createOverlays, createThemeColors } from "./colorsBase"

const glindaSpecific = {
  // Glinda Pink (primary) - Elegant rose gold tones
  primary100: "#FDF2F8", // Soft blush
  primary200: "#FCE7F3", // Light rose
  primary300: "#F9A8D4", // Warm pink
  primary400: "#F472B6", // Vibrant rose
  primary500: "#EC4899", // Strong rose (WCAG AA compliant)
  primary600: "#BE185D", // Deep rose

  // Sage (secondary) - Sophisticated green accent
  secondary100: "#F7FAF7",
  secondary200: "#E8F5E8",
  secondary300: "#A7C7AC", 
  secondary400: "#7BA082",
  secondary500: "#52796F", // Sage green

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
   * A subtle color used for lines.
   */
  separator: palette.neutral300,
  /**
   * Error messages.
   */
  error: palette.angry500,
  /**
   * Error Background.
   */
  errorBackground: palette.angry100,
} as const