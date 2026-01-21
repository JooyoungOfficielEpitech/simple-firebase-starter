/**
 * Chat Showcase Screen
 * 실시간 채팅 시스템 데모 화면
 */

import { FC, useCallback, useState } from "react";
import { Pressable, ScrollView, TextStyle, View, ViewStyle } from "react-native";

import { CodeBlock } from "@/components/CodeBlock";
import { Icon } from "@/components/Icon";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

// ==========================================
// Mock Data
// ==========================================

const SAMPLE_MESSAGES = [
  { id: "1", text: "Hey! How are you?", sender: "other", time: "10:30 AM" },
  { id: "2", text: "I'm doing great, thanks! Working on this awesome app.", sender: "me", time: "10:31 AM" },
  { id: "3", text: "That sounds exciting! Tell me more.", sender: "other", time: "10:32 AM" },
];

// ==========================================
// Code Examples
// ==========================================

const CHAT_SERVICE_CODE = `// Real-time message listener
const unsubscribe = chatService.subscribeToMessages(
  chatRoomId,
  (messages) => {
    setMessages(messages);
  }
);

// Send a message
await chatService.sendMessage(chatRoomId, {
  text: "Hello!",
  senderId: currentUser.uid,
  type: "text",
});`;

const FIRESTORE_REALTIME_CODE = `import firestore from "@react-native-firebase/firestore";

const subscribeToChat = (roomId: string, callback: Function) => {
  return firestore()
    .collection("chatRooms")
    .doc(roomId)
    .collection("messages")
    .orderBy("createdAt", "desc")
    .limit(50)
    .onSnapshot((snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(messages);
    });
};`;

const MESSAGE_TYPES_CODE = `interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  type: "text" | "image" | "file" | "system";
  createdAt: Timestamp;
  readBy: string[];
  metadata?: {
    imageUrl?: string;
    fileName?: string;
    fileSize?: number;
  };
}`;

const TYPING_INDICATOR_CODE = `// Optimistic typing indicator
const setTypingStatus = async (roomId: string, isTyping: boolean) => {
  await firestore()
    .collection("chatRooms")
    .doc(roomId)
    .update({
      [\`typing.\${currentUser.uid}\`]: isTyping
        ? firestore.FieldValue.serverTimestamp()
        : firestore.FieldValue.delete(),
    });
};

// Listen for typing
chatRoomRef.onSnapshot((doc) => {
  const typing = doc.data()?.typing || {};
  const typingUsers = Object.keys(typing)
    .filter((uid) => uid !== currentUser.uid);
  setIsOtherTyping(typingUsers.length > 0);
});`;

// ==========================================
// Component
// ==========================================

export const ChatShowcaseScreen: FC = function ChatShowcaseScreen() {
  const { themed, theme } = useAppTheme();
  const [isTyping, setIsTyping] = useState(false);

  const renderMessage = useCallback(
    (message: (typeof SAMPLE_MESSAGES)[0]) => {
      const isMe = message.sender === "me";
      return (
        <View
          key={message.id}
          style={[
            themed($messageContainer),
            isMe ? themed($messageContainerMe) : themed($messageContainerOther),
          ]}
        >
          <View
            style={[
              themed($messageBubble),
              isMe ? themed($messageBubbleMe) : themed($messageBubbleOther),
            ]}
          >
            <Text
              style={[
                themed($messageText),
                isMe ? themed($messageTextMe) : themed($messageTextOther),
              ]}
            >
              {message.text}
            </Text>
          </View>
          <Text style={themed($messageTime)}>{message.time}</Text>
        </View>
      );
    },
    [themed],
  );

  const renderFeature = useCallback(
    (icon: string, title: string, description: string) => (
      <View key={title} style={themed($featureItem)}>
        <View style={themed($featureIcon)}>
          <Icon
            icon={icon as "check" | "bell" | "menu"}
            size={20}
            color={theme.colors.tint}
          />
        </View>
        <View style={themed($featureContent)}>
          <Text style={themed($featureTitle)}>{title}</Text>
          <Text style={themed($featureDesc)}>{description}</Text>
        </View>
      </View>
    ),
    [themed, theme.colors.tint],
  );

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <ScrollView contentContainerStyle={themed($content)}>
        {/* Header */}
        <View style={themed($header)}>
          <Text preset="heading">Chat System</Text>
          <Text preset="default" style={themed($subtitle)}>
            Real-time messaging with Firestore
          </Text>
        </View>

        {/* Chat Preview */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Live Preview
          </Text>
          <View style={themed($chatPreview)}>
            <View style={themed($chatHeader)}>
              <View style={themed($chatAvatar)}>
                <Text style={themed($avatarText)}>JD</Text>
              </View>
              <View style={themed($chatInfo)}>
                <Text style={themed($chatName)}>John Doe</Text>
                <Text style={themed($chatStatus)}>
                  {isTyping ? "typing..." : "Online"}
                </Text>
              </View>
              <Icon icon="menu" size={20} color={theme.colors.textDim} />
            </View>
            <View style={themed($messagesContainer)}>
              {SAMPLE_MESSAGES.map(renderMessage)}
            </View>
            <View style={themed($inputContainer)}>
              <View style={themed($textInput)}>
                <Text style={themed($placeholderText)}>Type a message...</Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  themed($sendButton),
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => setIsTyping(!isTyping)}
              >
                <Icon icon="check" size={20} color={theme.colors.palette.neutral100} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Features */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Features
          </Text>
          <View style={themed($featuresCard)}>
            {renderFeature("check", "Real-time Messages", "Instant message delivery")}
            {renderFeature("check", "Read Receipts", "Track message read status")}
            {renderFeature("check", "Typing Indicators", "See when others are typing")}
            {renderFeature("check", "Image Sharing", "Send photos and images")}
            {renderFeature("check", "Push Notifications", "Never miss a message")}
            {renderFeature("check", "Offline Support", "Queue messages offline")}
          </View>
        </View>

        {/* Message Types */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Supported Message Types
          </Text>
          <View style={themed($typesGrid)}>
            <View style={themed($typeCard)}>
              <Icon icon="menu" size={24} color={theme.colors.tint} />
              <Text style={themed($typeName)}>Text</Text>
            </View>
            <View style={themed($typeCard)}>
              <Icon icon="menu" size={24} color={theme.colors.tint} />
              <Text style={themed($typeName)}>Image</Text>
            </View>
            <View style={themed($typeCard)}>
              <Icon icon="menu" size={24} color={theme.colors.tint} />
              <Text style={themed($typeName)}>File</Text>
            </View>
            <View style={themed($typeCard)}>
              <Icon icon="settings" size={24} color={theme.colors.tint} />
              <Text style={themed($typeName)}>System</Text>
            </View>
          </View>
        </View>

        {/* Code Examples */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Implementation
          </Text>
          <CodeBlock
            title="Chat Service Usage"
            code={CHAT_SERVICE_CODE}
            language="tsx"
          />
          <CodeBlock
            title="Firestore Real-time Listener"
            code={FIRESTORE_REALTIME_CODE}
            language="tsx"
          />
          <CodeBlock
            title="Message Type Definition"
            code={MESSAGE_TYPES_CODE}
            language="tsx"
          />
          <CodeBlock
            title="Typing Indicator"
            code={TYPING_INDICATOR_CODE}
            language="tsx"
          />
        </View>

        {/* Architecture */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Architecture
          </Text>
          <View style={themed($archCard)}>
            <View style={themed($archLayer)}>
              <Text style={themed($archLayerName)}>UI Layer</Text>
              <Text style={themed($archLayerDesc)}>
                ChatScreen, MessageList, ChatInput
              </Text>
            </View>
            <View style={themed($archArrow)}>
              <Text style={themed($archArrowText)}>↕</Text>
            </View>
            <View style={themed($archLayer)}>
              <Text style={themed($archLayerName)}>Service Layer</Text>
              <Text style={themed($archLayerDesc)}>
                ChatService, MessageQueue
              </Text>
            </View>
            <View style={themed($archArrow)}>
              <Text style={themed($archArrowText)}>↕</Text>
            </View>
            <View style={themed($archLayer)}>
              <Text style={themed($archLayerName)}>Data Layer</Text>
              <Text style={themed($archLayerDesc)}>
                Firestore, MMKV Cache
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

// ==========================================
// Styles
// ==========================================

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.xxl,
});

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.lg,
});

const $subtitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginTop: spacing.xs,
});

const $section: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  marginTop: spacing.lg,
});

const $sectionTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  marginBottom: spacing.md,
});

const $chatPreview: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  overflow: "hidden",
});

const $chatHeader: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  padding: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
  gap: spacing.sm,
});

const $chatAvatar: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.tint,
  justifyContent: "center",
  alignItems: "center",
});

const $avatarText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: "700",
  color: colors.palette.neutral100,
});

const $chatInfo: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

const $chatName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 15,
  fontWeight: "600",
  color: colors.text,
});

const $chatStatus: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.palette.secondary500,
});

const $messagesContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
  gap: spacing.sm,
});

const $messageContainer: ThemedStyle<ViewStyle> = () => ({});

const $messageContainerMe: ThemedStyle<ViewStyle> = () => ({
  alignItems: "flex-end",
});

const $messageContainerOther: ThemedStyle<ViewStyle> = () => ({
  alignItems: "flex-start",
});

const $messageBubble: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  maxWidth: "75%",
  padding: spacing.sm,
  borderRadius: 16,
});

const $messageBubbleMe: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
  borderBottomRightRadius: 4,
});

const $messageBubbleOther: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral300,
  borderBottomLeftRadius: 4,
});

const $messageText: ThemedStyle<TextStyle> = () => ({
  fontSize: 14,
});

const $messageTextMe: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
});

const $messageTextOther: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
});

const $messageTime: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 10,
  color: colors.textDim,
  marginTop: spacing.xxs,
});

const $inputContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  padding: spacing.md,
  borderTopWidth: 1,
  borderTopColor: colors.separator,
  gap: spacing.sm,
});

const $textInput: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  backgroundColor: colors.palette.neutral300,
  borderRadius: 20,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
});

const $placeholderText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.textDim,
});

const $sendButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: colors.tint,
  justifyContent: "center",
  alignItems: "center",
});

const $featuresCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
  gap: spacing.md,
});

const $featureItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  gap: spacing.md,
});

const $featureIcon: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 32,
  height: 32,
  borderRadius: 8,
  backgroundColor: colors.palette.neutral300,
  justifyContent: "center",
  alignItems: "center",
});

const $featureContent: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

const $featureTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
});

const $featureDesc: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
});

const $typesGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
});

const $typeCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
  alignItems: "center",
  gap: spacing.xs,
});

const $typeName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  fontWeight: "600",
  color: colors.text,
});

const $archCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
  alignItems: "center",
});

const $archLayer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: "100%",
  backgroundColor: colors.palette.neutral300,
  borderRadius: 8,
  padding: spacing.md,
  alignItems: "center",
});

const $archLayerName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
});

const $archLayerDesc: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
  textAlign: "center",
});

const $archArrow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xs,
});

const $archArrowText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 18,
  color: colors.textDim,
});

export default ChatShowcaseScreen;
