/**
 * Theme Factory Module
 *
 * Exports all theme factory components for dynamic theme creation and management.
 */

export { ThemeFactory } from "./ThemeFactory"
export { ThemeBuilder } from "./ThemeBuilder"
export {
  themePresets,
  elphabaPreset,
  glindaPreset,
  gwynplainePreset,
  johannaPreset,
  legacyKaraokePreset,
  getPresetById,
  getWickedPresets,
  getAllPreviewColors,
} from "./presets"
export type {
  ThemeConfig,
  ThemeValidationResult,
  ThemeValidationError,
  ThemeValidationWarning,
  AccessibilityValidation,
  ContrastCheck,
  ThemeMergeStrategy,
  ThemeExtensionOptions,
  ThemePreset,
  PaletteGenerationOptions,
  GeneratedPalette,
  ThemeBuilderResult,
} from "./types"
