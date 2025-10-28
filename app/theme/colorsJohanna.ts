import { baseColors, createOverlays, createThemeColors, createSemanticColors } from "./colorsBase"

/**
 * Johanna Theme - Darker sky blue and tarnished gold tones
 * WCAG 2.1 AA compliant color palette
 * Represents the melancholy of a caged bird
 */
const johannaSpecific = {
  // Primary: Johanna Darker Sky Blue - Deep melancholy tones
  primary100: "#E8F0F8", // Very light steel blue
  primary200: "#C7D9E8", // Light steel blue
  primary300: "#6B8CAE", // Medium steel blue
  primary400: "#4A6B8A", // Dark steel blue
  primary500: "#2C4B6B", // Very dark sky blue (WCAG AA)
  primary600: "#1E3649", // Deep midnight blue

  // Secondary: Dark Gold - Tarnished gold for broken dreams
  secondary100: "#FDF6E3",
  secondary200: "#F7E9B9",
  secondary300: "#D4AF37", // Classic gold
  secondary400: "#B8860B", // Dark goldenrod
  secondary500: "#8B6914", // Dark gold

  // Accent: Silver for cage motifs (shared from base)
  accent100: baseColors.silverAccent100,
  accent200: baseColors.silverAccent200,
  accent300: baseColors.silverAccent300,
  accent400: baseColors.silverAccent400,
  accent500: baseColors.silverAccent500,

  // Blue-tinted overlays for melancholy atmosphere
  ...createOverlays(44, 75, 107),
}

const palette = createThemeColors(johannaSpecific)

export const colors = createSemanticColors(palette)