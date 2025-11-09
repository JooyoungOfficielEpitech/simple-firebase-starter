import React, { FC, useEffect, useState } from "react"
import { View, ViewStyle, TextStyle, TouchableOpacity } from "react-native"
import { useProfile } from "@/context/AppContextProvider"
import { Text } from "@/components/Text"
import { Button } from "@/components/Button"
import { BaseModal } from "@/components/BaseModal"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { navigationRef } from "@/navigators/navigationUtilities"

/**
 * 프로필 완성 안내 모달 컴포넌트
 * 
 * 사용자에게 프로필 완성을 안내하는 모달을 표시합니다.
 * React.memo를 사용하여 불필요한 리렌더링을 방지합니다.
 */
export const ProfileCompletionModal: FC = React.memo(() => {
  const { themed } = useAppTheme()
  const { shouldShowProfilePrompt, dismissProfilePrompt, profileCheckLoading } = useProfile()
  const [timeoutReached, setTimeoutReached] = useState(false)

  const handleNavigateToProfile = () => {
    dismissProfilePrompt()
    try {
      // EditProfile 화면으로 이동
      navigationRef.navigate("EditProfile" as never)
      console.log("📱 [ProfileCompletionModal] EditProfile로 이동")
    } catch (error) {
      console.error("❌ [ProfileCompletionModal] 네비게이션 오류:", error)
    }
  }

  const handleDismiss = () => {
    dismissProfilePrompt()
    console.log("⏭️ [ProfileCompletionModal] 프로필 완성 안내 닫기")
  }

  // 프로필 모달 타임아웃 처리 (20초)
  useEffect(() => {
    if (shouldShowProfilePrompt) {
      console.log('⏰ ProfileCompletionModal 20초 타임아웃 시작')
      const timeoutId = setTimeout(() => {
        console.log('🚨 ProfileCompletionModal 20초 타임아웃 - 강제 닫기')
        setTimeoutReached(true)
        dismissProfilePrompt()
      }, 20000)

      return () => {
        clearTimeout(timeoutId)
        setTimeoutReached(false)
      }
    }
  }, [shouldShowProfilePrompt, dismissProfilePrompt])

  // 프로필 체크가 진행 중이거나 완료되지 않았으면 모달 표시하지 않음
  // 또한 로딩 상태나 타임아웃 상황에서도 표시하지 않음
  const shouldShowModal = shouldShowProfilePrompt && !profileCheckLoading && !timeoutReached
  
  return (
    <BaseModal 
      visible={shouldShowModal} 
      onClose={handleDismiss}
      // 배경 터치 시 모달이 닫히도록 설정
    >
      <Text preset="heading" style={themed($modalTitle)}>
        🎭 프로필 완성하고 시작하세요!
      </Text>
      
      <Text preset="default" style={themed($modalDescription)}>
        앱을 최대한 활용하기 위해
        {"\n"}기본 프로필을 완성해주세요
        {"\n\n"}
        ✨ 전화번호, 성별, 생년월일, 키 정보만 입력하면
        {"\n"}더 나은 서비스를 이용하실 수 있어요!
      </Text>
      
      <View style={themed($modalButtons)}>
        <Button
          text="프로필 완성하기"
          onPress={handleNavigateToProfile}
          style={themed($primaryButton)}
        />
        
        <Button
          text="나중에 하기"
          onPress={handleDismiss}
          preset="default"
          style={themed($secondaryButton)}
          textStyle={themed($secondaryButtonText)}
        />
        
        {timeoutReached && (
          <TouchableOpacity
            onPress={handleDismiss}
            style={themed($emergencyButton)}
          >
            <Text style={themed($emergencyButtonText)}>
              🚨 응급 닫기 (터치 불응 해결)
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </BaseModal>
  )
})

ProfileCompletionModal.displayName = "ProfileCompletionModal"

// 모달 내부 컨텐츠 스타일 정의

const $modalTitle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  textAlign: "center",
  marginBottom: spacing.md,
})

const $modalDescription: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  textAlign: "center",
  marginBottom: spacing.xl,
  lineHeight: 24,
  color: colors.textDim,
})

const $modalButtons: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
})

const $primaryButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
})

const $secondaryButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  borderWidth: 1,
  borderColor: colors.border,
})

const $secondaryButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})

const $emergencyButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  marginTop: spacing.md,
  backgroundColor: colors.error,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderRadius: 8,
  borderWidth: 2,
  borderColor: colors.errorBackground,
})

const $emergencyButtonText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.bold,
  color: colors.errorBackground,
  textAlign: "center",
})