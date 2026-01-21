import { type FC, useCallback, useEffect, useState, useRef } from "react";
import {
  Alert,
  FlatList,
  type ListRenderItem,
  RefreshControl,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";
import auth from "@react-native-firebase/auth";

import { Button } from "@/components/Button";
import { ChatListItem } from "@/components/chat";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import type { ChatStackScreenProps } from "@/navigators/ChatNavigator";
import { chatService } from "@/services/chat";
import { userService } from "@/services/firestore";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";
import type { ChatListItem as ChatListItemType, ChatRoom } from "@/types/chat";

export interface ChatListScreenProps extends ChatStackScreenProps<"ChatList"> {}

/**
 * Chat list screen that displays all chat rooms for the current user.
 * Features:
 * - Real-time chat room updates
 * - FlatList for efficient rendering
 * - Pull to refresh functionality
 * - Empty state when no chats
 * - Navigate to create new chat
 */
export const ChatListScreen: FC<ChatListScreenProps> = function ChatListScreen({
  navigation,
}) {
  const { themed, theme } = useAppTheme();

  const [chatRooms, setChatRooms] = useState<ChatListItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const currentUserId = auth().currentUser?.uid;
  const unreadCountsRef = useRef<Map<string, number>>(new Map());

  /**
   * Transform ChatRoom to ChatListItem for UI display
   */
  const transformChatRoomToListItem = useCallback(
    (room: ChatRoom, unreadCount: number = 0): ChatListItemType | null => {
      if (!currentUserId) return null;

      // Find the partner (the other participant)
      const partnerId = room.participants.find((id) => id !== currentUserId);
      if (!partnerId) return null;

      const partnerInfo = room.participantInfo[partnerId];

      return {
        chatId: room.id,
        partnerId,
        partnerName: partnerInfo?.name || "알 수 없음",
        partnerAvatar: partnerInfo?.avatar,
        lastMessage: room.lastMessage?.text,
        lastMessageTime: room.lastMessage?.timestamp?.toDate(),
        unreadCount,
      };
    },
    [currentUserId],
  );

  /**
   * Fetch unread counts for all chat rooms
   */
  const fetchUnreadCounts = useCallback(
    async (rooms: ChatRoom[]): Promise<Map<string, number>> => {
      const counts = new Map<string, number>();

      await Promise.all(
        rooms.map(async (room) => {
          try {
            const count = await chatService.getUnreadCount(room.id);
            counts.set(room.id, count);
          } catch (error) {
            console.error(`읽지 않은 메시지 수 조회 실패 (${room.id}):`, error);
            counts.set(room.id, 0);
          }
        }),
      );

      return counts;
    },
    [],
  );

  /**
   * Subscribe to chat rooms
   */
  useEffect(() => {
    if (!currentUserId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribe = chatService.subscribeToChatRooms(
      currentUserId,
      async (rooms) => {
        // Fetch unread counts for all rooms
        const unreadCounts = await fetchUnreadCounts(rooms);
        unreadCountsRef.current = unreadCounts;

        const transformedRooms = rooms
          .map((room) =>
            transformChatRoomToListItem(room, unreadCounts.get(room.id) || 0),
          )
          .filter((item): item is ChatListItemType => item !== null);

        setChatRooms(transformedRooms);
        setIsLoading(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [currentUserId, transformChatRoomToListItem, fetchUnreadCounts]);

  /**
   * Handle pull to refresh
   */
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // The subscription will automatically update, but we simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  }, []);

  /**
   * Navigate to chat room
   */
  const handleChatPress = useCallback(
    (chatItem: ChatListItemType) => {
      navigation.navigate("ChatRoom", {
        chatId: chatItem.chatId,
        partnerName: chatItem.partnerName,
        partnerAvatar: chatItem.partnerAvatar,
        partnerId: chatItem.partnerId,
      });
    },
    [navigation],
  );

  /**
   * Navigate to new chat screen
   */
  const handleNewChat = useCallback(() => {
    navigation.navigate("NewChat");
  }, [navigation]);

  /**
   * Render individual chat item
   */
  const renderChatItem: ListRenderItem<ChatListItemType> = useCallback(
    ({ item }) => (
      <ChatListItem chatItem={item} onPress={() => handleChatPress(item)} />
    ),
    [handleChatPress],
  );

  /**
   * Extract unique key for FlatList
   */
  const keyExtractor = useCallback((item: ChatListItemType) => item.chatId, []);

  /**
   * Render empty state when no chats
   */
  const renderEmptyState = useCallback(
    () => (
      <View style={themed($emptyContainer)}>
        <Text style={themed($emptyIcon)}>{"💬"}</Text>
        <Text style={themed($emptyTitle)}>채팅이 없습니다</Text>
        <Text style={themed($emptyDescription)}>
          새로운 대화를 시작해보세요!
        </Text>
        <Button
          text="새 채팅 시작"
          preset="cta"
          onPress={handleNewChat}
          style={themed($newChatButton)}
        />
      </View>
    ),
    [themed, handleNewChat],
  );

  /**
   * Render loading state
   */
  if (isLoading && chatRooms.length === 0) {
    return (
      <Screen
        preset="fixed"
        contentContainerStyle={$styles.flex1}
        safeAreaEdges={["top"]}
      >
        <View style={themed($header)}>
          <Text style={themed($headerTitle)} preset="heading">
            채팅
          </Text>
        </View>
        <View style={themed($loadingContainer)}>
          <Text style={themed($loadingText)}>채팅 목록을 불러오는 중...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      preset="fixed"
      contentContainerStyle={$styles.flex1}
      safeAreaEdges={["top"]}
    >
      {/* Header */}
      <View style={themed($header)}>
        <Text style={themed($headerTitle)} preset="heading">
          채팅
        </Text>
        {chatRooms.length > 0 && (
          <Text style={themed($chatCount)}>{chatRooms.length}개의 대화</Text>
        )}
      </View>

      {/* Chat List */}
      <FlatList
        data={chatRooms}
        renderItem={renderChatItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={themed($listContent)}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.tint}
            colors={[theme.colors.tint]}
          />
        }
        showsVerticalScrollIndicator={false}
        accessibilityRole="list"
        accessibilityLabel="채팅 목록"
      />

      {/* Floating New Chat Button (when there are chats) */}
      {chatRooms.length > 0 && (
        <View style={themed($fabContainer)}>
          <Button
            text="+"
            preset="cta"
            onPress={handleNewChat}
            style={themed($fab)}
            textStyle={themed($fabText)}
            accessibilityLabel="새 채팅 시작"
            accessibilityHint="탭하여 새로운 대화를 시작합니다"
          />
        </View>
      )}
    </Screen>
  );
};

const $header: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
  backgroundColor: colors.background,
});

const $headerTitle: ThemedStyle<TextStyle> = () => ({
  fontSize: 28,
  marginBottom: 4,
});

const $chatCount: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.textDim,
});

const $listContent: ThemedStyle<ViewStyle> = () => ({
  flexGrow: 1,
});

const $loadingContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
});

const $loadingText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  color: colors.textDim,
});

const $emptyContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: spacing.xl,
  paddingVertical: spacing.xxxl,
});

const $emptyIcon: ThemedStyle<TextStyle> = ({ spacing }) => ({
  fontSize: 64,
  marginBottom: spacing.md,
});

const $emptyTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 20,
  fontWeight: "600",
  color: colors.text,
  marginBottom: spacing.xs,
  textAlign: "center",
});

const $emptyDescription: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 16,
  color: colors.textDim,
  textAlign: "center",
  lineHeight: 24,
  marginBottom: spacing.lg,
});

const $newChatButton: ThemedStyle<ViewStyle> = () => ({
  minWidth: 160,
});

const $fabContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "absolute",
  bottom: spacing.lg,
  right: spacing.lg,
  zIndex: 999,
  elevation: 8,
});

const $fab: ThemedStyle<ViewStyle> = () => ({
  width: 56,
  height: 56,
  borderRadius: 28,
  minHeight: 56,
  paddingVertical: 0,
  paddingHorizontal: 0,
});

const $fabText: ThemedStyle<TextStyle> = () => ({
  fontSize: 28,
  fontWeight: "400",
});
