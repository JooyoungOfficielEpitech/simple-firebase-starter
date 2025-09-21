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

  // Wicked Green (adapted for dark theme - maintaining semantic meaning)
  primary100: "#E8F5E8", // Lightest green
  primary200: "#C3E6C3",
  primary300: "#9DD69D",
  primary400: "#76C676",
  primary500: "#4FB84F", // Main green
  primary600: "#228B22", // Darker green

  // Wicked Pink (adapted for dark theme - maintaining semantic meaning)
  secondary100: "#FFF0F5", // Lightest pink
  secondary200: "#FFCCE0",
  secondary300: "#FF99CC",
  secondary400: "#FF66B8",
  secondary500: "#FF1493", // Main hot pink

  // Accent colors for dark theme
  accent100: "#FFFACD",
  accent200: "#FFEAA7",
  accent300: "#FDCB6E",
  accent400: "#E17055",
  accent500: "#D63031",

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
