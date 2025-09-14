import React, { forwardRef, ForwardedRef } from "react"
import { View, TextInput, ViewStyle, TextStyle, TextInputProps } from "react-native"

import { Icon } from "@/components/Icon"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export interface SearchBarProps extends Omit<TextInputProps, 'style'> {
  /**
   * Container style override
   */
  containerStyle?: ViewStyle
  /**
   * Input style override
   */
  inputStyle?: TextStyle
}

/**
 * SearchBar component for text search input with search icon
 */
export const SearchBar = forwardRef<TextInput, SearchBarProps>(function SearchBar(
  { containerStyle, inputStyle, placeholder = "검색...", ...inputProps },
  ref: ForwardedRef<TextInput>
) {
  const { themed, theme } = useAppTheme()

  return (
    <View style={themed([$container, containerStyle])}>
      <Icon
        icon="view"
        size={20}
        color={theme.colors.textDim}
        containerStyle={themed($searchIcon)}
      />
      <TextInput
        ref={ref}
        style={themed([$input, inputStyle])}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textDim}
        {...inputProps}
      />
    </View>
  )
})

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderWidth: 1,
  borderColor: colors.border,
})

const $searchIcon: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginRight: spacing.sm,
})

const $input: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  flex: 1,
  fontSize: 16,
  fontFamily: typography.primary.normal,
  color: colors.text,
  padding: 0, // Remove default padding to align properly
})