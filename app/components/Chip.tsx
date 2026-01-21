/**
 * Chip Component
 * 칩 컴포넌트 - 태그, 필터, 선택 항목 표시에 사용
 */

import { FC } from "react";
import { Pressable, TextStyle, View, ViewStyle } from "react-native";

import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

import { Icon, IconTypes } from "./Icon";
import { Text } from "./Text";

// ==========================================
// Types
// ==========================================

export type ChipVariant = "filled" | "outlined" | "soft";
export type ChipSize = "sm" | "md" | "lg";
export type ChipColor = "default" | "primary" | "secondary" | "success" | "warning" | "error";

export interface ChipProps {
  /** Chip label text */
  label: string;
  /** Visual variant */
  variant?: ChipVariant;
  /** Size variant */
  size?: ChipSize;
  /** Color variant */
  color?: ChipColor;
  /** Left icon */
  leftIcon?: IconTypes;
  /** Right icon (usually for remove) */
  rightIcon?: IconTypes;
  /** Selected/active state */
  selected?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Callback when chip is pressed */
  onPress?: () => void;
  /** Callback when right icon is pressed (e.g., remove) */
  onRemove?: () => void;
  /** Container style override */
  style?: ViewStyle;
}

// ==========================================
// Component
// ==========================================

export const Chip: FC<ChipProps> = ({
  label,
  variant = "filled",
  size = "md",
  color = "default",
  leftIcon,
  rightIcon,
  selected = false,
  disabled = false,
  onPress,
  onRemove,
  style,
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme();

  // Get color configuration
  const getColorConfig = () => {
    switch (color) {
      case "primary":
        return {
          filled: { bg: colors.tint, text: colors.palette.neutral100, border: colors.tint },
          outlined: { bg: "transparent", text: colors.tint, border: colors.tint },
          soft: { bg: colors.tint + "20", text: colors.tint, border: colors.tint },
        };
      case "secondary":
        return {
          filled: { bg: colors.palette.secondary500, text: colors.palette.neutral100, border: colors.palette.secondary500 },
          outlined: { bg: "transparent", text: colors.palette.secondary500, border: colors.palette.secondary500 },
          soft: { bg: colors.palette.secondary500 + "20", text: colors.palette.secondary500, border: colors.palette.secondary500 },
        };
      case "success":
        return {
          filled: { bg: colors.palette.secondary500, text: colors.palette.neutral100, border: colors.palette.secondary500 },
          outlined: { bg: "transparent", text: colors.palette.secondary500, border: colors.palette.secondary500 },
          soft: { bg: colors.palette.secondary500 + "20", text: colors.palette.secondary500, border: colors.palette.secondary500 },
        };
      case "warning":
        return {
          filled: { bg: colors.palette.accent500, text: colors.palette.neutral100, border: colors.palette.accent500 },
          outlined: { bg: "transparent", text: colors.palette.accent500, border: colors.palette.accent500 },
          soft: { bg: colors.palette.accent500 + "20", text: colors.palette.accent500, border: colors.palette.accent500 },
        };
      case "error":
        return {
          filled: { bg: colors.error, text: colors.palette.neutral100, border: colors.error },
          outlined: { bg: "transparent", text: colors.error, border: colors.error },
          soft: { bg: colors.error + "20", text: colors.error, border: colors.error },
        };
      default:
        return {
          filled: { bg: colors.palette.neutral400, text: colors.text, border: colors.palette.neutral400 },
          outlined: { bg: "transparent", text: colors.text, border: colors.border },
          soft: { bg: colors.palette.neutral200, text: colors.text, border: colors.palette.neutral200 },
        };
    }
  };

  const colorConfig = getColorConfig()[variant];

  // Get size configuration
  const getSizeConfig = () => {
    switch (size) {
      case "sm":
        return { height: 24, paddingH: 8, fontSize: 12, iconSize: 14 };
      case "lg":
        return { height: 40, paddingH: 16, fontSize: 16, iconSize: 20 };
      default:
        return { height: 32, paddingH: 12, fontSize: 14, iconSize: 16 };
    }
  };

  const sizeConfig = getSizeConfig();

  const chipStyle: ViewStyle = {
    height: sizeConfig.height,
    paddingHorizontal: sizeConfig.paddingH,
    backgroundColor: selected ? colors.tint : colorConfig.bg,
    borderWidth: variant === "outlined" ? 1 : 0,
    borderColor: selected ? colors.tint : colorConfig.border,
    borderRadius: sizeConfig.height / 2,
  };

  const textColor = selected ? colors.palette.neutral100 : colorConfig.text;

  const handlePress = () => {
    if (!disabled && onPress) {
      onPress();
    }
  };

  const handleRemove = () => {
    if (!disabled && onRemove) {
      onRemove();
    }
  };

  const ChipContent = (
    <>
      {leftIcon && (
        <View style={themed($leftIcon)}>
          <Icon
            icon={leftIcon}
            size={sizeConfig.iconSize}
            color={textColor}
          />
        </View>
      )}
      <Text
        style={[
          themed($label),
          { fontSize: sizeConfig.fontSize, color: textColor },
        ]}
      >
        {label}
      </Text>
      {(rightIcon || onRemove) && (
        <Pressable
          onPress={handleRemove}
          hitSlop={8}
          disabled={disabled}
          style={themed($rightIconWrapper)}
        >
          <Icon
            icon={rightIcon || "x"}
            size={sizeConfig.iconSize - 2}
            color={textColor}
          />
        </Pressable>
      )}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={[
          themed($chip),
          chipStyle,
          disabled && { opacity: 0.5 },
          style,
        ]}
      >
        {ChipContent}
      </Pressable>
    );
  }

  return (
    <View
      style={[
        themed($chip),
        chipStyle,
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      {ChipContent}
    </View>
  );
};

// ==========================================
// Chip Group Component
// ==========================================

export interface ChipGroupProps {
  /** Array of chip options */
  options: Array<{ label: string; value: string }>;
  /** Selected value(s) */
  value?: string | string[];
  /** Callback when selection changes */
  onChange?: (value: string | string[]) => void;
  /** Allow multiple selection */
  multiple?: boolean;
  /** Chip variant */
  variant?: ChipVariant;
  /** Chip size */
  size?: ChipSize;
  /** Chip color */
  color?: ChipColor;
  /** Gap between chips */
  gap?: number;
  /** Container style override */
  style?: ViewStyle;
}

export const ChipGroup: FC<ChipGroupProps> = ({
  options,
  value = [],
  onChange,
  multiple = false,
  variant = "outlined",
  size = "md",
  color = "primary",
  gap = 8,
  style,
}) => {
  const { themed } = useAppTheme();

  const selectedValues = Array.isArray(value) ? value : [value];

  const handleChipPress = (chipValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(chipValue)
        ? selectedValues.filter((v) => v !== chipValue)
        : [...selectedValues, chipValue];
      onChange?.(newValues);
    } else {
      onChange?.(chipValue);
    }
  };

  return (
    <View style={[themed($chipGroup), { gap }, style]}>
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          variant={variant}
          size={size}
          color={color}
          selected={selectedValues.includes(option.value)}
          onPress={() => handleChipPress(option.value)}
        />
      ))}
    </View>
  );
};

// ==========================================
// Styles
// ==========================================

const $chip: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
});

const $leftIcon: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginRight: spacing.xxs,
});

const $rightIconWrapper: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginLeft: spacing.xxs,
});

const $label: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.medium,
});

const $chipGroup: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  flexWrap: "wrap",
});
