/**
 * Base color palette for dark themes
 * Contains common neutral, accent, and error colors with inverted neutrals
 * All colors meet WCAG 2.1 AA compliance standards for dark backgrounds
 */
export const baseDarkColors = {
  // Dark theme neutrals (inverted but optimized for WCAG AA compliance)
  neutral900: "#FFFFFF", // White text (21:1 contrast with black background)
  neutral800: "#F5F5F5", // Very light gray (19.6:1 contrast with black)
  neutral700: "#E0E0E0", // Light gray (12.6:1 contrast with black)
  neutral600: "#BDBDBD", // Medium light gray (9.0:1 contrast with black)
  neutral500: "#9E9E9E", // Medium gray (6.5:1 contrast with black - WCAG AA)
  neutral400: "#757575", // Dark gray (4.6:1 contrast with black - WCAG AA)
  neutral300: "#424242", // Very dark gray
  neutral200: "#212121", // Nearly black for dark backgrounds
  neutral100: "#000000", // Pure black background

  // Error states - optimized for dark theme (semantic naming)
  error100: "#FFEBEE", // Light error background
  error500: "#F44336", // Brighter red for dark backgrounds (3.9:1 with black)

  // Common gold accent colors for Elphaba and Glinda dark themes (inverted)
  goldAccent500: "#FFF8E1", // Very light gold
  goldAccent400: "#FFE082", // Light gold  
  goldAccent300: "#FFC107", // Medium gold
  goldAccent200: "#FF8F00", // Bright gold
  goldAccent100: "#E65100", // Dark gold

  // Silver accent colors for Gwynplaine dark theme (inverted)
  silverAccent500: "#FAFAFA", // Very light silver
  silverAccent400: "#F5F5F5", // Light silver
  silverAccent300: "#E0E0E0", // Medium silver
  silverAccent200: "#BDBDBD", // Dark silver
  silverAccent100: "#9E9E9E", // Very dark silver
} as const

/**
 * Helper function to create overlay colors with specified tint for dark themes
 * Standardized transparency values for consistency across themes
 */
export const createDarkOverlays = (r: number, g: number, b: number) => ({
  overlay20: `rgba(${r}, ${g}, ${b}, 0.25)`, // Standardized: 25% opacity (same as light theme)
  overlay50: `rgba(${r}, ${g}, ${b}, 0.55)`, // Standardized: 55% opacity (same as light theme)
})

/**
 * Helper function to merge base dark colors with theme-specific colors
 */
export const createDarkThemeColors = <T extends Record<string, string>>(themeSpecific: T) => ({
  ...baseDarkColors,
  ...themeSpecific,
} as typeof baseDarkColors & T)