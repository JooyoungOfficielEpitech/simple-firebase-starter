/**
 * Typography Tokens - Colored Sheep Community Design System
 *
 * Platform-specific font families and typography scales
 * Based on REACT_NATIVE_DESIGN_SPEC.json
 */

import { Platform, TextStyle } from "react-native"

/**
 * Font family configuration
 * iOS: SF Pro Text (system default)
 * Android: Roboto (system default)
 */
export const fontFamily = {
  ios: "SF Pro Text",
  android: "Roboto",
  system: Platform.select({
    ios: "-apple-system" as const,
    android: "system-ui" as const,
  }),
  fallback: "sans-serif" as const,
} as const

/**
 * Font weight mapping for cross-platform consistency
 */
export const fontWeights = {
  regular: "400" as TextStyle["fontWeight"],
  bold: "700" as TextStyle["fontWeight"],
} as const

/**
 * Typography scales with platform-specific font families
 * All values in pixels, React Native will handle conversion
 */
export const typography = {
  /**
   * Legacy Ignite boilerplate compatibility
   * @deprecated Use fontFamily and fontWeights instead
   */
  primary: {
    /**
     * Regular weight font
     */
    normal: Platform.select({
      ios: "System",
      android: "normal",
    }),
    /**
     * Medium weight font
     */
    medium: Platform.select({
      ios: "System",
      android: "normal",
    }),
    /**
     * Bold weight font
     */
    bold: Platform.select({
      ios: "System",
      android: "normal",
    }),
  },

  /**
   * Secondary font family (currently same as primary)
   */
  secondary: Platform.select({
    ios: "System",
    android: "normal",
  }),

  /**
   * Code/monospace font family
   */
  code: Platform.select({
    ios: "Courier",
    android: "monospace",
  }),

  /**
   * Heading 1 - Welcome messages, page titles
   * fontSize: 30px, fontWeight: 700, lineHeight: 36px
   */
  h1: {
    fontSize: 30,
    fontWeight: fontWeights.bold,
    lineHeight: 36,
    letterSpacing: 0,
  },

  /**
   * Heading 2 - Header titles
   * fontSize: 24px, fontWeight: 700, lineHeight: 32px
   */
  h2: {
    fontSize: 24,
    fontWeight: fontWeights.bold,
    lineHeight: 32,
    letterSpacing: 0,
  },

  /**
   * Heading 3 - Post titles
   * fontSize: 18px, fontWeight: 700, lineHeight: 28px
   */
  h3: {
    fontSize: 18,
    fontWeight: fontWeights.bold,
    lineHeight: 28,
    letterSpacing: 0,
  },

  /**
   * Body - Default text, descriptions
   * fontSize: 14px, fontWeight: 400, lineHeight: 22.75px
   */
  body: {
    fontSize: 14,
    fontWeight: fontWeights.regular,
    lineHeight: 22.75,
    letterSpacing: 0,
  },

  /**
   * Body Large - Emphasized body text
   * fontSize: 16px, fontWeight: 400, lineHeight: 24px
   */
  bodyLarge: {
    fontSize: 16,
    fontWeight: fontWeights.regular,
    lineHeight: 24,
    letterSpacing: 0,
  },

  /**
   * Body Small - Captions, timestamps
   * fontSize: 12px, fontWeight: 400, lineHeight: 16px
   */
  bodySmall: {
    fontSize: 12,
    fontWeight: fontWeights.regular,
    lineHeight: 16,
    letterSpacing: 0,
  },

  /**
   * Button - Button labels
   * fontSize: 16px, fontWeight: 700, lineHeight: 24px
   */
  button: {
    fontSize: 16,
    fontWeight: fontWeights.bold,
    lineHeight: 24,
    letterSpacing: 0,
  },

  /**
   * Label - Form labels
   * fontSize: 14px, fontWeight: 700, lineHeight: 20px
   */
  label: {
    fontSize: 14,
    fontWeight: fontWeights.bold,
    lineHeight: 20,
    letterSpacing: 0,
  },
} as const

/**
 * Accessibility configuration
 * Supports dynamic type scaling based on system settings
 */
export const accessibility = {
  dynamicType: true,
  minScale: 0.85,
  maxScale: 1.3,
} as const

/**
 * Custom fonts to preload
 * Currently using system fonts, so this is an empty object
 */
export const customFontsToLoad = {}

export type Typography = typeof typography
export type TypographyKey = keyof Typography
