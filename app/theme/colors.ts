import { createOverlays, createThemeColors } from "./colorsBase"

/**
 * Korean Karaoke theme - Modern neon-inspired design
 * Refactored to use the unified base color system
 */
const karaokeSpecific = {
  // Korean Karaoke Primary - Modern neon-inspired tones
  primary100: "#E8F3FF", // Light blue-tint
  primary200: "#B3D9FF", // Sky blue
  primary300: "#66B8FF", // Bright blue
  primary400: "#1A90FF", // Karaoke blue
  primary500: "#0066CC", // Main karaoke blue
  primary600: "#004499", // Dark karaoke blue

  // Korean Karaoke Secondary - Warm accent tones
  secondary100: "#FFF9E6", // Light gold
  secondary200: "#FFE6B3", // Soft gold
  secondary300: "#FFCC66", // Medium gold
  secondary400: "#FFB31A", // Bright gold
  secondary500: "#FF9900", // Korean karaoke gold

  // Accent - Gold/Yellow highlights
  accent100: "#FFFACD",
  accent200: "#FFEAA7",
  accent300: "#FDCB6E",
  accent400: "#E17055",
  accent500: "#D63031",

  // Blue-tinted overlays for karaoke theme
  ...createOverlays(0, 102, 204), // Blue overlay
}

const palette = createThemeColors(karaokeSpecific)

export const colors = {
  /**
   * The palette is available to use, but prefer using the name.
   * This is only included for rare, one-off cases. Try to use
   * semantic names as much as possible.
   */
  palette,
  /**
   * A helper for making something see-thru.
   */
  transparent: "rgba(0, 0, 0, 0)",
  /**
   * The default text color in many components.
   */
  text: palette.neutral800,
  /**
   * Secondary text information.
   */
  textDim: palette.neutral600,
  /**
   * The default color of the screen background.
   */
  background: palette.secondary500,
  /**
   * The default border color.
   */
  border: palette.neutral400,
  /**
   * The main tinting color.
   */
  tint: palette.primary500,
  /**
   * The inactive tinting color.
   */
  tintInactive: palette.neutral300,
  /**
   * Primary action color (main CTA buttons, active tabs).
   */
  primaryAction: palette.primary500,
  /**
   * Secondary action color (secondary buttons, highlights, icons).
   */
  secondaryAction: palette.primary300,
  /**
   * Selected/focused item color.
   */
  selected: palette.primary300,
  /**
   * Icon accent color.
   */
  iconAccent: palette.primary300,
  /**
   * A subtle color used for lines.
   */
  separator: palette.neutral300,
  /**
   * Error messages.
   */
  error: palette.error500,
  /**
   * Error Background.
   */
  errorBackground: palette.error100,
} as const
