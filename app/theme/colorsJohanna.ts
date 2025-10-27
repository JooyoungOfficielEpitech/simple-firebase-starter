import { baseColors, createOverlays, createThemeColors } from "./colorsBase"

const johannaSpecific = {
  // Johanna Darker Sky Blue (primary) - Deep melancholy blue tones for the caged bird
  primary100: "#E8F0F8", // Very light steel blue
  primary200: "#C7D9E8", // Light steel blue
  primary300: "#6B8CAE", // Medium steel blue
  primary400: "#4A6B8A", // Dark steel blue
  primary500: "#2C4B6B", // Very dark sky blue (WCAG AA compliant) - main theme color
  primary600: "#1E3649", // Deep midnight blue

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
  ...createOverlays(44, 75, 107), // RGB for darker sky blue
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
  background: palette.primary100, // Very light steel blue background
  /**
   * The default border color.
   */
  border: palette.neutral400,
  /**
   * The main tinting color - Very dark sky blue.
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