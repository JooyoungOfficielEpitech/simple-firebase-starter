import { baseDarkColors, createDarkOverlays, createDarkThemeColors } from "./colorsBaseDark"

const glindaDarkSpecific = {
  // Glinda Pink (darker variants for dark theme)
  primary600: "#FFF0F5",
  primary500: "#FFCCE0",
  primary400: "#FF99CC",
  primary300: "#FF66B8",
  primary200: "#FF1493", // Hot pink - main color
  primary100: "#DC143C", // Deeper pink

  // Green (darker variants for dark theme)
  secondary500: "#E8F5E8",
  secondary400: "#C3E6C3",
  secondary300: "#9DD69D",
  secondary200: "#76C676",
  secondary100: "#4FB84F", // Supporting green

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
  separator: palette.neutral300,
  error: palette.angry500,
  errorBackground: palette.angry100,
} as const