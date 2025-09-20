import { baseColors, createOverlays, createThemeColors } from "./colorsBase"

const glindaSpecific = {
  // Glinda Pink (primary) - Hot pink/Magenta tones
  primary100: "#FFF0F5",
  primary200: "#FFCCE0",
  primary300: "#FF99CC",
  primary400: "#FF66B8", 
  primary500: "#FF1493", // Hot pink - main color
  primary600: "#DC143C", // Deeper pink

  // Green (secondary) - Supporting tones
  secondary100: "#E8F5E8",
  secondary200: "#C3E6C3",
  secondary300: "#9DD69D",
  secondary400: "#76C676",
  secondary500: "#4FB84F", // Supporting green

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
  background: palette.neutral200,
  /**
   * The default border color.
   */
  border: palette.neutral400,
  /**
   * The main tinting color - Glinda's pink.
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