/**
 * SearchBar Component
 * 검색 바 컴포넌트 - 검색 입력에 사용
 */

import { FC, useState, useRef } from "react";
import {
  Pressable,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

import { Icon, IconTypes } from "./Icon";
import { Text } from "./Text";

// ==========================================
// Types
// ==========================================

export type SearchBarVariant = "default" | "filled" | "outlined";
export type SearchBarSize = "sm" | "md" | "lg";

export interface SearchBarProps extends Omit<TextInputProps, "style"> {
  /** Current search value */
  value?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Callback when value changes */
  onChangeText?: (text: string) => void;
  /** Callback when search is submitted */
  onSearch?: (text: string) => void;
  /** Callback when clear button is pressed */
  onClear?: () => void;
  /** Visual variant */
  variant?: SearchBarVariant;
  /** Size variant */
  size?: SearchBarSize;
  /** Show cancel button */
  showCancel?: boolean;
  /** Cancel button text */
  cancelText?: string;
  /** Callback when cancel is pressed */
  onCancel?: () => void;
  /** Custom left icon */
  leftIcon?: IconTypes;
  /** Custom right icon (replaces clear) */
  rightIcon?: IconTypes;
  /** Right icon press handler */
  onRightIconPress?: () => void;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** Container style override */
  style?: ViewStyle;
  /** Input style override */
  inputStyle?: TextStyle;
}

// ==========================================
// Component
// ==========================================

export const SearchBar: FC<SearchBarProps> = ({
  value = "",
  placeholder = "Search...",
  onChangeText,
  onSearch,
  onClear,
  variant = "default",
  size = "md",
  showCancel = false,
  cancelText = "Cancel",
  onCancel,
  leftIcon = "x",
  rightIcon,
  onRightIconPress,
  loading = false,
  disabled = false,
  autoFocus = false,
  style,
  inputStyle,
  ...textInputProps
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme();

  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleClear = () => {
    onChangeText?.("");
    onClear?.();
    inputRef.current?.focus();
  };

  const handleCancel = () => {
    onChangeText?.("");
    inputRef.current?.blur();
    onCancel?.();
  };

  const handleSubmit = () => {
    onSearch?.(value);
  };

  // Get size-specific styles
  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return { height: 36, fontSize: 14, iconSize: 16, padding: 8 };
      case "lg":
        return { height: 52, fontSize: 18, iconSize: 24, padding: 16 };
      default:
        return { height: 44, fontSize: 16, iconSize: 20, padding: 12 };
    }
  };

  const sizeStyles = getSizeStyles();

  const cancelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isFocused && showCancel ? 1 : 0, { duration: 200 }),
    width: withTiming(isFocused && showCancel ? 60 : 0, { duration: 200 }),
  }));

  return (
    <View style={[themed($wrapper), style]}>
      <View
        style={[
          themed($container),
          { height: sizeStyles.height },
          variant === "filled" && themed($filledContainer),
          variant === "outlined" && themed($outlinedContainer),
          isFocused && variant === "outlined" && { borderColor: colors.tint },
          disabled && { opacity: 0.5 },
        ]}
      >
        {/* Search Icon */}
        <Icon
          icon={leftIcon}
          size={sizeStyles.iconSize}
          color={colors.textDim}
          style={{ marginLeft: sizeStyles.padding }}
        />

        {/* Input */}
        <TextInput
          ref={inputRef}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={colors.textDim}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSubmitEditing={handleSubmit}
          editable={!disabled}
          autoFocus={autoFocus}
          returnKeyType="search"
          style={[
            themed($input),
            {
              fontSize: sizeStyles.fontSize,
              paddingHorizontal: sizeStyles.padding,
            },
            inputStyle,
          ]}
          {...textInputProps}
        />

        {/* Clear/Right Icon */}
        {value.length > 0 && !loading && !rightIcon && (
          <Pressable
            onPress={handleClear}
            style={{ marginRight: sizeStyles.padding }}
            hitSlop={8}
          >
            <Icon
              icon="x"
              size={sizeStyles.iconSize}
              color={colors.textDim}
            />
          </Pressable>
        )}

        {rightIcon && (
          <Pressable
            onPress={onRightIconPress}
            style={{ marginRight: sizeStyles.padding }}
            hitSlop={8}
          >
            <Icon
              icon={rightIcon}
              size={sizeStyles.iconSize}
              color={colors.textDim}
            />
          </Pressable>
        )}

        {loading && (
          <View style={{ marginRight: sizeStyles.padding }}>
            <Text style={themed($loadingText)}>...</Text>
          </View>
        )}
      </View>

      {/* Cancel Button */}
      {showCancel && (
        <Animated.View style={cancelAnimatedStyle}>
          <Pressable onPress={handleCancel} style={themed($cancelButton)}>
            <Text style={themed($cancelText)}>{cancelText}</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
};

// ==========================================
// Styles
// ==========================================

const $wrapper: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
});

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.palette.neutral200,
  borderRadius: 10,
});

const $filledContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral300,
});

const $outlinedContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: "transparent",
  borderWidth: 1,
  borderColor: colors.border,
});

const $input: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  flex: 1,
  fontFamily: typography.primary.normal,
  color: colors.text,
});

const $loadingText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
});

const $cancelButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginLeft: spacing.sm,
  justifyContent: "center",
});

const $cancelText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.tint,
  fontFamily: typography.primary.medium,
  fontSize: 16,
});
