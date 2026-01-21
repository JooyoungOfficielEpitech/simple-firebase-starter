/**
 * Spacer Component
 * 간격 컴포넌트 - 레이아웃 간격 조정에 사용
 */

import { FC } from "react";
import { View, ViewStyle } from "react-native";

import { useAppTheme } from "@/theme/context";

// ==========================================
// Types
// ==========================================

export type SpacerSize = "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

export interface SpacerProps {
  /** Predefined size from theme spacing */
  size?: SpacerSize;
  /** Custom width (overrides size for horizontal) */
  width?: number;
  /** Custom height (overrides size for vertical) */
  height?: number;
  /** Flex value for flexible spacing */
  flex?: number;
  /** Container style override */
  style?: ViewStyle;
}

// ==========================================
// Component
// ==========================================

export const Spacer: FC<SpacerProps> = ({
  size = "md",
  width,
  height,
  flex,
  style,
}) => {
  const {
    theme: { spacing },
  } = useAppTheme();

  // Size to spacing mapping
  const getSizeValue = (): number => {
    switch (size) {
      case "xxs":
        return spacing.xxs;
      case "xs":
        return spacing.xs;
      case "sm":
        return spacing.sm;
      case "lg":
        return spacing.lg;
      case "xl":
        return spacing.xl;
      case "xxl":
        return spacing.xxl;
      default:
        return spacing.md;
    }
  };

  const sizeValue = getSizeValue();

  // If flex is provided, use flexible spacing
  if (flex !== undefined) {
    return <View style={[{ flex }, style]} />;
  }

  return (
    <View
      style={[
        {
          width: width ?? sizeValue,
          height: height ?? sizeValue,
        },
        style,
      ]}
    />
  );
};

// ==========================================
// Preset Spacers
// ==========================================

export const SpacerXXS: FC<Omit<SpacerProps, "size">> = (props) => (
  <Spacer size="xxs" {...props} />
);

export const SpacerXS: FC<Omit<SpacerProps, "size">> = (props) => (
  <Spacer size="xs" {...props} />
);

export const SpacerSM: FC<Omit<SpacerProps, "size">> = (props) => (
  <Spacer size="sm" {...props} />
);

export const SpacerMD: FC<Omit<SpacerProps, "size">> = (props) => (
  <Spacer size="md" {...props} />
);

export const SpacerLG: FC<Omit<SpacerProps, "size">> = (props) => (
  <Spacer size="lg" {...props} />
);

export const SpacerXL: FC<Omit<SpacerProps, "size">> = (props) => (
  <Spacer size="xl" {...props} />
);

export const SpacerXXL: FC<Omit<SpacerProps, "size">> = (props) => (
  <Spacer size="xxl" {...props} />
);

export const SpacerFlex: FC<Omit<SpacerProps, "flex">> = (props) => (
  <Spacer flex={1} {...props} />
);
