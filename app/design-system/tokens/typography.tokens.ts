/**
 * Typography Tokens - 타이포그래피 스케일
 */

import { typography as baseTypography } from "@/theme/typography"

export const fontSizes = {
  xxs: 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
} as const

export const lineHeights = {
  tight: 1.2,
  snug: 1.4,
  normal: 1.5,
  relaxed: 1.6,
  loose: 1.75,
} as const

export const fontWeights = {
  light: "300",
  normal: "400",
  medium: "500",
  semiBold: "600",
  bold: "700",
} as const

export const typographyPresets = {
  h1: {
    fontSize: fontSizes.xxxl,
    lineHeight: fontSizes.xxxl * lineHeights.tight,
    fontWeight: fontWeights.bold,
    fontFamily: baseTypography.primary.bold,
  },
  h2: {
    fontSize: fontSizes.xxl,
    lineHeight: fontSizes.xxl * lineHeights.snug,
    fontWeight: fontWeights.semiBold,
    fontFamily: baseTypography.primary.semiBold,
  },
  h3: {
    fontSize: fontSizes.xl,
    lineHeight: fontSizes.xl * lineHeights.snug,
    fontWeight: fontWeights.semiBold,
    fontFamily: baseTypography.primary.semiBold,
  },
  body1: {
    fontSize: fontSizes.md,
    lineHeight: fontSizes.md * lineHeights.normal,
    fontWeight: fontWeights.normal,
    fontFamily: baseTypography.primary.normal,
  },
  body2: {
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm * lineHeights.normal,
    fontWeight: fontWeights.normal,
    fontFamily: baseTypography.primary.normal,
  },
  caption: {
    fontSize: fontSizes.xs,
    lineHeight: fontSizes.xs * lineHeights.normal,
    fontWeight: fontWeights.normal,
    fontFamily: baseTypography.primary.normal,
  },
} as const

export { baseTypography as typography }
