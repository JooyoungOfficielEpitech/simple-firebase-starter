import { baseDarkColors, createDarkOverlays, createDarkThemeColors } from "./colorsBaseDark"

const elphabaDarkSpecific = {
  // Elphaba Green (darker variants for dark theme)
  primary600: "#E8F5E8",
  primary500: "#C3E6C3",
  primary400: "#9DD69D",
  primary300: "#76C676",
  primary200: "#4FB84F", // Main green
  primary100: "#228B22", // Forest green

  // Black (darker variants for dark theme)
  secondary500: "#F7F7F7",
  secondary400: "#E1E1E1",
  secondary300: "#CFCFCF",
  secondary200: "#6B6B6B",
  secondary100: "#2D2D2D", // Elegant black

  // Gold accent colors
  accent500: baseDarkColors.goldAccent500,
  accent400: baseDarkColors.goldAccent400,
  accent300: baseDarkColors.goldAccent300,
  accent200: baseDarkColors.goldAccent200,
  accent100: baseDarkColors.goldAccent100,

  // Green-tinted overlays
  ...createDarkOverlays(34, 139, 34),
}

const palette = createDarkThemeColors(elphabaDarkSpecific)

export const colors = {
  palette,
  transparent: "rgba(0, 0, 0, 0)",
  text: palette.neutral800,
  textDim: palette.neutral600,
  background: palette.neutral200,
  border: palette.neutral400,
  tint: palette.primary500,
  tintInactive: palette.neutral300,
  primaryAction: palette.primary200,
  secondaryAction: palette.secondary100,
  selected: palette.secondary200,
  iconAccent: palette.secondary100,
  separator: palette.neutral300,
  error: palette.error500,
  errorBackground: palette.error100,
} as const