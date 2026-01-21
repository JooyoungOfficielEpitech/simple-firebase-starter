import { type FC } from "react";
import {
  type StyleProp,
  View,
  type ViewStyle,
  type TextStyle,
} from "react-native";

import { useAppTheme } from "@/theme/context";
import { type ThemedStyle } from "@/theme/types";

import { Text } from "./Text";

export interface NotificationBadgeProps {
  /**
   * Number of unread notifications
   */
  count: number;
  /**
   * Optional style override for the badge container
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * A badge component that displays the count of unread notifications.
 * Shows numbers 1-99, or "99+" for counts over 99. Does not render if count is 0.
 * @param {NotificationBadgeProps} props - The props for the `NotificationBadge` component.
 * @returns {JSX.Element | null} The rendered `NotificationBadge` component, or null if count is 0.
 * @example
 * <NotificationBadge count={5} />
 * <NotificationBadge count={100} /> // Shows "99+"
 */
export const NotificationBadge: FC<NotificationBadgeProps> =
  function NotificationBadge(props) {
    const { count, style: $styleOverride } = props;
    const { themed } = useAppTheme();

    // Don't render if count is 0
    if (count <= 0) {
      return null;
    }

    // Display "99+" for counts over 99
    const displayCount = count > 99 ? "99+" : count.toString();

    return (
      <View
        style={[themed($container), $styleOverride]}
        accessibilityLabel={`${count}개의 읽지 않은 알림`}
        accessibilityRole="text"
      >
        <Text style={themed($text)} numberOfLines={1}>
          {displayCount}
        </Text>
      </View>
    );
  };

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.error,
  borderRadius: 10,
  minWidth: 20,
  height: 20,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 4,
});

const $text: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
  fontSize: 12,
  fontWeight: "bold",
  lineHeight: 16,
  textAlign: "center",
});
