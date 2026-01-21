/**
 * SyncIndicator Component
 * Displays a syncing indicator with spinner and message
 * 스피너와 메시지를 포함한 동기화 표시기 컴포넌트
 */

import { type FC } from "react";
import {
  ActivityIndicator,
  type StyleProp,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";

import { useAppTheme } from "@/theme/context";
import { type ThemedStyle } from "@/theme/types";

import { Text } from "./Text";

export interface SyncIndicatorProps {
  /**
   * Whether syncing is in progress
   * 동기화 진행 여부
   */
  isSyncing: boolean;
  /**
   * Custom message to display while syncing
   * 동기화 중 표시할 커스텀 메시지
   * @default "동기화 중..."
   */
  message?: string;
  /**
   * Optional style override for the container
   * 컨테이너의 선택적 스타일 오버라이드
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Size of the spinner
   * 스피너 크기
   * @default "small"
   */
  spinnerSize?: "small" | "large";
  /**
   * Optional spinner color (defaults to theme primary)
   * 선택적 스피너 색상 (기본값: 테마 primary)
   */
  spinnerColor?: string;
  /**
   * Optional testID for E2E testing
   * E2E 테스트용 선택적 testID
   */
  testID?: string;
}

/**
 * A component that displays a syncing indicator with spinner and message.
 * Renders nothing when not syncing.
 *
 * 스피너와 메시지가 포함된 동기화 표시기 컴포넌트.
 * 동기화 중이 아닐 때는 렌더링하지 않음.
 *
 * @example
 * // Basic usage
 * <SyncIndicator isSyncing={isSyncing} />
 *
 * // With custom message
 * <SyncIndicator isSyncing={isSyncing} message="데이터를 저장하는 중..." />
 *
 * // With custom style
 * <SyncIndicator
 *   isSyncing={isSyncing}
 *   message="업로드 중..."
 *   style={{ marginTop: 8 }}
 * />
 */
export const SyncIndicator: FC<SyncIndicatorProps> = function SyncIndicator(
  props,
) {
  const {
    isSyncing,
    message = "동기화 중...",
    style: $styleOverride,
    spinnerSize = "small",
    spinnerColor,
    testID,
  } = props;

  const { themed, theme } = useAppTheme();

  // Don't render if not syncing
  if (!isSyncing) {
    return null;
  }

  return (
    <View
      style={[themed($container), $styleOverride]}
      accessibilityRole="progressbar"
      accessibilityLabel={message}
      accessibilityLiveRegion="polite"
      testID={testID}
    >
      <ActivityIndicator
        size={spinnerSize}
        color={spinnerColor ?? theme.colors.palette.primary500}
        style={themed($spinner)}
        accessibilityElementsHidden
      />
      <Text style={themed($text)} numberOfLines={1}>
        {message}
      </Text>
    </View>
  );
};

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.sm,
});

const $spinner: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginRight: spacing.xs,
});

const $text: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.textDim,
  fontSize: 13,
  fontFamily: typography.primary.normal,
});

export default SyncIndicator;
