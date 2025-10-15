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
        accessibilityRole="button"
        accessibilityLabel={`${song.title} - ${song.musical} 노래 재생`}
        accessibilityHint="터치하여 노래방으로 이동합니다"
        {...touchableProps}
      >
        <View style={themed($playIconContainer)}>
          <View style={themed($playIconBackground)}>
            <Icon
              icon="caretRight"
              size={20}
              color={theme.colors.palette.neutral100}
            />
          </View>
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
  padding: spacing?.md || 12, // Match PostCard padding
  backgroundColor: colors.secondaryAction + '20', // Secondary color background to match PostCard
  minHeight: 72, // Minimum touch target for Korean UX patterns
  borderRadius: 12, // More rounded for Korean app aesthetics
  marginHorizontal: spacing.sm,
  marginBottom: spacing?.md || 12, // Match PostCard marginBottom
  borderWidth: 2, // Thicker border to match PostCard
  borderColor: colors.secondaryAction + '60', // Secondary color border to match PostCard
})

const $playIconContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginRight: spacing.md,
  width: 40, // Increased for better visual presence
  alignItems: "center",
})

const $playIconBackground: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: colors.secondaryAction, // BOLD: Play buttons in secondary color
  justifyContent: "center",
  alignItems: "center",
  shadowColor: colors.secondaryAction + "80",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 4, // Android shadow
})

const $contentContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  marginRight: spacing.sm,
})

const $songTitle: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  color: colors.text,
  marginBottom: spacing.xxxs,
  fontSize: 18, // Slightly larger for Korean text readability
  lineHeight: 28, // Better line height for Korean characters
  fontFamily: typography.primary.medium,
  letterSpacing: -0.3, // Subtle letter spacing for Korean text
})

const $musicalName: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  lineHeight: 22, // Better line height for Korean text
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  marginTop: spacing.xxxs, // Subtle spacing for better hierarchy
})

const $arrowContainer: ThemedStyle<ViewStyle> = () => ({
  width: 24,
  alignItems: "center",
})

const $separator: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  height: 4, // Reduced spacing to match PostCard style
  backgroundColor: colors.background, // Match screen background
  marginHorizontal: spacing.sm, // Consistent with container margins
})