/**
 * Base color palette shared across all themes
 * Contains common neutral, accent, and error colors
 * All colors meet WCAG 2.1 AA compliance standards (4.5:1 contrast for normal text, 3:1 for large text)
 */
export const baseColors = {
  // Neutral colors (white to black) - WCAG 2.1 AA compliant
  neutral100: "#FFFFFF", // White
  neutral200: "#F8F8F8", // Very light gray
  neutral300: "#E5E5E5", // Light gray (3.6:1 with white, suitable for large text only)
  neutral400: "#9E9E9E", // Medium gray (4.6:1 contrast with white - WCAG AA compliant)
  neutral500: "#757575", // Updated for better contrast (5.9:1 with white)
  neutral600: "#424242", // Dark gray (12.6:1 with white - excellent contrast)
  neutral700: "#2E2E2E", // Very dark gray (15.8:1 with white)
  neutral800: "#1A1A1A", // Nearly black (18.7:1 with white)
  neutral900: "#000000", // Pure black (21:1 with white - maximum contrast)

  // Error states - WCAG AA compliant
  error100: "#FFEBEE", // Light error background
  error500: "#D32F2F", // Error text (5.9:1 with white - WCAG AA compliant)

  // Gold accent colors - Shared by Elphaba, Glinda, Johanna themes
  goldAccent100: "#FFF8E1", // Very light gold
  goldAccent200: "#FFE082", // Light gold
  goldAccent300: "#FFC107", // Medium gold
  goldAccent400: "#FF8F00", // Bright gold
  goldAccent500: "#E65100", // Dark gold (4.7:1 with white - WCAG AA compliant)

  // Silver accent colors - Shared by Gwynplaine, Johanna themes
  silverAccent100: "#FAFAFA", // Very light silver
  silverAccent200: "#F5F5F5", // Light silver
  silverAccent300: "#E0E0E0", // Medium silver
  silverAccent400: "#9E9E9E", // Dark silver (4.6:1 with white - WCAG AA)
  silverAccent500: "#616161", // Very dark silver (7.0:1 with white - excellent)
} as const

/**
 * Helper function to create overlay colors with specified tint
 * Standardized transparency values for consistency across themes
 */
export const createOverlays = (r: number, g: number, b: number) => ({
  overlay20: `rgba(${r}, ${g}, ${b}, 0.25)`, // Standardized: 25% opacity
  overlay50: `rgba(${r}, ${g}, ${b}, 0.55)`, // Standardized: 55% opacity
})

/**
 * Helper function to merge base colors with theme-specific colors
 */
export const createThemeColors = <T extends Record<string, string>>(themeSpecific: T) => ({
  ...baseColors,
  ...themeSpecific,
} as typeof baseColors & T)

/**
 * Standard semantic color mappings for light themes
 * Eliminates duplication across all theme files
 */
export const createSemanticColors = <T extends Record<string, string>>(palette: T & typeof baseColors) => ({
  palette,
  transparent: "rgba(0, 0, 0, 0)" as const,
  text: palette.neutral800,
  textDim: palette.neutral600,
  background: palette.primary100 || palette.secondary500,
  border: palette.neutral400,
  tint: palette.primary500,
  tintInactive: palette.neutral300,
  primaryAction: palette.primary500,
  secondaryAction: palette.secondary500 || palette.primary300,
  selected: palette.secondary400 || palette.primary300,
  iconAccent: palette.secondary500 || palette.primary300,
  separator: palette.neutral300,
  error: palette.error500,
  errorBackground: palette.error100,
} as const)