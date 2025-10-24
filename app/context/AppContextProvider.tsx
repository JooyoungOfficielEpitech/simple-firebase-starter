import { FC, PropsWithChildren } from "react"
import { AuthProvider } from "./AuthContext"
import { ProfileProvider } from "./ProfileContext"
import { NotificationProvider } from "./NotificationContext"
import { useAuth } from "./AuthContext"

/**
 * ProfileNotificationProvider: ProfileContext와 NotificationContext를 제공하는 컴포넌트
 * AuthProvider 내부에서 사용되어 user 정보에 접근 가능
 */
const ProfileNotificationProvider: FC<PropsWithChildren> = ({ children }) => {
  const { user } = useAuth()
  
  // 항상 ProfileProvider와 NotificationProvider를 제공하되
  // user가 null일 때도 안전하게 처리하도록 함
  return (
    <ProfileProvider user={user}>
      <NotificationProvider user={user}>
        {children}
      </NotificationProvider>
    </ProfileProvider>
  )
}

/**
 * AppContextProvider: 모든 앱 레벨 컨텍스트를 제공하는 최상위 프로바이더
 * 
 * 계층 구조:
 * 1. AuthProvider (가장 최상위 - 인증 상태 관리)
 * 2. ProfileProvider (user 정보 필요)
 * 3. NotificationProvider (user 정보 필요)
 * 
 * 이 구조를 통해 각 컨텍스트는 독립적인 관심사를 가지면서도
 * 필요한 의존성(user 정보)을 안전하게 주입받을 수 있습니다.
 */
export const AppContextProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <AuthProvider>
      <ProfileNotificationProvider>
        {children}
      </ProfileNotificationProvider>
    </AuthProvider>
  )
}

// 편의를 위한 통합 훅들
export { useAuth } from "./AuthContext"
export { useProfile } from "./ProfileContext"  
export { useNotification } from "./NotificationContext"

// 타입 export
export type { AuthContextType } from "./AuthContext"
export type { ProfileContextType } from "./ProfileContext"
export type { NotificationContextType } from "./NotificationContext"