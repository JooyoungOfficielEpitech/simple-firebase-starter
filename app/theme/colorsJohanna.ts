import { baseColors, createOverlays, createThemeColors } from "./colorsBase"

const johannaSpecific = {
  // Johanna Dark Sky Blue (primary) - Melancholy blue tones for the caged bird
  primary100: "#F0F8FF", // Alice blue - very light sky
  primary200: "#D6EAF8", // Light sky blue
  primary300: "#85C1E9", // Medium sky blue
  primary400: "#5DADE2", // Bright sky blue
  primary500: "#3F7CAC", // Dark sky blue (WCAG AA compliant) - main theme color
  primary600: "#2E5984", // Deep navy blue

  // Dark Gold (secondary) - Tarnished gold for broken dreams
  secondary100: "#FDF6E3",
  secondary200: "#F7E9B9", 
  secondary300: "#D4AF37", // Classic gold
  secondary400: "#B8860B", // Dark goldenrod
  secondary500: "#8B6914", // Dark gold - secondary theme color

  // Silver accent colors for cage motifs
  accent100: baseColors.silverAccent100,
  accent200: baseColors.silverAccent200,
  accent300: baseColors.silverAccent300,
  accent400: baseColors.silverAccent400,
  accent500: baseColors.silverAccent500,

  // Blue-tinted overlays for melancholy atmosphere
  ...createOverlays(63, 124, 172), // RGB for dark sky blue
}

const palette = createThemeColors(johannaSpecific)

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
  background: palette.primary100, // Light sky blue background
  /**
   * The default border color.
   */
  border: palette.neutral400,
  /**
   * The main tinting color - Dark sky blue.
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