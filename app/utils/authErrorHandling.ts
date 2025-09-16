import { Alert } from "react-native"

import { translate } from "@/i18n/translate"

/**
 * 인증 관련 에러를 처리하는 유틸리티 함수들
 */

export interface AuthErrorConfig {
  /** 에러 타이틀 */
  title: string
  /** 기본 에러 메시지 (error가 없거나 알 수 없는 에러일 때) */
  defaultMessage: string
  /** 추가 액션 버튼들 (optional) */
  actions?: Array<{
    text: string
    onPress: () => void
    style?: "default" | "cancel" | "destructive"
  }>
}

/**
 * 인증 에러를 Alert으로 표시하는 공통 함수
 */
export function showAuthError(error: unknown, config: AuthErrorConfig): void {
  const errorMessage = error instanceof Error ? error.message : config.defaultMessage

  const buttons = [
    ...(config.actions || []),
    { text: translate("common:ok"), style: "default" as const },
  ]

  Alert.alert(config.title, errorMessage, buttons)
}

/**
 * 로그인 에러 처리
 */
export function handleSignInError(error: unknown): void {
  showAuthError(error, {
    title: translate("signInScreen:errorTitle"),
    defaultMessage: translate("signInScreen:authFailed"),
  })
}

/**
 * 회원가입 에러 처리
 */
export function handleSignUpError(error: unknown): void {
  showAuthError(error, {
    title: translate("signUpScreen:errorTitle"),
    defaultMessage: translate("signUpScreen:signUpFailed"),
  })
}

/**
 * Google 로그인 에러 처리
 */
export function handleGoogleSignInError(error: unknown): void {
  showAuthError(error, {
    title: translate("signInScreen:errorTitle"),
    defaultMessage: translate("signInScreen:googleFailed"),
  })
}

/**
 * 비밀번호 재설정 에러 처리
 */
export function handleForgotPasswordError(error: unknown): void {
  showAuthError(error, {
    title: translate("forgotPasswordScreen:errorTitle"),
    defaultMessage: translate("forgotPasswordScreen:sendFailed"),
  })
}

/**
 * 폼 유효성 검사 에러 처리
 */
export function handleFormValidationError(
  validationError: { issues: Array<{ message: string }> },
  errorTitle: string,
): void {
  const firstError = validationError.issues[0]
  Alert.alert(errorTitle, firstError.message)
}