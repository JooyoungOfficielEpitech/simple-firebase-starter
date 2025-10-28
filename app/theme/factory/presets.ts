/**
 * Theme Presets - Pre-configured themes for quick selection
 *
 * Includes legacy and Wicked character theme presets.
 * All presets are WCAG 2.1 AA compliant.
 */

import type { ThemePreset, ThemeConfig } from "./types"

/**
 * Elphaba (Wicked) Theme Preset
 * Nature-inspired emerald green with elegant black accents
 */
export const elphabaPreset: ThemePreset = {
  id: "elphaba",
  name: "Elphaba",
  description: "Nature-inspired emerald green with elegant black accents",
  preview: {
    primary: "#2E7D32",
    secondary: "#424242",
    accent: "#E65100",
  },
  light: {
    id: "elphaba-light",
    name: "Elphaba Light",
    isDark: false,
    wickedCharacter: "elphaba",
    colors: {
      primary100: "#E8F5E8",
      primary200: "#C8E6C8",
      primary300: "#81C784",
      primary400: "#4CAF50",
      primary500: "#2E7D32",
      primary600: "#1B5E20",
      secondary100: "#FAFAFA",
      secondary200: "#F5F5F5",
      secondary300: "#E0E0E0",
      secondary400: "#757575",
      secondary500: "#424242",
      accent100: "#FFF8E1",
      accent200: "#FFE082",
      accent300: "#FFC107",
      accent400: "#FF8F00",
      accent500: "#E65100",
      overlay20: "rgba(46, 125, 50, 0.25)",
      overlay50: "rgba(46, 125, 50, 0.55)",
    } as any,
  },
  dark: {
    id: "elphaba-dark",
    name: "Elphaba Dark",
    isDark: true,
    wickedCharacter: "elphaba",
    colors: {
      primary100: "#1B5E20",
      primary200: "#2E7D32",
      primary300: "#388E3C",
      primary400: "#4CAF50",
      primary500: "#66BB6A",
      primary600: "#81C784",
      secondary100: "#424242",
      secondary200: "#616161",
      secondary300: "#757575",
      secondary400: "#9E9E9E",
      secondary500: "#BDBDBD",
      accent100: "#E65100",
      accent200: "#FF6F00",
      accent300: "#FF8F00",
      accent400: "#FFA000",
      accent500: "#FFB300",
      overlay20: "rgba(102, 187, 106, 0.25)",
      overlay50: "rgba(102, 187, 106, 0.55)",
    } as any,
  },
}

/**
 * Glinda (Wicked) Theme Preset
 * Elegant rose pink with golden blonde accents
 */
export const glindaPreset: ThemePreset = {
  id: "glinda",
  name: "Glinda",
  description: "Elegant rose pink with golden blonde accents",
  preview: {
    primary: "#EC4899",
    secondary: "#D4AF37",
    accent: "#E65100",
  },
  light: {
    id: "glinda-light",
    name: "Glinda Light",
    isDark: false,
    wickedCharacter: "glinda",
    colors: {
      primary100: "#FDF2F8",
      primary200: "#FCE7F3",
      primary300: "#F9A8D4",
      primary400: "#F472B6",
      primary500: "#EC4899",
      primary600: "#BE185D",
      secondary100: "#FFFDF7",
      secondary200: "#FFF9E6",
      secondary300: "#F5E6A3",
      secondary400: "#E6CC5A",
      secondary500: "#D4AF37",
      accent100: "#FFF8E1",
      accent200: "#FFE082",
      accent300: "#FFC107",
      accent400: "#FF8F00",
      accent500: "#E65100",
      overlay20: "rgba(220, 20, 60, 0.25)",
      overlay50: "rgba(220, 20, 60, 0.55)",
    } as any,
  },
  dark: {
    id: "glinda-dark",
    name: "Glinda Dark",
    isDark: true,
    wickedCharacter: "glinda",
    colors: {
      primary100: "#831843",
      primary200: "#9D174D",
      primary300: "#BE185D",
      primary400: "#DB2777",
      primary500: "#EC4899",
      primary600: "#F472B6",
      secondary100: "#92400E",
      secondary200: "#B45309",
      secondary300: "#D97706",
      secondary400: "#F59E0B",
      secondary500: "#FBBF24",
      accent100: "#E65100",
      accent200: "#FF6F00",
      accent300: "#FF8F00",
      accent400: "#FFA000",
      accent500: "#FFB300",
      overlay20: "rgba(236, 72, 153, 0.25)",
      overlay50: "rgba(236, 72, 153, 0.55)",
    } as any,
  },
}

/**
 * Gwynplaine (Phantom of the Opera) Theme Preset
 * Deep purple with silvery moonlight accents
 */
export const gwynplainePreset: ThemePreset = {
  id: "gwynplaine",
  name: "Gwynplaine",
  description: "Deep purple with silvery moonlight accents (Phantom of the Opera inspired)",
  preview: {
    primary: "#6A1B9A",
    secondary: "#9E9E9E",
    accent: "#E65100",
  },
  light: {
    id: "gwynplaine-light",
    name: "Gwynplaine Light",
    isDark: false,
    wickedCharacter: "gwynplaine",
    colors: {
      primary100: "#F3E5F5",
      primary200: "#E1BEE7",
      primary300: "#BA68C8",
      primary400: "#9C27B0",
      primary500: "#6A1B9A",
      primary600: "#4A148C",
      secondary100: "#FAFAFA",
      secondary200: "#F5F5F5",
      secondary300: "#E0E0E0",
      secondary400: "#9E9E9E",
      secondary500: "#616161",
      accent100: "#FFF8E1",
      accent200: "#FFE082",
      accent300: "#FFC107",
      accent400: "#FF8F00",
      accent500: "#E65100",
      overlay20: "rgba(106, 27, 154, 0.25)",
      overlay50: "rgba(106, 27, 154, 0.55)",
    } as any,
  },
  dark: {
    id: "gwynplaine-dark",
    name: "Gwynplaine Dark",
    isDark: true,
    wickedCharacter: "gwynplaine",
    colors: {
      primary100: "#4A148C",
      primary200: "#6A1B9A",
      primary300: "#7B1FA2",
      primary400: "#8E24AA",
      primary500: "#9C27B0",
      primary600: "#AB47BC",
      secondary100: "#424242",
      secondary200: "#616161",
      secondary300: "#757575",
      secondary400: "#9E9E9E",
      secondary500: "#BDBDBD",
      accent100: "#E65100",
      accent200: "#FF6F00",
      accent300: "#FF8F00",
      accent400: "#FFA000",
      accent500: "#FFB300",
      overlay20: "rgba(156, 39, 176, 0.25)",
      overlay50: "rgba(156, 39, 176, 0.55)",
    } as any,
  },
}

/**
 * Johanna (Sweeney Todd) Theme Preset
 * Blood crimson red with dark coal accents
 */
export const johannaPreset: ThemePreset = {
  id: "johanna",
  name: "Johanna",
  description: "Blood crimson red with dark coal accents (Sweeney Todd inspired)",
  preview: {
    primary: "#C62828",
    secondary: "#424242",
    accent: "#E65100",
  },
  light: {
    id: "johanna-light",
    name: "Johanna Light",
    isDark: false,
    wickedCharacter: "johanna",
    colors: {
      primary100: "#FFEBEE",
      primary200: "#FFCDD2",
      primary300: "#E57373",
      primary400: "#EF5350",
      primary500: "#C62828",
      primary600: "#B71C1C",
      secondary100: "#FAFAFA",
      secondary200: "#F5F5F5",
      secondary300: "#E0E0E0",
      secondary400: "#757575",
      secondary500: "#424242",
      accent100: "#FFF8E1",
      accent200: "#FFE082",
      accent300: "#FFC107",
      accent400: "#FF8F00",
      accent500: "#E65100",
      overlay20: "rgba(198, 40, 40, 0.25)",
      overlay50: "rgba(198, 40, 40, 0.55)",
    } as any,
  },
  dark: {
    id: "johanna-dark",
    name: "Johanna Dark",
    isDark: true,
    wickedCharacter: "johanna",
    colors: {
      primary100: "#B71C1C",
      primary200: "#C62828",
      primary300: "#D32F2F",
      primary400: "#E53935",
      primary500: "#EF5350",
      primary600: "#E57373",
      secondary100: "#212121",
      secondary200: "#424242",
      secondary300: "#616161",
      secondary400: "#757575",
      secondary500: "#9E9E9E",
      accent100: "#E65100",
      accent200: "#FF6F00",
      accent300: "#FF8F00",
      accent400: "#FFA000",
      accent500: "#FFB300",
      overlay20: "rgba(239, 83, 80, 0.25)",
      overlay50: "rgba(239, 83, 80, 0.55)",
    } as any,
  },
}

/**
 * Legacy Karaoke Theme Preset
 * @deprecated Maintained for backward compatibility
 */
export const legacyKaraokePreset: ThemePreset = {
  id: "karaoke-legacy",
  name: "Karaoke (Legacy)",
  description: "Original Korean Karaoke theme - neon-inspired design",
  preview: {
    primary: "#0066CC",
    secondary: "#FF9900",
    accent: "#FDCB6E",
  },
  light: {
    id: "karaoke-light",
    name: "Karaoke Light",
    isDark: false,
    colors: {
      primary100: "#E8F3FF",
      primary200: "#B3D9FF",
      primary300: "#66B8FF",
      primary400: "#1A90FF",
      primary500: "#0066CC",
      primary600: "#004499",
      secondary100: "#FFF9E6",
      secondary200: "#FFE6B3",
      secondary300: "#FFCC66",
      secondary400: "#FFB31A",
      secondary500: "#FF9900",
      accent100: "#FFFACD",
      accent200: "#FFEAA7",
      accent300: "#FDCB6E",
      accent400: "#E17055",
      accent500: "#D63031",
      overlay20: "rgba(0, 102, 204, 0.25)",
      overlay50: "rgba(0, 102, 204, 0.55)",
    } as any,
  },
  dark: {
    id: "karaoke-dark",
    name: "Karaoke Dark",
    isDark: true,
    colors: {
      primary100: "#004499",
      primary200: "#0066CC",
      primary300: "#1A90FF",
      primary400: "#66B8FF",
      primary500: "#B3D9FF",
      primary600: "#E8F3FF",
      secondary100: "#FF9900",
      secondary200: "#FFB31A",
      secondary300: "#FFCC66",
      secondary400: "#FFE6B3",
      secondary500: "#FFF9E6",
      accent100: "#D63031",
      accent200: "#E17055",
      accent300: "#FDCB6E",
      accent400: "#FFEAA7",
      accent500: "#FFFACD",
      overlay20: "rgba(179, 217, 255, 0.25)",
      overlay50: "rgba(179, 217, 255, 0.55)",
    } as any,
  },
}

/**
 * All available theme presets
 */
export const themePresets = [
  elphabaPreset,
  glindaPreset,
  gwynplainePreset,
  johannaPreset,
  legacyKaraokePreset,
] as const

/**
 * Get preset by ID
 * @param id Preset ID
 * @returns Theme preset or undefined
 */
export function getPresetById(id: string): ThemePreset | undefined {
  return themePresets.find((preset) => preset.id === id)
}

/**
 * Get all Wicked character presets (excluding legacy)
 */
export function getWickedPresets(): ThemePreset[] {
  return [elphabaPreset, glindaPreset, gwynplainePreset, johannaPreset]
}

/**
 * Get preview colors for all presets
 */
export function getAllPreviewColors(): Array<{ id: string; name: string; colors: { primary: string; secondary: string; accent: string } }> {
  return themePresets.map((preset) => ({
    id: preset.id,
    name: preset.name,
    colors: preset.preview,
  }))
}
