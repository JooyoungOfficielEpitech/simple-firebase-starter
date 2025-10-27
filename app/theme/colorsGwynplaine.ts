import { baseColors, createOverlays, createThemeColors } from "./colorsBase"

const gwynplaineSpecific = {
  // Gwynplaine Wine (primary) - Deep wine red tones
  primary100: "#FDF2F8", // Ultra light wine
  primary200: "#FCE7F3", // Soft wine
  primary300: "#F687B3", // Light wine
  primary400: "#ED64A6", // Vibrant wine
  primary500: "#722F37", // Strong wine red (WCAG AA compliant)
  primary600: "#4A1E22", // Deep wine

  // Brown (secondary) - Rich earthy brown
  secondary100: "#FEFDFB",
  secondary200: "#F7F3E9", 
  secondary300: "#D4B887",
  secondary400: "#A0522D",
  secondary500: "#8B4513", // Rich brown

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
  background: palette.primary100, // Ultra light wine background
  /**
   * The default border color.
   */
  border: palette.neutral400,
  /**
   * The main tinting color - Deep wine red.
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