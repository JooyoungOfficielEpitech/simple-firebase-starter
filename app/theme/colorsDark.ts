import { baseDarkColors, createDarkOverlays, createDarkThemeColors } from "./colorsBaseDark"

const darkSpecific = {
  // Korean Karaoke Primary - Modern neon-inspired tones (dark variants)
  primary600: "#E8F3FF", // Light blue-tint  
  primary500: "#B3D9FF", // Sky blue
  primary400: "#66B8FF", // Bright blue
  primary300: "#1A90FF", // Karaoke blue
  primary200: "#0066CC", // Main karaoke blue
  primary100: "#004499", // Dark karaoke blue

  // Korean Karaoke Secondary - Warm accent tones (dark variants)
  secondary500: "#FFF9E6", // Light gold
  secondary400: "#FFE6B3", // Soft gold
  secondary300: "#FFCC66", // Medium gold
  secondary200: "#FFB31A", // Bright gold
  secondary100: "#FF9900", // Korean karaoke gold

  // Accent - Gold/Yellow highlights (dark variants)
  accent500: "#FFFACD",
  accent400: "#FFEAA7",
  accent300: "#FDCB6E",
  accent200: "#E17055",
  accent100: "#D63031",

  // Overlays with blue tint for karaoke theme
  ...createDarkOverlays(26, 102, 204),
}

const palette = createDarkThemeColors(darkSpecific)

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
   * WCAG AA: White text on dark backgrounds meets 21:1 contrast ratio
   */
  text: palette.neutral900, // White text for dark theme
  /**
   * Secondary text information.
   * WCAG AA: Light gray text maintains 7:1 contrast on dark backgrounds
   */
  textDim: palette.neutral700, // Light gray for secondary text
  /**
   * The default color of the screen background.
   * Dark background using nearly black
   */
  background: palette.neutral100, // Dark background
  /**
   * The default border color.
   * Medium gray for visibility on dark backgrounds
   */
  border: palette.neutral500,
  /**
   * The main tinting color.
   */
  tint: palette.primary300,
  /**
   * The inactive tinting color.
   */
  tintInactive: palette.neutral400,
  /**
   * Primary action color (main CTA buttons, active tabs).
   */
  primaryAction: palette.primary300,
  /**
   * Secondary action color (secondary buttons, highlights, icons).
   */
  secondaryAction: palette.secondary200,
  /**
   * Selected/focused item color.
   */
  selected: palette.primary400,
  /**
   * Icon accent color.
   */
  iconAccent: palette.secondary200,
  /**
   * A subtle color used for lines.
   */
  separator: palette.neutral400,
  /**
   * Error messages.
   */
  error: palette.error500,
  /**
   * Error Background.
   */
  errorBackground: palette.error100,
} as const
