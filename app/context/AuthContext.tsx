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
import { useSingleFirebaseListener } from "@/hooks/useFirebaseListener"
import { firebaseCleanupManager } from "@/utils/firebaseCleanup"

export type AuthContextType = {
  isAuthenticated: boolean
  isLoading: boolean
  user: FirebaseAuthTypes.User | null
  isEmailVerified: boolean

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
  
  // Firebase 리스너 관리
  const { setListener: setAuthListener, cleanup: cleanupAuthListener } = useSingleFirebaseListener()

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
      scopes: ["email", "profile"],
    })
  }, [])

  useEffect(() => {
    console.log('🔐 [AuthContext] Auth 상태 리스너 설정 시작')
    
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      setUser(user)
      setIsEmailVerified(user?.emailVerified || false)
      setIsLoading(false)

      if (!user) {
        // 로그아웃 시 Firebase 리스너 정리
        firebaseCleanupManager.cleanupByComponent('AuthContext')
      }
    })

    // 리스너를 안전하게 등록
    setAuthListener(unsubscribe)
    firebaseCleanupManager.registerListener(
      'authStateChanged',
      unsubscribe,
      { component: 'AuthContext', description: 'Firebase Auth State Listener' }
    )

    return () => {
      console.log('🔐 [AuthContext] Auth 상태 리스너 정리')
      cleanupAuthListener()
    }
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
        const result = await auth().signInWithCredential(googleCredential)
        
        // 즉시 사용자 상태 업데이트 (onAuthStateChanged 이벤트 보완)
        setUser(result.user)
        setIsEmailVerified(result.user?.emailVerified || false)
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
