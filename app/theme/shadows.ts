/**
 * Shadow Tokens - Colored Sheep Community Design System
 *
 * Platform-specific shadow definitions
 * iOS: shadowColor, shadowOffset, shadowOpacity, shadowRadius
 * Android: elevation
 */

import { ViewStyle } from "react-native"

/**
 * Shadow configuration type
 */
export interface ShadowStyle {
  shadowColor: string
  shadowOffset: { width: number; height: number }
  shadowOpacity: number
  shadowRadius: number
  elevation: number
}

/**
 * Card shadow - Subtle elevation for content cards
 * shadowColor: #111111, offset: (0, 4), opacity: 0.08, radius: 8, elevation: 4
 */
export const cardShadow: ShadowStyle = {
  shadowColor: '#111111',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 4,
}

/**
 * Button shadow - Default button elevation
 * shadowColor: #111111, offset: (0, 6), opacity: 0.12, radius: 14, elevation: 6
 */
export const buttonShadow: ShadowStyle = {
  shadowColor: '#111111',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.12,
  shadowRadius: 14,
  elevation: 6,
}

/**
 * Button hover shadow - Enhanced elevation on interaction
 * shadowColor: #111111, offset: (0, 8), opacity: 0.16, radius: 16, elevation: 8
 */
export const buttonHoverShadow: ShadowStyle = {
  shadowColor: '#111111',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.16,
  shadowRadius: 16,
  elevation: 8,
}

/**
 * Modal shadow - Strong elevation for overlay content
 * shadowColor: #000000, offset: (0, -2), opacity: 0.1, radius: 20, elevation: 16
 */
export const modalShadow: ShadowStyle = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.1,
  shadowRadius: 20,
  elevation: 16,
}

/**
 * All shadow presets grouped together
 */
export const shadows = {
  card: cardShadow,
  button: buttonShadow,
  buttonHover: buttonHoverShadow,
  modal: modalShadow,
} as const

export type Shadows = typeof shadows
export type ShadowKey = keyof Shadows
