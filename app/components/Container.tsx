/**
 * Container Component
 * 컨테이너 레이아웃 컴포넌트 - 일관된 패딩과 최대 너비 제공
 */

import { FC, ReactNode } from "react";
import { View, ViewStyle, useWindowDimensions } from "react-native";

import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

// ==========================================
// Types
// ==========================================

export type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

export interface ContainerProps {
  /** 컨테이너 내용 */
  children: ReactNode;
  /** 컨테이너 크기 */
  size?: ContainerSize;
  /** 가로 중앙 정렬 */
  centered?: boolean;
  /** 가로 패딩 */
  horizontalPadding?: boolean;
  /** 세로 패딩 */
  verticalPadding?: boolean;
  /** 컨테이너 스타일 */
  style?: ViewStyle;
}

// ==========================================
// Constants
// ==========================================

const MAX_WIDTHS: Record<ContainerSize, number | undefined> = {
  sm: 540,
  md: 720,
  lg: 960,
  xl: 1140,
  full: undefined,
};

// ==========================================
// Component
// ==========================================

export const Container: FC<ContainerProps> = ({
  children,
  size = "full",
  centered = true,
  horizontalPadding = true,
  verticalPadding = false,
  style,
}) => {
  const { themed, theme: { spacing } } = useAppTheme();
  const { width: screenWidth } = useWindowDimensions();

  const maxWidth = MAX_WIDTHS[size];
  const containerWidth = maxWidth ? Math.min(screenWidth, maxWidth) : "100%";

  return (
    <View
      style={[
        themed($container),
        {
          width: containerWidth,
          paddingHorizontal: horizontalPadding ? spacing.lg : 0,
          paddingVertical: verticalPadding ? spacing.lg : 0,
        },
        centered && $centered,
        style,
      ]}
    >
      {children}
    </View>
  );
};

// ==========================================
// Styles
// ==========================================

const $container: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
});

const $centered: ViewStyle = {
  alignSelf: "center",
};
