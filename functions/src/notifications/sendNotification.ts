/**
 * Firebase Cloud Functions for Push Notifications
 * Handles sending FCM notifications to users
 */

import * as admin from "firebase-admin"
import * as logger from "firebase-functions/logger"

// Notification payload types
export interface NotificationData {
  title: string
  body: string
  data?: Record<string, string>
  imageUrl?: string
}

export interface UserNotificationTarget {
  userId: string
  fcmTokens?: string[]
}

/**
 * Get FCM tokens for a user from Firestore
 */
export async function getUserFcmTokens(userId: string): Promise<string[]> {
  const db = admin.firestore()

  try {
    const userDoc = await db.collection("users").doc(userId).get()

    if (!userDoc.exists) {
      logger.warn(`User ${userId} not found`)
      return []
    }

    const userData = userDoc.data()
    const fcmTokens = userData?.fcmTokens || []

    // Filter out any null or empty tokens
    return fcmTokens.filter((token: string) => token && token.length > 0)
  } catch (error) {
    logger.error(`Error getting FCM tokens for user ${userId}:`, error)
    return []
  }
}

/**
 * Send push notification to a specific user
 */
export async function sendPushNotification(
  userId: string,
  notification: NotificationData
): Promise<{ success: boolean; failedTokens: string[] }> {
  const tokens = await getUserFcmTokens(userId)

  if (tokens.length === 0) {
    logger.info(`No FCM tokens found for user ${userId}`)
    return { success: false, failedTokens: [] }
  }

  const message: admin.messaging.MulticastMessage = {
    tokens,
    notification: {
      title: notification.title,
      body: notification.body,
      ...(notification.imageUrl && { imageUrl: notification.imageUrl }),
    },
    data: notification.data || {},
    android: {
      notification: {
        channelId: "default",
        priority: "high",
        sound: "default",
      },
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
          badge: 1,
        },
      },
    },
  }

  try {
    const response = await admin.messaging().sendEachForMulticast(message)

    // Collect failed tokens for cleanup
    const failedTokens: string[] = []

    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const errorCode = resp.error?.code
        // Remove invalid or unregistered tokens
        if (
          errorCode === "messaging/invalid-registration-token" ||
          errorCode === "messaging/registration-token-not-registered"
        ) {
          failedTokens.push(tokens[idx])
        }
        logger.warn(`Failed to send to token ${idx}:`, resp.error)
      }
    })

    // Clean up failed tokens from user document
    if (failedTokens.length > 0) {
      await removeInvalidTokens(userId, failedTokens)
    }

    logger.info(
      `Notification sent to user ${userId}: ${response.successCount} success, ${response.failureCount} failed`
    )

    return {
      success: response.successCount > 0,
      failedTokens,
    }
  } catch (error) {
    logger.error(`Error sending notification to user ${userId}:`, error)
    return { success: false, failedTokens: [] }
  }
}

/**
 * Send push notification to multiple users
 */
export async function sendPushNotificationToMultiple(
  userIds: string[],
  notification: NotificationData
): Promise<{ successCount: number; failureCount: number }> {
  let successCount = 0
  let failureCount = 0

  // Send notifications in parallel with batching
  const batchSize = 10
  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize)
    const results = await Promise.all(
      batch.map((userId) => sendPushNotification(userId, notification))
    )

    results.forEach((result) => {
      if (result.success) {
        successCount++
      } else {
        failureCount++
      }
    })
  }

  return { successCount, failureCount }
}

/**
 * Remove invalid FCM tokens from user document
 */
async function removeInvalidTokens(userId: string, invalidTokens: string[]): Promise<void> {
  const db = admin.firestore()

  try {
    await db.collection("users").doc(userId).update({
      fcmTokens: admin.firestore.FieldValue.arrayRemove(...invalidTokens),
    })
    logger.info(`Removed ${invalidTokens.length} invalid tokens for user ${userId}`)
  } catch (error) {
    logger.error(`Error removing invalid tokens for user ${userId}:`, error)
  }
}

/**
 * Store notification in Firestore for in-app notification list
 */
export async function storeNotification(
  userId: string,
  notification: {
    type: string
    title: string
    body: string
    data?: Record<string, string>
    imageUrl?: string
  }
): Promise<string> {
  const db = admin.firestore()

  try {
    const notificationRef = await db.collection("users").doc(userId).collection("notifications").add({
      ...notification,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    logger.info(`Stored notification ${notificationRef.id} for user ${userId}`)
    return notificationRef.id
  } catch (error) {
    logger.error(`Error storing notification for user ${userId}:`, error)
    throw error
  }
}
