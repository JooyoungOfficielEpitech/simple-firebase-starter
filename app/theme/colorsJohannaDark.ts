import { baseDarkColors, createDarkOverlays, createDarkThemeColors } from "./colorsBaseDark"

const johannaDarkSpecific = {
  // Johanna Darker Sky Blue (primary) - Deep melancholy blue tones for night
  primary100: "#1E3649", // Deep midnight blue
  primary200: "#2C4B6B", // Very dark sky blue
  primary300: "#4A6B8A", // Dark steel blue
  primary400: "#6B8CAE", // Medium steel blue
  primary500: "#8DA9C4", // Light steel blue for dark theme
  primary600: "#B8CCE0", // Very light steel blue

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
  ...createDarkOverlays(44, 75, 107), // RGB for darker sky blue
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
  background: palette.primary100, // Deep midnight blue background
  /**
   * The default border color.
   */
  border: palette.neutral600,
  /**
   * The main tinting color - Light steel blue.
   */
  tint: palette.primary500,
  /**
   * The inactive tinting color.
   */
  tintInactive: palette.neutral700,
  /**
   * Primary action color.
   */
  primaryAction: palette.primary300,
  /**
   * Secondary action color.
   */
  secondaryAction: palette.secondary400,
  /**
   * Selected/focused item color.
   */
  selected: palette.secondary300,
  /**
   * Icon accent color.
   */
  iconAccent: palette.secondary400,
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