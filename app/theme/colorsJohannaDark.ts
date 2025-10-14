import { baseDarkColors, createDarkOverlays, createDarkThemeColors } from "./colorsBaseDark"

const johannaDarkSpecific = {
  // Johanna Dark Sky Blue (primary) - Darker melancholy blue tones for night
  primary100: "#1A2942", // Very dark navy
  primary200: "#2C3E50", // Dark slate blue
  primary300: "#34495E", // Medium dark blue
  primary400: "#4A6741", // Darker blue-green
  primary500: "#5D6D7E", // Muted dark blue
  primary600: "#708090", // Slate gray

  // Dark Gold (secondary) - Darker tarnished gold for night scenes
  secondary100: "#2C1810",
  secondary200: "#3E2723", 
  secondary300: "#5D4037", // Dark brown-gold
  secondary400: "#6D4C41", // Medium brown-gold
  secondary500: "#8D6E63", // Dark gold for dark theme

  // Silver accent colors
  accent100: baseDarkColors.silverAccent100,
  accent200: baseDarkColors.silverAccent200,
  accent300: baseDarkColors.silverAccent300,
  accent400: baseDarkColors.silverAccent400,
  accent500: baseDarkColors.silverAccent500,

  // Blue-tinted overlays for dark melancholy atmosphere
  ...createDarkOverlays(93, 109, 126), // RGB for muted dark blue
}

const palette = createDarkThemeColors(johannaDarkSpecific)

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
  text: palette.neutral100, // Light text for dark theme
  /**
   * Secondary text information.
   */
  textDim: palette.neutral400,
  /**
   * The default color of the screen background.
   */
  background: palette.primary100, // Dark navy background
  /**
   * The default border color.
   */
  border: palette.neutral600,
  /**
   * The main tinting color - Muted dark blue.
   */
  tint: palette.primary500,
  /**
   * The inactive tinting color.
   */
  tintInactive: palette.neutral700,
  /**
   * A subtle color used for lines.
   */
  separator: palette.neutral700,
  /**
   * Error messages.
   */
  error: palette.angry500,
  /**
   * Error Background.
   */
  errorBackground: palette.angry100,
} as const