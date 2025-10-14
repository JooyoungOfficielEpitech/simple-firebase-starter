import { baseDarkColors, createDarkOverlays, createDarkThemeColors } from "./colorsBaseDark"

const glindaDarkSpecific = {
  // Glinda Pink (darker variants for dark theme)
  primary600: "#FFF0F5",
  primary500: "#FFCCE0",
  primary400: "#FF99CC",
  primary300: "#FF66B8",
  primary200: "#FF1493", // Hot pink - main color
  primary100: "#DC143C", // Deeper pink

  // Blonde (darker variants for dark theme)
  secondary500: "#FFFDF7",
  secondary400: "#FFF9E6",
  secondary300: "#F5E6A3",
  secondary200: "#E6CC5A",
  secondary100: "#D4AF37", // Golden blonde

  // Gold accent colors
  accent500: baseDarkColors.goldAccent500,
  accent400: baseDarkColors.goldAccent400,
  accent300: baseDarkColors.goldAccent300,
  accent200: baseDarkColors.goldAccent200,
  accent100: baseDarkColors.goldAccent100,

  // Pink-tinted overlays
  ...createDarkOverlays(220, 20, 60),
}

const palette = createDarkThemeColors(glindaDarkSpecific)

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
  error: palette.angry500,
  errorBackground: palette.angry100,
} as const