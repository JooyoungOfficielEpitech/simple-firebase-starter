/**
 * Theme Factory Type Definitions
 *
 * Provides TypeScript types for dynamic theme generation, validation, and manipulation.
 * All generated themes must maintain WCAG 2.1 AA compliance.
 */

import type { Theme, Colors, Spacing, Typography, Timing, WickedCharacterTheme } from "../types"

/**
 * Theme configuration for dynamic theme creation
 */
export interface ThemeConfig {
  /** Unique identifier for the theme */
  id: string
  /** Human-readable theme name */
  name: string
  /** Whether this is a dark theme variant */
  isDark: boolean
  /** Wicked character association (optional for custom themes) */
  wickedCharacter?: WickedCharacterTheme
  /** Color palette configuration */
  colors: Partial<Colors>
  /** Spacing configuration (optional, defaults to standard) */
  spacing?: Partial<Spacing>
  /** Typography configuration (optional, defaults to standard) */
  typography?: Partial<Typography>
  /** Timing configuration (optional, defaults to standard) */
  timing?: Partial<Timing>
}

/**
 * Theme validation result
 */
export interface ThemeValidationResult {
  /** Whether the theme is valid */
  isValid: boolean
  /** List of validation errors */
  errors: ThemeValidationError[]
  /** List of validation warnings (non-critical issues) */
  warnings: ThemeValidationWarning[]
  /** WCAG compliance check result */
  accessibility: AccessibilityValidation
}

/**
 * Theme validation error
 */
export interface ThemeValidationError {
  /** Error type identifier */
  type: "missing_required_color" | "invalid_color_format" | "missing_semantic_mapping" | "type_mismatch"
  /** Human-readable error message */
  message: string
  /** Field that caused the error */
  field: string
  /** Suggested fix (if applicable) */
  suggestion?: string
}

/**
 * Theme validation warning
 */
export interface ThemeValidationWarning {
  /** Warning type identifier */
  type: "low_contrast" | "similar_colors" | "missing_optional_field"
  /** Human-readable warning message */
  message: string
  /** Field that caused the warning */
  field: string
  /** Severity level */
  severity: "low" | "medium" | "high"
}

/**
 * WCAG 2.1 AA accessibility validation result
 */
export interface AccessibilityValidation {
  /** Whether the theme meets WCAG 2.1 AA standards */
  meetsWCAG_AA: boolean
  /** Contrast ratio checks */
  contrastChecks: ContrastCheck[]
  /** Overall accessibility score (0-100) */
  score: number
}

/**
 * Individual contrast ratio check
 */
export interface ContrastCheck {
  /** Color pair being checked */
  pair: { foreground: string; background: string }
  /** Calculated contrast ratio */
  ratio: number
  /** Whether it meets WCAG AA for normal text (4.5:1) */
  meetsAA_Normal: boolean
  /** Whether it meets WCAG AA for large text (3:1) */
  meetsAA_Large: boolean
  /** Field names for the color pair */
  fieldNames: { foreground: string; background: string }
}

/**
 * Theme merge strategy
 */
export type ThemeMergeStrategy = "override" | "merge" | "preserve"

/**
 * Theme extension options
 */
export interface ThemeExtensionOptions {
  /** Base theme to extend from */
  baseTheme: Theme
  /** Partial overrides */
  overrides: Partial<ThemeConfig>
  /** Merge strategy for conflicts */
  mergeStrategy?: ThemeMergeStrategy
}

/**
 * Theme preset configuration
 */
export interface ThemePreset {
  /** Preset identifier */
  id: string
  /** Preset name */
  name: string
  /** Preset description */
  description: string
  /** Light theme configuration */
  light: ThemeConfig
  /** Dark theme configuration */
  dark: ThemeConfig
  /** Preview colors for UI */
  preview: {
    primary: string
    secondary: string
    accent: string
  }
}

/**
 * Color palette generation options
 */
export interface PaletteGenerationOptions {
  /** Base color (hex format) */
  baseColor: string
  /** Generate complementary colors */
  generateComplementary?: boolean
  /** Generate analogous colors */
  generateAnalogous?: boolean
  /** Generate triadic colors */
  generateTriadic?: boolean
  /** Automatically adjust for WCAG compliance */
  ensureWCAGCompliance?: boolean
  /** Target contrast ratio (default: 4.5 for AA normal text) */
  targetContrastRatio?: number
}

/**
 * Generated color palette
 */
export interface GeneratedPalette {
  /** Primary color shades (100-600) */
  primary: {
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
  }
  /** Secondary color shades (100-500) */
  secondary: {
    100: string
    200: string
    300: string
    400: string
    500: string
  }
  /** Accent color shades (100-500, optional) */
  accent?: {
    100: string
    200: string
    300: string
    400: string
    500: string
  }
  /** Generated overlay colors */
  overlays: {
    overlay20: string
    overlay50: string
  }
}

/**
 * Theme builder fluent API result
 */
export interface ThemeBuilderResult {
  /** Built theme configuration */
  config: ThemeConfig
  /** Validation result */
  validation: ThemeValidationResult
  /** Built theme object (only if validation passed) */
  theme?: Theme
}
