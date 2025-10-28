/**
 * Color Utilities for Runtime Theme Generation
 *
 * Provides color manipulation functions for generating theme palettes.
 * Includes WCAG compliance adjustments and color transformations.
 */

/**
 * Convert hex color to RGB object
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => {
    const hex = Math.round(x).toString(16)
    return hex.length === 1 ? "0" + hex : hex
  }).join("")
}

/**
 * Convert hex color to HSL
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null

  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

/**
 * Convert HSL to hex color
 */
export function hslToHex(h: number, s: number, l: number): string {
  h = h / 360
  s = s / 100
  l = l / 100

  let r: number, g: number, b: number

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return rgbToHex(r * 255, g * 255, b * 255)
}

/**
 * Lighten a color by a percentage
 */
export function lighten(hex: string, percent: number): string {
  const hsl = hexToHsl(hex)
  if (!hsl) return hex

  const newL = Math.min(100, hsl.l + percent)
  return hslToHex(hsl.h, hsl.s, newL)
}

/**
 * Darken a color by a percentage
 */
export function darken(hex: string, percent: number): string {
  const hsl = hexToHsl(hex)
  if (!hsl) return hex

  const newL = Math.max(0, hsl.l - percent)
  return hslToHex(hsl.h, hsl.s, newL)
}

/**
 * Adjust saturation of a color
 */
export function saturate(hex: string, percent: number): string {
  const hsl = hexToHsl(hex)
  if (!hsl) return hex

  const newS = Math.min(100, Math.max(0, hsl.s + percent))
  return hslToHex(hsl.h, newS, hsl.l)
}

/**
 * Get complementary color (180 degrees on color wheel)
 */
export function getComplementary(hex: string): string {
  const hsl = hexToHsl(hex)
  if (!hsl) return hex

  const newH = (hsl.h + 180) % 360
  return hslToHex(newH, hsl.s, hsl.l)
}

/**
 * Get analogous colors (±30 degrees on color wheel)
 */
export function getAnalogous(hex: string): [string, string] {
  const hsl = hexToHsl(hex)
  if (!hsl) return [hex, hex]

  const color1 = hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l)
  const color2 = hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l)

  return [color1, color2]
}

/**
 * Get triadic colors (±120 degrees on color wheel)
 */
export function getTriadic(hex: string): [string, string] {
  const hsl = hexToHsl(hex)
  if (!hsl) return [hex, hex]

  const color1 = hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l)
  const color2 = hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l)

  return [color1, color2]
}

/**
 * Calculate relative luminance (for WCAG contrast ratio)
 */
export function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0

  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((val) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Calculate contrast ratio between two colors (WCAG 2.1)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const l1 = getRelativeLuminance(color1)
  const l2 = getRelativeLuminance(color2)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Adjust color to meet WCAG AA contrast ratio (4.5:1 for normal text)
 */
export function ensureWCAGCompliance(
  foreground: string,
  background: string,
  targetRatio: number = 4.5,
): string {
  let adjustedColor = foreground
  let ratio = getContrastRatio(adjustedColor, background)

  // If already compliant, return as is
  if (ratio >= targetRatio) {
    return adjustedColor
  }

  const bgLuminance = getRelativeLuminance(background)
  const shouldDarken = bgLuminance > 0.5 // Light background needs dark text

  // Try to adjust lightness to meet ratio
  for (let i = 0; i < 100; i++) {
    if (shouldDarken) {
      adjustedColor = darken(adjustedColor, 2)
    } else {
      adjustedColor = lighten(adjustedColor, 2)
    }

    ratio = getContrastRatio(adjustedColor, background)
    if (ratio >= targetRatio) {
      return adjustedColor
    }
  }

  // If still not compliant, return black or white based on background
  return bgLuminance > 0.5 ? "#000000" : "#FFFFFF"
}

/**
 * Generate color shades (100-600 for primary, 100-500 for secondary)
 */
export function generateShades(
  baseColor: string,
  count: 5 | 6 = 6,
): Record<string, string> {
  const shades: Record<string, string> = {}
  const steps = count === 6 ? [100, 200, 300, 400, 500, 600] : [100, 200, 300, 400, 500]

  // Base color is typically at position 500
  const baseIndex = count === 6 ? 4 : 4
  shades[steps[baseIndex]] = baseColor

  // Generate lighter shades
  for (let i = baseIndex - 1; i >= 0; i--) {
    const lightenAmount = (baseIndex - i) * 15
    shades[steps[i]] = lighten(baseColor, lightenAmount)
  }

  // Generate darker shades
  for (let i = baseIndex + 1; i < steps.length; i++) {
    const darkenAmount = (i - baseIndex) * 12
    shades[steps[i]] = darken(baseColor, darkenAmount)
  }

  return shades
}

/**
 * Create overlay colors with specified RGB tint
 */
export function createOverlays(color: string): { overlay20: string; overlay50: string } {
  const rgb = hexToRgb(color)
  if (!rgb) {
    return {
      overlay20: "rgba(0, 0, 0, 0.25)",
      overlay50: "rgba(0, 0, 0, 0.55)",
    }
  }

  return {
    overlay20: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`,
    overlay50: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.55)`,
  }
}

/**
 * Validate if string is a valid hex color
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color)
}

/**
 * Generate a random hex color
 */
export function randomColor(): string {
  return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")
}
