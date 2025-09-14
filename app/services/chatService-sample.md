# 채팅 서비스 예시

```ts
import { translate } from "@/i18n/translate"

import { firestoreService } from "./firestore"
import { MessageType } from "../types/chat"

/**
 * 1:1 채팅방 생성 및 메시지 전송 예시 (매칭 기반)
 */
async function exampleDirectChat() {
  try {
    // 1. 1:1 채팅방 생성 (매칭 기반, 한 번에 하나의 활성 채팅방만 허용)
    const otherUserId = "other_user_id"

    // 활성 채팅방이 있는지 확인
    const activeChat = await firestoreService.getUserActiveChat("current_user_id")
    if (activeChat) {
      console.log(translate("matching:messages.alreadyInChat"), activeChat.id)
      return
    }

    const chatId = await firestoreService.createOrGetDirectChat(otherUserId)
    console.log("채팅방 ID:", chatId)

    // 2. 텍스트 메시지 전송
    const textMessage = {
      chatId,
      senderId: "current_user_id",
      type: "text" as MessageType,
      content: {
        text: "안녕하세요! 반갑습니다.",
      },
    }
    const messageId = await firestoreService.sendMessage(textMessage)
    console.log("메시지 ID:", messageId)

    // 3. 추가 텍스트 메시지 전송 예시
    const additionalMessage = {
      chatId,
      senderId: "current_user_id",
      type: "text" as MessageType,
      content: {
        text: "오늘 날씨가 정말 좋네요!",
      },
    }
    await firestoreService.sendMessage(additionalMessage)
  } catch (error) {
    console.error("채팅 예시 오류:", error)
  }
}

/**
 * 채팅방 메시지 조회 및 실시간 리스너 예시
 */
async function exampleChatListener() {
  const chatId = "example_chat_id"

  // 1. 기존 메시지 조회
  const messages = await firestoreService.getChatMessages({
    chatId,
    limit: 20,
  })
  console.log("기존 메시지:", messages.length)

  // 2. 실시간 메시지 리스너
  const unsubscribe = firestoreService.subscribeToChatMessages(
    chatId,
    (newMessages) => {
      console.log("새 메시지 수신:", newMessages.length)
      newMessages.forEach((message) => {
        console.log(`${message.senderId}: ${message.content.text}`)
      })
    },
    50, // 최대 50개 메시지
  )

  // 3. 10초 후 리스너 해제
  setTimeout(() => {
    unsubscribe()
    console.log("메시지 리스너 해제됨")
  }, 10000)
}

/**
 * 채팅방 목록 조회 및 실시간 리스너 예시
 */
async function exampleChatList() {
  // 1. 사용자의 채팅방 목록 조회
  const chats = await firestoreService.getUserChats()
  console.log("채팅방 수:", chats.length)

  chats.forEach((chat) => {
    console.log(`채팅방: ${chat.id}`)
    console.log(`참여자: ${chat.participants.map((p) => p.name).join(", ")}`)
    console.log(`마지막 메시지: ${chat.lastMessage?.text || "없음"}`)
    console.log("---")
  })

  // 2. 실시간 채팅방 리스너
  const unsubscribe = firestoreService.subscribeToUserChats("current_user_id", (updatedChats) => {
    console.log("채팅방 목록 업데이트:", updatedChats.length)
  })

  // 3. 10초 후 리스너 해제
  setTimeout(() => {
    unsubscribe()
    console.log("채팅방 리스너 해제됨")
  }, 10000)
}

/**
 * 메시지 읽음 상태 업데이트 예시
 */
async function exampleMarkAsRead() {
  const chatId = "example_chat_id"
  const messageIds = ["message_1", "message_2", "message_3"]

  // 메시지들을 읽음 상태로 표시
  await firestoreService.markMessagesAsRead(chatId, messageIds)
  console.log("메시지 읽음 처리 완료")
}

/**
 * 채팅 통계 조회 예시
 */
async function exampleChatStats() {
  const stats = await firestoreService.getChatStats()
  console.log("채팅 통계:")
  console.log(`- 총 채팅방: ${stats.totalChats}`)
  console.log(`- 활성 채팅방: ${stats.activeChats}`)
  console.log(`- 총 메시지: ${stats.totalMessages}`)
  console.log(`- 읽지 않은 메시지: ${stats.unreadMessages}`)
}

/**
 * 메시지 편집 및 삭제 예시
 */
async function exampleMessageManagement() {
  const messageId = "example_message_id"

  // 1. 메시지 편집
  await firestoreService.updateMessage(messageId, {
    content: {
      text: "편집된 메시지입니다.",
    },
  })
  console.log("메시지 편집 완료")

  // 2. 메시지 삭제 (소프트 삭제)
  await firestoreService.deleteMessage(messageId)
  console.log("메시지 삭제 완료")
}

/**
 * 채팅방 관리 예시 (1:1 매칭 앱용)
 */
async function exampleChatManagement() {
  const chatId = "example_chat_id"

  // 1. 채팅방 정보 조회
  const chat = await firestoreService.getChat(chatId)
  if (chat) {
    console.log("채팅방 정보:", chat.name || "1:1 채팅")
    console.log(
      "참여자:",
      chat.participants.map((p) => p.name),
    )
    console.log("상태:", chat.status)
  }

  // 2. 활성 채팅방 확인
  const activeChat = await firestoreService.getUserActiveChat("current_user_id")
  if (activeChat) {
    console.log("현재 활성 채팅방:", activeChat.id)
  }

  // 3. 채팅방 종료 (매칭 종료 시)
  await firestoreService.endChat(chatId)
  console.log("채팅방 종료 완료")

  // 4. 채팅방 삭제 (소프트 삭제)
  await firestoreService.deleteChat(chatId)
  console.log("채팅방 삭제 완료")
}

/**
 * 1:1 매칭 앱 특성 예시
 */
async function exampleMatchingAppFeatures() {
  try {
    // 1. 현재 활성 채팅방 확인
    const activeChat = await firestoreService.getUserActiveChat("current_user_id")
    if (activeChat) {
      console.log("현재 활성 채팅방:", activeChat.id)
      console.log(
        "참여자:",
        activeChat.participants.map((p) => p.name),
      )
      return
    }

    // 2. 새로운 채팅방 생성 시도 (이미 활성 채팅방이 있으면 에러)
    try {
      const chatId = await firestoreService.createOrGetDirectChat("other_user_id")
      console.log("새 채팅방 생성:", chatId)
    } catch (error: any) {
      console.log(translate("matching:messages.matchFailed"), error.message)
    }

    // 3. 매칭 기반 채팅방 생성 (매칭이 성공한 경우)
    // 이는 매칭 시스템에서 자동으로 호출됨
    console.log(translate("matching:messages.matchSuccess"))
  } catch (error) {
    console.error("매칭 앱 특성 예시 오류:", error)
  }
}
```
