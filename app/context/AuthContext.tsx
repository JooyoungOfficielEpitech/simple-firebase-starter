import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth"
import {
  GoogleSignin,
  statusCodes,
  isErrorWithCode,
  isSuccessResponse,
  isCancelledResponse,
} from "@react-native-google-signin/google-signin"

import { translate } from "@/i18n/translate"
import { userService } from "@/services/firestore"
import { type CreateUserProfile } from "@/types/user"
import { NotificationCleanupUtils } from "@/utils/notificationCleanup"

export type AuthContextType = {
  isAuthenticated: boolean
  isLoading: boolean
  user: FirebaseAuthTypes.User | null
  isEmailVerified: boolean

  // 프로필 완성 상태 관리
  isProfileComplete: boolean
  profileCheckLoading: boolean
  shouldShowProfilePrompt: boolean
  checkProfileCompletion: () => Promise<void>
  dismissProfilePrompt: () => void

  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>

  signInWithGoogle: () => Promise<void>

  logout: () => Promise<void>

  // Email verification functions
  sendEmailVerification: () => Promise<void>
  reloadUser: () => Promise<FirebaseAuthTypes.User | null>
  updateUserEmail: (newEmail: string) => Promise<void>

  authError: string | null
  clearAuthError: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

export interface AuthProviderProps {}

export const AuthProvider: FC<PropsWithChildren<AuthProviderProps>> = ({ children }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  
  // 프로필 완성 상태 관리
  const [isProfileComplete, setIsProfileComplete] = useState(true) // 기본값을 true로 설정하여 로딩 중일 때 방해하지 않음
  const [profileCheckLoading, setProfileCheckLoading] = useState(false)
  const [shouldShowProfilePrompt, setShouldShowProfilePrompt] = useState(false) // 프로필 안내 표시 여부
  const [hasCompletedFirstCheck, setHasCompletedFirstCheck] = useState(false) // 첫 번째 프로필 체크 완료 여부

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
      scopes: ["email", "profile"],
    })
  }, [])

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      setUser(user)
      setIsEmailVerified(user?.emailVerified || false)
      setIsLoading(false)

      // 사용자 로그인 시 알림 정리 및 프로필 체크 실행
      if (user) {
        try {
          await NotificationCleanupUtils.cleanupUserNotificationsOnLogin(user.uid)
          
          // 로그인/앱 시작 시 프로필 완성도 자동 체크
          console.log("🚀 [AuthContext] 로그인 감지 - 프로필 완성도 체크 시작")
          setTimeout(async () => {
            try {
              await autoCheckProfileOnLogin(user.uid)
            } catch (error) {
              console.error('❌ [AuthContext] 자동 프로필 체크 실패:', error)
            }
          }, 2000) // 로그인 완료 후 2초 지연
        } catch (error) {
          console.error('❌ [AuthContext] 로그인 시 초기화 실패:', error)
        }
      } else {
        // 로그아웃 시 프로필 관련 상태 리셋
        setIsProfileComplete(true)
        setShouldShowProfilePrompt(false)
        setHasCompletedFirstCheck(false)
      }
    })

    return unsubscribe
  }, [])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setAuthError(null)

      await auth().signInWithEmailAndPassword(email, password)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : translate("auth:errors.signInFailed")
      setAuthError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setAuthError(null)

      const userCredential = await auth().createUserWithEmailAndPassword(email, password)

      // 회원가입 후 즉시 이메일 검증 메일 발송
      if (userCredential.user && !userCredential.user.emailVerified) {
        await userCredential.user.sendEmailVerification()
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : translate("auth:errors.signUpFailed")
      setAuthError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    try {
      setIsLoading(true)
      setAuthError(null)

      // Check if Play Services are available (Android only)
      await GoogleSignin.hasPlayServices()

      // Attempt to sign in
      const response = await GoogleSignin.signIn()

      if (isCancelledResponse(response)) {
        return
      }

      if (isSuccessResponse(response)) {
        const { idToken } = response.data

        if (!idToken) {
          throw new Error(translate("auth:errors.googleSignInFailed"))
        }

        const googleCredential = auth.GoogleAuthProvider.credential(idToken)
        await auth().signInWithCredential(googleCredential)
      }
    } catch (error) {
      // Handle specific Google Sign-in errors
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            // Sign in operation is already in progress
            setAuthError(translate("auth:errors.signInInProgress"))
            break
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            // Android only - Play Services not available or outdated
            setAuthError(translate("auth:errors.playServicesNotAvailable"))
            break
          default:
            setAuthError(translate("auth:errors.googleSignInFailed"))
        }
      } else {
        // General error
        const errorMessage =
          error instanceof Error ? error.message : translate("auth:errors.googleSignInFailed")
        setAuthError(errorMessage)
      }
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      setAuthError(null)

      // 즉시 사용자 상태를 null로 설정하여 UI가 즉시 업데이트되도록 함
      setUser(null)

      // Sign out from Google
      await GoogleSignin.signOut()

      // Sign out from Firebase
      await auth().signOut()
    } catch (error) {
      // 에러가 발생해도 사용자는 로그아웃된 상태로 유지
      console.warn("Logout error:", error)

      const errorMessage =
        error instanceof Error ? error.message : translate("auth:errors.logoutFailed")
      setAuthError(errorMessage)

      // 에러가 발생해도 사용자 상태는 null로 유지
      setUser(null)

      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearAuthError = useCallback(() => {
    setAuthError(null)
  }, [])

  // 로그인/앱 시작 시 자동 프로필 체크 함수
  const autoCheckProfileOnLogin = useCallback(async (userId: string) => {
    if (profileCheckLoading) {
      return
    }

    try {
      setProfileCheckLoading(true)
      console.log("🔍 [AuthContext] 로그인 시 프로필 완성도 체크 시작")
      
      const profile = await userService.getUserProfile(userId)
      
      // 실제 프로필 완성도 확인
      const isComplete = Boolean(
        profile?.gender &&
        profile?.birthday &&
        typeof profile?.heightCm === "number"
      )
      
      console.log("📊 [AuthContext] 프로필 완성도 결과:", {
        name: profile?.name,
        gender: profile?.gender,
        birthday: profile?.birthday,
        heightCm: profile?.heightCm,
        isComplete
      })
      
      setIsProfileComplete(isComplete)
      setHasCompletedFirstCheck(true) // 첫 번째 체크 완료 표시
      
      // 프로필이 미완성인 경우에만 안내 모달 표시 (첫 번째 체크 완료 후)
      if (!isComplete) {
        console.log("🎭 [AuthContext] 프로필 미완성 - 안내 모달 활성화")
        setShouldShowProfilePrompt(true)
      } else {
        console.log("✅ [AuthContext] 프로필 완성됨 - 모달 표시하지 않음")
        setShouldShowProfilePrompt(false)
      }
      
    } catch (error) {
      console.error("❌ [AuthContext] 프로필 완성도 체크 실패:", error)
      // 에러 발생 시 기본값을 true로 설정하여 앱 사용에 지장이 없도록 함
      setIsProfileComplete(true)
      setHasCompletedFirstCheck(true)
      setShouldShowProfilePrompt(false)
    } finally {
      setProfileCheckLoading(false)
    }
  }, [profileCheckLoading])

  // 수동 프로필 완성도 체크 함수 (기존 API 호환성 유지)
  const checkProfileCompletion = useCallback(async () => {
    if (!user) {
      return
    }
    await autoCheckProfileOnLogin(user.uid)
  }, [user, autoCheckProfileOnLogin])

  // 프로필 안내 모달 닫기 함수
  const dismissProfilePrompt = useCallback(() => {
    setShouldShowProfilePrompt(false)
    console.log("⏭️ [AuthContext] 프로필 안내 모달 닫기")
  }, [])

  // 이메일 검증 메일 발송
  const sendEmailVerification = useCallback(async () => {
    try {
      setIsLoading(true)
      setAuthError(null)

      const currentUser = auth().currentUser
      if (!currentUser) {
        throw new Error(translate("auth:errors.userNotFound"))
      }

      await currentUser.sendEmailVerification()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : translate("auth:errors.emailVerificationFailed")
      setAuthError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 사용자 정보 새로고침 (이메일 검증 상태 확인)
  const reloadUser = useCallback(async () => {
    try {
      setIsLoading(true)
      setAuthError(null)

      const currentUser = auth().currentUser
      if (!currentUser) {
        throw new Error(translate("auth:errors.userNotFound"))
      }

      await currentUser.reload()
      const updatedUser = auth().currentUser
      setUser(updatedUser)
      setIsEmailVerified(updatedUser?.emailVerified || false)

      return updatedUser
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : translate("auth:errors.reloadFailed")
      setAuthError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 이메일 주소 변경
  const updateUserEmail = useCallback(async (newEmail: string) => {
    try {
      setIsLoading(true)
      setAuthError(null)

      const currentUser = auth().currentUser
      if (!currentUser) {
        throw new Error(translate("auth:errors.userNotFound"))
      }

      await currentUser.updateEmail(newEmail)

      // 이메일 변경 후 새로운 이메일로 검증 메일 발송
      await currentUser.sendEmailVerification()

      // 사용자 정보 새로고침
      await currentUser.reload()
      const updatedUser = auth().currentUser
      setUser(updatedUser)
      setIsEmailVerified(false) // 새 이메일은 미검증 상태
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : translate("auth:errors.emailUpdateFailed")
      setAuthError(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const value = {
    isAuthenticated: !!user,
    isLoading,
    user,
    isEmailVerified,
    isProfileComplete,
    profileCheckLoading,
    shouldShowProfilePrompt,
    checkProfileCompletion,
    dismissProfilePrompt,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    logout,
    sendEmailVerification,
    reloadUser,
    updateUserEmail,
    authError,
    clearAuthError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
