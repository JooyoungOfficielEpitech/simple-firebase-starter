/**
 * 공통 Zustand 스토어 타입 정의
 */
import { FirebaseAuthTypes } from "@react-native-firebase/auth"
import type { WickedCharacterTheme, ImmutableThemeContextModeT } from "@/theme/types"

/**
 * 인증 스토어 상태
 */
export interface AuthState {
  // 상태
  user: FirebaseAuthTypes.User | null
  isLoading: boolean
  isAuthenticated: boolean
  isEmailVerified: boolean
  authError: string | null

  // 액션
  setUser: (user: FirebaseAuthTypes.User | null) => void
  setIsLoading: (isLoading: boolean) => void
  setAuthError: (error: string | null) => void
  clearAuthError: () => void

  // 비동기 액션
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  sendEmailVerification: () => Promise<void>
  reloadUser: () => Promise<FirebaseAuthTypes.User | null>
  updateUserEmail: (newEmail: string) => Promise<void>
}

/**
 * 프로필 스토어 상태
 */
export interface ProfileState {
  // 상태
  isProfileComplete: boolean
  profileCheckLoading: boolean
  shouldShowProfilePrompt: boolean
  hasCompletedFirstCheck: boolean

  // 액션
  setIsProfileComplete: (isComplete: boolean) => void
  setProfileCheckLoading: (isLoading: boolean) => void
  setShouldShowProfilePrompt: (shouldShow: boolean) => void
  setHasCompletedFirstCheck: (hasCompleted: boolean) => void

  // 비동기 액션
  checkProfileCompletion: (userId: string) => Promise<void>
  dismissProfilePrompt: () => void
  resetProfileState: () => void
}

/**
 * 테마 스토어 상태
 */
export interface ThemeState {
  // 상태
  themeMode: ImmutableThemeContextModeT
  wickedCharacter: WickedCharacterTheme

  // 액션
  setThemeMode: (mode: ImmutableThemeContextModeT) => void
  setWickedCharacter: (character: WickedCharacterTheme) => void
  toggleTheme: () => void
}

/**
 * 알림 스토어 상태
 */
export interface NotificationState {
  // 상태
  fcmToken: string | null
  unreadCount: number
  notifications: NotificationItem[]
  isInitialized: boolean

  // 액션
  setFcmToken: (token: string | null) => void
  setUnreadCount: (count: number) => void
  addNotification: (notification: NotificationItem) => void
  markAsRead: (notificationId: string) => void
  clearNotifications: () => void
  setIsInitialized: (isInitialized: boolean) => void
}

/**
 * 알림 아이템
 */
export interface NotificationItem {
  id: string
  title: string
  body: string
  data?: Record<string, any>
  timestamp: number
  isRead: boolean
  type?: string
}

/**
 * 스토어 지속성 옵션
 */
export interface PersistOptions {
  name: string
  partialize?: (state: any) => any
  version?: number
  migrate?: (persistedState: any, version: number) => any
}
