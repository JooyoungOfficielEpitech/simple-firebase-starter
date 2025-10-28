/**
 * 프로필 Zustand 스토어
 * ProfileContext를 대체하는 경량 상태 관리
 */
import { create } from "zustand"
import { userService } from "@/services/firestore"
import type { ProfileState } from "./types"

/**
 * 프로필 스토어
 * - 프로필 완성도 체크
 * - 프로필 안내 모달 관리
 */
export const useProfileStore = create<ProfileState>((set, get) => ({
  // 초기 상태
  isProfileComplete: true, // 기본값을 true로 설정하여 로딩 중일 때 방해하지 않음
  profileCheckLoading: false,
  shouldShowProfilePrompt: false,
  hasCompletedFirstCheck: false,

  // 동기 액션
  setIsProfileComplete: (isComplete) => set({ isProfileComplete: isComplete }),

  setProfileCheckLoading: (isLoading) => set({ profileCheckLoading: isLoading }),

  setShouldShowProfilePrompt: (shouldShow) => set({ shouldShowProfilePrompt: shouldShow }),

  setHasCompletedFirstCheck: (hasCompleted) => set({ hasCompletedFirstCheck: hasCompleted }),

  // 프로필 완성도 체크
  checkProfileCompletion: async (userId: string) => {
    // 동시 호출 방지
    if (get().profileCheckLoading) {
      console.log("⏭️ [ProfileStore] 이미 체크 중 - 스킵")
      return
    }

    try {
      set({ profileCheckLoading: true })
      console.log("🔍 [ProfileStore] 프로필 완성도 체크 시작")

      const profile = await userService.getUserProfile(userId)

      // 실제 프로필 완성도 확인
      const isComplete = Boolean(
        profile?.gender && profile?.birthday && typeof profile?.heightCm === "number",
      )

      console.log("📊 [ProfileStore] 프로필 완성도 결과:", {
        name: profile?.name,
        gender: profile?.gender,
        birthday: profile?.birthday,
        heightCm: profile?.heightCm,
        isComplete,
      })

      set({
        isProfileComplete: isComplete,
        hasCompletedFirstCheck: true,
      })

      // 프로필이 미완성인 경우에만 안내 모달 표시
      if (!isComplete) {
        console.log("🎭 [ProfileStore] 프로필 미완성 - 안내 모달 활성화")
        set({ shouldShowProfilePrompt: true })
      } else {
        console.log("✅ [ProfileStore] 프로필 완성됨 - 모달 표시하지 않음")
        set({ shouldShowProfilePrompt: false })
      }
    } catch (error) {
      console.error("❌ [ProfileStore] 프로필 완성도 체크 실패:", error)
      // 에러 발생 시 기본값을 true로 설정하여 앱 사용에 지장이 없도록 함
      set({
        isProfileComplete: true,
        hasCompletedFirstCheck: true,
        shouldShowProfilePrompt: false,
      })
    } finally {
      set({ profileCheckLoading: false })
    }
  },

  // 프로필 안내 모달 닫기
  dismissProfilePrompt: () => {
    set({ shouldShowProfilePrompt: false })
    console.log("⏭️ [ProfileStore] 프로필 안내 모달 닫기")
  },

  // 프로필 상태 리셋 (로그아웃 시 사용)
  resetProfileState: () => {
    set({
      isProfileComplete: true,
      shouldShowProfilePrompt: false,
      hasCompletedFirstCheck: false,
      profileCheckLoading: false,
    })
    console.log("🔄 [ProfileStore] 프로필 상태 리셋")
  },
}))

/**
 * 사용자 로그인 시 자동 프로필 체크 (5초 지연)
 * App.tsx 또는 MainNavigator에서 호출
 */
export const initializeProfileCheck = (userId: string) => {
  console.log("🚀 [ProfileStore] 사용자 로그인 감지 - 프로필 완성도 체크 5초 지연 후 시작")

  const timeoutId = setTimeout(() => {
    useProfileStore.getState().checkProfileCompletion(userId).catch((error) => {
      console.error("❌ [ProfileStore] 자동 프로필 체크 실패:", error)
    })
  }, 5000)

  return () => clearTimeout(timeoutId)
}
