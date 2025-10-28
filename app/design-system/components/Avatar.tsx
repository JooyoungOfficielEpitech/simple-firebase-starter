import React from "react"
import { View, Image, ViewStyle, StyleProp, ImageStyle } from "react-native"
import { Text } from "@/components/Text"
import { spacing, semanticColors } from "../tokens"

export interface AvatarProps {
  /** 사용자 이름 (이니셜 표시용) */
  name?: string
  /** 이미지 URI */
  source?: string
  /** 크기 */
  size?: "sm" | "md" | "lg" | "xl"
  /** 스타일 오버라이드 */
  style?: StyleProp<ViewStyle>
}

const sizeValues = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 72,
}

const getInitials = (name: string): string => {
  const words = name.trim().split(" ")
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

/**
 * Avatar 컴포넌트
 * 사용자 프로필 이미지
 */
export const Avatar = React.memo<AvatarProps>(function Avatar({
  name,
  source,
  size = "md",
  style,
}) {
  const avatarSize = sizeValues[size]

  const $avatarStyle: StyleProp<ViewStyle> = [
    {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
      backgroundColor: semanticColors.primary.light,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },
    style,
  ]

  const $imageStyle: StyleProp<ImageStyle> = {
    width: avatarSize,
    height: avatarSize,
  }

  return (
    <View style={$avatarStyle}>
      {source ? (
        <Image source={{ uri: source }} style={$imageStyle} />
      ) : name ? (
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: avatarSize * 0.4,
            fontWeight: "600",
          }}
        >
          {getInitials(name)}
        </Text>
      ) : null}
    </View>
  )
})
