/**
 * Design System Tokens - 통합 export
 */

export * from "./spacing.tokens"
export * from "./colors.tokens"
export * from "./typography.tokens"
export * from "./shadows.tokens"

import { spacing } from "./spacing.tokens"
import { semanticColors, palette } from "./colors.tokens"
import { fontSizes, lineHeights, fontWeights, typographyPresets } from "./typography.tokens"
import { shadows, componentShadows } from "./shadows.tokens"

export const tokens = {
  spacing,
  colors: { semantic: semanticColors, palette },
  typography: { sizes: fontSizes, lineHeights, weights: fontWeights, presets: typographyPresets },
  shadows: { ...shadows, component: componentShadows },
} as const
