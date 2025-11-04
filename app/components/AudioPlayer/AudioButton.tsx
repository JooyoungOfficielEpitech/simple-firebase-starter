import React from "react"
import { TouchableOpacity, TouchableOpacityProps, ViewStyle } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Icon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export interface AudioButtonProps extends TouchableOpacityProps {
  icon: string
  size?: number
  style?: ViewStyle
}

export function AudioButton({ icon, size = 24, style, ...props }: AudioButtonProps) {
  const { themed, theme } = useAppTheme()

  // Validate icon prop
  if (typeof icon !== 'string') {
    if (__DEV__) console.error("AudioButton: icon must be a string, received:", typeof icon, icon)
    return (
      <TouchableOpacity style={themed([$button, style])} {...props}>
        <Text text="?" />
      </TouchableOpacity>
    )
  }

  // Ionicons 아이콘 매핑
  const getIoniconName = (iconName: string): keyof typeof Ionicons.glyphMap => {
    switch (iconName) {
      case "play":
        return "play"  // 재생 아이콘
      case "pause":
        return "pause"  // 일시정지 아이콘
      case "stop":
        return "stop"  // 정지 아이콘
      default:
        return "ellipse"
    }
  }

  const isAudioIcon = ["play", "pause", "stop"].includes(icon)

  return (
    <TouchableOpacity
      style={themed([$button, style])}
      activeOpacity={0.7}
      {...props}
    >
      {isAudioIcon ? (
        <Ionicons
          name={getIoniconName(icon)}
          size={size}
          color={props.disabled ? theme.colors.textDim : 
                 (icon === "play" || icon === "pause") ? theme.colors.background : theme.colors.tint}
        />
      ) : (
        <Icon
          icon={icon as any}
          size={size}
          color={props.disabled ? theme.colors.textDim : theme.colors.tint}
        />
      )}
    </TouchableOpacity>
  )
}

const $button: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  padding: spacing.sm,
  borderRadius: 50,
  backgroundColor: colors.palette.neutral200,
  marginHorizontal: spacing.xs,
  justifyContent: "center",
  alignItems: "center",
})
