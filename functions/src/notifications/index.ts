/**
 * Notifications Module Index
 * Export all notification-related functions and utilities
 */

// Utilities
export {
  sendPushNotification,
  sendPushNotificationToMultiple,
  getUserFcmTokens,
  storeNotification,
  type NotificationData,
  type UserNotificationTarget,
} from "./sendNotification"

// Triggers
export { onNewMessage, onMessagesRead } from "./chatNotifications"
export { onNewMatch, onNewLike, onMatchExpiringSoon } from "./matchNotifications"
