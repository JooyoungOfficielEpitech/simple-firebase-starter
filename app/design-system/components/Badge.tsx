import React from "react"
import { View, ViewStyle, StyleProp } from "react-native"
import { Text } from "@/components/Text"
import { spacing, semanticColors, fontSizes } from "../tokens"

export interface BadgeProps {
  /** 뱃지 텍스트 */
  text: string
  /** 뱃지 변형 */
  variant?: "success" | "warning" | "error" | "info" | "neutral"
  /** 크기 */
  size?: "sm" | "md" | "lg"
  /** 스타일 오버라이드 */
  style?: StyleProp<ViewStyle>
}

const variantColors = {
  success: semanticColors.success.main,
  warning: semanticColors.warning.main,
  error: semanticColors.error.main,
  info: semanticColors.primary.main,
  neutral: semanticColors.border.dark,
}

const sizeStyles = {
  sm: { paddingHorizontal: spacing.xs, paddingVertical: 2, fontSize: fontSizes.xxs },
  md: { paddingHorizontal: spacing.sm, paddingVertical: 4, fontSize: fontSizes.xs },
  lg: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, fontSize: fontSizes.sm },
}

/**
 * Badge 컴포넌트
 * 상태 표시나 라벨용
 */
export const Badge = React.memo<BadgeProps>(function Badge({
  text,
  variant = "neutral",
  size = "md",
  style,
}) {
  const $badgeStyle: StyleProp<ViewStyle> = [
    {
      backgroundColor: variantColors[variant],
      borderRadius: 12,
      alignSelf: "flex-start",
      ...sizeStyles[size],
    },
    style,
  ]

  return (
    <View style={$badgeStyle}>
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: sizeStyles[size].fontSize,
          fontWeight: "600",
        }}
      >
        {text}
      </Text>
    </View>
  )
})
