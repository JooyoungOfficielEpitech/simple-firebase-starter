import { baseColors, createOverlays, createThemeColors, createSemanticColors } from "./colorsBase"

/**
 * Gwynplaine Theme - Deep wine red and rich brown tones
 * WCAG 2.1 AA compliant color palette
 */
const gwynplaineSpecific = {
  // Primary: Gwynplaine Wine - Deep wine red tones
  primary100: "#FDF2F8", // Ultra light wine
  primary200: "#FCE7F3", // Soft wine
  primary300: "#F687B3", // Light wine
  primary400: "#ED64A6", // Vibrant wine
  primary500: "#722F37", // Strong wine red (WCAG AA)
  primary600: "#4A1E22", // Deep wine

  // Secondary: Rich Brown
  secondary100: "#FEFDFB",
  secondary200: "#F7F3E9",
  secondary300: "#D4B887",
  secondary400: "#A0522D",
  secondary500: "#8B4513", // Rich brown

  // Accent: Silver (shared from base)
  accent100: baseColors.silverAccent100,
  accent200: baseColors.silverAccent200,
  accent300: baseColors.silverAccent300,
  accent400: baseColors.silverAccent400,
  accent500: baseColors.silverAccent500,

  // Wine/burgundy-tinted overlays
  ...createOverlays(173, 20, 87),
}

const palette = createThemeColors(gwynplaineSpecific)

export const colors = createSemanticColors(palette)