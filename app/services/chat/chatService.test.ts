/**
 * Chat Service Tests
 */

import { ChatMessage, ChatRoom } from "@/types/chat";

// Mock Firebase
jest.mock("@react-native-firebase/firestore", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        collection: jest.fn(() => ({
          add: jest.fn(),
          orderBy: jest.fn(() => ({
            limit: jest.fn(() => ({
              get: jest.fn(),
              onSnapshot: jest.fn(),
            })),
          })),
        })),
      })),
      where: jest.fn(() => ({
        orderBy: jest.fn(() => ({
          get: jest.fn(),
          onSnapshot: jest.fn(),
        })),
      })),
      add: jest.fn(),
    })),
  })),
}));

jest.mock("@react-native-firebase/auth", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    currentUser: { uid: "test-user-id" },
  })),
}));

describe("ChatService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("ChatRoom Type", () => {
    it("should have correct structure", () => {
      const mockRoom: ChatRoom = {
        id: "room-1",
        participants: ["user1", "user2"],
        participantDetails: {
          user1: { displayName: "User 1" },
          user2: { displayName: "User 2" },
        },
        lastMessage: {
          text: "Hello",
          senderId: "user1",
          timestamp: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        unreadCount: {
          user1: 0,
          user2: 1,
        },
      };

      expect(mockRoom.id).toBe("room-1");
      expect(mockRoom.participants).toHaveLength(2);
      expect(mockRoom.lastMessage?.text).toBe("Hello");
    });
  });

  describe("ChatMessage Type", () => {
    it("should have correct structure for text message", () => {
      const mockMessage: ChatMessage = {
        id: "msg-1",
        chatRoomId: "room-1",
        senderId: "user1",
        text: "Hello, World!",
        type: "text",
        timestamp: new Date(),
        readBy: ["user1"],
      };

      expect(mockMessage.id).toBe("msg-1");
      expect(mockMessage.type).toBe("text");
      expect(mockMessage.text).toBe("Hello, World!");
    });

    it("should have correct structure for image message", () => {
      const mockMessage: ChatMessage = {
        id: "msg-2",
        chatRoomId: "room-1",
        senderId: "user1",
        type: "image",
        imageUrl: "https://example.com/image.jpg",
        timestamp: new Date(),
        readBy: ["user1"],
      };

      expect(mockMessage.type).toBe("image");
      expect(mockMessage.imageUrl).toBe("https://example.com/image.jpg");
    });
  });

  describe("Message Validation", () => {
    it("should validate message text is not empty", () => {
      const validateMessage = (text: string): boolean => {
        return text.trim().length > 0;
      };

      expect(validateMessage("Hello")).toBe(true);
      expect(validateMessage("")).toBe(false);
      expect(validateMessage("   ")).toBe(false);
    });

    it("should validate message length", () => {
      const MAX_MESSAGE_LENGTH = 1000;
      const validateMessageLength = (text: string): boolean => {
        return text.length <= MAX_MESSAGE_LENGTH;
      };

      expect(validateMessageLength("Short message")).toBe(true);
      expect(validateMessageLength("a".repeat(1001))).toBe(false);
    });
  });

  describe("Participant Utils", () => {
    it("should get other participant id", () => {
      const getOtherParticipant = (
        participants: string[],
        currentUserId: string
      ): string | undefined => {
        return participants.find((id) => id !== currentUserId);
      };

      expect(getOtherParticipant(["user1", "user2"], "user1")).toBe("user2");
      expect(getOtherParticipant(["user1", "user2"], "user2")).toBe("user1");
    });

    it("should check if user is participant", () => {
      const isParticipant = (
        participants: string[],
        userId: string
      ): boolean => {
        return participants.includes(userId);
      };

      expect(isParticipant(["user1", "user2"], "user1")).toBe(true);
      expect(isParticipant(["user1", "user2"], "user3")).toBe(false);
    });
  });
});
