import { translate } from "@/i18n/translate"
import type { AlertButton } from "@/components/AlertModal"

/**
 * 인증 관련 에러를 처리하는 유틸리티 함수들
 */

export interface AuthErrorConfig {
  /** 에러 타이틀 */
  title: string
  /** 기본 에러 메시지 (error가 없거나 알 수 없는 에러일 때) */
  defaultMessage: string
  /** 추가 액션 버튼들 (optional) */
  actions?: AlertButton[]
  /** 알림 콜백 함수 */
  showAlert?: (title: string, message: string, buttons?: AlertButton[]) => void
}

/**
 * 인증 에러를 Alert으로 표시하는 공통 함수
 */
export function showAuthError(error: unknown, config: AuthErrorConfig): void {
  const errorMessage = error instanceof Error ? error.message : config.defaultMessage

  const buttons: AlertButton[] = [
    ...(config.actions || []),
    { text: translate("common:ok"), style: "default" },
  ]

  if (config.showAlert) {
    config.showAlert(config.title, errorMessage, buttons)
  } else {
    // Fallback for when no alert function is provided
    console.warn('showAuthError: No alert function provided, consider using AlertModal')
  }
}

/**
 * 인증 에러 핸들러 생성 유틸리티
 * 중복 코드를 제거하고 일관성 있는 에러 처리를 제공
 */
function createAuthErrorHandler(titleKey: string, defaultMessageKey: string) {
  return (error: unknown, showAlert?: (title: string, message: string, buttons?: AlertButton[]) => void): void => {
    showAuthError(error, {
      title: translate(titleKey as any),
      defaultMessage: translate(defaultMessageKey as any),
      showAlert,
    })
  }
}

/**
 * 로그인 에러 처리
 */
export const handleSignInError = createAuthErrorHandler(
  "signInScreen:errorTitle",
  "signInScreen:authFailed"
)

/**
 * 회원가입 에러 처리
 */
export const handleSignUpError = createAuthErrorHandler(
  "signUpScreen:errorTitle",
  "signUpScreen:signUpFailed"
)

/**
 * Google 로그인 에러 처리
 */
export const handleGoogleSignInError = createAuthErrorHandler(
  "signInScreen:errorTitle",
  "signInScreen:googleFailed"
)

/**
 * 비밀번호 재설정 에러 처리
 */
export const handleForgotPasswordError = createAuthErrorHandler(
  "forgotPasswordScreen:errorTitle",
  "forgotPasswordScreen:sendFailed"
)

/**
 * 폼 유효성 검사 에러 처리
 */
export function handleFormValidationError(
  validationError: { issues: Array<{ message: string }> },
  errorTitle: string,
  showAlert?: (title: string, message: string) => void,
): void {
  const firstError = validationError.issues[0]
  if (showAlert) {
    showAlert(errorTitle, firstError.message)
  } else {
    console.warn('handleFormValidationError: No alert function provided, consider using AlertModal')
  }
}