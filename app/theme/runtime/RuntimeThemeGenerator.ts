/**
 * Runtime Theme Generator
 *
 * Generates themes dynamically at runtime based on user input.
 * Automatically creates color palettes and ensures WCAG compliance.
 */

import { ThemeBuilder } from "../factory/ThemeBuilder"
import type { Theme, WickedCharacterTheme } from "../types"
import type { PaletteGenerationOptions, GeneratedPalette } from "../factory/types"
import {
  generateShades,
  getComplementary,
  getAnalogous,
  getTriadic,
  ensureWCAGCompliance,
  createOverlays,
  isValidHexColor,
  hexToHsl,
  saturate,
} from "./colorUtils"

export class RuntimeThemeGenerator {
  /**
   * Generate a complete theme from a single base color
   * @param baseColor Primary color (hex format)
   * @param options Generation options
   * @returns Generated theme
   */
  static generateFromColor(
    baseColor: string,
    options: {
      name?: string
      isDark?: boolean
      wickedCharacter?: WickedCharacterTheme
      ensureWCAGCompliance?: boolean
    } = {},
  ): Theme {
    // Validate color format
    if (!isValidHexColor(baseColor)) {
      throw new Error(`Invalid hex color: ${baseColor}`)
    }

    const {
      name = "Custom Theme",
      isDark = false,
      wickedCharacter,
      ensureWCAGCompliance: ensureCompliance = true,
    } = options

    // Generate color palette
    const palette = this.generatePalette({
      baseColor,
      generateComplementary: true,
      ensureWCAGCompliance: ensureCompliance,
    })

    // Build theme using ThemeBuilder
    const builder = new ThemeBuilder()
      .setId(`custom-${Date.now()}`)
      .setName(name)
      .setDark(isDark)

    if (wickedCharacter) {
      builder.setWickedCharacter(wickedCharacter)
    }

    // Set primary colors
    builder.setPrimaryColors({
      100: palette.primary[100],
      200: palette.primary[200],
      300: palette.primary[300],
      400: palette.primary[400],
      500: palette.primary[500],
      600: palette.primary[600],
    })

    // Set secondary colors
    builder.setSecondaryColors({
      100: palette.secondary[100],
      200: palette.secondary[200],
      300: palette.secondary[300],
      400: palette.secondary[400],
      500: palette.secondary[500],
    })

    // Set accent colors if generated
    if (palette.accent) {
      builder.setAccentColors({
        100: palette.accent[100],
        200: palette.accent[200],
        300: palette.accent[300],
        400: palette.accent[400],
        500: palette.accent[500],
      })
    }

    // Set overlays
    builder.addColor("overlay20" as any, palette.overlays.overlay20)
    builder.addColor("overlay50" as any, palette.overlays.overlay50)

    return builder.build()
  }

  /**
   * Generate a color palette from options
   * @param options Palette generation options
   * @returns Generated color palette
   */
  static generatePalette(options: PaletteGenerationOptions): GeneratedPalette {
    const {
      baseColor,
      generateComplementary = true,
      generateAnalogous = false,
      generateTriadic = false,
      ensureWCAGCompliance: ensureCompliance = true,
      targetContrastRatio = 4.5,
    } = options

    // Generate primary color shades
    const primaryShades = generateShades(baseColor, 6)

    // Determine secondary color
    let secondaryBaseColor: string
    if (generateComplementary) {
      secondaryBaseColor = getComplementary(baseColor)
    } else if (generateAnalogous) {
      const [color1] = getAnalogous(baseColor)
      secondaryBaseColor = color1
    } else if (generateTriadic) {
      const [color1] = getTriadic(baseColor)
      secondaryBaseColor = color1
    } else {
      // Default to a desaturated version of base color
      secondaryBaseColor = saturate(baseColor, -30)
    }

    // Generate secondary color shades
    const secondaryShades = generateShades(secondaryBaseColor, 5)

    // Generate accent colors (optional)
    let accentShades: GeneratedPalette["accent"]
    if (generateTriadic) {
      const [, color2] = getTriadic(baseColor)
      accentShades = generateShades(color2, 5) as any
    }

    // Generate overlays
    const overlays = createOverlays(baseColor)

    // Ensure WCAG compliance if requested
    if (ensureCompliance) {
      // Adjust primary500 for text on light background
      primaryShades[500] = ensureWCAGCompliance(
        primaryShades[500],
        "#FFFFFF",
        targetContrastRatio,
      )

      // Adjust secondary500
      secondaryShades[500] = ensureWCAGCompliance(
        secondaryShades[500],
        "#FFFFFF",
        targetContrastRatio,
      )

      // Regenerate shades based on adjusted base colors
      const adjustedPrimaryShades = generateShades(primaryShades[500], 6)
      const adjustedSecondaryShades = generateShades(secondaryShades[500], 5)

      return {
        primary: adjustedPrimaryShades as GeneratedPalette["primary"],
        secondary: adjustedSecondaryShades as GeneratedPalette["secondary"],
        accent: accentShades,
        overlays,
      }
    }

    return {
      primary: primaryShades as GeneratedPalette["primary"],
      secondary: secondaryShades as GeneratedPalette["secondary"],
      accent: accentShades,
      overlays,
    }
  }

  /**
   * Generate theme from multiple colors
   * @param colors Color configuration
   * @param options Additional options
   * @returns Generated theme
   */
  static generateFromColors(
    colors: {
      primary: string
      secondary?: string
      accent?: string
    },
    options: {
      name?: string
      isDark?: boolean
      wickedCharacter?: WickedCharacterTheme
    } = {},
  ): Theme {
    const {
      name = "Multi-Color Theme",
      isDark = false,
      wickedCharacter,
    } = options

    // Generate shades for each color
    const primaryShades = generateShades(colors.primary, 6)
    const secondaryShades = colors.secondary
      ? generateShades(colors.secondary, 5)
      : generateShades(getComplementary(colors.primary), 5)
    const accentShades = colors.accent
      ? generateShades(colors.accent, 5)
      : undefined

    // Build theme
    const builder = new ThemeBuilder()
      .setId(`multi-color-${Date.now()}`)
      .setName(name)
      .setDark(isDark)

    if (wickedCharacter) {
      builder.setWickedCharacter(wickedCharacter)
    }

    builder.setPrimaryColors(primaryShades as any)
    builder.setSecondaryColors(secondaryShades as any)

    if (accentShades) {
      builder.setAccentColors(accentShades as any)
    }

    const overlays = createOverlays(colors.primary)
    builder.addColor("overlay20" as any, overlays.overlay20)
    builder.addColor("overlay50" as any, overlays.overlay50)

    return builder.build()
  }

  /**
   * Generate a random theme
   * @param options Theme options
   * @returns Random generated theme
   */
  static generateRandom(options: {
    isDark?: boolean
    wickedCharacter?: WickedCharacterTheme
  } = {}): Theme {
    // Generate random hue (0-360)
    const hue = Math.floor(Math.random() * 360)
    // Random saturation (40-80% for vibrant but not overwhelming colors)
    const saturation = Math.floor(Math.random() * 40) + 40
    // Lightness based on isDark
    const lightness = options.isDark ? Math.floor(Math.random() * 20) + 30 : Math.floor(Math.random() * 20) + 50

    // Convert HSL to hex
    const baseColor = this.hslToHex(hue, saturation, lightness)

    return this.generateFromColor(baseColor, {
      name: `Random ${options.isDark ? "Dark" : "Light"}`,
      isDark: options.isDark,
      wickedCharacter: options.wickedCharacter,
    })
  }

  /**
   * Convert HSL to hex (helper method)
   */
  private static hslToHex(h: number, s: number, l: number): string {
    const hDecimal = h / 360
    const sDecimal = s / 100
    const lDecimal = l / 100

    let r: number, g: number, b: number

    if (sDecimal === 0) {
      r = g = b = lDecimal
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
      }

      const q = lDecimal < 0.5 ? lDecimal * (1 + sDecimal) : lDecimal + sDecimal - lDecimal * sDecimal
      const p = 2 * lDecimal - q

      r = hue2rgb(p, q, hDecimal + 1 / 3)
      g = hue2rgb(p, q, hDecimal)
      b = hue2rgb(p, q, hDecimal - 1 / 3)
    }

    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16)
      return hex.length === 1 ? "0" + hex : hex
    }

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  /**
   * Preview palette without creating full theme
   * @param baseColor Base color
   * @returns Color palette preview
   */
  static previewPalette(baseColor: string): {
    primary: string[]
    secondary: string[]
    accent?: string[]
  } {
    const palette = this.generatePalette({
      baseColor,
      generateComplementary: true,
      generateTriadic: true,
    })

    return {
      primary: Object.values(palette.primary),
      secondary: Object.values(palette.secondary),
      accent: palette.accent ? Object.values(palette.accent) : undefined,
    }
  }
}
