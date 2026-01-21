/**
 * Match Notification Triggers
 * Sends push notifications for new matches
 */

import * as admin from "firebase-admin"
import * as logger from "firebase-functions/logger"
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore"
import { sendPushNotification, storeNotification } from "./sendNotification"

/**
 * Trigger: Send push notification when a new match is created
 */
export const onNewMatch = onDocumentCreated("matches/{matchId}", async (event) => {
  const snapshot = event.data
  if (!snapshot) {
    logger.error("No data associated with the event")
    return
  }

  const matchData = snapshot.data()
  const matchId = snapshot.id

  const { user1Id, user2Id, status } = matchData

  // Only send notification when status is "matched" or "chatCreated"
  if (status !== "matched" && status !== "chatCreated") {
    logger.info(`Match ${matchId} status is ${status}, skipping notification`)
    return
  }

  logger.info(`New match ${matchId} between ${user1Id} and ${user2Id}`)

  try {
    const db = admin.firestore()

    // Get both users' info
    const [user1Doc, user2Doc] = await Promise.all([
      db.collection("users").doc(user1Id).get(),
      db.collection("users").doc(user2Id).get(),
    ])

    const user1Data = user1Doc.data()
    const user2Data = user2Doc.data()

    const user1Name = user1Data?.displayName || user1Data?.name || "새로운 사람"
    const user2Name = user2Data?.displayName || user2Data?.name || "새로운 사람"

    const user1Avatar = user1Data?.photoURL || user1Data?.profileImage
    const user2Avatar = user2Data?.photoURL || user2Data?.profileImage

    // Send notification to user1 about matching with user2
    if (user1Data?.notificationSettings?.match !== false) {
      await sendPushNotification(user1Id, {
        title: "새로운 매칭!",
        body: `${user2Name}님과 매칭되었습니다. 지금 대화를 시작해보세요!`,
        data: {
          type: "new_match",
          matchId,
          partnerId: user2Id,
          chatRoomId: matchData.chatRoomId || matchId,
        },
        imageUrl: user2Avatar,
      })

      await storeNotification(user1Id, {
        type: "new_match",
        title: "새로운 매칭!",
        body: `${user2Name}님과 매칭되었습니다`,
        data: {
          matchId,
          partnerId: user2Id,
          chatRoomId: matchData.chatRoomId || matchId,
        },
        imageUrl: user2Avatar,
      })
    }

    // Send notification to user2 about matching with user1
    if (user2Data?.notificationSettings?.match !== false) {
      await sendPushNotification(user2Id, {
        title: "새로운 매칭!",
        body: `${user1Name}님과 매칭되었습니다. 지금 대화를 시작해보세요!`,
        data: {
          type: "new_match",
          matchId,
          partnerId: user1Id,
          chatRoomId: matchData.chatRoomId || matchId,
        },
        imageUrl: user1Avatar,
      })

      await storeNotification(user2Id, {
        type: "new_match",
        title: "새로운 매칭!",
        body: `${user1Name}님과 매칭되었습니다`,
        data: {
          matchId,
          partnerId: user1Id,
          chatRoomId: matchData.chatRoomId || matchId,
        },
        imageUrl: user1Avatar,
      })
    }

    logger.info(`Sent match notifications for match ${matchId}`)
  } catch (error) {
    logger.error(`Error processing match notification:`, error)
  }
})

/**
 * Trigger: Send notification when someone likes the user
 */
export const onNewLike = onDocumentCreated("likes/{likeId}", async (event) => {
  const snapshot = event.data
  if (!snapshot) {
    logger.error("No data associated with the event")
    return
  }

  const likeData = snapshot.data()
  const { fromUserId, toUserId, type } = likeData

  // Skip if it's a "dislike" or "pass"
  if (type !== "like" && type !== "superlike") {
    return
  }

  logger.info(`New ${type} from ${fromUserId} to ${toUserId}`)

  try {
    const db = admin.firestore()

    // Check if recipient wants like notifications
    const recipientDoc = await db.collection("users").doc(toUserId).get()
    const recipientData = recipientDoc.data()

    if (recipientData?.notificationSettings?.likes === false) {
      logger.info(`User ${toUserId} has like notifications disabled`)
      return
    }

    // Get sender info
    const senderDoc = await db.collection("users").doc(fromUserId).get()
    const senderData = senderDoc.data()

    // For premium features, you might reveal the liker's identity
    // For free users, keep it anonymous
    const isPremium = recipientData?.subscription?.status === "active"
    const senderName = isPremium
      ? senderData?.displayName || senderData?.name || "누군가"
      : "누군가"
    const senderAvatar = isPremium ? senderData?.photoURL || senderData?.profileImage : undefined

    const notificationTitle = type === "superlike" ? "슈퍼 좋아요!" : "좋아요!"
    const notificationBody =
      type === "superlike"
        ? `${senderName}님이 당신에게 슈퍼 좋아요를 보냈습니다!`
        : `${senderName}님이 당신을 좋아합니다`

    // Send push notification
    await sendPushNotification(toUserId, {
      title: notificationTitle,
      body: notificationBody,
      data: {
        type: "new_like",
        likeType: type,
        fromUserId: isPremium ? fromUserId : "",
      },
      imageUrl: senderAvatar,
    })

    // Store notification
    await storeNotification(toUserId, {
      type: "new_like",
      title: notificationTitle,
      body: notificationBody,
      data: {
        likeType: type,
        fromUserId: isPremium ? fromUserId : "",
      },
      imageUrl: senderAvatar,
    })

    logger.info(`Sent like notification to ${toUserId}`)
  } catch (error) {
    logger.error(`Error processing like notification:`, error)
  }
})

/**
 * Trigger: Send notification when match is about to expire (for time-limited matches)
 */
export const onMatchExpiringSoon = onDocumentUpdated("matches/{matchId}", async (event) => {
  const beforeData = event.data?.before.data()
  const afterData = event.data?.after.data()

  if (!beforeData || !afterData) {
    return
  }

  // Check if expiresAt was just set or updated
  if (!beforeData.expiringNotificationSent && afterData.expiresAt) {
    const matchId = event.params.matchId
    const { user1Id, user2Id } = afterData
    const expiresAt = afterData.expiresAt.toDate()
    const now = new Date()

    // Calculate hours until expiration
    const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)

    // Send reminder if less than 24 hours remaining
    if (hoursUntilExpiry <= 24 && hoursUntilExpiry > 0) {
      logger.info(`Match ${matchId} expiring in ${hoursUntilExpiry.toFixed(1)} hours`)

      const db = admin.firestore()

      // Get user names
      const [user1Doc, user2Doc] = await Promise.all([
        db.collection("users").doc(user1Id).get(),
        db.collection("users").doc(user2Id).get(),
      ])

      const user1Name = user1Doc.data()?.displayName || "매칭 상대"
      const user2Name = user2Doc.data()?.displayName || "매칭 상대"

      // Send to both users
      await Promise.all([
        sendPushNotification(user1Id, {
          title: "매칭이 곧 만료됩니다",
          body: `${user2Name}님과의 매칭이 ${Math.ceil(hoursUntilExpiry)}시간 후 만료됩니다. 대화를 시작해보세요!`,
          data: {
            type: "match_expiring",
            matchId,
            partnerId: user2Id,
          },
        }),
        sendPushNotification(user2Id, {
          title: "매칭이 곧 만료됩니다",
          body: `${user1Name}님과의 매칭이 ${Math.ceil(hoursUntilExpiry)}시간 후 만료됩니다. 대화를 시작해보세요!`,
          data: {
            type: "match_expiring",
            matchId,
            partnerId: user1Id,
          },
        }),
      ])

      // Mark notification as sent
      await db.collection("matches").doc(matchId).update({
        expiringNotificationSent: true,
      })
    }
  }
})
