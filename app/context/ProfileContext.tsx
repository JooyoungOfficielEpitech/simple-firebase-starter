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

import { userService } from "@/services/firestore"

export type ProfileContextType = {
  // 프로필 완성 상태 관리
  isProfileComplete: boolean
  profileCheckLoading: boolean
  shouldShowProfilePrompt: boolean
  hasCompletedFirstCheck: boolean
  
  // 프로필 관련 함수
  checkProfileCompletion: (userId: string) => Promise<void>
  dismissProfilePrompt: () => void
  resetProfileState: () => void
}

export const ProfileContext = createContext<ProfileContextType | null>(null)

export interface ProfileProviderProps {
  user: FirebaseAuthTypes.User | null
}

export const ProfileProvider: FC<PropsWithChildren<ProfileProviderProps>> = ({ 
  children, 
  user 
}) => {
  // 프로필 완성 상태 관리
  const [isProfileComplete, setIsProfileComplete] = useState(true) // 기본값을 true로 설정하여 로딩 중일 때 방해하지 않음
  const [profileCheckLoading, setProfileCheckLoading] = useState(false)
  const [shouldShowProfilePrompt, setShouldShowProfilePrompt] = useState(false) // 프로필 안내 표시 여부
  const [hasCompletedFirstCheck, setHasCompletedFirstCheck] = useState(false) // 첫 번째 프로필 체크 완료 여부
  const isCheckingRef = useRef(false)

  // 로그인/앱 시작 시 자동 프로필 체크 함수
  const checkProfileCompletion = useCallback(async (userId: string) => {
    if (isCheckingRef.current) {
      console.log("⏭️ [ProfileContext] 이미 체크 중 - 스킵")
      return
    }

    try {
      isCheckingRef.current = true
      setProfileCheckLoading(true)
      console.log("🔍 [ProfileContext] 프로필 완성도 체크 시작")
      
      const profile = await userService.getUserProfile(userId)
      
      // 실제 프로필 완성도 확인
      const isComplete = Boolean(
        profile?.gender &&
        profile?.birthday &&
        typeof profile?.heightCm === "number"
      )
      
      console.log("📊 [ProfileContext] 프로필 완성도 결과:", {
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
        console.log("🎭 [ProfileContext] 프로필 미완성 - 안내 모달 활성화")
        setShouldShowProfilePrompt(true)
      } else {
        console.log("✅ [ProfileContext] 프로필 완성됨 - 모달 표시하지 않음")
        setShouldShowProfilePrompt(false)
      }
      
    } catch (error) {
      console.error("❌ [ProfileContext] 프로필 완성도 체크 실패:", error)
      // 에러 발생 시 기본값을 true로 설정하여 앱 사용에 지장이 없도록 함
      setIsProfileComplete(true)
      setHasCompletedFirstCheck(true)
      setShouldShowProfilePrompt(false)
    } finally {
      isCheckingRef.current = false
      setProfileCheckLoading(false)
    }
  }, [])

  // 프로필 안내 모달 닫기 함수
  const dismissProfilePrompt = useCallback(() => {
    setShouldShowProfilePrompt(false)
    console.log("⏭️ [ProfileContext] 프로필 안내 모달 닫기")
  }, [])

  // 프로필 상태 리셋 함수 (로그아웃 시 사용)
  const resetProfileState = useCallback(() => {
    isCheckingRef.current = false
    setIsProfileComplete(true)
    setShouldShowProfilePrompt(false)
    setHasCompletedFirstCheck(false)
    console.log("🔄 [ProfileContext] 프로필 상태 리셋")
  }, [])

  // 사용자 변경 시 자동 프로필 체크
  useEffect(() => {
    if (user) {
      console.log("🚀 [ProfileContext] 사용자 로그인 감지 - 프로필 완성도 체크 시작")
      // 로그인 완료 후 2초 지연하여 프로필 체크
      const timer = setTimeout(async () => {
        try {
          await checkProfileCompletion(user.uid)
        } catch (error) {
          console.error('❌ [ProfileContext] 자동 프로필 체크 실패:', error)
        }
      }, 2000)

      return () => clearTimeout(timer)
    } else {
      // 로그아웃 시 프로필 관련 상태 리셋
      resetProfileState()
    }
  }, [user?.uid, checkProfileCompletion, resetProfileState])

  const value = {
    isProfileComplete,
    profileCheckLoading,
    shouldShowProfilePrompt,
    hasCompletedFirstCheck,
    checkProfileCompletion,
    dismissProfilePrompt,
    resetProfileState,
  }

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export const useProfile = () => {
  const context = useContext(ProfileContext)
  if (!context) throw new Error("useProfile must be used within a ProfileProvider")
  return context
}