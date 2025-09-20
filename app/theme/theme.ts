import { colors as colorsLight } from "./colors"
import { colors as colorsDark } from "./colorsDark"
import { colors as colorsElphaba } from "./colorsElphaba"
import { colors as colorsElphabaDark } from "./colorsElphabaDark"
import { colors as colorsGlinda } from "./colorsGlinda"
import { colors as colorsGlindaDark } from "./colorsGlindaDark"
import { colors as colorsGwynplaine } from "./colorsGwynplaine"
import { colors as colorsGwynplaineDark } from "./colorsGwynplaineDark"
import { spacing as spacingLight } from "./spacing"
import { spacing as spacingDark } from "./spacingDark"
import { timing } from "./timing"
import type { Theme, WickedCharacterTheme } from "./types"
import { typography } from "./typography"

// Helper function to get colors based on theme combination
export const getThemeColors = (isDark: boolean, wickedCharacter: WickedCharacterTheme) => {
  if (wickedCharacter === "glinda") {
    return isDark ? colorsGlindaDark : colorsGlinda
  } else if (wickedCharacter === "gwynplaine") {
    return isDark ? colorsGwynplaineDark : colorsGwynplaine
  } else {
    return isDark ? colorsElphabaDark : colorsElphaba
  }
}

// Here we define our themes.
export const lightTheme: Theme = {
  colors: colorsLight,
  spacing: spacingLight,
  typography,
  timing,
  isDark: false,
  wickedCharacter: "elphaba", // Default to Elphaba
}

export const darkTheme: Theme = {
  colors: colorsDark,
  spacing: spacingDark,
  typography,
  timing,
  isDark: true,
  wickedCharacter: "elphaba", // Default to Elphaba
}

// Elphaba themes (green-based)
export const lightElphabaTheme: Theme = {
  colors: colorsElphaba,
  spacing: spacingLight,
  typography,
  timing,
  isDark: false,
  wickedCharacter: "elphaba",
}

export const darkElphabaTheme: Theme = {
  colors: colorsElphabaDark,
  spacing: spacingDark,
  typography,
  timing,
  isDark: true,
  wickedCharacter: "elphaba",
}

// Glinda themes (pink-based)
export const lightGlindaTheme: Theme = {
  colors: colorsGlinda,
  spacing: spacingLight,
  typography,
  timing,
  isDark: false,
  wickedCharacter: "glinda",
}

export const darkGlindaTheme: Theme = {
  colors: colorsGlindaDark,
  spacing: spacingDark,
  typography,
  timing,
  isDark: true,
  wickedCharacter: "glinda",
}

// Gwynplaine themes (purple-based)
export const lightGwynplaineTheme: Theme = {
  colors: colorsGwynplaine,
  spacing: spacingLight,
  typography,
  timing,
  isDark: false,
  wickedCharacter: "gwynplaine",
}

export const darkGwynplaineTheme: Theme = {
  colors: colorsGwynplaineDark,
  spacing: spacingDark,
  typography,
  timing,
  isDark: true,
  wickedCharacter: "gwynplaine",
}
