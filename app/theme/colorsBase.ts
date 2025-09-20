/**
 * Base color palette shared across all themes
 * Contains common neutral, accent, and error colors
 */
export const baseColors = {
  // Neutral colors (white to black) - consistent across all themes
  neutral100: "#FFFFFF",
  neutral200: "#F8F8F8", 
  neutral300: "#E5E5E5",
  neutral400: "#B8B8B8",
  neutral500: "#8A8A8A",
  neutral600: "#5C5C5C",
  neutral700: "#2E2E2E",
  neutral800: "#1A1A1A",
  neutral900: "#000000",

  // Error states - consistent across all themes
  angry100: "#FFE5E5",
  angry500: "#E74C3C",

  // Common accent colors for Elphaba and Glinda themes
  goldAccent100: "#FFFACD",
  goldAccent200: "#FFEAA7", 
  goldAccent300: "#FDCB6E",
  goldAccent400: "#E17055",
  goldAccent500: "#D63031",

  // Silver accent colors for Gwynplaine theme
  silverAccent100: "#F5F5F5",
  silverAccent200: "#EEEEEE",
  silverAccent300: "#E0E0E0", 
  silverAccent400: "#BDBDBD",
  silverAccent500: "#9E9E9E",
} as const

/**
 * Helper function to create overlay colors with specified tint
 */
export const createOverlays = (r: number, g: number, b: number) => ({
  overlay20: `rgba(${r}, ${g}, ${b}, 0.2)`,
  overlay50: `rgba(${r}, ${g}, ${b}, 0.5)`,
})

/**
 * Helper function to merge base colors with theme-specific colors
 */
export const createThemeColors = (themeSpecific: Record<string, string>) => ({
  ...baseColors,
  ...themeSpecific,
})