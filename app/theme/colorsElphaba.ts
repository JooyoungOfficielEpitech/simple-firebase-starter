import { baseColors, createOverlays, createThemeColors } from "./colorsBase"

const elphabaSpecific = {
  // Elphaba Green (primary) - Emerald/Forest tones
  primary100: "#E8F5E8",
  primary200: "#C3E6C3", 
  primary300: "#9DD69D",
  primary400: "#76C676",
  primary500: "#4FB84F", // Main green
  primary600: "#228B22", // Forest green

  // Pink (secondary) - Supporting tones
  secondary100: "#FFF0F5",
  secondary200: "#FFCCE0",
  secondary300: "#FF99CC", 
  secondary400: "#FF66B8",
  secondary500: "#FF1493", // Supporting pink

  // Gold accent colors
  accent100: baseColors.goldAccent100,
  accent200: baseColors.goldAccent200,
  accent300: baseColors.goldAccent300,
  accent400: baseColors.goldAccent400,
  accent500: baseColors.goldAccent500,

  // Green-tinted overlays
  ...createOverlays(34, 139, 34),
}

const palette = createThemeColors(elphabaSpecific)

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
   * The main tinting color - Elphaba's green.
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