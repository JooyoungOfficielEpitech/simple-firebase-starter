import {
  type FC,
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import {
  FlatList,
  type ListRenderItem,
  type TextStyle,
  View,
  type ViewStyle,
  ActivityIndicator,
} from "react-native";
import auth from "@react-native-firebase/auth";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

import { Alert } from "react-native";

import { Header } from "@/components/Header";
import {
  MessageBubble,
  MessageInput,
  TypingIndicator,
  DateSeparator,
} from "@/components/chat";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import type { ChatStackScreenProps } from "@/navigators/ChatNavigator";
import { chatService } from "@/services/chat";
import { imageService } from "@/services/storage/imageService";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";
import type { Message } from "@/types/chat";

export interface ChatRoomScreenProps extends ChatStackScreenProps<"ChatRoom"> {}

interface MessageWithDate {
  type: "message" | "date";
  data: Message | Date;
  key: string;
}

// 메시지 아이템 높이 (대략적인 값, 실제로는 가변적)
const ESTIMATED_MESSAGE_HEIGHT = 60;
const INITIAL_MESSAGES_LIMIT = 30;
const LOAD_MORE_LIMIT = 30;

/**
 * Chat room screen for viewing and sending messages in a conversation.
 * Features:
 * - Real-time message updates
 * - Inverted FlatList for chat-style scroll
 * - Send text messages
 * - Typing indicator
 * - Date separators between message groups
 * - Infinite scroll pagination
 * - Mark messages as read
 */
export const ChatRoomScreen: FC<ChatRoomScreenProps> = function ChatRoomScreen({
  route,
  navigation,
}) {
  const { themed, theme } = useAppTheme();

  const chatId = route.params.chatId;
  const partnerName = route.params.partnerName || "채팅";
  const partnerAvatar = route.params.partnerAvatar;
  const partnerId = route.params.partnerId;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);

  const currentUserId = auth().currentUser?.uid;
  const flatListRef = useRef<FlatList>(null);
  const lastDocRef =
    useRef<FirebaseFirestoreTypes.QueryDocumentSnapshot | null>(null);
  const latestTimestampRef = useRef<FirebaseFirestoreTypes.Timestamp | null>(
    null,
  );
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  const isPartnerTyping = typingUserIds.includes(partnerId);

  /**
   * 초기 메시지 로드 및 실시간 구독 설정 (최적화)
   */
  useEffect(() => {
    if (!chatId || isInitializedRef.current) {
      return;
    }

    let unsubscribe: (() => void) | null = null;

    const initializeChat = async () => {
      setIsLoading(true);

      try {
        // 1. 초기 메시지 로드
        const {
          messages: initialMessages,
          lastDoc,
          latestTimestamp,
        } = await chatService.getInitialMessages(
          chatId,
          INITIAL_MESSAGES_LIMIT,
        );

        setMessages(initialMessages);
        lastDocRef.current = lastDoc;
        latestTimestampRef.current = latestTimestamp;
        setHasMoreMessages(initialMessages.length >= INITIAL_MESSAGES_LIMIT);

        // 읽지 않은 메시지 읽음 처리
        const unreadMessageIds = initialMessages
          .filter(
            (msg) =>
              msg.senderId !== currentUserId &&
              !msg.readBy?.includes(currentUserId || ""),
          )
          .map((msg) => msg.id);

        if (unreadMessageIds.length > 0 && currentUserId) {
          chatService.markAsRead(chatId, unreadMessageIds).catch(console.error);
        }

        // 2. 새 메시지만 실시간 구독 (초기 로드 이후)
        unsubscribe = chatService.subscribeToNewMessages(
          chatId,
          latestTimestamp,
          // 새 메시지 추가
          (newMessages) => {
            setMessages((prev) => {
              // 중복 방지
              const newIds = new Set(newMessages.map((m) => m.id));
              const filtered = prev.filter((m) => !newIds.has(m.id));
              // 새 메시지를 앞에 추가 (최신순)
              return [...newMessages.reverse(), ...filtered];
            });

            // 새 메시지 읽음 처리
            const unreadIds = newMessages
              .filter(
                (msg) =>
                  msg.senderId !== currentUserId &&
                  !msg.readBy?.includes(currentUserId || ""),
              )
              .map((msg) => msg.id);

            if (unreadIds.length > 0 && currentUserId) {
              chatService.markAsRead(chatId, unreadIds).catch(console.error);
            }

            // 최신 타임스탬프 업데이트
            if (newMessages.length > 0) {
              const latestMsg = newMessages[newMessages.length - 1];
              if (latestMsg.createdAt) {
                latestTimestampRef.current =
                  latestMsg.createdAt as FirebaseFirestoreTypes.Timestamp;
              }
            }
          },
          // 메시지 수정 (읽음 상태 등)
          (modifiedMessages) => {
            setMessages((prev) =>
              prev.map((msg) => {
                const modified = modifiedMessages.find((m) => m.id === msg.id);
                return modified || msg;
              }),
            );
          },
        );

        isInitializedRef.current = true;
      } catch (error) {
        console.error("채팅 초기화 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      isInitializedRef.current = false;
    };
  }, [chatId, currentUserId]);

  /**
   * Subscribe to typing status
   */
  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = chatService.subscribeToTypingStatus(
      chatId,
      (userIds) => {
        setTypingUserIds(userIds);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [chatId]);

  /**
   * Clean up typing status on unmount
   */
  useEffect(() => {
    return () => {
      if (chatId) {
        chatService.setTypingStatus(chatId, false).catch(console.error);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [chatId]);

  /**
   * Handle sending a text message
   */
  const handleSend = useCallback(
    async (text: string) => {
      if (!chatId || !text.trim()) return;

      setIsSending(true);

      // Stop typing indicator
      chatService.setTypingStatus(chatId, false).catch(console.error);

      try {
        await chatService.sendMessage(chatId, {
          text,
          type: "text",
        });
      } catch (error) {
        console.error("메시지 전송 실패:", error);
        Alert.alert(
          "전송 실패",
          "메시지를 전송하지 못했습니다. 다시 시도해주세요.",
        );
      } finally {
        setIsSending(false);
      }
    },
    [chatId],
  );

  /**
   * Handle image picker press - shows action sheet to choose camera or gallery
   */
  const handleImagePick = useCallback(() => {
    Alert.alert(
      "이미지 선택",
      "이미지를 어디서 가져올까요?",
      [
        {
          text: "카메라",
          onPress: () => handleImageSource("camera"),
        },
        {
          text: "갤러리",
          onPress: () => handleImageSource("gallery"),
        },
        {
          text: "취소",
          style: "cancel",
        },
      ],
      { cancelable: true },
    );
  }, []);

  /**
   * Handle image source selection and upload
   */
  const handleImageSource = useCallback(
    async (source: "camera" | "gallery") => {
      if (!chatId || isUploadingImage) return;

      setIsUploadingImage(true);

      try {
        // 1. 이미지 선택
        const pickedImage = await imageService.pickImage(source, {
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (!pickedImage) {
          setIsUploadingImage(false);
          return;
        }

        // 2. 이미지 압축
        const compressedUri = await imageService.compressImage(pickedImage.uri, {
          maxWidth: 1080,
          maxHeight: 1080,
          quality: 0.7,
        });

        // 3. Firebase Storage에 업로드
        const uploadResult = await imageService.uploadImage(compressedUri, {
          path: `chats/${chatId}/images`,
        });

        // 4. 메시지 전송
        await chatService.sendMessage(chatId, {
          type: "image",
          imageUrl: uploadResult.downloadUrl,
        });
      } catch (error) {
        console.error("이미지 전송 실패:", error);
        Alert.alert(
          "전송 실패",
          "이미지를 전송하지 못했습니다. 다시 시도해주세요.",
        );
      } finally {
        setIsUploadingImage(false);
      }
    },
    [chatId, isUploadingImage],
  );

  /**
   * Load more messages for pagination (무한 스크롤)
   */
  const handleLoadMore = useCallback(async () => {
    if (!chatId || isLoadingMore || !hasMoreMessages || !lastDocRef.current)
      return;

    setIsLoadingMore(true);

    try {
      const result = await chatService.getMessages(
        chatId,
        LOAD_MORE_LIMIT,
        lastDocRef.current,
      );

      if (result.messages.length > 0) {
        setMessages((prev) => {
          // 중복 방지
          const existingIds = new Set(prev.map((m) => m.id));
          const newMessages = result.messages.filter(
            (m) => !existingIds.has(m.id),
          );
          return [...prev, ...newMessages];
        });
        lastDocRef.current = result.lastDoc;
      }

      if (result.messages.length < LOAD_MORE_LIMIT) {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error("메시지 더 불러오기 실패:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [chatId, isLoadingMore, hasMoreMessages]);

  /**
   * FlatList onEndReached 핸들러 (무한 스크롤)
   */
  const handleEndReached = useCallback(() => {
    if (hasMoreMessages && !isLoadingMore) {
      handleLoadMore();
    }
  }, [handleLoadMore, hasMoreMessages, isLoadingMore]);

  /**
   * FlatList getItemLayout for performance optimization
   * 대략적인 높이 추정 (실제 높이는 가변적)
   */
  const getItemLayout = useCallback(
    (_data: ArrayLike<MessageWithDate> | null | undefined, index: number) => ({
      length: ESTIMATED_MESSAGE_HEIGHT,
      offset: ESTIMATED_MESSAGE_HEIGHT * index,
      index,
    }),
    [],
  );

  /**
   * Transform messages to include date separators
   */
  const messagesWithDates = useMemo((): MessageWithDate[] => {
    if (messages.length === 0) return [];

    const result: MessageWithDate[] = [];
    let lastDate: string | null = null;

    // Messages are in descending order (newest first)
    // Reverse iterate to process oldest first for date grouping
    const sortedMessages = [...messages].reverse();

    for (const message of sortedMessages) {
      const messageDate = message.createdAt?.toDate?.() || new Date();
      const dateString = messageDate.toDateString();

      if (dateString !== lastDate) {
        result.push({
          type: "date",
          data: messageDate,
          key: `date-${dateString}`,
        });
        lastDate = dateString;
      }

      result.push({
        type: "message",
        data: message,
        key: message.id,
      });
    }

    // Reverse back to newest first for inverted FlatList
    return result.reverse();
  }, [messages]);

  /**
   * Render individual message or date separator
   */
  const renderItem: ListRenderItem<MessageWithDate> = useCallback(
    ({ item, index }) => {
      if (item.type === "date") {
        return <DateSeparator date={item.data as Date} />;
      }

      const message = item.data as Message;
      const isOwn = message.senderId === currentUserId;

      // Check if we should show avatar (different sender from previous message)
      const nextItem = messagesWithDates[index + 1];
      const showAvatar =
        !isOwn &&
        (nextItem?.type === "date" ||
          (nextItem?.type === "message" &&
            (nextItem.data as Message).senderId !== message.senderId));

      return (
        <MessageBubble
          message={message}
          isOwn={isOwn}
          showAvatar={showAvatar}
          partnerAvatar={partnerAvatar}
        />
      );
    },
    [currentUserId, messagesWithDates, partnerAvatar],
  );

  /**
   * Extract unique key for FlatList
   */
  const keyExtractor = useCallback((item: MessageWithDate) => item.key, []);

  /**
   * Render empty state when no messages
   */
  const renderEmptyState = useCallback(
    () => (
      <View style={themed($emptyContainer)}>
        <Text style={themed($emptyText)}>
          {partnerName}님과의 대화를 시작해보세요!
        </Text>
      </View>
    ),
    [themed, partnerName],
  );

  /**
   * Render loading more indicator (무한 스크롤)
   */
  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;

    return (
      <View style={themed($loadingMoreContainer)}>
        <ActivityIndicator size="small" color={theme.colors.tint} />
        <Text style={themed($loadingMoreText)}>이전 메시지 불러오는 중...</Text>
      </View>
    );
  }, [isLoadingMore, themed, theme.colors.tint]);

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
        <Header
          title={partnerName}
          leftIcon="back"
          onLeftPress={() => navigation.goBack()}
        />
        <View style={themed($loadingContainer)}>
          <Text style={themed($loadingText)}>메시지를 불러오는 중...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
      {/* Header */}
      <Header
        title={partnerName}
        leftIcon="back"
        onLeftPress={() => navigation.goBack()}
      />

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messagesWithDates}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        inverted
        contentContainerStyle={themed($listContent)}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        // 무한 스크롤 최적화
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        // 성능 최적화
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={15}
        windowSize={10}
        initialNumToRender={INITIAL_MESSAGES_LIMIT}
        updateCellsBatchingPeriod={50}
        // 기타 설정
        showsVerticalScrollIndicator={false}
        accessibilityRole="list"
        accessibilityLabel="메시지 목록"
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      />

      {/* Typing Indicator */}
      <TypingIndicator isTyping={isPartnerTyping} partnerName={partnerName} />

      {/* Message Input */}
      <MessageInput
        onSend={handleSend}
        onImagePick={handleImagePick}
        disabled={isSending || isUploadingImage}
        placeholder={isUploadingImage ? "이미지 업로드 중..." : `${partnerName}님에게 메시지 보내기...`}
      />
    </Screen>
  );
};

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexGrow: 1,
  paddingVertical: spacing.xs,
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
  transform: [{ rotate: "180deg" }], // Flip for inverted list (more reliable on Android)
});

const $emptyText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  color: colors.textDim,
  textAlign: "center",
});

const $loadingMoreContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.md,
  alignItems: "center",
  flexDirection: "row",
  justifyContent: "center",
  gap: spacing.xs,
});

const $loadingMoreText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
  marginLeft: 8,
});
