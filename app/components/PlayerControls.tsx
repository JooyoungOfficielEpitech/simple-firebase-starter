import React, { memo } from "react"
import { View, ViewStyle, TextStyle, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { State } from 'react-native-track-player'

import { Text } from "@/components/Text"
import { Icon } from "@/components/Icon"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface PlayerControlsProps {
  playbackState: { state?: State } | null
  isPlayerInitialized: boolean
  isLoading: boolean
  onPlayPress: () => void
  onSavePress: () => void
}

export const PlayerControls = memo<PlayerControlsProps>(({ 
  playbackState, 
  isPlayerInitialized, 
  isLoading, 
  onPlayPress, 
  onSavePress 
}) => {
  const { themed } = useAppTheme()

  const getPlayIcon = (): "play" | "pause" => {
    try {
      if (!playbackState || playbackState.state === undefined || playbackState.state === null) {
        return "play"
      }
      
      const isPlaying = String(playbackState.state) === "playing"
      return isPlaying ? "pause" : "play"
    } catch (error) {
      return "play"
    }
  }

  return (
    <View style={themed($container)}>
      <AudioButton
        icon={getPlayIcon()}
        onPress={onPlayPress}
        disabled={!isPlayerInitialized || isLoading}
        size={32}
        style={themed($playButton)}
      />
      
      <TouchableOpacity 
        style={themed($saveButtonAligned)} 
        onPress={onSavePress}
      >
        <Text text="구간 저장하기" style={themed($saveButtonTextOnly)} />
      </TouchableOpacity>
    </View>
  )
})

interface AudioButtonProps {
  icon: string
  size?: number
  style?: ViewStyle
  disabled?: boolean
  onPress?: () => void
}

const AudioButton = memo<AudioButtonProps>(({ 
  icon, 
  size = 24, 
  style, 
  disabled,
  onPress,
  ...props 
}) => {
  const { themed, theme } = useAppTheme()
  
  if (typeof icon !== 'string') {
    return (
      <TouchableOpacity style={themed([$button, style])} onPress={onPress} disabled={disabled}>
        <Text text="?" />
      </TouchableOpacity>
    )
  }
  
  const getIoniconName = (iconName: string): keyof typeof Ionicons.glyphMap => {
    switch (iconName) {
      case "play":
        return "play"
      case "pause":
        return "pause"
      case "stop":
        return "stop"
      default:
        return "ellipse"
    }
  }
  
  const isAudioIcon = ["play", "pause", "stop"].includes(icon)
  
  return (
    <TouchableOpacity
      style={themed([$button, style])}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
      {...props}
    >
      {isAudioIcon ? (
        <Ionicons
          name={getIoniconName(icon)}
          size={size}
          color={disabled ? theme.colors.textDim : 
                 (icon === "play" || icon === "pause") ? theme.colors.background : theme.colors.tint}
        />
      ) : (
        <Icon
          icon={icon as any}
          size={size}
          color={disabled ? theme.colors.textDim : theme.colors.tint}
        />
      )}
    </TouchableOpacity>
  )
})

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: spacing.lg,
})

const $button: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  padding: spacing.sm,
  borderRadius: 50,
  backgroundColor: colors.palette.neutral200,
  marginHorizontal: spacing.xs,
  justifyContent: "center",
  alignItems: "center",
})

const $playButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  width: 64,
  height: 64,
  borderRadius: 32,
  backgroundColor: colors.tint,
  marginHorizontal: spacing.md,
  justifyContent: "center",
  alignItems: "center",
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 4,
})

const $saveButtonAligned: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.tint,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  borderRadius: 12,
  marginLeft: spacing.lg,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 3,
})

const $saveButtonTextOnly: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.background,
  textAlign: "center",
})