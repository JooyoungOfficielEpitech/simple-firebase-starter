/**
 * Design System - Typography Tokens
 *
 * Consistent typography scale for text hierarchy.
 * Platform-specific font handling with fallbacks.
 * Korean typography optimization included.
 *
 * Scale:
 * - Display: 32-48px - Hero sections
 * - Heading: 20-28px - Section headers
 * - Body: 14-16px - Content text
 * - Label: 11-12px - UI labels and captions
 */

import { Platform } from "react-native"
import { typography } from "@/theme/typography"

/**
 * Font family tokens
 * Platform-specific font families with fallbacks
 */
export const fontFamilyTokens = {
  primary: {
    normal: typography.primary.normal,
    medium: typography.primary.medium,
    semiBold: typography.primary.semiBold,
    bold: typography.primary.bold,
  },
  code: {
    normal: typography.code.normal,
  },
} as const

/**
 * Font size scale
 * Based on modular scale (1.125 ratio) for visual hierarchy
 */
export const fontSizeTokens = {
  // Display sizes - for hero sections
  "display-lg": 48,     // 48px
  "display-md": 40,     // 40px
  "display-sm": 32,     // 32px

  // Heading sizes - for section headers
  "heading-xl": 28,     // 28px
  "heading-lg": 24,     // 24px
  "heading-md": 20,     // 20px
  "heading-sm": 18,     // 18px

  // Body sizes - for content text
  "body-xl": 18,        // 18px
  "body-lg": 16,        // 16px
  "body-md": 14,        // 14px (default)
  "body-sm": 13,        // 13px

  // Label sizes - for UI labels and captions
  "label-lg": 12,       // 12px
  "label-md": 11,       // 11px
  "label-sm": 10,       // 10px
} as const

/**
 * Font weight tokens
 */
export const fontWeightTokens = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const

/**
 * Line height tokens
 * Calculated as multiplier of font size
 * Korean text uses slightly larger line height (1.6x)
 */
export const lineHeightTokens = {
  tight: 1.2,           // Tight line height
  normal: 1.5,          // Normal line height
  relaxed: 1.6,         // Relaxed line height (Korean default)
  loose: 1.8,           // Loose line height
} as const

/**
 * Letter spacing tokens
 * In pixels - used for fine-tuning text spacing
 */
export const letterSpacingTokens = {
  tight: -0.5,          // Tight letter spacing
  normal: 0,            // Normal letter spacing
  wide: 0.5,            // Wide letter spacing
  wider: 1,             // Wider letter spacing
} as const

/**
 * Semantic typography tokens
 * Pre-configured text styles for common use cases
 */
export const typographyPresets = {
  // Display styles
  displayLarge: {
    fontFamily: fontFamilyTokens.primary.bold,
    fontSize: fontSizeTokens["display-lg"],
    lineHeight: fontSizeTokens["display-lg"] * lineHeightTokens.tight,
    fontWeight: fontWeightTokens.bold as any,
    letterSpacing: letterSpacingTokens.tight,
  },
  displayMedium: {
    fontFamily: fontFamilyTokens.primary.bold,
    fontSize: fontSizeTokens["display-md"],
    lineHeight: fontSizeTokens["display-md"] * lineHeightTokens.tight,
    fontWeight: fontWeightTokens.bold as any,
    letterSpacing: letterSpacingTokens.tight,
  },
  displaySmall: {
    fontFamily: fontFamilyTokens.primary.semiBold,
    fontSize: fontSizeTokens["display-sm"],
    lineHeight: fontSizeTokens["display-sm"] * lineHeightTokens.normal,
    fontWeight: fontWeightTokens.semibold as any,
    letterSpacing: letterSpacingTokens.normal,
  },

  // Heading styles
  headingXL: {
    fontFamily: fontFamilyTokens.primary.bold,
    fontSize: fontSizeTokens["heading-xl"],
    lineHeight: fontSizeTokens["heading-xl"] * lineHeightTokens.normal,
    fontWeight: fontWeightTokens.bold as any,
    letterSpacing: letterSpacingTokens.normal,
  },
  headingLarge: {
    fontFamily: fontFamilyTokens.primary.semiBold,
    fontSize: fontSizeTokens["heading-lg"],
    lineHeight: fontSizeTokens["heading-lg"] * lineHeightTokens.normal,
    fontWeight: fontWeightTokens.semibold as any,
    letterSpacing: letterSpacingTokens.normal,
  },
  headingMedium: {
    fontFamily: fontFamilyTokens.primary.semiBold,
    fontSize: fontSizeTokens["heading-md"],
    lineHeight: fontSizeTokens["heading-md"] * lineHeightTokens.normal,
    fontWeight: fontWeightTokens.semibold as any,
    letterSpacing: letterSpacingTokens.normal,
  },
  headingSmall: {
    fontFamily: fontFamilyTokens.primary.medium,
    fontSize: fontSizeTokens["heading-sm"],
    lineHeight: fontSizeTokens["heading-sm"] * lineHeightTokens.normal,
    fontWeight: fontWeightTokens.medium as any,
    letterSpacing: letterSpacingTokens.normal,
  },

  // Body styles
  bodyXLarge: {
    fontFamily: fontFamilyTokens.primary.normal,
    fontSize: fontSizeTokens["body-xl"],
    lineHeight: fontSizeTokens["body-xl"] * lineHeightTokens.relaxed,
    fontWeight: fontWeightTokens.regular as any,
    letterSpacing: letterSpacingTokens.normal,
  },
  bodyLarge: {
    fontFamily: fontFamilyTokens.primary.normal,
    fontSize: fontSizeTokens["body-lg"],
    lineHeight: fontSizeTokens["body-lg"] * lineHeightTokens.relaxed,
    fontWeight: fontWeightTokens.regular as any,
    letterSpacing: letterSpacingTokens.normal,
  },
  bodyMedium: {
    fontFamily: fontFamilyTokens.primary.normal,
    fontSize: fontSizeTokens["body-md"],
    lineHeight: fontSizeTokens["body-md"] * lineHeightTokens.relaxed,
    fontWeight: fontWeightTokens.regular as any,
    letterSpacing: letterSpacingTokens.normal,
  },
  bodySmall: {
    fontFamily: fontFamilyTokens.primary.normal,
    fontSize: fontSizeTokens["body-sm"],
    lineHeight: fontSizeTokens["body-sm"] * lineHeightTokens.normal,
    fontWeight: fontWeightTokens.regular as any,
    letterSpacing: letterSpacingTokens.normal,
  },

  // Label styles
  labelLarge: {
    fontFamily: fontFamilyTokens.primary.medium,
    fontSize: fontSizeTokens["label-lg"],
    lineHeight: fontSizeTokens["label-lg"] * lineHeightTokens.normal,
    fontWeight: fontWeightTokens.medium as any,
    letterSpacing: letterSpacingTokens.wide,
  },
  labelMedium: {
    fontFamily: fontFamilyTokens.primary.medium,
    fontSize: fontSizeTokens["label-md"],
    lineHeight: fontSizeTokens["label-md"] * lineHeightTokens.normal,
    fontWeight: fontWeightTokens.medium as any,
    letterSpacing: letterSpacingTokens.wide,
  },
  labelSmall: {
    fontFamily: fontFamilyTokens.primary.normal,
    fontSize: fontSizeTokens["label-sm"],
    lineHeight: fontSizeTokens["label-sm"] * lineHeightTokens.normal,
    fontWeight: fontWeightTokens.regular as any,
    letterSpacing: letterSpacingTokens.wider,
  },

  // Code style
  code: {
    fontFamily: fontFamilyTokens.code.normal,
    fontSize: fontSizeTokens["body-md"],
    lineHeight: fontSizeTokens["body-md"] * lineHeightTokens.relaxed,
    fontWeight: fontWeightTokens.regular as any,
    letterSpacing: letterSpacingTokens.normal,
  },
} as const

/**
 * Korean typography adjustments
 * Korean text requires larger line height for readability
 */
export const koreanTypographyAdjustments = {
  lineHeightMultiplier: 1.6,  // 1.6x line height for Korean
  letterSpacing: 0,           // No letter spacing for Korean
}

/**
 * Helper function to get typography preset
 * Automatically adjusts for Korean text if needed
 */
export const getTypographyPreset = (
  preset: keyof typeof typographyPresets,
  isKorean: boolean = false,
) => {
  const basePreset = typographyPresets[preset]

  if (isKorean) {
    return {
      ...basePreset,
      lineHeight: basePreset.fontSize * koreanTypographyAdjustments.lineHeightMultiplier,
      letterSpacing: koreanTypographyAdjustments.letterSpacing,
    }
  }

  return basePreset
}

/**
 * TypeScript types for typography tokens
 */
export type FontFamilyToken = keyof typeof fontFamilyTokens
export type FontSizeToken = keyof typeof fontSizeTokens
export type FontWeightToken = keyof typeof fontWeightTokens
export type LineHeightToken = keyof typeof lineHeightTokens
export type LetterSpacingToken = keyof typeof letterSpacingTokens
export type TypographyPreset = keyof typeof typographyPresets

/**
 * Typography token documentation
 *
 * USAGE EXAMPLES:
 *
 * 1. Using typography presets:
 * ```tsx
 * <Text style={typographyPresets.headingLarge}>Heading</Text>
 * ```
 *
 * 2. Korean text optimization:
 * ```tsx
 * <Text style={getTypographyPreset("bodyMedium", true)}>한글 텍스트</Text>
 * ```
 *
 * 3. Custom typography:
 * ```tsx
 * <Text style={{
 *   fontFamily: fontFamilyTokens.primary.semiBold,
 *   fontSize: fontSizeTokens["body-lg"],
 *   lineHeight: fontSizeTokens["body-lg"] * lineHeightTokens.relaxed,
 * }}>
 *   Custom text
 * </Text>
 * ```
 */
