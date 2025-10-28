import { baseColors, createOverlays, createThemeColors, createSemanticColors } from "./colorsBase"

/**
 * Glinda Theme - Elegant rose and golden blonde tones
 * WCAG 2.1 AA compliant color palette
 */
const glindaSpecific = {
  // Primary: Glinda Pink - Elegant rose tones
  primary100: "#FDF2F8", // Soft blush
  primary200: "#FCE7F3", // Light rose
  primary300: "#F9A8D4", // Warm pink
  primary400: "#F472B6", // Vibrant rose
  primary500: "#EC4899", // Strong rose (WCAG AA)
  primary600: "#BE185D", // Deep rose

  // Secondary: Golden Blonde
  secondary100: "#FFFDF7",
  secondary200: "#FFF9E6",
  secondary300: "#F5E6A3",
  secondary400: "#E6CC5A",
  secondary500: "#D4AF37", // Golden blonde

  // Accent: Gold (shared from base)
  accent100: baseColors.goldAccent100,
  accent200: baseColors.goldAccent200,
  accent300: baseColors.goldAccent300,
  accent400: baseColors.goldAccent400,
  accent500: baseColors.goldAccent500,

  // Pink-tinted overlays
  ...createOverlays(220, 20, 60),
}

const palette = createThemeColors(glindaSpecific)

export const colors = createSemanticColors(palette)