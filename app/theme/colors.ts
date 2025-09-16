const palette = {
  // Wicked-inspired neutrals (white to black)
  neutral100: "#FFFFFF",
  neutral200: "#F8F8F8",
  neutral300: "#E5E5E5",
  neutral400: "#B8B8B8",
  neutral500: "#8A8A8A",
  neutral600: "#5C5C5C",
  neutral700: "#2E2E2E",
  neutral800: "#1A1A1A",
  neutral900: "#000000",

  // Wicked Green (primary) - Emerald/Forest tones
  primary100: "#E8F5E8",
  primary200: "#C3E6C3",
  primary300: "#9DD69D",
  primary400: "#76C676",
  primary500: "#4FB84F", // Main green
  primary600: "#228B22", // Forest green

  // Wicked Pink (secondary) - Hot pink/Magenta tones
  secondary100: "#FFF0F5",
  secondary200: "#FFCCE0",
  secondary300: "#FF99CC",
  secondary400: "#FF66B8",
  secondary500: "#FF1493", // Hot pink

  // Accent - Gold/Yellow highlights
  accent100: "#FFFACD",
  accent200: "#FFEAA7",
  accent300: "#FDCB6E",
  accent400: "#E17055",
  accent500: "#D63031",

  // Error states
  angry100: "#FFE5E5",
  angry500: "#E74C3C",

  // Overlays with green tint
  overlay20: "rgba(34, 139, 34, 0.2)",
  overlay50: "rgba(34, 139, 34, 0.5)",
} as const

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
   * The main tinting color.
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
