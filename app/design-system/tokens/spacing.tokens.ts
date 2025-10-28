/**
 * Spacing Tokens - 4px 기준 스케일 시스템
 */

export const spacing = {
  none: 0,
  xxxs: 2,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const

export type Spacing = typeof spacing
export type SpacingKey = keyof Spacing

export const getSpacing = (key: SpacingKey): number => spacing[key]
export const customSpacing = (units: number): number => 4 * units

export default spacing
