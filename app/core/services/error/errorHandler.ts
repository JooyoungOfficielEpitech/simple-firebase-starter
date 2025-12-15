/**
 * Centralized error handling and monitoring service
 */

// Define FirebaseError as a generic error type since RN Firebase doesn't export it
interface FirebaseError extends Error {
  code?: string
}

export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export interface ErrorDetails {
  error: Error | FirebaseError | string
  context?: string
  userId?: string
  metadata?: Record<string, any>
  severity?: ErrorSeverity
  timestamp?: Date
}

export interface ParsedError {
  message: string
  userFriendlyMessage: string
  code?: string
  severity: ErrorSeverity
  shouldRetry: boolean
  actionRequired?: string
}

/**
 * Main error handler class
 */
export class ErrorHandler {
  private static instance: ErrorHandler
  private errorQueue: ErrorDetails[] = []
  private isOnline: boolean = true

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  /**
   * Parse and categorize errors
   */
  parseError(errorDetails: ErrorDetails): ParsedError {
    const { error } = errorDetails
    let parsedError: ParsedError = {
      message: "",
      userFriendlyMessage: "알 수 없는 오류가 발생했습니다",
      severity: ErrorSeverity.MEDIUM,
      shouldRetry: false,
    }

    if (error && typeof error === 'object' && 'code' in error) {
      parsedError = this.parseFirebaseError(error)
    } else if (error instanceof Error) {
      parsedError = this.parseJavaScriptError(error)
    } else if (typeof error === "string") {
      parsedError = {
        message: error,
        userFriendlyMessage: error,
        severity: ErrorSeverity.LOW,
        shouldRetry: false,
      }
    }

    // Override severity if provided
    if (errorDetails.severity) {
      parsedError.severity = errorDetails.severity
    }

    return parsedError
  }

  /**
   * Parse Firebase-specific errors
   */
  private parseFirebaseError(error: any): ParsedError {
    const { code, message } = error

    switch (code) {
      // Authentication errors
      case "auth/user-not-found":
        return {
          message,
          userFriendlyMessage: "사용자를 찾을 수 없습니다",
          code,
          severity: ErrorSeverity.MEDIUM,
          shouldRetry: false,
          actionRequired: "계정을 다시 확인해주세요",
        }

      case "auth/wrong-password":
        return {
          message,
          userFriendlyMessage: "비밀번호가 올바르지 않습니다",
          code,
          severity: ErrorSeverity.MEDIUM,
          shouldRetry: false,
          actionRequired: "비밀번호를 다시 입력해주세요",
        }

      case "auth/email-already-in-use":
        return {
          message,
          userFriendlyMessage: "이미 사용 중인 이메일입니다",
          code,
          severity: ErrorSeverity.MEDIUM,
          shouldRetry: false,
          actionRequired: "다른 이메일을 사용해주세요",
        }

      case "auth/weak-password":
        return {
          message,
          userFriendlyMessage: "비밀번호가 너무 약합니다",
          code,
          severity: ErrorSeverity.MEDIUM,
          shouldRetry: false,
          actionRequired: "더 강한 비밀번호를 사용해주세요",
        }

      case "auth/network-request-failed":
        return {
          message,
          userFriendlyMessage: "네트워크 연결을 확인해주세요",
          code,
          severity: ErrorSeverity.HIGH,
          shouldRetry: true,
          actionRequired: "인터넷 연결을 확인하고 다시 시도해주세요",
        }

      // Firestore errors
      case "firestore/permission-denied":
        return {
          message,
          userFriendlyMessage: "접근 권한이 없습니다",
          code,
          severity: ErrorSeverity.HIGH,
          shouldRetry: false,
          actionRequired: "로그인 상태를 확인해주세요",
        }

      case "firestore/not-found":
        return {
          message,
          userFriendlyMessage: "요청한 데이터를 찾을 수 없습니다",
          code,
          severity: ErrorSeverity.MEDIUM,
          shouldRetry: false,
          actionRequired: "페이지를 새로고침해주세요",
        }

      case "firestore/unavailable":
        return {
          message,
          userFriendlyMessage: "서비스가 일시적으로 사용할 수 없습니다",
          code,
          severity: ErrorSeverity.HIGH,
          shouldRetry: true,
          actionRequired: "잠시 후 다시 시도해주세요",
        }

      case "firestore/deadline-exceeded":
        return {
          message,
          userFriendlyMessage: "요청 시간이 초과되었습니다",
          code,
          severity: ErrorSeverity.HIGH,
          shouldRetry: true,
          actionRequired: "네트워크 연결을 확인하고 다시 시도해주세요",
        }

      // Storage errors
      case "storage/object-not-found":
        return {
          message,
          userFriendlyMessage: "파일을 찾을 수 없습니다",
          code,
          severity: ErrorSeverity.MEDIUM,
          shouldRetry: false,
          actionRequired: "파일을 다시 업로드해주세요",
        }

      case "storage/quota-exceeded":
        return {
          message,
          userFriendlyMessage: "저장 공간이 부족합니다",
          code,
          severity: ErrorSeverity.HIGH,
          shouldRetry: false,
          actionRequired: "관리자에게 문의해주세요",
        }

      default:
        return {
          message,
          userFriendlyMessage: "서버 오류가 발생했습니다",
          code,
          severity: ErrorSeverity.MEDIUM,
          shouldRetry: true,
          actionRequired: "잠시 후 다시 시도해주세요",
        }
    }
  }

  /**
   * Parse JavaScript errors
   */
  private parseJavaScriptError(error: Error): ParsedError {
    const { name, message } = error

    switch (name) {
      case "TypeError":
        return {
          message,
          userFriendlyMessage: "데이터 처리 중 오류가 발생했습니다",
          severity: ErrorSeverity.MEDIUM,
          shouldRetry: true,
        }

      case "ReferenceError":
        return {
          message,
          userFriendlyMessage: "앱 오류가 발생했습니다",
          severity: ErrorSeverity.HIGH,
          shouldRetry: false,
          actionRequired: "앱을 다시 시작해주세요",
        }

      case "NetworkError":
        return {
          message,
          userFriendlyMessage: "네트워크 연결을 확인해주세요",
          severity: ErrorSeverity.HIGH,
          shouldRetry: true,
          actionRequired: "인터넷 연결을 확인하고 다시 시도해주세요",
        }

      default:
        return {
          message,
          userFriendlyMessage: "예상치 못한 오류가 발생했습니다",
          severity: ErrorSeverity.MEDIUM,
          shouldRetry: true,
          actionRequired: "페이지를 새로고침하거나 다시 시도해주세요",
        }
    }
  }

  /**
   * Handle error with automatic retry logic
   */
  async handleError(errorDetails: ErrorDetails): Promise<ParsedError> {
    const parsedError = this.parseError(errorDetails)
    
    // Add to error queue for offline handling
    this.addToQueue({
      ...errorDetails,
      severity: parsedError.severity,
      timestamp: new Date(),
    })

    // Log error (in production, send to monitoring service)
    this.logError(errorDetails, parsedError)

    // Process error queue if online
    if (this.isOnline) {
      await this.processErrorQueue()
    }

    return parsedError
  }

  /**
   * Add error to queue for batch processing
   */
  private addToQueue(errorDetails: ErrorDetails) {
    this.errorQueue.push(errorDetails)
    
    // Keep queue size manageable
    if (this.errorQueue.length > 100) {
      this.errorQueue = this.errorQueue.slice(-50)
    }
  }

  /**
   * Process error queue (send to monitoring service)
   */
  private async processErrorQueue() {
    if (this.errorQueue.length === 0) return

    try {
      // In a real app, send to monitoring service like Crashlytics, Sentry, etc.
      console.log("Processing error queue:", this.errorQueue.length, "errors")
      
      // Simulate sending errors to monitoring service
      // await this.sendToMonitoringService(this.errorQueue)
      
      // Clear queue after successful processing
      this.errorQueue = []
    } catch (error) {
      console.warn("Failed to process error queue:", error)
    }
  }

  /**
   * Log error for debugging
   */
  private logError(errorDetails: ErrorDetails, parsedError: ParsedError) {
    const logLevel = this.getLogLevel(parsedError.severity)
    const logData = {
      timestamp: new Date().toISOString(),
      severity: parsedError.severity,
      message: parsedError.message,
      userFriendlyMessage: parsedError.userFriendlyMessage,
      context: errorDetails.context,
      userId: errorDetails.userId,
      metadata: errorDetails.metadata,
      stack: errorDetails.error instanceof Error ? errorDetails.error.stack : undefined,
    }

    switch (logLevel) {
      case "error":
        console.error("Error:", logData)
        break
      case "warn":
        console.warn("Warning:", logData)
        break
      default:
        console.log("Info:", logData)
    }
  }

  /**
   * Get appropriate log level for error severity
   */
  private getLogLevel(severity: ErrorSeverity): "error" | "warn" | "log" {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return "error"
      case ErrorSeverity.MEDIUM:
        return "warn"
      default:
        return "log"
    }
  }

  /**
   * Set online status for queue processing
   */
  setOnlineStatus(isOnline: boolean) {
    this.isOnline = isOnline
    
    if (isOnline) {
      this.processErrorQueue()
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    const recentErrors = this.errorQueue.filter(
      error => error.timestamp && error.timestamp > last24Hours
    )

    const severityCount = recentErrors.reduce((acc, error) => {
      const severity = error.severity || ErrorSeverity.MEDIUM
      acc[severity] = (acc[severity] || 0) + 1
      return acc
    }, {} as Record<ErrorSeverity, number>)

    return {
      total: recentErrors.length,
      bySeverity: severityCount,
      queueSize: this.errorQueue.length,
    }
  }
}

// Singleton instance
export const errorHandler = ErrorHandler.getInstance()

// Convenience functions
export const handleError = (errorDetails: ErrorDetails) => 
  errorHandler.handleError(errorDetails)

export const parseError = (errorDetails: ErrorDetails) => 
  errorHandler.parseError(errorDetails)