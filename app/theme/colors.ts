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

  // Korean Karaoke Primary - Modern neon-inspired tones  
  primary100: "#E8F3FF", // Light blue-tint
  primary200: "#B3D9FF", // Sky blue
  primary300: "#66B8FF", // Bright blue
  primary400: "#1A90FF", // Karaoke blue
  primary500: "#0066CC", // Main karaoke blue
  primary600: "#004499", // Dark karaoke blue

  // Korean Karaoke Secondary - Warm accent tones
  secondary100: "#FFF9E6", // Light gold
  secondary200: "#FFE6B3", // Soft gold  
  secondary300: "#FFCC66", // Medium gold
  secondary400: "#FFB31A", // Bright gold
  secondary500: "#FF9900", // Korean karaoke gold

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
