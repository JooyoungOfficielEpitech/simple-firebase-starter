/**
 * Theme Tokens Export - Colored Sheep Community Design System
 *
 * Centralized export of all design system tokens
 * Import pattern: import { colors, typography, spacing, shadows } from '@/theme'
 */

export * from './colors'
export * from './typography'
export * from './spacing'
export * from './shadows'

/**
 * Re-export for convenience
 */
import { colors, darkColors } from './colors'
import { typography, fontFamily, accessibility } from './typography'
import { spacing, componentSpacing, borderRadius } from './spacing'
import { shadows } from './shadows'

export const theme = {
  colors,
  darkColors,
  typography,
  fontFamily,
  spacing,
  componentSpacing,
  borderRadius,
  shadows,
  accessibility,
} as const

export type Theme = typeof theme
