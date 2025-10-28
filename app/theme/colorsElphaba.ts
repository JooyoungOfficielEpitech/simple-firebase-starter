import { baseColors, createOverlays, createThemeColors, createSemanticColors } from "./colorsBase"

/**
 * Elphaba Theme - Modern nature-inspired emerald tones
 * WCAG 2.1 AA compliant color palette
 */
const elphabaSpecific = {
  // Primary: Elphaba Green - Nature-inspired emerald tones
  primary100: "#E8F5E8", // Ultra light mint
  primary200: "#C8E6C8", // Soft mint green
  primary300: "#81C784", // Fresh green
  primary400: "#4CAF50", // Vibrant emerald
  primary500: "#2E7D32", // Strong emerald (WCAG AA)
  primary600: "#1B5E20", // Deep forest green

  // Secondary: Black - Dark elegant accent
  secondary100: "#FAFAFA", // Very light gray
  secondary200: "#F5F5F5", // Light gray
  secondary300: "#E0E0E0", // Medium light gray
  secondary400: "#757575", // Medium dark gray (WCAG AA)
  secondary500: "#424242", // Elegant black

  // Accent: Gold (shared from base)
  accent100: baseColors.goldAccent100,
  accent200: baseColors.goldAccent200,
  accent300: baseColors.goldAccent300,
  accent400: baseColors.goldAccent400,
  accent500: baseColors.goldAccent500,

  // Green-tinted overlays
  ...createOverlays(46, 125, 50),
}

const palette = createThemeColors(elphabaSpecific)

export const colors = createSemanticColors(palette)