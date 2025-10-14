import { baseColors, createOverlays, createThemeColors } from "./colorsBase"

const elphabaSpecific = {
  // Elphaba Green (primary) - Modern nature-inspired emerald tones
  primary100: "#F0F9F0", // Ultra light mint
  primary200: "#D4EDDA", // Soft mint green
  primary300: "#A3D9A5", // Fresh green
  primary400: "#6CBF6C", // Vibrant emerald
  primary500: "#28A745", // Strong emerald (WCAG AA compliant)
  primary600: "#1E7E34", // Deep forest green

  // Black (secondary) - Dark elegant accent
  secondary100: "#F7F7F7",
  secondary200: "#E1E1E1",
  secondary300: "#CFCFCF", 
  secondary400: "#6B6B6B",
  secondary500: "#2D2D2D", // Elegant black

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
  background: palette.primary100, // Ultra light mint background
  /**
   * The default border color.
   */
  border: palette.neutral400,
  /**
   * The main tinting color - Modern emerald green.
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
  error: palette.angry500,
  /**
   * Error Background.
   */
  errorBackground: palette.angry100,
} as const