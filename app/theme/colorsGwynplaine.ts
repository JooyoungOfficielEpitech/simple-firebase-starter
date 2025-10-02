import { baseColors, createOverlays, createThemeColors } from "./colorsBase"

const gwynplaineSpecific = {
  // Gwynplaine Purple (primary) - Deep mystical purple tones
  primary100: "#FAF5FF", // Ultra light lavender
  primary200: "#E9D5FF", // Soft lavender
  primary300: "#C084FC", // Bright purple
  primary400: "#A855F7", // Vibrant purple
  primary500: "#7C3AED", // Strong purple (WCAG AA compliant)
  primary600: "#5B21B6", // Deep purple

  // Gold (secondary) - Luxurious accent
  secondary100: "#FFFBEB",
  secondary200: "#FEF3C7", 
  secondary300: "#FCD34D",
  secondary400: "#F59E0B",
  secondary500: "#D97706", // Warm gold

  // Silver accent colors
  accent100: baseColors.silverAccent100,
  accent200: baseColors.silverAccent200,
  accent300: baseColors.silverAccent300,
  accent400: baseColors.silverAccent400,
  accent500: baseColors.silverAccent500,

  // Wine/burgundy-tinted overlays
  ...createOverlays(173, 20, 87),
}

const palette = createThemeColors(gwynplaineSpecific)

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
  background: palette.primary100, // Ultra light lavender background
  /**
   * The default border color.
   */
  border: palette.neutral400,
  /**
   * The main tinting color - Mystical purple.
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