/**
 * Firebase Cloud Functions for matching system
 * Implements the queue-based matching logic with Firestore transactions
 */

import * as admin from "firebase-admin"
import { setGlobalOptions } from "firebase-functions/v2"
import * as logger from "firebase-functions/logger"
import { onDocumentCreated } from "firebase-functions/v2/firestore"

// Initialize Firebase Admin SDK
admin.initializeApp()
const db = admin.firestore()

// Set global options for cost control and align region with Firestore location
setGlobalOptions({ maxInstances: 10, region: "asia-northeast3" })

/**
 * Cloud Function that triggers when a new document is added to matchingQueue
 * Implements the matching logic as specified in matching.txt
 */
export const processMatchingQueue = onDocumentCreated("matchingQueue/{queueId}", async (event) => {
  const snapshot = event.data
  if (!snapshot) {
    logger.error("No data associated with the event")
    return
  }

  const queueData = snapshot.data()
  const queueId = snapshot.id
  const { userId, gender } = queueData

  logger.info(`Processing matching queue entry for user ${userId} with gender ${gender}`)

  try {
    // Use a transaction to ensure atomic operations and prevent race conditions
    await db.runTransaction(async (transaction) => {
      // Get the newly added queue entry
      const currentQueueRef = db.collection("matchingQueue").doc(queueId)
      const currentQueueDoc = await transaction.get(currentQueueRef)

      if (!currentQueueDoc.exists) {
        logger.warn(`Queue entry ${queueId} no longer exists`)
        return
      }

      const currentQueueData = currentQueueDoc.data()
      if (!currentQueueData) {
        logger.warn(`No data in queue entry ${queueId}`)
        return
      }

      // Find potential match: opposite gender, earliest timestamp
      const oppositeGender = gender === "male" ? "female" : "male"

      const potentialMatchesQuery = await db
        .collection("matchingQueue")
        .where("gender", "==", oppositeGender)
        .orderBy("timestamp", "asc")
        .limit(1)
        .get()

      if (potentialMatchesQuery.empty) {
        logger.info(`No potential match found for user ${userId}. Staying in queue.`)
        return
      }

      const matchDoc = potentialMatchesQuery.docs[0]
      const matchData = matchDoc.data()
      const matchId = matchDoc.id
      const matchUserId = matchData.userId

      logger.info(`Found potential match: ${userId} <-> ${matchUserId}`)

      // Verify the match document still exists in the transaction
      const matchQueueRef = db.collection("matchingQueue").doc(matchId)
      const matchQueueDoc = await transaction.get(matchQueueRef)

      if (!matchQueueDoc.exists) {
        logger.warn(`Match queue entry ${matchId} no longer exists`)
        return
      }

      // Create the match document
      const matchRef = db.collection("matches").doc()
      const matchDocId = matchRef.id

      const matchDocument = {
        user1Id: userId,
        user2Id: matchUserId,
        matchedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: "matched",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }

      transaction.set(matchRef, matchDocument)

      // Create the chat room
      const chatRoomRef = db.collection("chatRooms").doc(matchDocId) // Use match ID as chat room ID
      const chatRoomDocument = {
        participants: [userId, matchUserId],
        matchId: matchDocId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastActivity: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
      }

      transaction.set(chatRoomRef, chatRoomDocument)

      // Update match with chat room ID
      transaction.update(matchRef, {
        chatRoomId: matchDocId,
        status: "chatCreated",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      // Remove both users from the matching queue
      transaction.delete(currentQueueRef)
      transaction.delete(matchQueueRef)

      logger.info(`Successfully created match ${matchDocId} between ${userId} and ${matchUserId}`)
    })
  } catch (error) {
    logger.error(`Error processing matching queue for user ${userId}:`, error)
    throw error
  }
})

/**
 * Clean up expired queue entries (optional utility function)
 */
export const cleanupExpiredQueueEntries = onDocumentCreated(
  "system/cleanup", // Trigger this manually or via scheduled function
  async () => {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

      const expiredEntries = await db
        .collection("matchingQueue")
        .where("timestamp", "<", fiveMinutesAgo)
        .get()

      if (expiredEntries.empty) {
        logger.info("No expired queue entries to clean up")
        return
      }

      const batch = db.batch()
      expiredEntries.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })

      await batch.commit()
      logger.info(`Cleaned up ${expiredEntries.size} expired queue entries`)
    } catch (error) {
      logger.error("Error cleaning up expired queue entries:", error)
    }
  },
)

/**
 * Send push notification when a new notification document is created
 * Triggers on notifications/{notificationId} document creation
 */
export const sendPushNotification = onDocumentCreated(
  "notifications/{notificationId}",
  async (event) => {
    const snapshot = event.data
    if (!snapshot) {
      logger.error("No notification data associated with the event")
      return
    }

    const notificationData = snapshot.data()
    const notificationId = snapshot.id

    // 필수 필드 검증
    const { userId, title, message } = notificationData
    if (!userId || !title || !message) {
      logger.error("Missing required notification fields", { notificationId })
      return
    }

    logger.info("Processing push notification", { notificationId, userId })

    try {
      // 사용자의 활성 FCM 토큰들 조회
      const tokensSnapshot = await db
        .collection("userFCMTokens")
        .where("userId", "==", userId)
        .where("isActive", "==", true)
        .get()

      if (tokensSnapshot.empty) {
        logger.warn(`No active FCM tokens found for user ${userId}`)
        return
      }

      const fcmTokens = tokensSnapshot.docs.map((doc) => doc.data().fcmToken)
      logger.info(`Found ${fcmTokens.length} active FCM tokens for user ${userId}`)

      // FCM 메시지 구성
      const messages = fcmTokens.map((token) => ({
        token,
        notification: {
          title,
          body: message,
        },
        data: {
          notificationId,
          type: notificationData.type || "general",
          postId: notificationData.postId || "",
          ...(notificationData.applicantId && { applicantId: notificationData.applicantId }),
          ...(notificationData.organizerId && { organizerId: notificationData.organizerId }),
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: 1,
            },
          },
        },
        android: {
          priority: "high" as const,
          notification: {
            sound: "default",
            priority: "high" as const,
          },
        },
      }))

      // FCM으로 푸시 전송
      const response = await admin.messaging().sendEach(messages)

      // 결과 처리
      const successCount = response.responses.filter((r) => r.success).length
      const failureCount = response.failureCount

      logger.info(
        `Push notification sent: ${successCount} success, ${failureCount} failed`,
        { notificationId, userId },
      )

      // 실패한 토큰들 처리 (무효한 토큰 비활성화)
      if (failureCount > 0) {
        const batch = db.batch()
        response.responses.forEach((res, index) => {
          if (!res.success && res.error) {
            const errorCode = res.error.code
            // 토큰이 무효하거나 등록되지 않은 경우
            if (
              errorCode === "messaging/invalid-registration-token" ||
              errorCode === "messaging/registration-token-not-registered"
            ) {
              const invalidToken = fcmTokens[index]
              logger.warn(`Deactivating invalid FCM token: ${invalidToken.substring(0, 20)}...`)

              // 무효한 토큰 비활성화
              const tokenDoc = tokensSnapshot.docs.find(
                (doc) => doc.data().fcmToken === invalidToken,
              )
              if (tokenDoc) {
                batch.update(tokenDoc.ref, {
                  isActive: false,
                  lastUsed: admin.firestore.FieldValue.serverTimestamp(),
                })
              }
            }
          }
        })

        await batch.commit()
        logger.info(`Cleaned up ${failureCount} invalid FCM tokens`)
      }
    } catch (error) {
      logger.error(`Error sending push notification for ${userId}:`, error)
      throw error
    }
  },
)
