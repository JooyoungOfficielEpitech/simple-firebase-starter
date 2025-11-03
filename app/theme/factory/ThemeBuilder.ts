/**
 * Theme Builder - Fluent API for building themes
 *
 * Provides a chainable API for creating themes with validation.
 * Implements the Builder pattern for intuitive theme construction.
 *
 * @example
 * ```typescript
 * const theme = new ThemeBuilder()
 *   .setId("custom-ocean")
 *   .setName("Ocean Blue")
 *   .setDark(false)
 *   .setColors({
 *     primary100: "#E3F2FD",
 *     primary500: "#2196F3",
 *     secondary500: "#00BCD4"
 *   })
 *   .build()
 * ```
 */

import { ThemeFactory } from "./ThemeFactory"
import type { Theme, Colors, Spacing, Typography, Timing, WickedCharacterTheme } from "../types"
import type { ThemeConfig, ThemeBuilderResult, ThemeValidationResult } from "./types"

export class ThemeBuilder {
  private config: Partial<ThemeConfig> = {}

  /**
   * Set theme ID
   * @param id Unique theme identifier
   */
  setId(id: string): this {
    this.config.id = id
    return this
  }

  /**
   * Set theme name
   * @param name Human-readable theme name
   */
  setName(name: string): this {
    this.config.name = name
    return this
  }

  /**
   * Set whether theme is dark variant
   * @param isDark Dark theme flag
   */
  setDark(isDark: boolean): this {
    this.config.isDark = isDark
    return this
  }

  /**
   * Set Wicked character association
   * @param character Wicked character theme
   */
  setWickedCharacter(character: WickedCharacterTheme): this {
    this.config.wickedCharacter = character
    return this
  }

  /**
   * Set color palette
   * @param colors Partial or full color configuration
   */
  setColors(colors: Partial<Colors>): this {
    this.config.colors = {
      ...this.config.colors,
      ...colors,
    } as Partial<Colors>
    return this
  }

  /**
   * Add individual color
   * @param key Color key
   * @param value Color value (hex or rgba)
   */
  addColor(key: keyof Colors, value: string): this {
    this.config.colors = {
      ...this.config.colors,
      [key]: value
    } as Partial<Colors>
    return this
  }

  /**
   * Set primary color palette
   * @param shades Primary color shades (100-600)
   */
  setPrimaryColors(shades: {
    100?: string
    200?: string
    300?: string
    400?: string
    500?: string
    600?: string
  }): this {
    const primaryColors: Record<string, string> = {}
    Object.entries(shades).forEach(([shade, color]) => {
      const key = `primary${shade}`
      primaryColors[key] = color
    })

    this.config.colors = {
      ...this.config.colors,
      ...primaryColors
    } as Partial<Colors>

    return this
  }

  /**
   * Set secondary color palette
   * @param shades Secondary color shades (100-500)
   */
  setSecondaryColors(shades: {
    100?: string
    200?: string
    300?: string
    400?: string
    500?: string
  }): this {
    const secondaryColors: Record<string, string> = {}
    Object.entries(shades).forEach(([shade, color]) => {
      const key = `secondary${shade}`
      secondaryColors[key] = color
    })

    this.config.colors = {
      ...this.config.colors,
      ...secondaryColors
    } as Partial<Colors>

    return this
  }

  /**
   * Set accent color palette
   * @param shades Accent color shades (100-500)
   */
  setAccentColors(shades: {
    100?: string
    200?: string
    300?: string
    400?: string
    500?: string
  }): this {
    const accentColors: Record<string, string> = {}
    Object.entries(shades).forEach(([shade, color]) => {
      const key = `accent${shade}`
      accentColors[key] = color
    })

    this.config.colors = {
      ...this.config.colors,
      ...accentColors
    } as Partial<Colors>

    return this
  }

  /**
   * Set spacing configuration
   * @param spacing Spacing configuration
   */
  setSpacing(spacing: Partial<Spacing>): this {
    this.config.spacing = {
      ...this.config.spacing,
      ...spacing,
    } as Spacing
    return this
  }

  /**
   * Set typography configuration
   * @param typography Typography configuration
   */
  setTypography(typography: Partial<Typography>): this {
    this.config.typography = {
      ...this.config.typography,
      ...typography,
    } as Typography
    return this
  }

  /**
   * Set timing configuration
   * @param timing Timing configuration
   */
  setTiming(timing: Partial<Timing>): this {
    this.config.timing = {
      ...this.config.timing,
      ...timing,
    } as Timing
    return this
  }

  /**
   * Validate the current configuration without building
   * @returns Validation result
   */
  validate(): ThemeValidationResult {
    const fullConfig: ThemeConfig = {
      id: this.config.id || "unnamed-theme",
      name: this.config.name || "Unnamed Theme",
      isDark: this.config.isDark ?? false,
      colors: this.config.colors || {},
      wickedCharacter: this.config.wickedCharacter,
      spacing: this.config.spacing,
      typography: this.config.typography,
      timing: this.config.timing,
    }

    return ThemeFactory.validateTheme(fullConfig)
  }

  /**
   * Build the theme
   * @param throwOnError Whether to throw error on validation failure (default: true)
   * @returns Built theme or builder result with validation errors
   */
  build(throwOnError: boolean = true): Theme {
    const fullConfig: ThemeConfig = {
      id: this.config.id || "unnamed-theme",
      name: this.config.name || "Unnamed Theme",
      isDark: this.config.isDark ?? false,
      colors: this.config.colors || {},
      wickedCharacter: this.config.wickedCharacter,
      spacing: this.config.spacing,
      typography: this.config.typography,
      timing: this.config.timing,
    }

    if (throwOnError) {
      return ThemeFactory.createTheme(fullConfig)
    } else {
      try {
        return ThemeFactory.createTheme(fullConfig)
      } catch (error) {
        console.warn("Theme build failed:", error)
        throw error
      }
    }
  }

  /**
   * Build and return full result with validation details
   * @returns Builder result with config, validation, and theme (if valid)
   */
  buildWithValidation(): ThemeBuilderResult {
    const fullConfig: ThemeConfig = {
      id: this.config.id || "unnamed-theme",
      name: this.config.name || "Unnamed Theme",
      isDark: this.config.isDark ?? false,
      colors: this.config.colors || {},
      wickedCharacter: this.config.wickedCharacter,
      spacing: this.config.spacing,
      typography: this.config.typography,
      timing: this.config.timing,
    }

    const validation = ThemeFactory.validateTheme(fullConfig)

    let theme: Theme | undefined
    if (validation.isValid) {
      try {
        theme = ThemeFactory.createTheme(fullConfig)
      } catch (error) {
        console.warn("Theme creation failed despite validation:", error)
      }
    }

    return {
      config: fullConfig,
      validation,
      theme,
    }
  }

  /**
   * Reset builder to initial state
   */
  reset(): this {
    this.config = {}
    return this
  }

  /**
   * Clone the current builder
   * @returns New builder with same configuration
   */
  clone(): ThemeBuilder {
    const newBuilder = new ThemeBuilder()
    newBuilder.config = { ...this.config }
    if (this.config.colors) {
      newBuilder.config.colors = { ...this.config.colors }
    }
    if (this.config.spacing) {
      newBuilder.config.spacing = { ...this.config.spacing }
    }
    if (this.config.typography) {
      newBuilder.config.typography = { ...this.config.typography }
    }
    if (this.config.timing) {
      newBuilder.config.timing = { ...this.config.timing }
    }
    return newBuilder
  }

  /**
   * Get current configuration
   * @returns Current partial configuration
   */
  getConfig(): Partial<ThemeConfig> {
    return { ...this.config }
  }
}
