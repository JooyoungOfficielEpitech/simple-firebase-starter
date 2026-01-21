/**
 * NetworkStatusIcon Component
 * Displays network status icon with color indication
 * 색상 표시가 있는 네트워크 상태 아이콘 컴포넌트
 */

import { type FC } from "react";
import {
  type StyleProp,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";

import { useAppTheme } from "@/theme/context";
import { type ThemedStyle } from "@/theme/types";
import { useNetwork } from "@/context/NetworkContext";

import { Text } from "./Text";
import { Icon } from "./Icon";

export interface NetworkStatusIconProps {
  /**
   * Size of the icon in pixels
   * 아이콘 크기 (픽셀)
   * @default 24
   */
  size?: number;
  /**
   * Whether to show a label next to the icon
   * 아이콘 옆에 라벨 표시 여부
   * @default false
   */
  showLabel?: boolean;
  /**
   * Optional style override for the container
   * 컨테이너의 선택적 스타일 오버라이드
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Optional testID for E2E testing
   * E2E 테스트용 선택적 testID
   */
  testID?: string;
}

/**
 * A component that displays the current network status as an icon.
 * - Connected (WiFi): Green color with WiFi indicator
 * - Connected (Cellular): Green color with cellular indicator
 * - Offline: Red color with offline indicator
 *
 * 현재 네트워크 상태를 아이콘으로 표시하는 컴포넌트.
 * - 연결됨 (WiFi): 초록색 WiFi 표시
 * - 연결됨 (셀룰러): 초록색 셀룰러 표시
 * - 오프라인: 빨간색 오프라인 표시
 *
 * @example
 * // Icon only
 * <NetworkStatusIcon />
 *
 * // With label
 * <NetworkStatusIcon showLabel />
 *
 * // Custom size
 * <NetworkStatusIcon size={32} showLabel />
 */
export const NetworkStatusIcon: FC<NetworkStatusIconProps> =
  function NetworkStatusIcon(props) {
    const {
      size = 24,
      showLabel = false,
      style: $styleOverride,
      testID,
    } = props;

    const { themed, theme } = useAppTheme();
    const { isConnected, connectionType, isInternetReachable } = useNetwork();

    // Determine the actual online status
    const isOnline = isConnected && isInternetReachable !== false;

    // Get status color based on connection state
    const getStatusColor = (): string => {
      if (!isOnline) {
        return theme.colors.error;
      }
      return theme.colors.palette.secondary500; // Green for connected
    };

    // Get status label based on connection type
    const getStatusLabel = (): string => {
      if (!isOnline) {
        return "오프라인";
      }

      switch (connectionType) {
        case "wifi":
          return "WiFi";
        case "cellular":
          return "셀룰러";
        case "ethernet":
          return "이더넷";
        case "vpn":
          return "VPN";
        default:
          return "연결됨";
      }
    };

    // Get accessibility label
    const getAccessibilityLabel = (): string => {
      if (!isOnline) {
        return "네트워크 연결 끊김";
      }

      const label = getStatusLabel();
      return `네트워크 연결됨: ${label}`;
    };

    const statusColor = getStatusColor();
    const statusLabel = getStatusLabel();

    return (
      <View
        style={[themed($container), $styleOverride]}
        accessibilityLabel={getAccessibilityLabel()}
        accessibilityRole="text"
        testID={testID}
      >
        <View style={[themed($iconContainer), { width: size, height: size }]}>
          {/* Status indicator dot */}
          <View
            style={[
              themed($statusDot),
              {
                backgroundColor: statusColor,
                width: size * 0.35,
                height: size * 0.35,
                borderRadius: (size * 0.35) / 2,
              },
            ]}
            accessibilityElementsHidden
          />
          {/* Network icon */}
          <Icon
            icon="view"
            size={size * 0.6}
            color={isOnline ? theme.colors.text : theme.colors.textDim}
            accessibilityElementsHidden
          />
        </View>

        {showLabel && (
          <Text
            style={[
              themed($label),
              { color: isOnline ? theme.colors.text : theme.colors.error },
            ]}
            numberOfLines={1}
          >
            {statusLabel}
          </Text>
        )}
      </View>
    );
  };

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
});

const $iconContainer: ThemedStyle<ViewStyle> = () => ({
  position: "relative",
  alignItems: "center",
  justifyContent: "center",
});

const $statusDot: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  top: 0,
  right: 0,
  borderWidth: 1.5,
  borderColor: colors.background,
  zIndex: 1,
});

const $label: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.medium,
});

export default NetworkStatusIcon;
