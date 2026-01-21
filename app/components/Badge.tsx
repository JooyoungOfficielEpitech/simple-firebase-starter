/**
 * Badge Component
 * 배지 컴포넌트 - 상태 표시, 카운트, 라벨링에 사용
 */

import { FC } from "react";
import { TextStyle, View, ViewStyle } from "react-native";

import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

import { Text } from "./Text";

// ==========================================
// Types
// ==========================================

export type BadgeVariant = "default" | "primary" | "secondary" | "success" | "warning" | "error";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps {
  /** Text content of the badge */
  text?: string;
  /** Numeric value (will be formatted) */
  count?: number;
  /** Maximum count to display (e.g., 99+) */
  maxCount?: number;
  /** Badge variant/color */
  variant?: BadgeVariant;
  /** Badge size */
  size?: BadgeSize;
  /** Show as dot only (no text) */
  dot?: boolean;
  /** Custom background color */
  backgroundColor?: string;
  /** Custom text color */
  textColor?: string;
  /** Container style override */
  style?: ViewStyle;
}

// ==========================================
// Component
// ==========================================

export const Badge: FC<BadgeProps> = ({
  text,
  count,
  maxCount = 99,
  variant = "default",
  size = "md",
  dot = false,
  backgroundColor,
  textColor,
  style,
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme();

  // Get variant colors
  const getVariantColors = () => {
    switch (variant) {
      case "primary":
        return { bg: colors.tint, text: colors.palette.neutral100 };
      case "secondary":
        return { bg: colors.palette.secondary500, text: colors.palette.neutral100 };
      case "success":
        return { bg: colors.palette.secondary500, text: colors.palette.neutral100 };
      case "warning":
        return { bg: colors.palette.accent500, text: colors.palette.neutral100 };
      case "error":
        return { bg: colors.error, text: colors.palette.neutral100 };
      default:
        return { bg: colors.palette.neutral400, text: colors.text };
    }
  };

  const variantColors = getVariantColors();

  // Get size styles
  const getSizeStyles = (): ViewStyle & { fontSize: number } => {
    if (dot) {
      switch (size) {
        case "sm":
          return { width: 6, height: 6, fontSize: 0 };
        case "lg":
          return { width: 12, height: 12, fontSize: 0 };
        default:
          return { width: 8, height: 8, fontSize: 0 };
      }
    }

    switch (size) {
      case "sm":
        return { minWidth: 16, height: 16, paddingHorizontal: 4, fontSize: 10 };
      case "lg":
        return { minWidth: 24, height: 24, paddingHorizontal: 8, fontSize: 14 };
      default:
        return { minWidth: 20, height: 20, paddingHorizontal: 6, fontSize: 12 };
    }
  };

  const sizeStyles = getSizeStyles();

  // Format display text
  const getDisplayText = (): string => {
    if (dot) return "";
    if (count !== undefined) {
      return count > maxCount ? `${maxCount}+` : String(count);
    }
    return text || "";
  };

  const displayText = getDisplayText();

  return (
    <View
      style={[
        themed($badge),
        {
          backgroundColor: backgroundColor || variantColors.bg,
          minWidth: sizeStyles.minWidth,
          height: sizeStyles.height,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          borderRadius: typeof sizeStyles.height === "number" ? sizeStyles.height / 2 : 10,
        },
        dot && { width: sizeStyles.width, minWidth: sizeStyles.width },
        style,
      ]}
    >
      {!dot && displayText && (
        <Text
          style={[
            themed($badgeText),
            {
              color: textColor || variantColors.text,
              fontSize: sizeStyles.fontSize,
            },
          ]}
        >
          {displayText}
        </Text>
      )}
    </View>
  );
};

// ==========================================
// Styles
// ==========================================

const $badge: ThemedStyle<ViewStyle> = () => ({
  justifyContent: "center",
  alignItems: "center",
});

const $badgeText: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.medium,
  textAlign: "center",
});
