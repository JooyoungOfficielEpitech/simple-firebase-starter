/**
 * 푸시 알림 핸들러
 * 포그라운드/백그라운드 알림 처리 및 상태 관리
 */
import messaging, { FirebaseMessagingTypes } from "@react-native-firebase/messaging"
import { Alert, Platform } from "react-native"
import { useNotificationStore } from "@/stores"
import type { NotificationItem } from "@/stores/types"
import { handleNotificationNavigation } from "./notificationNavigation"
import { NavigationContainerRef } from "@react-navigation/native"
import type { AppStackParamList } from "@/navigators/types"

/**
 * Firebase 알림을 NotificationItem으로 변환
 */
export const parseNotification = (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): NotificationItem => {
  return {
    id: remoteMessage.messageId || `${Date.now()}`,
    title: remoteMessage.notification?.title || "알림",
    body: remoteMessage.notification?.body || "",
    data: remoteMessage.data,
    timestamp: Date.now(),
    isRead: false,
    type: (remoteMessage.data?.type as string) || "general",
  }
}

/**
 * 포그라운드 알림 표시
 */
export const showForegroundNotification = (notification: NotificationItem) => {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    Alert.alert(notification.title, notification.body, [{ text: "확인", style: "default" }], {
      cancelable: true,
    })
  }
}

/**
 * 포그라운드 메시지 리스너 설정
 */
export const setupForegroundMessageHandler = (
  navigation: NavigationContainerRef<AppStackParamList> | null,
) => {
  return messaging().onMessage(async (remoteMessage) => {
    console.log("🔔 [Notification] 포그라운드 메시지 수신:", remoteMessage)

    const notification = parseNotification(remoteMessage)

    // 스토어에 알림 추가
    useNotificationStore.getState().addNotification(notification)

    // 포그라운드 알림 표시
    showForegroundNotification(notification)

    // 알림 데이터에 딥링크가 있으면 처리 준비
    if (remoteMessage.data?.deepLink && navigation) {
      console.log("🔔 [Notification] 딥링크 데이터:", remoteMessage.data.deepLink)
    }
  })
}

/**
 * 백그라운드/종료 상태에서 알림 탭 핸들러
 */
export const setupNotificationOpenedHandler = (
  navigation: NavigationContainerRef<AppStackParamList> | null,
) => {
  return messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log("🔔 [Notification] 백그라운드 알림으로 앱 열림:", remoteMessage)

    const notification = parseNotification(remoteMessage)

    // 스토어에 알림 추가 및 읽음 처리
    useNotificationStore.getState().addNotification(notification)
    useNotificationStore.getState().markAsRead(notification.id)

    // 알림 타입별 내비게이션 처리
    if (navigation) {
      void handleNotificationNavigation(notification, navigation)
    }
  })
}

/**
 * 앱 종료 상태에서 알림으로 열렸는지 확인
 */
export const checkInitialNotification = async (
  navigation: NavigationContainerRef<AppStackParamList> | null,
) => {
  try {
    const remoteMessage = await messaging().getInitialNotification()
    if (remoteMessage) {
      console.log("🔔 [Notification] 종료 상태에서 알림으로 앱 열림:", remoteMessage)

      const notification = parseNotification(remoteMessage)

      // 스토어에 알림 추가 및 읽음 처리
      useNotificationStore.getState().addNotification(notification)
      useNotificationStore.getState().markAsRead(notification.id)

      // 알림 타입별 내비게이션 처리
      if (navigation) {
        // 약간의 지연 후 내비게이션 (앱 초기화 대기)
        setTimeout(() => {
          void handleNotificationNavigation(notification, navigation)
        }, 1000)
      }

      return notification
    }
    return null
  } catch (error) {
    console.error("🔔 [Notification] 초기 알림 확인 실패:", error)
    return null
  }
}

/**
 * 백그라운드 메시지 핸들러 설정
 * index.js에서 호출 필요
 */
export const setupBackgroundMessageHandler = () => {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log("🔔 [Notification] 백그라운드 메시지 수신:", remoteMessage)

    const notification = parseNotification(remoteMessage)

    // 스토어에 알림 추가 (백그라운드에서도 가능)
    useNotificationStore.getState().addNotification(notification)
  })
}

/**
 * FCM 토큰 새로고침 리스너
 */
export const setupTokenRefreshHandler = () => {
  return messaging().onTokenRefresh((token) => {
    console.log("🔔 [Notification] FCM 토큰 새로고침:", token.substring(0, 20) + "...")
    useNotificationStore.getState().setFcmToken(token)

    // TODO: 서버에 새 토큰 전송
  })
}

/**
 * 알림 초기화 (App.tsx에서 호출)
 */
export const initializeNotifications = async (
  navigation: NavigationContainerRef<AppStackParamList> | null,
) => {
  try {
    console.log("🔔 [Notification] 알림 시스템 초기화 시작")

    // iOS 원격 메시지 등록
    if (Platform.OS === "ios") {
      await messaging().registerDeviceForRemoteMessages()
      console.log("🔔 [Notification] iOS 원격 메시지 등록 완료")
    }

    // 권한 요청
    const authStatus = await messaging().requestPermission()
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL

    if (!enabled) {
      console.warn("🔔 [Notification] 알림 권한 거부됨")
      return false
    }

    // FCM 토큰 획득
    const token = await messaging().getToken()
    console.log("🔔 [Notification] FCM 토큰 획득:", token.substring(0, 20) + "...")
    useNotificationStore.getState().setFcmToken(token)

    // 포그라운드 메시지 핸들러 설정
    const unsubscribeForeground = setupForegroundMessageHandler(navigation)

    // 백그라운드 알림 탭 핸들러 설정
    const unsubscribeOpened = setupNotificationOpenedHandler(navigation)

    // 토큰 새로고침 핸들러 설정
    const unsubscribeTokenRefresh = setupTokenRefreshHandler()

    // 초기 알림 확인
    await checkInitialNotification(navigation)

    // 초기화 완료
    useNotificationStore.getState().setIsInitialized(true)
    console.log("🔔 [Notification] 알림 시스템 초기화 완료")

    // 클린업 함수 반환
    return () => {
      unsubscribeForeground()
      unsubscribeOpened()
      unsubscribeTokenRefresh()
    }
  } catch (error) {
    console.error("🔔 [Notification] 알림 시스템 초기화 실패:", error)
    return null
  }
}
