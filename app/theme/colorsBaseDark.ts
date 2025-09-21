/**
 * Base color palette for dark themes
 * Contains common neutral, accent, and error colors with inverted neutrals
 */
export const baseDarkColors = {
  // Dark theme neutrals (inverted)
  neutral900: "#FFFFFF",
  neutral800: "#F8F8F8",
  neutral700: "#E5E5E5",
  neutral600: "#B8B8B8",
  neutral500: "#8A8A8A",
  neutral400: "#5C5C5C",
  neutral300: "#2E2E2E",
  neutral200: "#1A1A1A",
  neutral100: "#000000",

  // Error states - consistent across all themes
  angry100: "#FFE5E5",
  angry500: "#E74C3C",

  // Common gold accent colors for Elphaba and Glinda dark themes
  goldAccent500: "#FFFACD",
  goldAccent400: "#FFEAA7",
  goldAccent300: "#FDCB6E", 
  goldAccent200: "#E17055",
  goldAccent100: "#D63031",

  // Silver accent colors for Gwynplaine dark theme
  silverAccent500: "#F5F5F5",
  silverAccent400: "#EEEEEE",
  silverAccent300: "#E0E0E0",
  silverAccent200: "#BDBDBD", 
  silverAccent100: "#9E9E9E",
} as const

/**
 * Helper function to create overlay colors with specified tint for dark themes
 */
export const createDarkOverlays = (r: number, g: number, b: number) => ({
  overlay20: `rgba(${r}, ${g}, ${b}, 0.3)`,
  overlay50: `rgba(${r}, ${g}, ${b}, 0.6)`,
})

/**
 * Helper function to merge base dark colors with theme-specific colors
 */
export const createDarkThemeColors = <T extends Record<string, string>>(themeSpecific: T) => ({
  ...baseDarkColors,
  ...themeSpecific,
} as typeof baseDarkColors & T)