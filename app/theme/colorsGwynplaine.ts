import { baseColors, createOverlays, createThemeColors } from "./colorsBase"

const gwynplaineSpecific = {
  // Gwynplaine Wine/Burgundy (primary) - Deep wine/burgundy tones
  primary100: "#FCE4EC",
  primary200: "#F8BBD9",
  primary300: "#F48FB1",
  primary400: "#F06292",
  primary500: "#AD1457", // Deep wine/burgundy - main color
  primary600: "#880E4F", // Dark burgundy

  // Brown/Tan (secondary) - Supporting brown/tan tones
  secondary100: "#EFEBE9",
  secondary200: "#D7CCC8", 
  secondary300: "#BCAAA4",
  secondary400: "#A1887F",
  secondary500: "#8D6E63", // Medium brown

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
  background: palette.neutral200,
  /**
   * The default border color.
   */
  border: palette.neutral400,
  /**
   * The main tinting color - Gwynplaine's purple.
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