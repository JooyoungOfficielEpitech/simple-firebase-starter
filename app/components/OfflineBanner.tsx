/**
 * OfflineBanner Component
 * Displays a banner when the device is offline with slide animation
 * 오프라인 상태일 때 슬라이드 애니메이션과 함께 배너를 표시하는 컴포넌트
 */

import { type FC, useEffect } from "react";
import { type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@/theme/context";
import { type ThemedStyle } from "@/theme/types";
import { useNetwork } from "@/context/NetworkContext";

import { Text } from "./Text";
import { Icon } from "./Icon";

export interface OfflineBannerProps {
  /**
   * Override the automatic network detection visibility
   * 자동 네트워크 감지 가시성 오버라이드
   */
  visible?: boolean;
  /**
   * Custom message to display
   * 표시할 커스텀 메시지
   * @default "오프라인 상태입니다"
   */
  message?: string;
  /**
   * Optional style override for the banner container
   * 배너 컨테이너의 선택적 스타일 오버라이드
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Optional testID for E2E testing
   * E2E 테스트용 선택적 testID
   */
  testID?: string;
}

/**
 * A banner component that displays when the device is offline.
 * Automatically detects network state or can be manually controlled via the `visible` prop.
 * Features a smooth slide-in/slide-out animation.
 *
 * 디바이스가 오프라인일 때 표시되는 배너 컴포넌트.
 * 자동으로 네트워크 상태를 감지하거나 `visible` prop으로 수동 제어 가능.
 * 부드러운 슬라이드 인/아웃 애니메이션 제공.
 *
 * @example
 * // Auto-detect mode (recommended)
 * <OfflineBanner />
 *
 * // Manual control mode
 * <OfflineBanner visible={!isOnline} message="인터넷에 연결할 수 없습니다" />
 */
export const OfflineBanner: FC<OfflineBannerProps> = function OfflineBanner(
  props,
) {
  const {
    visible: visibleOverride,
    message = "오프라인 상태입니다",
    style: $styleOverride,
    testID,
  } = props;

  const { themed, theme } = useAppTheme();
  const { isConnected, isInternetReachable } = useNetwork();
  const insets = useSafeAreaInsets();

  // Determine visibility: use override if provided, otherwise use network state
  const isOffline =
    visibleOverride ?? (!isConnected || isInternetReachable === false);

  // Animation value for slide effect
  const slideProgress = useSharedValue(0);

  useEffect(() => {
    slideProgress.value = withSpring(isOffline ? 1 : 0, {
      damping: 15,
      stiffness: 150,
      mass: 0.8,
    });
  }, [isOffline, slideProgress]);

  // Animated style for slide in/out from top
  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      slideProgress.value,
      [0, 1],
      [-60, 0],
      Extrapolation.CLAMP,
    );

    const opacity = interpolate(
      slideProgress.value,
      [0, 0.5, 1],
      [0, 0.8, 1],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  // Don't render if not visible and animation is complete
  if (!isOffline && slideProgress.value === 0) {
    return null;
  }

  const topPadding = insets.top > 0 ? insets.top : theme.spacing.sm;

  return (
    <Animated.View
      style={[
        themed($container),
        { paddingTop: topPadding },
        animatedStyle,
        $styleOverride,
      ]}
      accessibilityRole="alert"
      accessibilityLabel={message}
      accessibilityLiveRegion="polite"
      testID={testID}
    >
      <Icon
        icon="view"
        size={18}
        color={theme.colors.palette.neutral100}
        containerStyle={themed($icon)}
        accessibilityElementsHidden
      />
      <Text style={themed($text)} numberOfLines={1}>
        {message}
      </Text>
    </Animated.View>
  );
};

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  backgroundColor: colors.error,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.md,
  zIndex: 9999,
  shadowColor: colors.palette.neutral900,
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
});

const $icon: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginRight: spacing.xs,
});

const $text: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 14,
  fontFamily: typography.primary.medium,
  textAlign: "center",
});

export default OfflineBanner;
