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

export type NotificationContextType = {
  // 알림 관리 상태
  isCleanupLoading: boolean
  lastCleanupTime: Date | null
  
  // 알림 관련 함수
  cleanupUserNotifications: (userId: string) => Promise<void>
  resetNotificationState: () => void
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
  const resetNotificationState = useCallback(() => {
    isCleaningRef.current = false
    setIsCleanupLoading(false)
    setLastCleanupTime(null)
    console.log("🔄 [NotificationContext] 알림 상태 리셋")
  }, [])

  // 사용자 로그인 시 알림 정리 자동 실행
  useEffect(() => {
    if (user) {
      console.log("🚀 [NotificationContext] 사용자 로그인 감지 - 알림 정리 시작")
      cleanupUserNotifications(user.uid)
    } else {
      // 로그아웃 시 알림 관련 상태 리셋
      resetNotificationState()
    }
  }, [user?.uid, cleanupUserNotifications, resetNotificationState])

  const value = {
    isCleanupLoading,
    lastCleanupTime,
    cleanupUserNotifications,
    resetNotificationState,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) throw new Error("useNotification must be used within a NotificationProvider")
  return context
}