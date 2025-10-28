/**
 * 알림 Zustand 스토어
 * 푸시 알림 및 인앱 알림 상태 관리
 */
import { create } from "zustand"
import type { NotificationState, NotificationItem } from "./types"

/**
 * 알림 스토어
 * - FCM 토큰 관리
 * - 읽지 않은 알림 카운트
 * - 알림 목록 관리
 */
export const useNotificationStore = create<NotificationState>((set, get) => ({
  // 초기 상태
  fcmToken: null,
  unreadCount: 0,
  notifications: [],
  isInitialized: false,

  // FCM 토큰 설정
  setFcmToken: (token) => {
    console.log("🔔 [NotificationStore] FCM 토큰 설정:", token?.substring(0, 20) + "...")
    set({ fcmToken: token })
  },

  // 읽지 않은 알림 개수 설정
  setUnreadCount: (count) => {
    console.log("🔔 [NotificationStore] 읽지 않은 알림:", count)
    set({ unreadCount: count })
  },

  // 알림 추가
  addNotification: (notification) => {
    const notifications = get().notifications
    const exists = notifications.some((n) => n.id === notification.id)

    if (!exists) {
      console.log("🔔 [NotificationStore] 새 알림 추가:", notification.title)
      const newNotifications = [notification, ...notifications].slice(0, 100) // 최대 100개 유지
      const unreadCount = newNotifications.filter((n) => !n.isRead).length

      set({
        notifications: newNotifications,
        unreadCount,
      })
    }
  },

  // 알림 읽음 표시
  markAsRead: (notificationId) => {
    const notifications = get().notifications.map((n) =>
      n.id === notificationId ? { ...n, isRead: true } : n,
    )
    const unreadCount = notifications.filter((n) => !n.isRead).length

    console.log("🔔 [NotificationStore] 알림 읽음 처리:", notificationId)
    set({
      notifications,
      unreadCount,
    })
  },

  // 모든 알림 삭제
  clearNotifications: () => {
    console.log("🔔 [NotificationStore] 모든 알림 삭제")
    set({
      notifications: [],
      unreadCount: 0,
    })
  },

  // 초기화 상태 설정
  setIsInitialized: (isInitialized) => {
    console.log("🔔 [NotificationStore] 초기화 상태:", isInitialized)
    set({ isInitialized })
  },
}))
