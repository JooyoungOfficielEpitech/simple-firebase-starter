/**
 * Color Tokens - 시맨틱 색상 시스템
 */

import { colors } from "@/theme/colors"

const palette = colors.palette

export const semanticColors = {
  primary: {
    main: palette.primary500,
    light: palette.primary400,
    dark: palette.primary600,
    contrast: palette.neutral100,
  },
  secondary: {
    main: palette.secondary500,
    light: palette.secondary400,
    dark: "#CC7700", // Darker version of secondary500 (#FF9900)
    contrast: palette.neutral100,
  },
  success: {
    main: "#10B981",
    light: "#34D399",
    dark: "#059669",
    contrast: palette.neutral100,
  },
  warning: {
    main: "#F59E0B",
    light: "#FBBF24",
    dark: "#D97706",
    contrast: palette.neutral100,
  },
  error: {
    main: "#EF4444",
    light: "#F87171",
    dark: "#DC2626",
    contrast: palette.neutral100,
  },
  text: {
    primary: palette.neutral800,
    secondary: palette.neutral600,
    disabled: palette.neutral400,
  },
  background: {
    default: palette.neutral100,
    paper: palette.neutral100,
    elevated: palette.neutral200,
  },
  border: {
    default: palette.neutral300,
    light: palette.neutral200,
    dark: palette.neutral400,
  },
} as const

export const withOpacity = (color: string, opacity: number): string => {
  const hex = color.replace("#", "")
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export { palette }
