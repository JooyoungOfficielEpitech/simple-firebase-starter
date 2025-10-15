import React, { useState } from "react"
import {
  View,
  TouchableOpacity,
  FlatList,
  Animated,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native"

import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { Text } from "./Text"

export interface DropdownOption {
  label: string
  value: string
}

export interface DropdownProps {
  /**
   * Current selected value
   */
  value?: string
  /**
   * List of options to display
   */
  options: DropdownOption[]
  /**
   * Placeholder text when no value is selected
   */
  placeholder?: string
  /**
   * Called when an option is selected
   */
  onSelect: (value: string) => void
  /**
   * Whether the dropdown is disabled
   */
  disabled?: boolean
  /**
   * Custom style for the container
   */
  style?: StyleProp<ViewStyle>
  /**
   * Custom style for the dropdown button
   */
  buttonStyle?: StyleProp<ViewStyle>
  /**
   * Custom style for the dropdown text
   */
  textStyle?: StyleProp<TextStyle>
  /**
   * Custom style for the options list
   */
  optionsStyle?: StyleProp<ViewStyle>
}

/**
 * A dropdown component that expands to show options when pressed
 */
export function Dropdown(props: DropdownProps) {
  const {
    value,
    options,
    placeholder = "선택하세요",
    onSelect,
    disabled = false,
    style: $containerStyleOverride,
    buttonStyle: $buttonStyleOverride,
    textStyle: $textStyleOverride,
    optionsStyle: $optionsStyleOverride,
  } = props

  const { themed } = useAppTheme()
  const [isExpanded, setIsExpanded] = useState(false)
  const [animatedHeight] = useState(new Animated.Value(0))

  const selectedOption = options.find(option => option.value === value)
  const displayText = selectedOption?.label || placeholder

  const toggleDropdown = () => {
    if (disabled) return

    const newExpanded = !isExpanded
    setIsExpanded(newExpanded)

    Animated.timing(animatedHeight, {
      toValue: newExpanded ? Math.min(options.length * 50, 200) : 0,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }

  const handleSelectOption = (option: DropdownOption) => {
    onSelect(option.value)
    setIsExpanded(false)
    Animated.timing(animatedHeight, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }

  const renderOption = ({ item }: { item: DropdownOption }) => (
    <TouchableOpacity
      style={themed($optionItem)}
      onPress={() => handleSelectOption(item)}
      activeOpacity={0.7}
    >
      <Text style={themed($optionText)}>{item.label}</Text>
    </TouchableOpacity>
  )

  return (
    <View style={[$containerStyleOverride]}>
      {/* Dropdown Button */}
      <TouchableOpacity
        style={[
          themed($dropdownButton),
          disabled && themed($disabledButton),
          $buttonStyleOverride,
        ]}
        onPress={toggleDropdown}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text
          style={[
            themed($dropdownText),
            disabled && themed($disabledText),
            $textStyleOverride,
          ]}
        >
          {displayText}
        </Text>
        <Animated.View
          style={[
            themed($arrow),
            {
              transform: [
                {
                  rotate: animatedHeight.interpolate({
                    inputRange: [0, 200],
                    outputRange: ['0deg', '180deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={themed($arrowText)}>▼</Text>
        </Animated.View>
      </TouchableOpacity>

      {/* Dropdown Options */}
      <Animated.View
        style={[
          themed($optionsContainer),
          { height: animatedHeight },
          $optionsStyleOverride,
        ]}
      >
        <FlatList
          data={options}
          renderItem={renderOption}
          keyExtractor={(item) => item.value}
          scrollEnabled={options.length > 4}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    </View>
  )
}

// Themed styles
const $dropdownButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: colors.background,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 8,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  minHeight: 50,
})

const $disabledButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral200,
  opacity: 0.6,
})

const $dropdownText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  flex: 1,
  fontSize: 16,
  color: colors.text,
  fontFamily: typography.primary.normal,
})

const $disabledText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

const $arrow: ThemedStyle<ViewStyle> = () => ({
  marginLeft: 8,
})

const $arrowText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
})

const $optionsContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderWidth: 1,
  borderColor: colors.border,
  borderTopWidth: 0,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
  overflow: "hidden",
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  zIndex: 1000,
  elevation: 5,
  shadowColor: colors.palette.neutral800,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
})

const $optionItem: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
  backgroundColor: colors.background,
})

const $optionText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 16,
  color: colors.text,
  fontFamily: typography.primary.normal,
})