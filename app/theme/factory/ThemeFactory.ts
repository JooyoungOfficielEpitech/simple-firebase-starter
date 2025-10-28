/**
 * Theme Factory - Core theme creation and validation engine
 *
 * Provides methods for creating, validating, merging, and extending themes.
 * All generated themes are validated for WCAG 2.1 AA compliance.
 */

import { spacing } from "../spacing"
import { spacingDark } from "../spacingDark"
import { timing } from "../timing"
import { typography } from "../typography"
import { baseColors, createSemanticColors } from "../colorsBase"
import type { Theme, Colors } from "../types"
import type {
  ThemeConfig,
  ThemeValidationResult,
  ThemeValidationError,
  ThemeValidationWarning,
  AccessibilityValidation,
  ContrastCheck,
  ThemeExtensionOptions,
  ThemeMergeStrategy,
} from "./types"

/**
 * ThemeFactory - Main theme creation and manipulation engine
 */
export class ThemeFactory {
  /**
   * Create a new theme from configuration
   * @param config Theme configuration
   * @returns Theme object if valid, throws error if invalid
   */
  static createTheme(config: ThemeConfig): Theme {
    // Validate theme configuration
    const validation = this.validateTheme(config)

    if (!validation.isValid) {
      const errorMessages = validation.errors.map((e) => `${e.field}: ${e.message}`).join("\n")
      throw new Error(`Theme validation failed:\n${errorMessages}`)
    }

    // Merge with base colors
    const fullColors = this.mergeWithBaseColors(config.colors)

    // Create semantic colors
    const colors = createSemanticColors(fullColors) as Colors

    // Build complete theme
    const theme: Theme = {
      colors,
      spacing: config.spacing || (config.isDark ? spacingDark : spacing),
      typography: config.typography || typography,
      timing: config.timing || timing,
      isDark: config.isDark,
      wickedCharacter: config.wickedCharacter || "elphaba",
    }

    return theme
  }

  /**
   * Validate a theme configuration
   * @param config Theme configuration to validate
   * @returns Validation result with errors and warnings
   */
  static validateTheme(config: ThemeConfig): ThemeValidationResult {
    const errors: ThemeValidationError[] = []
    const warnings: ThemeValidationWarning[] = []

    // Check required fields
    if (!config.id) {
      errors.push({
        type: "missing_required_color",
        message: "Theme ID is required",
        field: "id",
      })
    }

    if (!config.name) {
      errors.push({
        type: "missing_required_color",
        message: "Theme name is required",
        field: "name",
      })
    }

    // Validate colors
    const colorValidation = this.validateColors(config.colors)
    errors.push(...colorValidation.errors)
    warnings.push(...colorValidation.warnings)

    // Perform accessibility validation
    const accessibility = this.validateAccessibility(config)

    // Add accessibility warnings
    if (!accessibility.meetsWCAG_AA) {
      warnings.push({
        type: "low_contrast",
        message: `Theme does not meet WCAG 2.1 AA standards (score: ${accessibility.score}/100)`,
        field: "colors",
        severity: "high",
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      accessibility,
    }
  }

  /**
   * Validate color configuration
   * @param colors Partial color configuration
   * @returns Validation errors and warnings
   */
  private static validateColors(
    colors: Partial<Colors>,
  ): Pick<ThemeValidationResult, "errors" | "warnings"> {
    const errors: ThemeValidationError[] = []
    const warnings: ThemeValidationWarning[] = []

    // Check for required primary colors
    const requiredPrimaryShades = [100, 200, 300, 400, 500, 600] as const
    requiredPrimaryShades.forEach((shade) => {
      const key = `primary${shade}` as keyof Colors
      if (!colors[key]) {
        warnings.push({
          type: "missing_optional_field",
          message: `Missing primary${shade} color (will use base color)`,
          field: `primary${shade}`,
          severity: "medium",
        })
      }
    })

    // Validate color format (basic hex validation)
    Object.entries(colors).forEach(([key, value]) => {
      if (typeof value === "string" && !this.isValidColor(value)) {
        errors.push({
          type: "invalid_color_format",
          message: `Invalid color format: ${value}`,
          field: key,
          suggestion: "Use hex format (#RRGGBB) or rgba format",
        })
      }
    })

    return { errors, warnings }
  }

  /**
   * Validate WCAG 2.1 AA accessibility compliance
   * @param config Theme configuration
   * @returns Accessibility validation result
   */
  private static validateAccessibility(config: ThemeConfig): AccessibilityValidation {
    const contrastChecks: ContrastCheck[] = []
    const colors = this.mergeWithBaseColors(config.colors)

    // Critical contrast pairs to check
    const criticalPairs = [
      {
        fg: colors.neutral800 || baseColors.neutral800,
        bg: colors.primary100 || colors.neutral100 || baseColors.neutral100,
        fgName: "text",
        bgName: "background",
      },
      {
        fg: colors.neutral600 || baseColors.neutral600,
        bg: colors.primary100 || colors.neutral100 || baseColors.neutral100,
        fgName: "textDim",
        bgName: "background",
      },
      {
        fg: colors.neutral100 || baseColors.neutral100,
        bg: colors.primary500 || baseColors.neutral800,
        fgName: "textLight",
        bgName: "primary",
      },
    ]

    let passedChecks = 0
    criticalPairs.forEach(({ fg, bg, fgName, bgName }) => {
      const ratio = this.calculateContrastRatio(fg, bg)
      const meetsAA_Normal = ratio >= 4.5
      const meetsAA_Large = ratio >= 3.0

      contrastChecks.push({
        pair: { foreground: fg, background: bg },
        ratio,
        meetsAA_Normal,
        meetsAA_Large,
        fieldNames: { foreground: fgName, background: bgName },
      })

      if (meetsAA_Normal) passedChecks++
    })

    const score = Math.round((passedChecks / criticalPairs.length) * 100)
    const meetsWCAG_AA = score >= 80 // At least 80% of checks must pass

    return {
      meetsWCAG_AA,
      contrastChecks,
      score,
    }
  }

  /**
   * Calculate contrast ratio between two colors
   * @param color1 First color (hex or rgba)
   * @param color2 Second color (hex or rgba)
   * @returns Contrast ratio (1-21)
   */
  private static calculateContrastRatio(color1: string, color2: string): number {
    const l1 = this.getRelativeLuminance(color1)
    const l2 = this.getRelativeLuminance(color2)

    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)

    return (lighter + 0.05) / (darker + 0.05)
  }

  /**
   * Calculate relative luminance of a color (WCAG formula)
   * @param color Color in hex or rgba format
   * @returns Relative luminance (0-1)
   */
  private static getRelativeLuminance(color: string): number {
    const rgb = this.hexToRgb(color)
    if (!rgb) return 0

    const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((val) => {
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    })

    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  /**
   * Convert hex color to RGB
   * @param hex Hex color string (#RRGGBB or #RGB)
   * @returns RGB object or null if invalid
   */
  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    // Handle rgba format
    if (hex.startsWith("rgba")) {
      const match = hex.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
      if (match) {
        return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) }
      }
    }

    // Handle hex format
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null
  }

  /**
   * Validate color format
   * @param color Color string
   * @returns Whether the color is valid
   */
  private static isValidColor(color: string): boolean {
    // Check hex format
    if (/^#[0-9A-F]{6}$/i.test(color)) return true
    // Check rgba format
    if (/^rgba?\(\d+,\s*\d+,\s*\d+(?:,\s*[\d.]+)?\)$/.test(color)) return true
    return false
  }

  /**
   * Merge theme colors with base colors
   * @param colors Partial color configuration
   * @returns Full color palette
   */
  private static mergeWithBaseColors(colors: Partial<Colors>): typeof baseColors & Partial<Colors> {
    return {
      ...baseColors,
      ...colors,
    }
  }

  /**
   * Merge two themes together
   * @param base Base theme
   * @param override Theme to merge on top
   * @param strategy Merge strategy (default: "override")
   * @returns Merged theme
   */
  static mergeThemes(base: Theme, override: Partial<Theme>, strategy: ThemeMergeStrategy = "override"): Theme {
    if (strategy === "preserve") {
      // Preserve base theme, only add missing fields from override
      return {
        ...override,
        ...base,
        colors: { ...override.colors, ...base.colors } as Colors,
        spacing: base.spacing || override.spacing,
        typography: base.typography || override.typography,
        timing: base.timing || override.timing,
      } as Theme
    } else if (strategy === "merge") {
      // Deep merge both themes
      return {
        ...base,
        ...override,
        colors: { ...base.colors, ...override.colors } as Colors,
        spacing: { ...base.spacing, ...override.spacing },
        typography: { ...base.typography, ...override.typography },
        timing: { ...base.timing, ...override.timing },
      } as Theme
    } else {
      // Override strategy (default)
      return {
        ...base,
        ...override,
        colors: { ...base.colors, ...override.colors } as Colors,
      } as Theme
    }
  }

  /**
   * Extend an existing theme with partial overrides
   * @param options Extension options
   * @returns New theme with extensions applied
   */
  static extendTheme(options: ThemeExtensionOptions): Theme {
    const { baseTheme, overrides, mergeStrategy = "override" } = options

    // Create config from overrides
    const config: ThemeConfig = {
      id: overrides.id || `${baseTheme.wickedCharacter}-extended`,
      name: overrides.name || `${baseTheme.wickedCharacter} Extended`,
      isDark: overrides.isDark ?? baseTheme.isDark,
      wickedCharacter: overrides.wickedCharacter ?? baseTheme.wickedCharacter,
      colors: overrides.colors || {},
      spacing: overrides.spacing,
      typography: overrides.typography,
      timing: overrides.timing,
    }

    // Create new theme from config
    try {
      const newTheme = this.createTheme(config)
      // Merge with base theme
      return this.mergeThemes(baseTheme, newTheme, mergeStrategy)
    } catch (error) {
      console.warn("Theme extension failed, falling back to base theme:", error)
      return baseTheme
    }
  }
}
