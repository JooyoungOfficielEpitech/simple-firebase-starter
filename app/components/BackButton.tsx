import { type FC, useCallback } from "react"
import { TouchableOpacity, type ViewStyle } from "react-native"
import { useNavigation } from "@react-navigation/native"

import { Button, type ButtonProps } from "./Button"
import { Icon } from "./Icon"
import { useAppTheme } from "@/theme/context"
import { type ThemedStyle } from "@/theme/types"

export interface BackButtonProps {
  /**
   * 뒤로가기 버튼 스타일
   * - "icon": 아이콘 버튼 (기본값)
   * - "text": 텍스트 버튼
   */
  variant?: "icon" | "text"
  
  /**
   * 텍스트 버튼에 표시할 텍스트
   */
  text?: string
  
  /**
   * 텍스트 버튼에 표시할 i18n 키
   */
  tx?: ButtonProps["tx"]
  
  /**
   * 뒤로가기 전에 실행할 함수들
   * 예: 폼 리셋, 에러 클리어 등
   */
  onBeforeGoBack?: () => void | Promise<void>
  
  /**
   * 커스텀 뒤로가기 핸들러
   * 기본값: navigation.goBack()
   */
  onPress?: () => void
  
  /**
   * 버튼 비활성화 여부
   */
  disabled?: boolean
  
  /**
   * 추가 스타일
   */
  style?: ViewStyle
  
  /**
   * 텍스트 버튼의 경우 Button 컴포넌트에 전달할 추가 props
   */
  buttonProps?: Partial<ButtonProps>
}

/**
 * 통일된 뒤로가기 버튼 컴포넌트
 * 
 * 사용법:
 * ```tsx
 * // 아이콘 버튼 (기본)
 * <BackButton />
 * 
 * // 텍스트 버튼
 * <BackButton variant="text" tx="common:back" />
 * 
 * // 폼 리셋과 함께
 * <BackButton 
 *   variant="text" 
 *   tx="signUpScreen:backToSignIn"
 *   onBeforeGoBack={() => {
 *     signUpForm.reset()
 *     clearAuthError()
 *   }}
 * />
 * ```
 */
export const BackButton: FC<BackButtonProps> = function BackButton({
  variant = "icon",
  text,
  tx,
  onBeforeGoBack,
  onPress,
  disabled = false,
  style,
  buttonProps,
}) {
  const navigation = useNavigation()
  const { theme } = useAppTheme()

  const handlePress = useCallback(async () => {
    if (disabled) return
    
    // 사전 작업 실행
    if (onBeforeGoBack) {
      await onBeforeGoBack()
    }
    
    // 커스텀 핸들러가 있으면 사용, 없으면 기본 뒤로가기
    if (onPress) {
      onPress()
    } else {
      navigation.goBack()
    }
  }, [onBeforeGoBack, onPress, disabled, navigation])

  if (variant === "text") {
    return (
      <Button
        text={text}
        tx={tx}
        onPress={handlePress}
        disabled={disabled}
        preset="default"
        style={style}
        {...buttonProps}
      />
    )
  }

  // 아이콘 버튼
  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      style={[
        $iconButton,
        disabled && $iconButtonDisabled,
        style,
      ]}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="뒤로가기"
      accessibilityHint="이전 화면으로 돌아갑니다"
    >
      <Icon 
        icon="back" 
        size={24} 
        color={disabled ? theme.colors.textDim : theme.colors.palette.primary500} 
      />
    </TouchableOpacity>
  )
}

const $iconButton: ViewStyle = {
  width: 44,
  height: 44,
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 22,
}

const $iconButtonDisabled: ViewStyle = {
  opacity: 0.5,
}