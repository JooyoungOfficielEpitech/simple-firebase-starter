/**
 * Divider Component
 * 구분선 컴포넌트 - 콘텐츠 섹션 분리에 사용
 */

import { FC } from "react";
import { TextStyle, View, ViewStyle } from "react-native";

import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

import { Text } from "./Text";

// ==========================================
// Types
// ==========================================

export type DividerOrientation = "horizontal" | "vertical";
export type DividerVariant = "solid" | "dashed" | "dotted";

export interface DividerProps {
  /** Orientation of the divider */
  orientation?: DividerOrientation;
  /** Line style variant */
  variant?: DividerVariant;
  /** Thickness of the divider line */
  thickness?: number;
  /** Custom color */
  color?: string;
  /** Text label in the middle (horizontal only) */
  label?: string;
  /** Label position */
  labelPosition?: "left" | "center" | "right";
  /** Spacing around the divider */
  spacing?: number;
  /** Container style override */
  style?: ViewStyle;
}

// ==========================================
// Component
// ==========================================

export const Divider: FC<DividerProps> = ({
  orientation = "horizontal",
  variant = "solid",
  thickness = 1,
  color,
  label,
  labelPosition = "center",
  spacing = 0,
  style,
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme();

  const lineColor = color || colors.separator;

  const getBorderStyle = (): "solid" | "dashed" | "dotted" => {
    return variant;
  };

  const lineStyle: ViewStyle = {
    backgroundColor: variant === "solid" ? lineColor : "transparent",
    borderColor: lineColor,
    borderStyle: getBorderStyle(),
    ...(orientation === "horizontal"
      ? {
          height: thickness,
          borderBottomWidth: variant !== "solid" ? thickness : 0,
        }
      : {
          width: thickness,
          borderRightWidth: variant !== "solid" ? thickness : 0,
        }),
  };

  // Horizontal divider with label
  if (orientation === "horizontal" && label) {
    return (
      <View
        style={[
          themed($containerWithLabel),
          { marginVertical: spacing },
          style,
        ]}
      >
        {labelPosition !== "left" && (
          <View style={[themed($line), lineStyle, { flex: labelPosition === "center" ? 1 : 0.2 }]} />
        )}
        <Text style={themed($label)}>{label}</Text>
        {labelPosition !== "right" && (
          <View style={[themed($line), lineStyle, { flex: labelPosition === "center" ? 1 : 0.8 }]} />
        )}
      </View>
    );
  }

  // Simple divider
  return (
    <View
      style={[
        themed($container),
        lineStyle,
        orientation === "horizontal"
          ? { marginVertical: spacing }
          : { marginHorizontal: spacing },
        style,
      ]}
    />
  );
};

// ==========================================
// Styles
// ==========================================

const $container: ThemedStyle<ViewStyle> = () => ({
  alignSelf: "stretch",
});

const $containerWithLabel: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
});

const $line: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

const $label: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  color: colors.textDim,
  fontFamily: typography.primary.medium,
});
