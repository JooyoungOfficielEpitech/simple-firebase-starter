/**
 * Chat Notification Triggers
 * Sends push notifications for new chat messages
 */

import * as admin from "firebase-admin"
import * as logger from "firebase-functions/logger"
import { onDocumentCreated } from "firebase-functions/v2/firestore"
import { sendPushNotification, storeNotification } from "./sendNotification"

/**
 * Trigger: Send push notification when a new message is created in a chat
 */
export const onNewMessage = onDocumentCreated(
  "chats/{chatId}/messages/{messageId}",
  async (event) => {
    const snapshot = event.data
    if (!snapshot) {
      logger.error("No data associated with the event")
      return
    }

    const messageData = snapshot.data()
    const { chatId } = event.params

    const { senderId, text, type, imageUrl } = messageData

    logger.info(`New message in chat ${chatId} from ${senderId}`)

    try {
      const db = admin.firestore()

      // Get chat room to find the recipient
      const chatDoc = await db.collection("chats").doc(chatId).get()

      if (!chatDoc.exists) {
        logger.warn(`Chat ${chatId} not found`)
        return
      }

      const chatData = chatDoc.data()
      if (!chatData) {
        logger.warn(`No data in chat ${chatId}`)
        return
      }

      const participants: string[] = chatData.participants || []

      // Find the recipient (the other participant)
      const recipientId = participants.find((id) => id !== senderId)

      if (!recipientId) {
        logger.warn(`No recipient found in chat ${chatId}`)
        return
      }

      // Check if recipient has notifications enabled and is not currently viewing the chat
      const recipientDoc = await db.collection("users").doc(recipientId).get()
      const recipientData = recipientDoc.data()

      // Skip if user has chat notifications disabled
      if (recipientData?.notificationSettings?.chat === false) {
        logger.info(`User ${recipientId} has chat notifications disabled`)
        return
      }

      // Get sender info for notification
      const senderDoc = await db.collection("users").doc(senderId).get()
      const senderData = senderDoc.data()
      const senderName = senderData?.displayName || senderData?.name || "누군가"

      // Prepare notification content
      let notificationBody: string
      if (type === "image") {
        notificationBody = "사진을 보냈습니다"
      } else if (type === "system") {
        return // Don't send notifications for system messages
      } else {
        // Truncate long messages
        notificationBody = text?.length > 50 ? `${text.substring(0, 50)}...` : text || "새 메시지"
      }

      // Send push notification
      await sendPushNotification(recipientId, {
        title: senderName,
        body: notificationBody,
        data: {
          type: "chat_message",
          chatId,
          senderId,
          messageId: event.params.messageId,
        },
        imageUrl: type === "image" ? imageUrl : undefined,
      })

      // Store notification in Firestore
      await storeNotification(recipientId, {
        type: "chat_message",
        title: senderName,
        body: notificationBody,
        data: {
          chatId,
          senderId,
          messageId: event.params.messageId,
        },
        imageUrl: type === "image" ? imageUrl : undefined,
      })

      // Update chat's last message info for list display
      await db.collection("chats").doc(chatId).update({
        lastMessage: notificationBody,
        lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
        lastMessageSenderId: senderId,
        [`unreadCount.${recipientId}`]: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      logger.info(`Sent chat notification to ${recipientId}`)
    } catch (error) {
      logger.error(`Error processing new message notification:`, error)
    }
  }
)

/**
 * Trigger: Reset unread count when user reads messages
 * This should be called from the client when opening a chat
 */
export const onMessagesRead = onDocumentCreated(
  "chats/{chatId}/readReceipts/{odId}",
  async (event) => {
    const { chatId, odId } = event.params

    try {
      const db = admin.firestore()

      // Reset unread count for this user
      await db.collection("chats").doc(chatId).update({
        [`unreadCount.${odId}`]: 0,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      logger.info(`Reset unread count for user ${odId} in chat ${chatId}`)
    } catch (error) {
      logger.error(`Error resetting unread count:`, error)
    }
  }
)
