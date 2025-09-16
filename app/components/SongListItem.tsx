import React from "react"
import { View, ViewStyle, TextStyle, TouchableOpacity, TouchableOpacityProps } from "react-native"

import { Icon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import type { Song } from "@/types/song"

export interface SongListItemProps extends Omit<TouchableOpacityProps, 'style'> {
  /**
   * Song data to display
   */
  song: Song
  /**
   * Container style override
   */
  containerStyle?: ViewStyle
  /**
   * Whether to show separator line
   */
  showSeparator?: boolean
}

/**
 * SongListItem component for displaying a song in a list
 */
export function SongListItem({ 
  song, 
  containerStyle, 
  showSeparator = true, 
  ...touchableProps 
}: SongListItemProps) {
  const { themed, theme } = useAppTheme()
  

  return (
    <>
      <TouchableOpacity
        style={themed([$container, containerStyle])}
        activeOpacity={0.7}
        {...touchableProps}
      >
        <View style={themed($playIconContainer)}>
          <Icon
            icon="caretRight"
            size={24}
            color={theme.colors.tint}
          />
        </View>
        
        <View style={themed($contentContainer)}>
          <Text
            text={song.title}
            preset="subheading"
            style={themed($songTitle)}
            numberOfLines={1}
          />
          <Text
            text={`(${song.musical})`}
            style={themed($musicalName)}
            numberOfLines={1}
          />
        </View>

        <View style={themed($arrowContainer)}>
          <Icon
            icon="caretRight"
            size={16}
            color={theme.colors.textDim}
          />
        </View>
      </TouchableOpacity>
      
      {showSeparator && <View style={themed($separator)} />}
    </>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.lg,
  backgroundColor: colors.background,
})

const $playIconContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginRight: spacing.md,
  width: 32,
  alignItems: "center",
})

const $contentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  marginRight: spacing.sm,
})

const $songTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  marginBottom: 2,
})

const $musicalName: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
})

const $arrowContainer: ThemedStyle<ViewStyle> = () => ({
  width: 24,
  alignItems: "center",
})

const $separator: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  height: 1,
  backgroundColor: colors.separator,
  marginLeft: spacing.lg + 32 + spacing.md, // Align with content
})