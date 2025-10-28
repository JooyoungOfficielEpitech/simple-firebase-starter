import { createOverlays, createThemeColors, createSemanticColors } from "./colorsBase"

/**
 * LEGACY: Korean Karaoke Theme - Modern neon-inspired design
 * @deprecated This theme is maintained for backward compatibility only.
 * The app now uses Wicked character themes (Elphaba, Glinda, Gwynplaine, Johanna).
 * See theme/colorsElphaba.ts for the new theme structure.
 */
const karaokeSpecific = {
  // Primary: Karaoke Blue - Modern neon-inspired tones
  primary100: "#E8F3FF", // Light blue
  primary200: "#B3D9FF", // Sky blue
  primary300: "#66B8FF", // Bright blue
  primary400: "#1A90FF", // Karaoke blue
  primary500: "#0066CC", // Main karaoke blue
  primary600: "#004499", // Dark karaoke blue

  // Secondary: Warm Gold
  secondary100: "#FFF9E6", // Light gold
  secondary200: "#FFE6B3", // Soft gold
  secondary300: "#FFCC66", // Medium gold
  secondary400: "#FFB31A", // Bright gold
  secondary500: "#FF9900", // Korean karaoke gold

  // Accent: Gold/Yellow highlights
  accent100: "#FFFACD",
  accent200: "#FFEAA7",
  accent300: "#FDCB6E",
  accent400: "#E17055",
  accent500: "#D63031",

  // Blue-tinted overlays
  ...createOverlays(0, 102, 204),
}

const palette = createThemeColors(karaokeSpecific)

// Custom semantic mapping for legacy karaoke theme
export const colors = {
  ...createSemanticColors(palette),
  // Override background and actions to use secondary gold instead of primary blue
  background: palette.secondary500,
  secondaryAction: palette.primary300,
  selected: palette.primary300,
  iconAccent: palette.primary300,
} as const
