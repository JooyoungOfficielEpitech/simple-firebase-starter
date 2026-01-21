/**
 * ProgressBar Component
 * 진행률 표시 컴포넌트
 */

import { FC, useEffect } from "react";
import { TextStyle, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

import { Text } from "./Text";

// ==========================================
// Types
// ==========================================

export type ProgressBarVariant = "default" | "primary" | "secondary" | "success" | "warning" | "error";
export type ProgressBarSize = "sm" | "md" | "lg";

export interface ProgressBarProps {
  /** Progress value (0-100) */
  progress: number;
  /** Show percentage label */
  showLabel?: boolean;
  /** Label position */
  labelPosition?: "top" | "right" | "inside";
  /** Progress bar variant/color */
  variant?: ProgressBarVariant;
  /** Progress bar size */
  size?: ProgressBarSize;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Custom progress color */
  progressColor?: string;
  /** Custom track color */
  trackColor?: string;
  /** Container style override */
  style?: ViewStyle;
}

// ==========================================
// Component
// ==========================================

export const ProgressBar: FC<ProgressBarProps> = ({
  progress,
  showLabel = false,
  labelPosition = "right",
  variant = "primary",
  size = "md",
  animationDuration = 300,
  progressColor,
  trackColor,
  style,
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme();

  const animatedProgress = useSharedValue(0);

  // Clamp progress between 0-100
  const clampedProgress = Math.min(100, Math.max(0, progress));

  useEffect(() => {
    animatedProgress.value = withTiming(clampedProgress, {
      duration: animationDuration,
    });
  }, [clampedProgress, animationDuration, animatedProgress]);

  // Get variant color
  const getVariantColor = () => {
    switch (variant) {
      case "primary":
        return colors.tint;
      case "secondary":
        return colors.palette.secondary500;
      case "success":
        return colors.palette.secondary500;
      case "warning":
        return colors.palette.accent500;
      case "error":
        return colors.error;
      default:
        return colors.palette.neutral500;
    }
  };

  // Get size height
  const getHeight = () => {
    switch (size) {
      case "sm":
        return 4;
      case "lg":
        return 12;
      default:
        return 8;
    }
  };

  const height = getHeight();
  const barColor = progressColor || getVariantColor();
  const bgColor = trackColor || colors.palette.neutral300;

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value}%`,
  }));

  const renderLabel = () => {
    if (!showLabel) return null;

    const label = `${Math.round(clampedProgress)}%`;

    if (labelPosition === "inside" && size === "lg") {
      return (
        <Text style={[themed($insideLabel), { lineHeight: height }]}>
          {label}
        </Text>
      );
    }

    return <Text style={themed($label)}>{label}</Text>;
  };

  return (
    <View
      style={[
        themed($container),
        labelPosition === "top" && { flexDirection: "column" },
        style,
      ]}
    >
      {labelPosition === "top" && renderLabel()}

      <View style={themed($barContainer)}>
        <View
          style={[
            themed($track),
            {
              height,
              backgroundColor: bgColor,
              borderRadius: height / 2,
            },
          ]}
        >
          <Animated.View
            style={[
              themed($progress),
              {
                height,
                backgroundColor: barColor,
                borderRadius: height / 2,
              },
              animatedBarStyle,
            ]}
          >
            {labelPosition === "inside" && size === "lg" && renderLabel()}
          </Animated.View>
        </View>
      </View>

      {labelPosition === "right" && renderLabel()}
    </View>
  );
};

// ==========================================
// Styles
// ==========================================

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
});

const $barContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

const $track: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  overflow: "hidden",
});

const $progress: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  left: 0,
  top: 0,
});

const $label: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
  minWidth: 36,
  textAlign: "right",
});

const $insideLabel: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 10,
  color: colors.palette.neutral100,
  textAlign: "center",
  paddingHorizontal: spacing.xs,
});
