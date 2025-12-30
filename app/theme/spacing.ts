/**
 * Spacing Tokens - Colored Sheep Community Design System
 *
 * Base unit: 4px
 * All spacing values from REACT_NATIVE_DESIGN_SPEC.json
 */

/**
 * Base spacing scale (4px increments)
 * Use for margins, paddings, and general whitespace
 */
export const spacing = {
  /** 4px */
  xxs: 4,
  /** 8px */
  xs: 8,
  /** 12px */
  sm: 12,
  /** 16px */
  md: 16,
  /** 24px */
  lg: 24,
  /** 32px */
  xl: 32,
  /** 48px */
  xxl: 48,
} as const

/**
 * Component-specific spacing values
 * Predefined spacing for common UI patterns
 */
export const componentSpacing = {
  /** Screen horizontal padding: 24px */
  screenPadding: 24,
  /** Card internal padding: 20px */
  cardPadding: 20,
  /** Gap between cards in a list: 16px */
  cardGap: 16,
  /** Gap between major sections: 32px */
  sectionGap: 32,
  /** Button vertical padding: 16px */
  buttonPaddingVertical: 16,
  /** Button horizontal padding: 32px */
  buttonPaddingHorizontal: 32,
  /** Input field padding: 12px */
  inputPadding: 12,
  /** Header height: 72px */
  headerHeight: 72,
} as const

/**
 * Border radius values
 * Usage mapped to specific components
 */
export const borderRadius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
  // Component-specific mappings
  card: 16,
  input: 12,
  button: 9999,
  modal: 24,
  sheepParts: 9999,
} as const

export type Spacing = typeof spacing
export type SpacingKey = keyof Spacing
export type ComponentSpacing = typeof componentSpacing
export type BorderRadius = typeof borderRadius
