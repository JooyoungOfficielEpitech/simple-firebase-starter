/**
 * Firebase Error Handling Utility
 *
 * Provides:
 * - Network error auto-retry with exponential backoff
 * - User-friendly Korean error messages
 * - Standardized error codes and recovery strategies
 */

import { logger } from '@/utils/logger'

export interface FirebaseError extends Error {
  code?: string
}

export interface RetryConfig {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  shouldRetry?: (error: FirebaseError) => boolean
}

export interface FirebaseErrorInfo {
  userMessage: string
  shouldRetry: boolean
  actionRequired?: string
}

/**
 * Firebase 에러 코드별 한국어 메시지 매핑
 */
const ERROR_MESSAGES: Record<string, FirebaseErrorInfo> = {
  // Firestore 네트워크 에러 (재시도 가능)
  'firestore/unavailable': {
    userMessage: '서비스가 일시적으로 사용할 수 없습니다',
    shouldRetry: true,
    actionRequired: '잠시 후 다시 시도해주세요',
  },
  'firestore/deadline-exceeded': {
    userMessage: '요청 시간이 초과되었습니다',
    shouldRetry: true,
    actionRequired: '네트워크 연결을 확인하고 다시 시도해주세요',
  },
  'firestore/cancelled': {
    userMessage: '요청이 취소되었습니다',
    shouldRetry: true,
    actionRequired: '다시 시도해주세요',
  },
  'firestore/aborted': {
    userMessage: '작업이 중단되었습니다',
    shouldRetry: true,
    actionRequired: '다시 시도해주세요',
  },

  // Firestore 권한 에러 (재시도 불가)
  'firestore/permission-denied': {
    userMessage: '접근 권한이 없습니다',
    shouldRetry: false,
    actionRequired: '로그인 상태를 확인해주세요',
  },
  'firestore/unauthenticated': {
    userMessage: '인증이 필요합니다',
    shouldRetry: false,
    actionRequired: '다시 로그인해주세요',
  },

  // Firestore 데이터 에러 (재시도 불가)
  'firestore/not-found': {
    userMessage: '요청한 데이터를 찾을 수 없습니다',
    shouldRetry: false,
    actionRequired: '페이지를 새로고침해주세요',
  },
  'firestore/already-exists': {
    userMessage: '이미 존재하는 데이터입니다',
    shouldRetry: false,
    actionRequired: '다른 이름을 사용해주세요',
  },
  'firestore/invalid-argument': {
    userMessage: '잘못된 요청입니다',
    shouldRetry: false,
    actionRequired: '입력 내용을 확인해주세요',
  },

  // Storage 에러
  'storage/object-not-found': {
    userMessage: '파일을 찾을 수 없습니다',
    shouldRetry: false,
    actionRequired: '파일을 다시 업로드해주세요',
  },
  'storage/quota-exceeded': {
    userMessage: '저장 공간이 부족합니다',
    shouldRetry: false,
    actionRequired: '관리자에게 문의해주세요',
  },
  'storage/unauthorized': {
    userMessage: '파일 접근 권한이 없습니다',
    shouldRetry: false,
    actionRequired: '로그인 상태를 확인해주세요',
  },
  'storage/retry-limit-exceeded': {
    userMessage: '파일 업로드 재시도 횟수를 초과했습니다',
    shouldRetry: false,
    actionRequired: '네트워크 연결을 확인하고 다시 시도해주세요',
  },

  // Auth 에러
  'auth/network-request-failed': {
    userMessage: '네트워크 연결을 확인해주세요',
    shouldRetry: true,
    actionRequired: '인터넷 연결을 확인하고 다시 시도해주세요',
  },
  'auth/too-many-requests': {
    userMessage: '너무 많은 요청이 발생했습니다',
    shouldRetry: true,
    actionRequired: '잠시 후 다시 시도해주세요',
  },
}

/**
 * 네트워크 에러 판별
 */
export function isNetworkError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const err = error as FirebaseError
  const errorCode = err.code || ''
  const errorMessage = err.message?.toLowerCase() || ''

  // 에러 코드로 판별
  const networkErrorCodes = [
    'firestore/unavailable',
    'firestore/deadline-exceeded',
    'firestore/cancelled',
    'firestore/aborted',
    'auth/network-request-failed',
  ]

  if (networkErrorCodes.includes(errorCode)) {
    return true
  }

  // 에러 메시지로 판별
  const networkKeywords = ['network', 'timeout', 'connection', 'offline', 'unavailable']
  return networkKeywords.some(keyword => errorMessage.includes(keyword))
}

/**
 * 사용자 친화적 에러 메시지 가져오기
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return '알 수 없는 오류가 발생했습니다'
  }

  const err = error as FirebaseError
  const errorCode = err.code || ''

  // 에러 코드에 맞는 메시지 반환
  const errorInfo = ERROR_MESSAGES[errorCode]
  if (errorInfo) {
    return errorInfo.actionRequired
      ? `${errorInfo.userMessage}. ${errorInfo.actionRequired}`
      : errorInfo.userMessage
  }

  // 기본 메시지
  return err.message || '서버 오류가 발생했습니다'
}

/**
 * 에러 재시도 가능 여부 판별
 */
export function shouldRetryError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const err = error as FirebaseError
  const errorCode = err.code || ''

  // 에러 코드로 판별
  const errorInfo = ERROR_MESSAGES[errorCode]
  if (errorInfo) {
    return errorInfo.shouldRetry
  }

  // 네트워크 에러는 기본적으로 재시도
  return isNetworkError(error)
}

/**
 * 지수 백오프 재시도 래퍼
 *
 * @param operation - 실행할 비동기 작업
 * @param operationName - 작업 이름 (로깅용)
 * @param config - 재시도 설정
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  config: RetryConfig = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    shouldRetry = shouldRetryError,
  } = config

  let lastError: unknown

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      // 재시도 가능 여부 확인
      if (!shouldRetry(error) || attempt === maxRetries - 1) {
        logger.error('Firebase', `❌ ${operationName} 실패`, { error })
        throw error
      }

      // 지수 백오프 계산
      const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay)

      logger.warn(
        'Firebase',
        `🔄 ${operationName} - 네트워크 에러, ${delay}ms 후 재시도 (${attempt + 1}/${maxRetries})`
      )

      // 대기
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

/**
 * FCM 토큰 만료 감지
 */
export function isTokenExpiredError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const err = error as FirebaseError
  const errorCode = err.code || ''
  const errorMessage = err.message?.toLowerCase() || ''

  // FCM 토큰 만료 관련 에러 코드
  const tokenExpiredCodes = [
    'messaging/registration-token-not-registered',
    'messaging/invalid-registration-token',
  ]

  if (tokenExpiredCodes.includes(errorCode)) {
    return true
  }

  // 에러 메시지로 판별
  const tokenExpiredKeywords = ['token', 'expired', 'invalid', 'not-registered']
  return tokenExpiredKeywords.every(keyword => errorMessage.includes(keyword))
}

/**
 * 에러 로깅 헬퍼
 */
export function logFirebaseError(
  context: string,
  error: unknown,
  metadata?: Record<string, any>
): void {
  const userMessage = getUserFriendlyMessage(error)
  const shouldRetry = shouldRetryError(error)
  const isNetwork = isNetworkError(error)

  logger.error('Firebase', `❌ ${context}`, {
    error,
    userMessage,
    shouldRetry,
    isNetwork,
    ...metadata,
  })
}
