import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { FirebaseAuthTypes } from "@react-native-firebase/auth"

import { NotificationCleanupUtils } from "@/utils/notificationCleanup"
import PushNotificationService, { PushNotificationProps } from "@/utils/pushNotificationService"
import { fcmTokenService } from "@/services/fcmTokenService"

export type NotificationContextType = {
  // 알림 관리 상태
  isCleanupLoading: boolean
  lastCleanupTime: Date | null
  
  // 푸시 알림 상태
  isPushNotificationEnabled: boolean
  fcmToken: string | null
  latestNotification: PushNotificationProps | null
  
  // 알림 관련 함수
  cleanupUserNotifications: (userId: string) => Promise<void>
  resetNotificationState: () => void
  
  // 푸시 알림 관련 함수
  initializePushNotifications: () => Promise<boolean>
  requestPushPermission: () => Promise<boolean>
  clearLatestNotification: () => void
}

export const NotificationContext = createContext<NotificationContextType | null>(null)

export interface NotificationProviderProps {
  user: FirebaseAuthTypes.User | null
}

export const NotificationProvider: FC<PropsWithChildren<NotificationProviderProps>> = ({
  children,
  user
}) => {
  const [isCleanupLoading, setIsCleanupLoading] = useState(false)
  const [lastCleanupTime, setLastCleanupTime] = useState<Date | null>(null)
  const isCleaningRef = useRef(false)

  // 푸시 알림 상태
  const [isPushNotificationEnabled, setIsPushNotificationEnabled] = useState(false)
  const [fcmToken, setFcmToken] = useState<string | null>(null)
  const [latestNotification, setLatestNotification] = useState<PushNotificationProps | null>(null)

  // 푸시 알림 서비스 인스턴스
  const pushService = useRef(PushNotificationService.getInstance())

  // 리스너 cleanup 함수들을 저장하는 ref
  const unsubscribeRefs = useRef<{
    foreground?: () => void
    opened?: () => void
    tokenRefresh?: () => void
  }>({})

  // 사용자 알림 정리 함수
  const cleanupUserNotifications = useCallback(async (userId: string) => {
    if (isCleaningRef.current) {
      console.log("⏭️ [NotificationContext] 이미 정리 중 - 스킵")
      return
    }

    try {
      isCleaningRef.current = true
      setIsCleanupLoading(true)
      console.log("🧹 [NotificationContext] 사용자 알림 정리 시작")
      
      await NotificationCleanupUtils.cleanupUserNotificationsOnLogin(userId)
      setLastCleanupTime(new Date())
      
      console.log("✅ [NotificationContext] 사용자 알림 정리 완료")
    } catch (error) {
      console.error("❌ [NotificationContext] 알림 정리 실패:", error)
    } finally {
      isCleaningRef.current = false
      setIsCleanupLoading(false)
    }
  }, [])

  // 알림 상태 리셋 함수 (로그아웃 시 사용)
  const resetNotificationState = useCallback(async () => {
    // 로그아웃 시 현재 기기의 FCM 토큰 비활성화
    if (user && fcmToken) {
      console.log('🔄 [NotificationContext] 로그아웃 시 FCM 토큰 비활성화 중...')
      const success = await fcmTokenService.deactivateToken(user.uid, fcmToken)
      if (success) {
        console.log('✅ [NotificationContext] FCM 토큰 비활성화 성공')
      } else {
        console.log('❌ [NotificationContext] FCM 토큰 비활성화 실패')
      }
    }

    // 모든 리스너 제거
    console.log('🧹 [NotificationContext] 로그아웃 - 모든 리스너 제거')
    if (unsubscribeRefs.current.foreground) {
      unsubscribeRefs.current.foreground()
      unsubscribeRefs.current.foreground = undefined
    }
    if (unsubscribeRefs.current.opened) {
      unsubscribeRefs.current.opened()
      unsubscribeRefs.current.opened = undefined
    }
    if (unsubscribeRefs.current.tokenRefresh) {
      unsubscribeRefs.current.tokenRefresh()
      unsubscribeRefs.current.tokenRefresh = undefined
    }

    // 상태 초기화
    isCleaningRef.current = false
    setIsCleanupLoading(false)
    setLastCleanupTime(null)
    setIsPushNotificationEnabled(false)
    setFcmToken(null)
    setLatestNotification(null)
    pushService.current.cleanup()
    console.log("🔄 [NotificationContext] 알림 상태 리셋")
  }, [user, fcmToken])

  // 푸시 알림 권한 요청
  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    try {
      const hasPermission = await pushService.current.requestPermission()
      setIsPushNotificationEnabled(hasPermission)
      return hasPermission
    } catch (error) {
      console.error("❌ [NotificationContext] 푸시 알림 권한 요청 실패:", error)
      return false
    }
  }, [])

  // 푸시 알림 초기화
  const initializePushNotifications = useCallback(async (): Promise<boolean> => {
    try {
      console.log("🚀 [NotificationContext] 푸시 알림 초기화 시작")

      // 기존 리스너가 있다면 먼저 제거 (중복 방지)
      if (unsubscribeRefs.current.foreground) {
        console.log("🧹 [NotificationContext] 기존 포그라운드 리스너 제거")
        unsubscribeRefs.current.foreground()
      }
      if (unsubscribeRefs.current.opened) {
        console.log("🧹 [NotificationContext] 기존 백그라운드 리스너 제거")
        unsubscribeRefs.current.opened()
      }
      if (unsubscribeRefs.current.tokenRefresh) {
        console.log("🧹 [NotificationContext] 기존 토큰 새로고침 리스너 제거")
        unsubscribeRefs.current.tokenRefresh()
      }

      // 서비스 초기화
      const isInitialized = await pushService.current.initialize()
      if (!isInitialized) {
        console.log("❌ [NotificationContext] 푸시 알림 초기화 실패")
        return false
      }

      // FCM 토큰 획득
      const token = await pushService.current.getFCMToken()
      setFcmToken(token)
      setIsPushNotificationEnabled(true)

      // FCM 토큰을 Firestore에 자동 등록
      if (token && user) {
        console.log('🔄 [NotificationContext] FCM 토큰을 서버에 등록 중...')
        const success = await fcmTokenService.registerToken(user.uid, token)
        if (success) {
          console.log('✅ [NotificationContext] FCM 토큰 서버 등록 성공')
        } else {
          console.log('❌ [NotificationContext] FCM 토큰 서버 등록 실패')
        }
      }

      // 알림 리스너 설정
      pushService.current.setNotificationListeners({
        onNotificationReceived: (notification) => {
          console.log("📱 [NotificationContext] 포그라운드 알림 수신:", notification)
          setLatestNotification(notification)
        },
        onNotificationOpenedApp: (notification) => {
          console.log("📲 [NotificationContext] 백그라운드 알림으로 앱 열림:", notification)
          setLatestNotification(notification)
        },
      })

      // 포그라운드 메시지 리스너 등록 및 ref에 저장
      unsubscribeRefs.current.foreground = pushService.current.onForegroundMessage()
      console.log("✅ [NotificationContext] 포그라운드 리스너 등록 완료")

      // 백그라운드/종료 상태에서 알림으로 앱이 열린 경우 리스너 등록
      unsubscribeRefs.current.opened = pushService.current.onNotificationOpenedApp()
      console.log("✅ [NotificationContext] 백그라운드 리스너 등록 완료")

      // 토큰 새로고침 리스너 등록
      unsubscribeRefs.current.tokenRefresh = pushService.current.onTokenRefresh(async (newToken) => {
        console.log("🔄 [NotificationContext] FCM 토큰 새로고침:", newToken)
        const oldToken = fcmToken
        setFcmToken(newToken)

        // 새로운 토큰을 서버에 업데이트
        if (user && oldToken) {
          console.log('🔄 [NotificationContext] 새로운 FCM 토큰을 서버에 업데이트 중...')
          const success = await fcmTokenService.updateToken(user.uid, oldToken, newToken)
          if (success) {
            console.log('✅ [NotificationContext] FCM 토큰 서버 업데이트 성공')
          } else {
            console.log('❌ [NotificationContext] FCM 토큰 서버 업데이트 실패')
          }
        } else if (user) {
          // 이전 토큰이 없는 경우 새로 등록
          const success = await fcmTokenService.registerToken(user.uid, newToken)
          if (success) {
            console.log('✅ [NotificationContext] 새 FCM 토큰 서버 등록 성공')
          }
        }
      })
      console.log("✅ [NotificationContext] 토큰 새로고침 리스너 등록 완료")

      // 앱이 종료된 상태에서 알림으로 열렸는지 확인
      const initialNotification = await pushService.current.checkInitialNotification()
      if (initialNotification) {
        setLatestNotification(initialNotification)
      }

      console.log("✅ [NotificationContext] 푸시 알림 초기화 완료")
      return true
    } catch (error) {
      console.error("❌ [NotificationContext] 푸시 알림 초기화 실패:", error)
      return false
    }
  }, [user, fcmToken])

  // 최신 알림 클리어
  const clearLatestNotification = useCallback(() => {
    setLatestNotification(null)
  }, [])

  // 앱 시작 시 무조건 푸시 알림 초기화 (로그인 여부 무관)
  useEffect(() => {
    console.log("🚀 [NotificationContext] 앱 시작 - 푸시 알림 무조건 초기화 시작")
    initializePushNotifications()

    // Cleanup: 컴포넌트 언마운트 시 모든 리스너 제거
    return () => {
      console.log("🧹 [NotificationContext] 컴포넌트 언마운트 - 리스너 정리")
      if (unsubscribeRefs.current.foreground) {
        unsubscribeRefs.current.foreground()
      }
      if (unsubscribeRefs.current.opened) {
        unsubscribeRefs.current.opened()
      }
      if (unsubscribeRefs.current.tokenRefresh) {
        unsubscribeRefs.current.tokenRefresh()
      }
    }
  }, [initializePushNotifications])

  // 사용자 로그인 시 알림 정리 및 토큰 등록
  useEffect(() => {
    if (user) {
      console.log("🚀 [NotificationContext] 사용자 로그인 감지 - 알림 정리 시작")
      cleanupUserNotifications(user.uid)

      // FCM 토큰이 있으면 서버에 등록 및 중복 토큰 강제 정리
      if (fcmToken) {
        ;(async () => {
          try {
            // 1단계: 먼저 기존 중복 토큰을 모두 정리
            console.log('🧹 [NotificationContext] 기존 중복 FCM 토큰 강제 정리 중...')
            const cleanedCount = await fcmTokenService.cleanupUserDuplicateTokens(user.uid)
            if (cleanedCount > 0) {
              console.log(`✅ [NotificationContext] 기존 중복 FCM 토큰 ${cleanedCount}개 정리 완료`)
            }

            // 2단계: 현재 토큰 등록 (이미 강화된 중복 방지 로직 포함)
            console.log('🔄 [NotificationContext] 로그인 후 FCM 토큰 서버 등록 중...')
            const success = await fcmTokenService.registerToken(user.uid, fcmToken)
            if (success) {
              console.log('✅ [NotificationContext] 로그인 후 FCM 토큰 서버 등록 성공')
            } else {
              console.log('❌ [NotificationContext] 로그인 후 FCM 토큰 서버 등록 실패')
            }

            // 3단계: 등록 후 다시 한번 중복 체크 (안전장치)
            console.log('🔍 [NotificationContext] 최종 중복 토큰 검증 중...')
            const finalCheck = await fcmTokenService.cleanupUserDuplicateTokens(user.uid)
            if (finalCheck > 0) {
              console.log(`⚠️ [NotificationContext] 추가 중복 ${finalCheck}개 발견 및 정리`)
            } else {
              console.log('✅ [NotificationContext] 중복 없음 - 완료')
            }
          } catch (error) {
            console.error('❌ [NotificationContext] 토큰 등록/정리 실패:', error)
          }
        })()
      }
    } else {
      // 로그아웃 시 알림 관련 상태 리셋
      resetNotificationState()
    }
  }, [user?.uid, fcmToken, cleanupUserNotifications, resetNotificationState])

  const value = {
    isCleanupLoading,
    lastCleanupTime,
    cleanupUserNotifications,
    resetNotificationState,
    isPushNotificationEnabled,
    fcmToken,
    latestNotification,
    initializePushNotifications,
    requestPushPermission,
    clearLatestNotification,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) throw new Error("useNotification must be used within a NotificationProvider")
  return context
}