import { type FC, memo, useMemo } from "react";
import {
  Image,
  type ImageStyle,
  type StyleProp,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

import { Text } from "@/components/Text";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";
import type { Message } from "@/types/chat";

export interface MessageBubbleProps {
  /**
   * Message data
   */
  message: Message;
  /**
   * Whether the message is from the current user
   */
  isOwn: boolean;
  /**
   * Whether to show the avatar (for consecutive messages from same sender)
   */
  showAvatar?: boolean;
  /**
   * Partner avatar URL (for received messages)
   */
  partnerAvatar?: string;
  /**
   * Optional style override for the container
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * A bubble component for displaying individual chat messages.
 * Own messages appear on the right with primary color.
 * Partner messages appear on the left with neutral color.
 * @param {MessageBubbleProps} props - The props for the `MessageBubble` component.
 * @returns {JSX.Element} The rendered `MessageBubble` component.
 * @example
 * <MessageBubble
 *   message={message}
 *   isOwn={message.senderId === currentUserId}
 *   showAvatar={true}
 * />
 */
export const MessageBubble: FC<MessageBubbleProps> = memo(
  function MessageBubble(props) {
    const {
      message,
      isOwn,
      showAvatar = true,
      partnerAvatar,
      style: $styleOverride,
    } = props;
    const { themed } = useAppTheme();

    /**
     * Format message timestamp to display time (memoized)
     */
    const timeString = useMemo(() => {
      const timestamp = message.createdAt;
      if (!timestamp) return "";

      const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
      return format(date, "a h:mm", { locale: ko });
    }, [message.createdAt]);

    // System message rendering
    if (message.type === "system") {
      return (
        <View style={[themed($systemMessageContainer), $styleOverride]}>
          <Text text={message.text || ""} style={themed($systemMessageText)} />
        </View>
      );
    }

    return (
      <View
        style={[
          themed($container),
          isOwn ? themed($ownContainer) : themed($otherContainer),
          $styleOverride,
        ]}
        accessibilityRole="text"
        accessibilityLabel={`${isOwn ? "내 메시지" : "상대방 메시지"}: ${message.text || "이미지"}${timeString ? `, ${timeString}` : ""}`}
      >
        {/* Avatar (only for received messages) */}
        {!isOwn && showAvatar && (
          <View style={themed($avatarContainer)}>
            {partnerAvatar ? (
              <Image
                source={{ uri: partnerAvatar }}
                style={themed($avatar)}
                accessibilityElementsHidden
              />
            ) : (
              <View style={themed($avatarPlaceholder)} />
            )}
          </View>
        )}

        {/* Spacer when no avatar */}
        {!isOwn && !showAvatar && <View style={themed($avatarSpacer)} />}

        {/* Message Content */}
        <View style={themed($messageWrapper)}>
          {/* Time for own messages (left side) */}
          {isOwn && timeString && (
            <Text text={timeString} style={themed($timeOwn)} />
          )}

          {/* Bubble */}
          <View
            style={[
              themed($bubble),
              isOwn ? themed($ownBubble) : themed($otherBubble),
            ]}
          >
            {message.type === "image" && message.imageUrl ? (
              <Image
                source={{ uri: message.imageUrl }}
                style={themed($imageMessage)}
                resizeMode="cover"
                accessibilityLabel="이미지 메시지"
              />
            ) : (
              <Text
                text={message.text || ""}
                style={[themed($messageText), isOwn && themed($ownMessageText)]}
              />
            )}
          </View>

          {/* Time for received messages (right side) */}
          {!isOwn && timeString && (
            <Text text={timeString} style={themed($timeOther)} />
          )}
        </View>
      </View>
    );
  },
);

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  marginVertical: spacing.xxs,
  paddingHorizontal: spacing.sm,
});

const $ownContainer: ThemedStyle<ViewStyle> = () => ({
  justifyContent: "flex-end",
});

const $otherContainer: ThemedStyle<ViewStyle> = () => ({
  justifyContent: "flex-start",
});

const $avatarContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginRight: spacing.xs,
});

const $avatar: ThemedStyle<ImageStyle> = () => ({
  width: 32,
  height: 32,
  borderRadius: 16,
});

const $avatarPlaceholder: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: colors.palette.neutral300,
});

const $avatarSpacer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: 32,
  marginRight: spacing.xs,
});

const $messageWrapper: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "flex-end",
  maxWidth: "75%",
});

const $bubble: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  borderRadius: 16,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  maxWidth: "100%",
});

const $ownBubble: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.primary500,
  borderBottomRightRadius: 4,
});

const $otherBubble: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral200,
  borderBottomLeftRadius: 4,
});

const $messageText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 15,
  lineHeight: 20,
  color: colors.text,
});

const $ownMessageText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
});

const $timeOwn: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 11,
  color: colors.textDim,
  marginRight: spacing.xxs,
});

const $timeOther: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 11,
  color: colors.textDim,
  marginLeft: spacing.xxs,
});

const $imageMessage: ThemedStyle<ImageStyle> = () => ({
  width: 200,
  height: 200,
  borderRadius: 12,
});

const $systemMessageContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  marginVertical: spacing.sm,
  paddingHorizontal: spacing.lg,
});

const $systemMessageText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
  textAlign: "center",
});
