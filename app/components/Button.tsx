import { ComponentType, useMemo, useCallback } from "react"
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native"

import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle, ThemedStyleArray } from "@/theme/types"

import { Text, TextProps } from "./Text"

type Presets = "default" | "filled" | "reversed" | "cta" | "accent"

export interface ButtonAccessoryProps {
  style: StyleProp<any>
  pressableState: PressableStateCallbackType
  disabled?: boolean
}

export interface ButtonProps extends PressableProps {
  /**
   * Text which is looked up via i18n.
   */
  tx?: TextProps["tx"]
  /**
   * The text to display if not using `tx` or nested components.
   */
  text?: TextProps["text"]
  /**
   * Optional options to pass to i18n. Useful for interpolation
   * as well as explicitly setting locale or translation fallbacks.
   */
  txOptions?: TextProps["txOptions"]
  /**
   * Accessibility label for screen readers. If not provided, will use text/tx.
   */
  accessibilityLabel?: string
  /**
   * Accessibility hint to provide additional context for screen readers.
   */
  accessibilityHint?: string
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  /**
   * An optional style override for the "pressed" state.
   */
  pressedStyle?: StyleProp<ViewStyle>
  /**
   * An optional style override for the button text.
   */
  textStyle?: StyleProp<TextStyle>
  /**
   * An optional style override for the button text when in the "pressed" state.
   */
  pressedTextStyle?: StyleProp<TextStyle>
  /**
   * An optional style override for the button text when in the "disabled" state.
   */
  disabledTextStyle?: StyleProp<TextStyle>
  /**
   * One of the different types of button presets.
   */
  preset?: Presets
  /**
   * An optional component to render on the right side of the text.
   * Example: `RightAccessory={(props) => <View {...props} />}`
   */
  RightAccessory?: ComponentType<ButtonAccessoryProps>
  /**
   * An optional component to render on the left side of the text.
   * Example: `LeftAccessory={(props) => <View {...props} />}`
   */
  LeftAccessory?: ComponentType<ButtonAccessoryProps>
  /**
   * Children components.
   */
  children?: React.ReactNode
  /**
   * disabled prop, accessed directly for declarative styling reasons.
   * https://reactnative.dev/docs/pressable#disabled
   */
  disabled?: boolean
  /**
   * An optional style override for the disabled state
   */
  disabledStyle?: StyleProp<ViewStyle>
  /**
   * Show loading indicator and disable the button
   */
  isLoading?: boolean
}

/**
 * A component that allows users to take actions and make choices.
 * Wraps the Text component with a Pressable component.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/app/components/Button/}
 * @param {ButtonProps} props - The props for the `Button` component.
 * @returns {JSX.Element} The rendered `Button` component.
 * @example
 * <Button
 *   tx="common:ok"
 *   style={styles.button}
 *   textStyle={styles.buttonText}
 *   onPress={handleButtonPress}
 * />
 */
export function Button(props: ButtonProps) {
  const {
    tx,
    text,
    txOptions,
    accessibilityLabel,
    accessibilityHint,
    style: $viewStyleOverride,
    pressedStyle: $pressedViewStyleOverride,
    textStyle: $textStyleOverride,
    pressedTextStyle: $pressedTextStyleOverride,
    disabledTextStyle: $disabledTextStyleOverride,
    children,
    RightAccessory,
    LeftAccessory,
    disabled,
    disabledStyle: $disabledViewStyleOverride,
    isLoading,
    ...rest
  } = props

  const { themed, theme } = useAppTheme()

  const preset: Presets = props.preset ?? "default"

  // Memoize preset styles to prevent unnecessary recalculations
  const presetStyles = useMemo(() => ({
    view: themed($viewPresets[preset]),
    text: themed($textPresets[preset]),
    pressedView: themed($pressedViewPresets[preset]),
    pressedText: themed($pressedTextPresets[preset]),
    disabledView: themed($disabledViewPresets[preset]),
    disabledText: themed($disabledTextPresets[preset]),
  }), [preset, themed])

  /**
   * Memoized view style function to prevent unnecessary recalculations
   * @param {PressableStateCallbackType} root0 - The root object containing the pressed state.
   * @param {boolean} root0.pressed - The pressed state.
   * @returns {StyleProp<ViewStyle>} The view style based on the pressed state.
   */
  const $viewStyle = useCallback(({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> => {
    return [
      presetStyles.view,
      $viewStyleOverride,
      !!pressed && [presetStyles.pressedView, $pressedViewStyleOverride],
      !!disabled &&
        !isLoading &&
        [presetStyles.disabledView, $disabledViewStyleOverride],
    ]
  }, [presetStyles, $viewStyleOverride, $pressedViewStyleOverride, disabled, isLoading, $disabledViewStyleOverride])

  /**
   * Memoized text style function to prevent unnecessary recalculations
   * @param {PressableStateCallbackType} root0 - The root object containing the pressed state.
   * @param {boolean} root0.pressed - The pressed state.
   * @returns {StyleProp<TextStyle>} The text style based on the pressed state.
   */
  const $textStyle = useCallback(({ pressed }: PressableStateCallbackType): StyleProp<TextStyle> => {
    return [
      presetStyles.text,
      $textStyleOverride,
      !!pressed && [presetStyles.pressedText, $pressedTextStyleOverride],
      !!disabled &&
        !isLoading &&
        [presetStyles.disabledText, $disabledTextStyleOverride],
    ]
  }, [presetStyles, $textStyleOverride, $pressedTextStyleOverride, disabled, isLoading, $disabledTextStyleOverride])

  // Improved accessibility label generation with better fallback logic
  const computedAccessibilityLabel = useMemo(() => {
    // Priority 1: Explicit accessibility label
    if (accessibilityLabel) return accessibilityLabel

    // Priority 2: Text content
    if (text) return text

    // Priority 3: String children
    if (typeof children === 'string') return children

    // Priority 4: Translation key as fallback (extract last segment)
    if (tx) {
      const segments = tx.split(':')
      return segments[segments.length - 1].replace(/([A-Z])/g, ' $1').trim()
    }

    // Priority 5: Generic button label
    return 'Button'
  }, [accessibilityLabel, text, children, tx])

  // Determine loading indicator color based on preset (Set created once outside component)
  const loadingColor = useMemo(() => {
    const lightPresets: Presets[] = ['reversed', 'cta', 'accent']
    return lightPresets.includes(preset)
      ? theme.colors.palette.neutral100
      : theme.colors.text
  }, [preset, theme.colors])

  return (
    <Pressable
      style={$viewStyle}
      accessibilityRole="button"
      accessibilityLabel={isLoading ? `${computedAccessibilityLabel}, Loading` : computedAccessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: !!disabled || !!isLoading,
        busy: !!isLoading
      }}
      {...rest}
      disabled={disabled || isLoading}
    >
      {(state) => (
        <>
          {isLoading ? (
            <ActivityIndicator
              size="small"
              color={loadingColor}
              accessibilityLabel="Loading"
            />
          ) : (
            <>
              {!!LeftAccessory && (
                <LeftAccessory
                  style={$leftAccessoryStyle}
                  pressableState={state}
                  disabled={disabled}
                />
              )}

              <Text tx={tx} text={text} txOptions={txOptions} style={$textStyle(state)}>
                {children}
              </Text>

              {!!RightAccessory && (
                <RightAccessory
                  style={$rightAccessoryStyle}
                  pressableState={state}
                  disabled={disabled}
                />
              )}
            </>
          )}
        </>
      )}
    </Pressable>
  )
}

const $baseViewStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 56, // Already meets 44px minimum
  minWidth: 44, // Ensure minimum width
  borderRadius: 8, // Slightly larger radius for modern look
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.md, // Increased from sm to md (16px)
  paddingHorizontal: spacing.md, // Increased from sm to md (16px)
  overflow: "hidden",
})

const $baseTextStyle: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: 16,
  lineHeight: 20,
  fontFamily: typography.primary.medium,
  textAlign: "center",
  flexShrink: 1,
  flexGrow: 0,
  zIndex: 2,
})

const $rightAccessoryStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginStart: spacing.xs,
  zIndex: 1,
})
const $leftAccessoryStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginEnd: spacing.xs,
  zIndex: 1,
})

const $viewPresets: Record<Presets, ThemedStyleArray<ViewStyle>> = {
  default: [
    $styles.row,
    $baseViewStyle,
    ({ colors }) => ({
      borderWidth: 1,
      borderColor: colors.palette.neutral400,
      backgroundColor: colors.palette.neutral100,
    }),
  ],
  filled: [
    $styles.row,
    $baseViewStyle,
    ({ colors }) => ({ backgroundColor: colors.palette.neutral300 }),
  ],
  reversed: [
    $styles.row,
    $baseViewStyle,
    ({ colors }) => ({ backgroundColor: colors.palette.neutral800 }),
  ],
  cta: [
    $styles.row,
    $baseViewStyle,
    ({ colors }) => ({ backgroundColor: colors.palette.primary500 }),
  ],
  accent: [
    $styles.row,
    $baseViewStyle,
    ({ colors }) => ({ backgroundColor: colors.palette.secondary500 }),
  ],
}

const $textPresets: Record<Presets, ThemedStyleArray<TextStyle>> = {
  default: [$baseTextStyle],
  filled: [$baseTextStyle],
  reversed: [$baseTextStyle, ({ colors }) => ({ color: colors.palette.neutral100 })],
  cta: [$baseTextStyle, ({ colors }) => ({ color: colors.palette.neutral100 })],
  accent: [$baseTextStyle, ({ colors }) => ({ color: colors.palette.neutral100 })],
}

const $pressedViewPresets: Record<Presets, ThemedStyle<ViewStyle>> = {
  default: ({ colors }) => ({ backgroundColor: colors.palette.neutral200 }),
  filled: ({ colors }) => ({ backgroundColor: colors.palette.neutral400 }),
  reversed: ({ colors }) => ({ backgroundColor: colors.palette.neutral700 }),
  cta: ({ colors }) => ({ backgroundColor: colors.palette.primary600 }),
  accent: ({ colors }) => ({ backgroundColor: colors.palette.secondary400 }),
}

const $pressedTextPresets: Record<Presets, ThemedStyle<TextStyle>> = {
  default: () => ({ opacity: 0.9 }),
  filled: () => ({ opacity: 0.9 }),
  reversed: () => ({ opacity: 0.9 }),
  cta: () => ({ opacity: 0.9 }),
  accent: () => ({ opacity: 0.9 }),
}

// Disabled state presets (applied in addition to any caller overrides)
const $disabledViewPresets: Record<Presets, ThemedStyle<ViewStyle>> = {
  default: ({ colors }) => ({
    backgroundColor: colors.palette.neutral200,
    borderColor: colors.palette.neutral300,
  }),
  filled: ({ colors }) => ({
    backgroundColor: colors.palette.neutral300,
  }),
  reversed: ({ colors }) => ({
    backgroundColor: colors.palette.neutral700,
  }),
  cta: ({ colors }) => ({
    backgroundColor: colors.palette.primary300,
  }),
  accent: ({ colors }) => ({
    backgroundColor: colors.palette.secondary300,
  }),
}

const $disabledTextPresets: Record<Presets, ThemedStyle<TextStyle>> = {
  default: ({ colors }) => ({ color: colors.textDim }),
  filled: ({ colors }) => ({ color: colors.textDim }),
  reversed: ({ colors }) => ({ color: colors.palette.neutral300 }),
  cta: ({ colors }) => ({ color: colors.palette.neutral100, opacity: 0.7 }),
  accent: ({ colors }) => ({ color: colors.palette.neutral100, opacity: 0.7 }),
}
