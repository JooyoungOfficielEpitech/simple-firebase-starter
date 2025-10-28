import React, { ReactNode } from "react"
import { View, ViewProps, ViewStyle, StyleProp } from "react-native"
import { shadows, spacing } from "../tokens"

export interface CardProps extends Omit<ViewProps, "style"> {
  /**  자식 요소 */
  children: ReactNode
  /** 그림자 크기 */
  elevation?: "none" | "sm" | "md" | "lg" | "xl"
  /** 패딩 크기 */
  padding?: keyof typeof spacing
  /** 스타일 오버라이드 */
  style?: StyleProp<ViewStyle>
}

/**
 * Card 컴포넌트
 * 콘텐츠를 그룹화하는 컨테이너
 */
export const Card = React.memo<CardProps>(function Card({
  children,
  elevation = "sm",
  padding = "md",
  style,
  ...props
}) {
  const $cardStyle: StyleProp<ViewStyle> = [
    {
      backgroundColor: "#FFFFFF",
      borderRadius: 12,
      padding: spacing[padding],
    },
    shadows[elevation],
    style,
  ]

  return (
    <View style={$cardStyle} {...props}>
      {children}
    </View>
  )
})
