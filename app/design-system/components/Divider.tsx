import React from "react"
import { View, ViewStyle, StyleProp } from "react-native"
import { spacing, semanticColors } from "../tokens"

export interface DividerProps {
  /** 방향 */
  orientation?: "horizontal" | "vertical"
  /** 간격 (여백) */
  spacing?: keyof typeof spacing
  /** 색상 */
  color?: string
  /** 스타일 오버라이드 */
  style?: StyleProp<ViewStyle>
}

/**
 * Divider 컴포넌트
 * 콘텐츠 구분선
 */
export const Divider = React.memo<DividerProps>(function Divider({
  orientation = "horizontal",
  spacing: spacingKey = "md",
  color = semanticColors.border.default,
  style,
}) {
  const marginValue = spacing[spacingKey]

  const $dividerStyle: StyleProp<ViewStyle> = [
    orientation === "horizontal"
      ? {
          height: 1,
          width: "100%",
          backgroundColor: color,
          marginVertical: marginValue,
        }
      : {
          width: 1,
          height: "100%",
          backgroundColor: color,
          marginHorizontal: marginValue,
        },
    style,
  ]

  return <View style={$dividerStyle} />
})
