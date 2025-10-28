import React, { forwardRef } from "react"
import { TextInput, TextInputProps, View, ViewStyle, StyleProp, TextStyle } from "react-native"
import { Text } from "@/components/Text"
import { spacing, semanticColors, fontSizes } from "../tokens"

export interface InputProps extends TextInputProps {
  /** 레이블 텍스트 */
  label?: string
  /** 에러 메시지 */
  error?: string
  /** 도움말 텍스트 */
  helperText?: string
  /** 컨테이너 스타일 */
  containerStyle?: StyleProp<ViewStyle>
}

/**
 * Input 컴포넌트
 * 텍스트 입력 필드
 */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, helperText, containerStyle, style, ...props },
  ref
) {
  const hasError = Boolean(error)

  const $containerStyle: StyleProp<ViewStyle> = [
    { marginBottom: spacing.md },
    containerStyle,
  ]

  const $inputStyle: StyleProp<TextStyle> = [
    {
      borderWidth: 1,
      borderColor: hasError ? semanticColors.error.main : semanticColors.border.default,
      borderRadius: 8,
      padding: spacing.sm,
      fontSize: fontSizes.md,
      minHeight: 48,
    },
    style,
  ]

  return (
    <View style={$containerStyle}>
      {label && (
        <Text preset="formLabel" style={{ marginBottom: spacing.xs }}>
          {label}
        </Text>
      )}
      <TextInput ref={ref} style={$inputStyle} {...props} />
      {(error || helperText) && (
        <Text
          style={{
            marginTop: spacing.xs,
            fontSize: fontSizes.xs,
            color: hasError ? semanticColors.error.main : semanticColors.text.secondary,
          }}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  )
})
