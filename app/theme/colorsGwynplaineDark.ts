import { baseDarkColors, createDarkOverlays, createDarkThemeColors } from "./colorsBaseDark"

const gwynplaineDarkSpecific = {
  // Gwynplaine Wine/Burgundy (darker variants for dark theme)
  primary600: "#FCE4EC",
  primary500: "#F8BBD9",
  primary400: "#F48FB1",
  primary300: "#F06292",
  primary200: "#AD1457", // Deep wine/burgundy - main color
  primary100: "#880E4F", // Dark burgundy

  // Brown/Tan (darker variants for dark theme)
  secondary500: "#EFEBE9",
  secondary400: "#D7CCC8",
  secondary300: "#BCAAA4",
  secondary200: "#A1887F",
  secondary100: "#8D6E63", // Medium brown

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
  separator: palette.neutral300,
  error: palette.angry500,
  errorBackground: palette.angry100,
} as const