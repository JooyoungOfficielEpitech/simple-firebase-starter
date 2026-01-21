import auth from "@react-native-firebase/auth";
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";

import {
  ChatRoom,
  Message,
  MessageType,
  CreateMessagePayload,
  MessagePaginationResult,
  ParticipantInfo,
} from "../../types/chat";

/**
 * 채팅 관련 Firestore 서비스
 */
export class ChatService {
  private db: FirebaseFirestoreTypes.Module;

  constructor() {
    this.db = firestore();
  }

  /**
   * 현재 사용자 ID 가져오기
   */
  private getCurrentUserId(): string {
    const user = auth().currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }
    return user.uid;
  }

  /**
   * 서버 타임스탬프 생성
   */
  private getServerTimestamp(): FirebaseFirestoreTypes.FieldValue {
    return firestore.FieldValue.serverTimestamp();
  }

  /**
   * 채팅방 생성
   * @param participantIds - 참가자 user ID 배열
   * @returns 생성된 채팅방 ID
   */
  async createChatRoom(
    participantIds: string[],
    participantInfoMap: Record<string, ParticipantInfo>,
  ): Promise<string> {
    try {
      const currentUserId = this.getCurrentUserId();

      // 현재 사용자가 참가자에 포함되어 있는지 확인
      if (!participantIds.includes(currentUserId)) {
        participantIds.push(currentUserId);
      }

      // 이미 존재하는 채팅방 확인 (1:1 채팅의 경우)
      if (participantIds.length === 2) {
        const existingChat = await this.findExistingChatRoom(participantIds);
        if (existingChat) {
          return existingChat;
        }
      }

      const chatRoomData = {
        participants: participantIds,
        participantInfo: participantInfoMap,
        createdAt: this.getServerTimestamp(),
        updatedAt: this.getServerTimestamp(),
      };

      const docRef = await this.db.collection("chats").add(chatRoomData);
      return docRef.id;
    } catch (error) {
      console.error("채팅방 생성 오류:", error);
      throw error;
    }
  }

  /**
   * 기존 채팅방 찾기 (1:1 채팅)
   */
  private async findExistingChatRoom(
    participantIds: string[],
  ): Promise<string | null> {
    try {
      const snapshot = await this.db
        .collection("chats")
        .where("participants", "array-contains", participantIds[0])
        .get();

      for (const doc of snapshot.docs) {
        const data = doc.data();
        const participants = data.participants as string[];
        if (
          participants.length === 2 &&
          participants.includes(participantIds[0]) &&
          participants.includes(participantIds[1])
        ) {
          return doc.id;
        }
      }

      return null;
    } catch (error) {
      console.error("기존 채팅방 검색 오류:", error);
      return null;
    }
  }

  /**
   * 채팅방 목록 가져오기
   * @param userId - 사용자 ID
   * @returns 채팅방 목록
   */
  async getChatRooms(userId?: string): Promise<ChatRoom[]> {
    try {
      const targetUserId = userId || this.getCurrentUserId();

      const snapshot = await this.db
        .collection("chats")
        .where("participants", "array-contains", targetUserId)
        .orderBy("updatedAt", "desc")
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatRoom[];
    } catch (error) {
      console.error("채팅방 목록 조회 오류:", error);
      throw error;
    }
  }

  /**
   * 채팅방 실시간 구독
   * @param userId - 사용자 ID
   * @param callback - 채팅방 목록 콜백
   * @returns 구독 해제 함수
   */
  subscribeToChatRooms(
    userId: string,
    callback: (rooms: ChatRoom[]) => void,
  ): () => void {
    return this.db
      .collection("chats")
      .where("participants", "array-contains", userId)
      .orderBy("updatedAt", "desc")
      .onSnapshot(
        (snapshot) => {
          const rooms = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as ChatRoom[];
          callback(rooms);
        },
        (error) => {
          console.error("채팅방 구독 오류:", error);
          callback([]);
        },
      );
  }

  /**
   * 메시지 전송
   * @param chatId - 채팅방 ID
   * @param message - 메시지 페이로드
   */
  async sendMessage(
    chatId: string,
    message: CreateMessagePayload,
  ): Promise<void> {
    try {
      const currentUserId = this.getCurrentUserId();

      const messageData = {
        chatId,
        senderId: currentUserId,
        text: message.text || null,
        imageUrl: message.imageUrl || null,
        type: message.type,
        createdAt: this.getServerTimestamp(),
        readBy: [currentUserId],
      };

      // 메시지 추가
      await this.db
        .collection("chats")
        .doc(chatId)
        .collection("messages")
        .add(messageData);

      // 채팅방의 lastMessage 업데이트
      await this.db
        .collection("chats")
        .doc(chatId)
        .update({
          lastMessage: {
            text: message.text || (message.type === "image" ? "사진" : ""),
            senderId: currentUserId,
            timestamp: this.getServerTimestamp(),
            type: message.type,
          },
          updatedAt: this.getServerTimestamp(),
        });
    } catch (error) {
      console.error("메시지 전송 오류:", error);
      throw error;
    }
  }

  /**
   * 메시지 목록 가져오기 (페이지네이션)
   * @param chatId - 채팅방 ID
   * @param limit - 가져올 메시지 수 (기본값: 50)
   * @param lastDoc - 마지막 문서 스냅샷
   * @returns 메시지 목록과 마지막 문서
   */
  async getMessages(
    chatId: string,
    limit: number = 50,
    lastDoc?: FirebaseFirestoreTypes.QueryDocumentSnapshot,
  ): Promise<MessagePaginationResult> {
    try {
      let query = this.db
        .collection("chats")
        .doc(chatId)
        .collection("messages")
        .orderBy("createdAt", "desc")
        .limit(limit);

      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }

      const snapshot = await query.get();

      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      const newLastDoc =
        snapshot.docs.length > 0
          ? snapshot.docs[snapshot.docs.length - 1]
          : null;

      return {
        messages,
        lastDoc: newLastDoc,
      };
    } catch (error) {
      console.error("메시지 목록 조회 오류:", error);
      throw error;
    }
  }

  /**
   * 메시지 실시간 구독
   * @param chatId - 채팅방 ID
   * @param callback - 메시지 목록 콜백
   * @param limit - 구독할 메시지 수 (기본값: 50)
   * @returns 구독 해제 함수
   */
  subscribeToMessages(
    chatId: string,
    callback: (messages: Message[]) => void,
    limit: number = 50,
  ): () => void {
    return this.db
      .collection("chats")
      .doc(chatId)
      .collection("messages")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .onSnapshot(
        (snapshot) => {
          const messages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Message[];
          callback(messages);
        },
        (error) => {
          console.error("메시지 구독 오류:", error);
          callback([]);
        },
      );
  }

  /**
   * 새 메시지만 실시간 구독 (최적화된 버전)
   * 기존 메시지 이후의 새 메시지만 구독하여 성능 향상
   * @param chatId - 채팅방 ID
   * @param afterTimestamp - 이 시간 이후의 메시지만 구독
   * @param onNewMessages - 새 메시지 콜백 (추가된 메시지만)
   * @param onModifiedMessages - 수정된 메시지 콜백 (읽음 상태 변경 등)
   * @returns 구독 해제 함수
   */
  subscribeToNewMessages(
    chatId: string,
    afterTimestamp: FirebaseFirestoreTypes.Timestamp | null,
    onNewMessages: (messages: Message[]) => void,
    onModifiedMessages?: (messages: Message[]) => void,
  ): () => void {
    let query = this.db
      .collection("chats")
      .doc(chatId)
      .collection("messages")
      .orderBy("createdAt", "asc");

    // 특정 시간 이후의 메시지만 구독
    if (afterTimestamp) {
      query = query.startAfter(afterTimestamp);
    }

    return query.onSnapshot(
      (snapshot) => {
        const addedMessages: Message[] = [];
        const modifiedMessages: Message[] = [];

        snapshot.docChanges().forEach((change) => {
          const message = {
            id: change.doc.id,
            ...change.doc.data(),
          } as Message;

          if (change.type === "added") {
            addedMessages.push(message);
          } else if (change.type === "modified") {
            modifiedMessages.push(message);
          }
        });

        if (addedMessages.length > 0) {
          onNewMessages(addedMessages);
        }

        if (modifiedMessages.length > 0 && onModifiedMessages) {
          onModifiedMessages(modifiedMessages);
        }
      },
      (error) => {
        console.error("새 메시지 구독 오류:", error);
      },
    );
  }

  /**
   * 초기 메시지 로드 (최적화된 버전)
   * 초기 로드 후 마지막 문서의 타임스탬프를 반환하여 실시간 구독에 사용
   * @param chatId - 채팅방 ID
   * @param limit - 가져올 메시지 수
   * @returns 메시지 목록, 마지막 문서, 마지막 타임스탬프
   */
  async getInitialMessages(
    chatId: string,
    limit: number = 30,
  ): Promise<{
    messages: Message[];
    lastDoc: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
    latestTimestamp: FirebaseFirestoreTypes.Timestamp | null;
  }> {
    try {
      const snapshot = await this.db
        .collection("chats")
        .doc(chatId)
        .collection("messages")
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();

      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      const lastDoc =
        snapshot.docs.length > 0
          ? snapshot.docs[snapshot.docs.length - 1]
          : null;

      // 가장 최신 메시지의 타임스탬프 (실시간 구독용)
      const latestTimestamp =
        snapshot.docs.length > 0
          ? (snapshot.docs[0].data()
              .createdAt as FirebaseFirestoreTypes.Timestamp)
          : null;

      return {
        messages,
        lastDoc,
        latestTimestamp,
      };
    } catch (error) {
      console.error("초기 메시지 로드 오류:", error);
      throw error;
    }
  }

  /**
   * 읽음 상태 업데이트
   * @param chatId - 채팅방 ID
   * @param messageIds - 읽음 처리할 메시지 ID 배열
   */
  async markAsRead(chatId: string, messageIds: string[]): Promise<void> {
    try {
      const currentUserId = this.getCurrentUserId();
      const batch = this.db.batch();

      for (const messageId of messageIds) {
        const messageRef = this.db
          .collection("chats")
          .doc(chatId)
          .collection("messages")
          .doc(messageId);

        batch.update(messageRef, {
          readBy: firestore.FieldValue.arrayUnion(currentUserId),
        });
      }

      await batch.commit();
    } catch (error) {
      console.error("읽음 상태 업데이트 오류:", error);
      throw error;
    }
  }

  /**
   * 타이핑 상태 설정
   * @param chatId - 채팅방 ID
   * @param isTyping - 타이핑 중 여부
   */
  async setTypingStatus(chatId: string, isTyping: boolean): Promise<void> {
    try {
      const currentUserId = this.getCurrentUserId();

      await this.db
        .collection("chats")
        .doc(chatId)
        .collection("typing")
        .doc(currentUserId)
        .set({
          isTyping,
          updatedAt: this.getServerTimestamp(),
        });
    } catch (error) {
      console.error("타이핑 상태 설정 오류:", error);
      throw error;
    }
  }

  /**
   * 타이핑 상태 구독
   * @param chatId - 채팅방 ID
   * @param callback - 타이핑 중인 사용자 ID 배열 콜백
   * @returns 구독 해제 함수
   */
  subscribeToTypingStatus(
    chatId: string,
    callback: (typingUserIds: string[]) => void,
  ): () => void {
    const currentUserId = this.getCurrentUserId();

    return this.db
      .collection("chats")
      .doc(chatId)
      .collection("typing")
      .where("isTyping", "==", true)
      .onSnapshot(
        (snapshot) => {
          const typingUserIds = snapshot.docs
            .map((doc) => doc.id)
            .filter((id) => id !== currentUserId);
          callback(typingUserIds);
        },
        (error) => {
          console.error("타이핑 상태 구독 오류:", error);
          callback([]);
        },
      );
  }

  /**
   * 채팅방 삭제
   * @param chatId - 채팅방 ID
   */
  async deleteChatRoom(chatId: string): Promise<void> {
    try {
      // 메시지 서브컬렉션 삭제
      const messagesSnapshot = await this.db
        .collection("chats")
        .doc(chatId)
        .collection("messages")
        .get();

      const batch = this.db.batch();

      messagesSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // 타이핑 서브컬렉션 삭제
      const typingSnapshot = await this.db
        .collection("chats")
        .doc(chatId)
        .collection("typing")
        .get();

      typingSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // 채팅방 문서 삭제
      batch.delete(this.db.collection("chats").doc(chatId));

      await batch.commit();
    } catch (error) {
      console.error("채팅방 삭제 오류:", error);
      throw error;
    }
  }

  /**
   * 단일 채팅방 조회
   * @param chatId - 채팅방 ID
   * @returns 채팅방 정보
   */
  async getChatRoom(chatId: string): Promise<ChatRoom | null> {
    try {
      const doc = await this.db.collection("chats").doc(chatId).get();

      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
      } as ChatRoom;
    } catch (error) {
      console.error("채팅방 조회 오류:", error);
      throw error;
    }
  }

  /**
   * 단일 채팅방 실시간 구독
   * @param chatId - 채팅방 ID
   * @param callback - 채팅방 정보 콜백
   * @returns 구독 해제 함수
   */
  subscribeToChatRoom(
    chatId: string,
    callback: (room: ChatRoom | null) => void,
  ): () => void {
    return this.db
      .collection("chats")
      .doc(chatId)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            callback({
              id: doc.id,
              ...doc.data(),
            } as ChatRoom);
          } else {
            callback(null);
          }
        },
        (error) => {
          console.error("채팅방 구독 오류:", error);
          callback(null);
        },
      );
  }

  /**
   * 읽지 않은 메시지 수 가져오기
   * @param chatId - 채팅방 ID
   * @returns 읽지 않은 메시지 수
   */
  async getUnreadCount(chatId: string): Promise<number> {
    try {
      const currentUserId = this.getCurrentUserId();

      const snapshot = await this.db
        .collection("chats")
        .doc(chatId)
        .collection("messages")
        .where("readBy", "not-in", [[currentUserId]])
        .get();

      // 본인이 보낸 메시지 제외
      const unreadMessages = snapshot.docs.filter((doc) => {
        const data = doc.data();
        return (
          data.senderId !== currentUserId &&
          !data.readBy?.includes(currentUserId)
        );
      });

      return unreadMessages.length;
    } catch (error) {
      console.error("읽지 않은 메시지 수 조회 오류:", error);
      return 0;
    }
  }
}

// 싱글톤 인스턴스 export
export const chatService = new ChatService();
