import { type FC } from "react";
import {
  Pressable,
  type StyleProp,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

import { useAppTheme } from "@/theme/context";
import { type ThemedStyle } from "@/theme/types";

import { Text } from "./Text";

export interface NotificationCardProps {
  /**
   * Title of the notification
   */
  title: string;
  /**
   * Body content of the notification
   */
  body: string;
  /**
   * Timestamp when the notification was received
   */
  timestamp: Date;
  /**
   * Whether the notification has been read
   */
  isRead: boolean;
  /**
   * Callback when the notification card is pressed
   */
  onPress?: () => void;
  /**
   * Optional style override for the container
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * A card component that displays a notification item in a list.
 * Shows title, body, and relative timestamp (e.g., "5분 전").
 * Has different styles for read/unread states.
 * @param {NotificationCardProps} props - The props for the `NotificationCard` component.
 * @returns {JSX.Element} The rendered `NotificationCard` component.
 * @example
 * <NotificationCard
 *   title="새로운 매칭"
 *   body="새로운 매칭 요청이 도착했습니다."
 *   timestamp={new Date()}
 *   isRead={false}
 *   onPress={() => console.log('pressed')}
 * />
 */
export const NotificationCard: FC<NotificationCardProps> =
  function NotificationCard(props) {
    const {
      title,
      body,
      timestamp,
      isRead,
      onPress,
      style: $styleOverride,
    } = props;
    const { themed } = useAppTheme();

    /**
     * Format relative time from now
     * Shows "방금 전" for very recent, otherwise "X분 전", "X시간 전", etc.
     */
    const formatRelativeTime = (date: Date): string => {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      // Less than 1 minute ago
      if (diffInSeconds < 60) {
        return "방금 전";
      }

      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: ko,
      });
    };

    const relativeTime = formatRelativeTime(timestamp);

    return (
      <Pressable
        style={({ pressed }) => [
          themed($container),
          !isRead && themed($unreadContainer),
          pressed && themed($pressedContainer),
          $styleOverride,
        ]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${body}, ${relativeTime}${!isRead ? ", 읽지 않음" : ""}`}
        accessibilityState={{ selected: !isRead }}
      >
        {/* Unread indicator dot */}
        {!isRead && (
          <View style={themed($unreadDot)} accessibilityElementsHidden />
        )}

        <View style={themed($contentContainer)}>
          {/* Header: Title and Timestamp */}
          <View style={themed($headerRow)}>
            <Text
              text={title}
              style={[themed($title), !isRead && themed($unreadTitle)]}
              numberOfLines={1}
            />
            <Text
              text={relativeTime}
              style={themed($timestamp)}
              numberOfLines={1}
            />
          </View>

          {/* Body */}
          <Text
            text={body}
            style={[themed($body), !isRead && themed($unreadBody)]}
            numberOfLines={2}
          />
        </View>
      </Pressable>
    );
  };

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  backgroundColor: colors.palette.neutral100,
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
});

const $unreadContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.primary100,
});

const $pressedContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral200,
});

const $unreadDot: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: colors.palette.primary500,
  marginRight: spacing.xs,
  marginTop: 6,
});

const $contentContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

const $headerRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.xxs,
});

const $title: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  fontWeight: "500",
  color: colors.text,
  flex: 1,
  marginRight: 8,
});

const $unreadTitle: ThemedStyle<TextStyle> = () => ({
  fontWeight: "700",
});

const $timestamp: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
});

const $body: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.textDim,
  lineHeight: 20,
});

const $unreadBody: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
});
