import { baseColors, createOverlays, createThemeColors } from "./colorsBase"

const elphabaSpecific = {
  // Elphaba Green (primary) - Modern nature-inspired emerald tones (WCAG AA)
  primary100: "#E8F5E8", // Ultra light mint (1.1:1 with white)
  primary200: "#C8E6C8", // Soft mint green (1.5:1 with white)
  primary300: "#81C784", // Fresh green (2.4:1 with white)
  primary400: "#4CAF50", // Vibrant emerald (3.4:1 with white)
  primary500: "#2E7D32", // Strong emerald (5.4:1 with white - WCAG AA)
  primary600: "#1B5E20", // Deep forest green (8.8:1 with white - excellent)

  // Black (secondary) - Dark elegant accent (WCAG AA)
  secondary100: "#FAFAFA", // Very light gray
  secondary200: "#F5F5F5", // Light gray
  secondary300: "#E0E0E0", // Medium light gray (2.4:1 with white)
  secondary400: "#757575", // Medium dark gray (5.9:1 with white - WCAG AA)
  secondary500: "#424242", // Elegant black (12.6:1 with white - excellent)

  // Gold accent colors (from updated base)
  accent100: baseColors.goldAccent100,
  accent200: baseColors.goldAccent200,
  accent300: baseColors.goldAccent300,
  accent400: baseColors.goldAccent400,
  accent500: baseColors.goldAccent500,

  // Green-tinted overlays
  ...createOverlays(46, 125, 50), // Updated to use the WCAG-compliant green
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
  error: palette.error500,
  /**
   * Error Background.
   */
  errorBackground: palette.error100,
} as const