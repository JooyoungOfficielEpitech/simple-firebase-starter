/**
 * Network Retry Service
 * 네트워크 재시도 서비스 - 지수 백오프 및 스마트 재시도 로직
 */

// ==========================================
// Types
// ==========================================

export interface RetryConfig {
  /** Maximum number of retries */
  maxRetries: number;
  /** Initial delay in milliseconds */
  initialDelay: number;
  /** Maximum delay in milliseconds */
  maxDelay: number;
  /** Backoff multiplier */
  backoffMultiplier: number;
  /** Add random jitter to prevent thundering herd */
  jitter: boolean;
  /** Retry only on specific error codes */
  retryableErrors?: string[];
  /** Timeout per attempt in milliseconds */
  timeout?: number;
}

export interface RetryState {
  attemptNumber: number;
  lastError?: Error;
  totalElapsedTime: number;
  nextDelay: number;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
}

type RetryCallback = (state: RetryState) => void;

// ==========================================
// Constants
// ==========================================

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
};

/**
 * Common retryable error codes
 * 재시도 가능한 일반적인 에러 코드
 */
export const RETRYABLE_ERRORS = [
  "NETWORK_ERROR",
  "TIMEOUT",
  "SERVICE_UNAVAILABLE",
  "TOO_MANY_REQUESTS",
  "INTERNAL_SERVER_ERROR",
  "GATEWAY_TIMEOUT",
  "BAD_GATEWAY",
  "unavailable",
  "deadline-exceeded",
  "resource-exhausted",
  "aborted",
  "unknown",
];

/**
 * Non-retryable error codes
 * 재시도 불가능한 에러 코드
 */
export const NON_RETRYABLE_ERRORS = [
  "INVALID_ARGUMENT",
  "NOT_FOUND",
  "ALREADY_EXISTS",
  "PERMISSION_DENIED",
  "UNAUTHENTICATED",
  "CANCELLED",
  "invalid-argument",
  "not-found",
  "already-exists",
  "permission-denied",
  "unauthenticated",
  "cancelled",
];

// ==========================================
// Retry Service
// ==========================================

class RetryService {
  private defaultConfig: RetryConfig = DEFAULT_CONFIG;

  /**
   * Set default configuration
   * 기본 설정 변경
   */
  setDefaultConfig(config: Partial<RetryConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }

  /**
   * Execute an async function with retry logic
   * 재시도 로직으로 비동기 함수 실행
   */
  async withRetry<T>(
    fn: () => Promise<T>,
    config?: Partial<RetryConfig>,
    onRetry?: RetryCallback,
  ): Promise<RetryResult<T>> {
    const finalConfig = { ...this.defaultConfig, ...config };
    let attemptNumber = 0;
    let lastError: Error | undefined;
    const startTime = Date.now();

    while (attemptNumber <= finalConfig.maxRetries) {
      attemptNumber++;

      try {
        // Execute with optional timeout
        const data = finalConfig.timeout
          ? await this.withTimeout(fn(), finalConfig.timeout)
          : await fn();

        return {
          success: true,
          data,
          attempts: attemptNumber,
          totalTime: Date.now() - startTime,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if error is retryable
        if (!this.isRetryable(lastError, finalConfig)) {
          console.log(
            `[RetryService] Non-retryable error: ${lastError.message}`,
          );
          break;
        }

        // Check if we have more retries
        if (attemptNumber > finalConfig.maxRetries) {
          console.log(
            `[RetryService] Max retries (${finalConfig.maxRetries}) exceeded`,
          );
          break;
        }

        // Calculate delay for next attempt
        const delay = this.calculateDelay(attemptNumber, finalConfig);

        console.log(
          `[RetryService] Attempt ${attemptNumber}/${finalConfig.maxRetries + 1} failed, retrying in ${delay}ms`,
        );

        // Notify callback
        if (onRetry) {
          onRetry({
            attemptNumber,
            lastError,
            totalElapsedTime: Date.now() - startTime,
            nextDelay: delay,
          });
        }

        // Wait before next attempt
        await this.delay(delay);
      }
    }

    return {
      success: false,
      error: lastError,
      attempts: attemptNumber,
      totalTime: Date.now() - startTime,
    };
  }

  /**
   * Check if an error is retryable
   * 에러가 재시도 가능한지 확인
   */
  isRetryable(error: Error, config?: Partial<RetryConfig>): boolean {
    const finalConfig = { ...this.defaultConfig, ...config };
    const errorCode = this.extractErrorCode(error);

    // Check non-retryable errors first
    if (NON_RETRYABLE_ERRORS.includes(errorCode)) {
      return false;
    }

    // If specific retryable errors are configured, use them
    if (finalConfig.retryableErrors?.length) {
      return finalConfig.retryableErrors.includes(errorCode);
    }

    // Default to checking against known retryable errors
    return RETRYABLE_ERRORS.includes(errorCode);
  }

  /**
   * Calculate delay for next retry attempt using exponential backoff
   * 지수 백오프를 사용하여 다음 재시도 대기 시간 계산
   */
  calculateDelay(attemptNumber: number, config?: Partial<RetryConfig>): number {
    const finalConfig = { ...this.defaultConfig, ...config };

    // Exponential backoff: initialDelay * (multiplier ^ (attempt - 1))
    let delay =
      finalConfig.initialDelay *
      Math.pow(finalConfig.backoffMultiplier, attemptNumber - 1);

    // Cap at max delay
    delay = Math.min(delay, finalConfig.maxDelay);

    // Add jitter (±25% randomization)
    if (finalConfig.jitter) {
      const jitterRange = delay * 0.25;
      delay = delay + (Math.random() * 2 - 1) * jitterRange;
    }

    return Math.round(delay);
  }

  /**
   * Execute a function with timeout
   * 타임아웃이 있는 함수 실행
   */
  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout>;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("TIMEOUT"));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([promise, timeoutPromise]);
      clearTimeout(timeoutId!);
      return result;
    } catch (error) {
      clearTimeout(timeoutId!);
      throw error;
    }
  }

  /**
   * Extract error code from various error formats
   * 다양한 에러 형식에서 에러 코드 추출
   */
  private extractErrorCode(error: Error): string {
    // Firebase error format
    const firebaseMatch = error.message.match(/\[([^\]]+)\]/);
    if (firebaseMatch) {
      return firebaseMatch[1];
    }

    // Check for code property
    const errorWithCode = error as Error & { code?: string };
    if (errorWithCode.code) {
      return errorWithCode.code;
    }

    // Check common error message patterns
    const message = error.message.toLowerCase();

    if (message.includes("network") || message.includes("fetch")) {
      return "NETWORK_ERROR";
    }

    if (message.includes("timeout")) {
      return "TIMEOUT";
    }

    if (message.includes("unavailable") || message.includes("503")) {
      return "SERVICE_UNAVAILABLE";
    }

    if (message.includes("rate limit") || message.includes("429")) {
      return "TOO_MANY_REQUESTS";
    }

    return "UNKNOWN_ERROR";
  }

  /**
   * Delay helper function
   * 지연 헬퍼 함수
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const retryService = new RetryService();

// ==========================================
// Utility Functions
// ==========================================

/**
 * Convenience wrapper for retry with default settings
 * 기본 설정으로 재시도하는 편의 래퍼
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config?: Partial<RetryConfig>,
): Promise<T> {
  const result = await retryService.withRetry(fn, config);

  if (!result.success) {
    throw result.error || new Error("Operation failed after retries");
  }

  return result.data as T;
}

/**
 * Create a retry wrapper for a specific function
 * 특정 함수에 대한 재시도 래퍼 생성
 */
export function createRetryWrapper<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  config?: Partial<RetryConfig>,
): T {
  return (async (...args: Parameters<T>) => {
    return withRetry(() => fn(...args), config);
  }) as T;
}
