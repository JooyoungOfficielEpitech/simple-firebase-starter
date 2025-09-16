const palette = {
  // Dark theme neutrals (inverted for dark mode)
  neutral900: "#FFFFFF",
  neutral800: "#F8F8F8",
  neutral700: "#E5E5E5",
  neutral600: "#B8B8B8",
  neutral500: "#8A8A8A",
  neutral400: "#5C5C5C",
  neutral300: "#2E2E2E",
  neutral200: "#1A1A1A",
  neutral100: "#000000",

  // Wicked Green (darker variants for dark theme)
  primary600: "#E8F5E8",
  primary500: "#C3E6C3",
  primary400: "#9DD69D",
  primary300: "#76C676",
  primary200: "#4FB84F", // Main green
  primary100: "#228B22", // Forest green

  // Wicked Pink (darker variants for dark theme)
  secondary500: "#FFF0F5",
  secondary400: "#FFCCE0",
  secondary300: "#FF99CC",
  secondary200: "#FF66B8",
  secondary100: "#FF1493", // Hot pink

  // Accent colors for dark theme
  accent500: "#FFFACD",
  accent400: "#FFEAA7",
  accent300: "#FDCB6E",
  accent200: "#E17055",
  accent100: "#D63031",

  // Error states
  angry100: "#FFE5E5",
  angry500: "#E74C3C",

  // Dark overlays with green tint
  overlay20: "rgba(34, 139, 34, 0.3)",
  overlay50: "rgba(34, 139, 34, 0.6)",
} as const

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
