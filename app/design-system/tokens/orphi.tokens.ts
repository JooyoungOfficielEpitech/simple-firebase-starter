/**
 * Orphi Design System Tokens
 *
 * 뮤지컬 배우를 위한 플랫폼 Orphi의 디자인 토큰
 *
 * @see design-spec/FINAL-REPORT.md
 */

// Theme configuration
export type ThemeName = 'elphaba' | 'glinda' | 'gwynplaine' | 'johanna'

export interface Theme {
  name: ThemeName
  displayName: string
  emoji: string
  quote: string
  colors: {
    primary600: string
    primary400: string
    primary100: string
    gradient: readonly [string, string]
  }
}

export const themes: Record<ThemeName, Theme> = {
  elphaba: {
    name: 'elphaba',
    displayName: '엘파바',
    emoji: '🟢',
    quote: '"누구나 세상을 날아오를 수 있어"',
    colors: {
      primary600: '#2e7d32',
      primary400: '#66bb6a',
      primary100: 'rgba(46, 125, 50, 0.082)',
      gradient: ['#2e7d32', '#66bb6a'] as const,
    },
  },
  glinda: {
    name: 'glinda',
    displayName: '글린다',
    emoji: '🌸',
    quote: '"인기가 많아질거야!"',
    colors: {
      primary600: '#c2185b',
      primary400: '#f06292',
      primary100: 'rgba(194, 24, 91, 0.082)',
      gradient: ['#c2185b', '#f06292'] as const,
    },
  },
  gwynplaine: {
    name: 'gwynplaine',
    displayName: '그윈플렌',
    emoji: '🍷',
    quote: '"부자들의 낙원은..."',
    colors: {
      primary600: '#8d6e63',
      primary400: '#a1887f',
      primary100: 'rgba(141, 110, 99, 0.082)',
      gradient: ['#8d6e63', '#a1887f'] as const,
    },
  },
  johanna: {
    name: 'johanna',
    displayName: '조안나',
    emoji: '🕊️',
    quote: '"날 수 없는 난 노래해"',
    colors: {
      primary600: '#3f7cac',
      primary400: '#64b5f6',
      primary100: 'rgba(63, 124, 172, 0.082)',
      gradient: ['#3f7cac', '#64b5f6'] as const,
    },
  },
} as const

export const orphiTokens = {
  colors: {
    // Primary Colors (Green - Default Elphaba theme)
    green600: '#2e7d32',
    green400: '#66bb6a',
    green100: 'rgba(46, 125, 50, 0.082)',
    green400_10: 'rgba(102, 187, 106, 0.082)',

    // Neutral Colors
    gray900: '#111827',
    gray700: '#374151',
    gray600: '#4b5563',
    gray500: '#6b7280',
    gray400: '#9ca3af',
    gray200: '#e5e7eb',
    gray50: '#f9fafb',

    // White variations
    white: '#ffffff',
    white95: 'rgba(255, 255, 255, 0.95)',
    white80: 'rgba(255, 255, 255, 0.8)',

    // Accent Colors
    red500: '#ef4444',
    orange300: '#fbbf24',
    orange600: '#ea580c',
    orange800: '#9a3412',
    yellow50: '#fffbeb',

    // Background
    background: '#f9fafb',
  },

  gradients: {
    // Primary Header Gradient (135deg)
    greenPrimary: ['#2e7d32', '#66bb6a'],

    // Background Gradient
    grayBackground: ['#f9fafb', '#f3f4f6'],

    // Alternative gradients
    greenHorizontal: ['#2e7d32', '#66bb6a'],
    grayDark: ['#9ca3af', '#6b7280'],
  },

  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 24,
      '2xl': 32,
    },

    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },

    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 48,
  },

  borderRadius: {
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    full: 9999,

    // Special cases
    bottomSheet: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
    header: {
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
      elevation: 10,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 25 },
      shadowOpacity: 0.25,
      shadowRadius: 50,
      elevation: 25,
    },
  },

  transitions: {
    default: 200,
    fast: 150,
    slow: 300,
  },
} as const

export type OrphiTokens = typeof orphiTokens
