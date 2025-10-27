/**
 * Design System - Design Tokens Index
 *
 * Centralized export for all design tokens.
 * Import design tokens from this file for consistent styling.
 *
 * Token Categories:
 * - Colors: Semantic color tokens
 * - Spacing: Layout and spacing tokens
 * - Typography: Text style tokens
 * - Shadows: Elevation and shadow tokens
 *
 * Usage:
 * ```tsx
 * import { colorTokens, spacingTokens, typographyPresets, shadowTokens } from "@/design-system/tokens"
 * ```
 */

// Color tokens
export {
  colorTokens,
  getColorToken,
  type ColorToken,
  type SurfaceToken,
  type ContentToken,
  type BorderToken,
  type InteractiveToken,
  type FeedbackToken,
  type OverlayToken,
  type AccentToken,
} from "./colors"

// Spacing tokens
export {
  spacingTokens,
  semanticSpacing,
  gridTokens,
  radiusTokens,
  type SpacingToken,
  type SemanticSpacingCategory,
  type RadiusToken,
} from "./spacing"

// Typography tokens
export {
  fontFamilyTokens,
  fontSizeTokens,
  fontWeightTokens,
  lineHeightTokens,
  letterSpacingTokens,
  typographyPresets,
  koreanTypographyAdjustments,
  getTypographyPreset,
  type FontFamilyToken,
  type FontSizeToken,
  type FontWeightToken,
  type LineHeightToken,
  type LetterSpacingToken,
  type TypographyPreset,
} from "./typography"

// Shadow tokens
export {
  shadowTokens,
  semanticShadows,
  coloredShadows,
  innerShadow,
  type ShadowToken,
  type SemanticShadowCategory,
} from "./shadows"

/**
 * Design token system overview
 *
 * PHILOSOPHY:
 * - Semantic naming over literal values
 * - Theme-agnostic tokens that work across all themes
 * - Type-safe token usage with TypeScript
 * - Consistent spacing and sizing based on base units
 * - Accessibility-first color choices (WCAG 2.1 AA)
 *
 * TOKEN HIERARCHY:
 * 1. Base tokens (primitives): Colors, font sizes, spacing units
 * 2. Semantic tokens (purpose): surface.primary, content.primary
 * 3. Component tokens (specific): button.primary, input.focus
 *
 * USAGE PATTERNS:
 *
 * 1. Direct token usage:
 * ```tsx
 * <View style={{ padding: spacingTokens.md }} />
 * ```
 *
 * 2. Semantic token usage:
 * ```tsx
 * const { theme } = useAppTheme()
 * <View style={{
 *   backgroundColor: theme.colors[colorTokens.surface.primary],
 *   padding: semanticSpacing.screen.paddingHorizontal,
 * }} />
 * ```
 *
 * 3. Typography preset usage:
 * ```tsx
 * <Text style={typographyPresets.headingLarge}>Title</Text>
 * ```
 *
 * 4. Shadow token usage:
 * ```tsx
 * <View style={[styles.card, shadowTokens.md]} />
 * ```
 *
 * MIGRATION FROM LEGACY THEME:
 * - Replace hardcoded values with design tokens
 * - Use semantic tokens for better maintainability
 * - Leverage TypeScript types for type safety
 *
 * CUSTOMIZATION:
 * - Override tokens in theme-specific files
 * - Extend token system with project-specific tokens
 * - Maintain consistent naming conventions
 */
