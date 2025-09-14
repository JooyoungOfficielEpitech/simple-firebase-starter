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
