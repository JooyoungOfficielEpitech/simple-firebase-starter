// TODO: write documentation about fonts and typography along with guides on how to add custom fonts in own
// markdown file and add links from here

import { Platform } from "react-native"
import {
  SpaceGrotesk_300Light as spaceGroteskLight,
  SpaceGrotesk_400Regular as spaceGroteskRegular,
  SpaceGrotesk_500Medium as spaceGroteskMedium,
  SpaceGrotesk_600SemiBold as spaceGroteskSemiBold,
  SpaceGrotesk_700Bold as spaceGroteskBold,
} from "@expo-google-fonts/space-grotesk"

export const customFontsToLoad = {
  spaceGroteskLight,
  spaceGroteskRegular,
  spaceGroteskMedium,
  spaceGroteskSemiBold,
  spaceGroteskBold,
}

const fonts = {
  spaceGrotesk: {
    // Cross-platform Google font.
    thin: "spaceGroteskLight", // Using light as thin
    light: "spaceGroteskLight",
    normal: "spaceGroteskRegular",
    medium: "spaceGroteskMedium",
    semiBold: "spaceGroteskSemiBold",
    bold: "spaceGroteskBold",
  },
  helveticaNeue: {
    // iOS only font.
    thin: "HelveticaNeue-Thin",
    light: "HelveticaNeue-Light",
    normal: "Helvetica Neue",
    medium: "HelveticaNeue-Medium",
  },
  courier: {
    // iOS only font.
    normal: "Courier",
  },
  sansSerif: {
    // Android only font.
    thin: "sans-serif-thin",
    light: "sans-serif-light",
    normal: "sans-serif",
    medium: "sans-serif-medium",
  },
  monospace: {
    // Android only font.
    normal: "monospace",
  },
}

/**
 * Platform-specific font fallback system
 * Ensures consistent typography across iOS, Android, and Web
 */
const platformFonts = {
  primary: Platform.select({
    ios: fonts.spaceGrotesk,
    android: fonts.spaceGrotesk,
    default: fonts.spaceGrotesk, // Web fallback
  }),
  secondary: Platform.select({
    ios: fonts.helveticaNeue,
    android: fonts.sansSerif,
    default: fonts.spaceGrotesk, // Web fallback to primary
  }),
  code: Platform.select({
    ios: fonts.courier,
    android: fonts.monospace,
    default: { normal: "monospace" }, // Web fallback
  }),
}

/**
 * Typography scale system with consistent sizing
 * Based on modular scale (1.25 ratio) for harmonious typography
 */
const typographyScale = {
  // Display sizes
  xxxl: 48,
  xxl: 38,
  xl: 30,

  // Heading sizes
  lg: 24,
  md: 19,
  sm: 15,

  // Body sizes
  base: 16,
  xs: 13,
  xxs: 10,

  // Line heights (relative to font size)
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
}

export const typography = {
  /**
   * The fonts are available to use, but prefer using the semantic name.
   */
  fonts,
  /**
   * The primary font. Used in most places.
   */
  primary: platformFonts.primary,
  /**
   * An alternate font used for perhaps titles and stuff.
   */
  secondary: platformFonts.secondary,
  /**
   * Lets get fancy with a monospace font!
   */
  code: platformFonts.code,
  /**
   * Typography scale system for consistent sizing
   */
  sizes: typographyScale,
}
