import { baseDarkColors, createDarkOverlays, createDarkThemeColors } from "./colorsBaseDark"

const gwynplaineDarkSpecific = {
  // Gwynplaine Wine (darker variants for dark theme)
  primary600: "#FDF2F8",
  primary500: "#FCE7F3",
  primary400: "#F687B3",
  primary300: "#ED64A6",
  primary200: "#722F37", // Deep wine red - main color
  primary100: "#4A1E22", // Dark wine

  // Brown (darker variants for dark theme)
  secondary500: "#FEFDFB",
  secondary400: "#F7F3E9",
  secondary300: "#D4B887",
  secondary200: "#A0522D",
  secondary100: "#8B4513", // Rich brown

  // Silver accent colors
  accent500: baseDarkColors.silverAccent500,
  accent400: baseDarkColors.silverAccent400,
  accent300: baseDarkColors.silverAccent300,
  accent200: baseDarkColors.silverAccent200,
  accent100: baseDarkColors.silverAccent100,

  // Wine/burgundy-tinted overlays
  ...createDarkOverlays(173, 20, 87),
}

const palette = createDarkThemeColors(gwynplaineDarkSpecific)

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