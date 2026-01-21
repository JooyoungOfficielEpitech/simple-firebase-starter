/**
 * Skeleton Component
 * 스켈레톤 로더 컴포넌트 - 콘텐츠 로딩 상태 표시
 */

import { FC, useEffect } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

// ==========================================
// Types
// ==========================================

export type SkeletonVariant = "text" | "circular" | "rectangular" | "rounded";

export interface SkeletonProps {
  /** Width of the skeleton */
  width?: number | string;
  /** Height of the skeleton */
  height?: number | string;
  /** Skeleton variant/shape */
  variant?: SkeletonVariant;
  /** Border radius (for rectangular variant) */
  borderRadius?: number;
  /** Disable animation */
  animation?: boolean;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Custom background color */
  backgroundColor?: string;
  /** Custom highlight color */
  highlightColor?: string;
  /** Container style override */
  style?: ViewStyle;
}

// ==========================================
// Component
// ==========================================

export const Skeleton: FC<SkeletonProps> = ({
  width = "100%",
  height = 20,
  variant = "text",
  borderRadius: customBorderRadius,
  animation = true,
  animationDuration = 1500,
  backgroundColor,
  highlightColor,
  style,
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme();

  const opacity = useSharedValue(0.3);

  useEffect(() => {
    if (animation) {
      opacity.value = withRepeat(
        withTiming(1, {
          duration: animationDuration / 2,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      );
    }
  }, [animation, animationDuration, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: animation ? opacity.value : 0.5,
  }));

  // Get border radius based on variant
  const getBorderRadius = (): number => {
    if (customBorderRadius !== undefined) return customBorderRadius;

    switch (variant) {
      case "circular":
        return typeof height === "number" ? height / 2 : 50;
      case "text":
        return 4;
      case "rounded":
        return 8;
      case "rectangular":
      default:
        return 0;
    }
  };

  // Get dimensions for circular variant
  const getDimensions = (): { width: number | `${number}%`; height: number | `${number}%` } => {
    if (variant === "circular") {
      const size = typeof height === "number" ? height : 40;
      return { width: size, height: size };
    }
    // Cast width and height to valid DimensionValue types
    const w = typeof width === "number" ? width : (width as `${number}%`);
    const h = typeof height === "number" ? height : (height as `${number}%`);
    return { width: w, height: h };
  };

  const dimensions = getDimensions();
  const bgColor = backgroundColor || colors.palette.neutral300;
  const hlColor = highlightColor || colors.palette.neutral400;

  return (
    <View
      style={[
        themed($container),
        {
          width: dimensions.width,
          height: dimensions.height,
          borderRadius: getBorderRadius(),
          backgroundColor: bgColor,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          themed($highlight),
          {
            backgroundColor: hlColor,
            borderRadius: getBorderRadius(),
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

// ==========================================
// Skeleton Group Component
// ==========================================

export interface SkeletonGroupProps {
  /** Number of skeleton items */
  count?: number;
  /** Gap between items */
  gap?: number;
  /** Direction of items */
  direction?: "row" | "column";
  /** Skeleton props to apply to all items */
  skeletonProps?: Omit<SkeletonProps, "style">;
  /** Container style override */
  style?: ViewStyle;
}

export const SkeletonGroup: FC<SkeletonGroupProps> = ({
  count = 3,
  gap = 8,
  direction = "column",
  skeletonProps,
  style,
}) => {
  const { themed } = useAppTheme();

  return (
    <View
      style={[
        themed($groupContainer),
        {
          flexDirection: direction,
          gap,
        },
        style,
      ]}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} {...skeletonProps} />
      ))}
    </View>
  );
};

// ==========================================
// Preset Skeletons
// ==========================================

export const SkeletonCard: FC<{ style?: ViewStyle }> = ({ style }) => {
  const { themed } = useAppTheme();

  return (
    <View style={[themed($cardContainer), style]}>
      <Skeleton variant="rectangular" height={120} borderRadius={8} />
      <View style={themed($cardContent)}>
        <Skeleton variant="text" width="80%" height={16} />
        <Skeleton variant="text" width="60%" height={14} />
        <View style={themed($cardFooter)}>
          <Skeleton variant="circular" height={24} />
          <Skeleton variant="text" width={60} height={12} />
        </View>
      </View>
    </View>
  );
};

export const SkeletonListItem: FC<{ style?: ViewStyle }> = ({ style }) => {
  const { themed } = useAppTheme();

  return (
    <View style={[themed($listItemContainer), style]}>
      <Skeleton variant="circular" height={48} />
      <View style={themed($listItemContent)}>
        <Skeleton variant="text" width="70%" height={16} />
        <Skeleton variant="text" width="40%" height={12} />
      </View>
    </View>
  );
};

// ==========================================
// Styles
// ==========================================

const $container: ThemedStyle<ViewStyle> = () => ({
  overflow: "hidden",
});

const $highlight: ThemedStyle<ViewStyle> = () => ({
  ...StyleSheet.absoluteFillObject,
});

const $groupContainer: ThemedStyle<ViewStyle> = () => ({});

const $cardContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: 12,
  overflow: "hidden",
  padding: spacing.sm,
  gap: spacing.sm,
});

const $cardContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
});

const $cardFooter: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
  marginTop: spacing.xs,
});

const $listItemContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.md,
  paddingVertical: spacing.sm,
});

const $listItemContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  gap: spacing.xs,
});

