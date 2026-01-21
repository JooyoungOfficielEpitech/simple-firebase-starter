import { type FC, memo, useMemo, useCallback } from "react";
import {
  Image,
  type ImageStyle,
  Pressable,
  type StyleProp,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

import { Text } from "@/components/Text";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";
import type { ChatListItem as ChatListItemType } from "@/types/chat";

export interface ChatListItemProps {
  /**
   * Chat list item data
   */
  chatItem: ChatListItemType;
  /**
   * Callback when the chat item is pressed
   */
  onPress: () => void;
  /**
   * Optional style override for the container
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * A list item component for displaying chat room in the chat list.
 * Shows avatar, partner name, last message, time, and unread count badge.
 * @param {ChatListItemProps} props - The props for the `ChatListItem` component.
 * @returns {JSX.Element} The rendered `ChatListItem` component.
 * @example
 * <ChatListItem
 *   chatItem={chatItem}
 *   onPress={() => navigateToChatRoom(chatItem.chatId)}
 * />
 */
export const ChatListItem: FC<ChatListItemProps> = memo(
  function ChatListItem(props) {
    const { chatItem, onPress, style: $styleOverride } = props;
    const { themed } = useAppTheme();

    /**
     * Format relative time from now (memoized)
     * Shows "방금" for very recent, otherwise "X분 전", "X시간 전", etc.
     */
    const relativeTime = useMemo(() => {
      const date = chatItem.lastMessageTime;
      if (!date) return "";

      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      // Less than 1 minute ago
      if (diffInSeconds < 60) {
        return "방금";
      }

      return formatDistanceToNow(date, {
        addSuffix: false,
        locale: ko,
      });
    }, [chatItem.lastMessageTime]);

    const hasUnread = chatItem.unreadCount > 0;

    return (
      <Pressable
        style={({ pressed }) => [
          themed($container),
          pressed && themed($pressedContainer),
          $styleOverride,
        ]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${chatItem.partnerName}님과의 채팅${chatItem.lastMessage ? `, 마지막 메시지: ${chatItem.lastMessage}` : ""}${hasUnread ? `, 읽지 않은 메시지 ${chatItem.unreadCount}개` : ""}`}
        accessibilityHint="탭하여 채팅방으로 이동"
      >
        {/* Avatar */}
        <View style={themed($avatarContainer)}>
          {chatItem.partnerAvatar ? (
            <Image
              source={{ uri: chatItem.partnerAvatar }}
              style={themed($avatar)}
              accessibilityElementsHidden
            />
          ) : (
            <View style={themed($avatarPlaceholder)}>
              <Text style={themed($avatarPlaceholderText)}>
                {chatItem.partnerName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={themed($contentContainer)}>
          {/* Header: Name and Time */}
          <View style={themed($headerRow)}>
            <Text
              text={chatItem.partnerName}
              style={[themed($name), hasUnread && themed($unreadName)]}
              numberOfLines={1}
            />
            {relativeTime && (
              <Text
                text={relativeTime}
                style={themed($timestamp)}
                numberOfLines={1}
              />
            )}
          </View>

          {/* Last Message */}
          <View style={themed($messageRow)}>
            <Text
              text={chatItem.lastMessage || "메시지가 없습니다"}
              style={[
                themed($lastMessage),
                hasUnread && themed($unreadLastMessage),
              ]}
              numberOfLines={1}
            />
            {hasUnread && (
              <View
                style={themed($unreadBadge)}
                accessibilityLabel={`읽지 않은 메시지 ${chatItem.unreadCount}개`}
              >
                <Text
                  text={
                    chatItem.unreadCount > 99
                      ? "99+"
                      : String(chatItem.unreadCount)
                  }
                  style={themed($unreadBadgeText)}
                />
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  },
);

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.background,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
});

const $pressedContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral200,
});

const $avatarContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginRight: spacing.sm,
});

const $avatar: ThemedStyle<ImageStyle> = () => ({
  width: 56,
  height: 56,
  borderRadius: 28,
});

const $avatarPlaceholder: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: colors.palette.primary200,
  justifyContent: "center",
  alignItems: "center",
});

const $avatarPlaceholderText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 22,
  fontWeight: "600",
  color: colors.palette.primary600,
});

const $contentContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  justifyContent: "center",
});

const $headerRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.xxs,
});

const $name: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  fontWeight: "500",
  color: colors.text,
  flex: 1,
  marginRight: 8,
});

const $unreadName: ThemedStyle<TextStyle> = () => ({
  fontWeight: "700",
});

const $timestamp: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
});

const $messageRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
});

const $lastMessage: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.textDim,
  flex: 1,
  marginRight: 8,
});

const $unreadLastMessage: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
});

const $unreadBadge: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.primary500,
  borderRadius: 12,
  minWidth: 24,
  height: 24,
  paddingHorizontal: 8,
  justifyContent: "center",
  alignItems: "center",
});

const $unreadBadgeText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  fontWeight: "600",
  color: colors.palette.neutral100,
});
