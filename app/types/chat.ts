import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

/**
 * 메시지 타입
 */
export type MessageType = "text" | "image" | "system";

/**
 * 참가자 정보
 */
export interface ParticipantInfo {
  name: string;
  avatar?: string;
}

/**
 * 마지막 메시지 정보
 */
export interface LastMessage {
  text: string;
  senderId: string;
  timestamp: FirebaseFirestoreTypes.Timestamp;
  type: MessageType;
}

/**
 * 채팅방 타입
 */
export interface ChatRoom {
  id: string;
  participants: string[]; // user IDs
  participantInfo: Record<string, ParticipantInfo>;
  lastMessage?: LastMessage;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}

/**
 * 메시지 타입
 */
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  type: MessageType;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  readBy: string[]; // user IDs who read this message
}

/**
 * 채팅 목록 아이템 (UI용)
 */
export interface ChatListItem {
  chatId: string;
  partnerName: string;
  partnerAvatar?: string;
  partnerId: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}

/**
 * 타이핑 상태
 */
export interface TypingStatus {
  isTyping: boolean;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}

/**
 * 메시지 생성 페이로드
 */
export interface CreateMessagePayload {
  text?: string;
  imageUrl?: string;
  type: MessageType;
}

/**
 * 메시지 페이지네이션 결과
 */
export interface MessagePaginationResult {
  messages: Message[];
  lastDoc: FirebaseFirestoreTypes.QueryDocumentSnapshot | null;
}
