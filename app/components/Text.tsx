import { ReactNode, forwardRef, Ref } from "react"
// eslint-disable-next-line no-restricted-imports
import { Platform, StyleProp, Text as RNText, TextProps as RNTextProps, TextStyle } from "react-native"
import { TOptions } from "i18next"

import { isRTL, TxKeyPath } from "@/i18n"
import { translate } from "@/i18n/translate"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle, ThemedStyleArray } from "@/theme/types"
import { typography } from "@/theme/typography"

type Sizes = keyof typeof $sizeStyles
type Weights = keyof typeof typography.primary
type Presets = "default" | "bold" | "heading" | "subheading" | "formLabel" | "formHelper"

export interface TextProps extends RNTextProps {
  /**
   * Text which is looked up via i18n.
   */
  tx?: TxKeyPath
  /**
   * The text to display if not using `tx` or nested components.
   */
  text?: string
  /**
   * Optional options to pass to i18n. Useful for interpolation
   * as well as explicitly setting locale or translation fallbacks.
   */
  txOptions?: TOptions
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<TextStyle>
  /**
   * One of the different types of text presets.
   */
  preset?: Presets
  /**
   * Text weight modifier.
   */
  weight?: Weights
  /**
   * Text size modifier.
   */
  size?: Sizes
  /**
   * Children components.
   */
  children?: ReactNode
}

/**
 * For your text displaying needs.
 * This component is a HOC over the built-in React Native one.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/app/components/Text/}
 * @param {TextProps} props - The props for the `Text` component.
 * @returns {JSX.Element} The rendered `Text` component.
 */
export const Text = forwardRef<RNText, TextProps>(function Text(props, ref) {
  const { weight, size, tx, txOptions, text, children, style: $styleOverride, ...rest } = props
  const { themed } = useAppTheme()

  const i18nText = tx && translate(tx, txOptions)
  const content = i18nText || text || children

  const preset: Presets = props.preset ?? "default"
  const $styles: StyleProp<TextStyle> = [
    $rtlStyle,
    themed($presets[preset]),
    weight && $fontWeightStyles[weight],
    size && $sizeStyles[size],
    $styleOverride,
  ]

  return (
    <RNText {...rest} style={$styles} ref={ref}>
      {content}
    </RNText>
  )
})

// 한국어 폰트 최적화: 한글 자모의 높이를 고려한 lineHeight 조정
// 한글은 자음+모음 결합 구조로 인해 영문보다 약간 더 높은 line height가 필요
const $sizeStyles = {
  xxl: { fontSize: 36, lineHeight: 48 } satisfies TextStyle, // 1.33 ratio for Korean readability
  xl: { fontSize: 24, lineHeight: 34 } satisfies TextStyle,  // 1.42 ratio for optimal spacing
  lg: { fontSize: 20, lineHeight: 30 } satisfies TextStyle,  // 1.5 ratio for body text
  md: { fontSize: 18, lineHeight: 27 } satisfies TextStyle,  // 1.5 ratio for medium text
  sm: { fontSize: 16, lineHeight: 24 } satisfies TextStyle,  // 1.5 ratio for small text
  xs: { fontSize: 14, lineHeight: 21 } satisfies TextStyle,  // 1.5 ratio for extra small
  xxs: { fontSize: 12, lineHeight: 18 } satisfies TextStyle, // 1.5 ratio for minimal text
}

const $fontWeightStyles = Object.entries(typography.primary).reduce((acc, [weight, fontFamily]) => {
  return { ...acc, [weight]: { fontFamily } }
}, {}) as Record<Weights, TextStyle>

const $baseStyle: ThemedStyle<TextStyle> = (theme) => ({
  ...$sizeStyles.sm,
  ...$fontWeightStyles.normal,
  color: theme.colors.text,
})

const $presets: Record<Presets, ThemedStyleArray<TextStyle>> = {
  default: [$baseStyle],
  bold: [$baseStyle, { ...$fontWeightStyles.bold }],
  heading: [
    $baseStyle,
    {
      ...$sizeStyles.xxl,
      ...$fontWeightStyles.bold,
    },
  ],
  subheading: [$baseStyle, { ...$sizeStyles.lg, ...$fontWeightStyles.medium }],
  formLabel: [$baseStyle, { ...$fontWeightStyles.medium }],
  formHelper: [$baseStyle, { ...$sizeStyles.sm, ...$fontWeightStyles.normal }],
}

// RTL 지원: 아랍어, 히브리어 등 오른쪽에서 왼쪽으로 읽는 언어 지원
// textAlign도 RTL 방향에 맞춰 조정
const $rtlStyle: TextStyle = isRTL
  ? {
      writingDirection: "rtl",
      textAlign: "right",
      // Android에서 RTL 렌더링 개선
      ...(Platform.OS === "android" && { textAlignVertical: "center" })
    }
  : {
      writingDirection: "ltr",
      textAlign: "left",
    }
