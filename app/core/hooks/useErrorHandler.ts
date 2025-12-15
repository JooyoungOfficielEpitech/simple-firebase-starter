/**
 * React hook for error handling with user-friendly messages and retry logic
 */

import { useState, useCallback } from "react"
import { errorHandler, ErrorDetails, ParsedError, ErrorSeverity } from "../services/error/errorHandler"

export interface UseErrorHandlerOptions {
  context?: string
  defaultRetryDelay?: number
  maxRetries?: number
  onError?: (error: ParsedError) => void
  onRetry?: (attempt: number) => void
}

export interface UseErrorHandlerReturn {
  error: ParsedError | null
  isRetrying: boolean
  retryCount: number
  handleError: (error: Error | string, metadata?: Record<string, any>) => Promise<void>
  clearError: () => void
  retry: () => Promise<void>
  canRetry: boolean
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}): UseErrorHandlerReturn {
  const {
    context = "Unknown",
    defaultRetryDelay = 1000,
    maxRetries = 3,
    onError,
    onRetry,
  } = options

  const [error, setError] = useState<ParsedError | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [lastErrorDetails, setLastErrorDetails] = useState<ErrorDetails | null>(null)

  const handleError = useCallback(async (
    errorInput: Error | string,
    metadata?: Record<string, any>
  ) => {
    const errorDetails: ErrorDetails = {
      error: errorInput,
      context,
      metadata,
      timestamp: new Date(),
    }

    setLastErrorDetails(errorDetails)
    
    try {
      const parsedError = await errorHandler.handleError(errorDetails)
      setError(parsedError)
      onError?.(parsedError)
    } catch (handlingError) {
      // Fallback if error handler itself fails
      const fallbackError: ParsedError = {
        message: "Error handler failed",
        userFriendlyMessage: "시스템 오류가 발생했습니다",
        severity: ErrorSeverity.HIGH,
        shouldRetry: false,
      }
      setError(fallbackError)
      onError?.(fallbackError)
    }
  }, [context, onError])

  const clearError = useCallback(() => {
    setError(null)
    setRetryCount(0)
    setLastErrorDetails(null)
    setIsRetrying(false)
  }, [])

  const retry = useCallback(async () => {
    if (!error?.shouldRetry || retryCount >= maxRetries || !lastErrorDetails) {
      return
    }

    setIsRetrying(true)
    const currentAttempt = retryCount + 1
    
    try {
      onRetry?.(currentAttempt)
      
      // Exponential backoff delay
      const delay = defaultRetryDelay * Math.pow(2, retryCount)
      await new Promise(resolve => setTimeout(resolve, delay))
      
      setRetryCount(currentAttempt)
      
      // Re-handle the original error to check if it's resolved
      const parsedError = await errorHandler.handleError(lastErrorDetails)
      
      // If it's the same error type, keep it; otherwise it might be resolved
      if (parsedError.code === error.code || parsedError.message === error.message) {
        setError(parsedError)
      } else {
        // Error might be resolved
        clearError()
      }
    } catch (retryError) {
      // Handle retry failure
      await handleError(retryError as Error, { 
        ...lastErrorDetails.metadata,
        retryAttempt: currentAttempt,
        originalError: lastErrorDetails.error,
      })
    } finally {
      setIsRetrying(false)
    }
  }, [error, retryCount, maxRetries, lastErrorDetails, defaultRetryDelay, onRetry, handleError, clearError])

  const canRetry = Boolean(
    error?.shouldRetry && 
    retryCount < maxRetries && 
    !isRetrying
  )

  return {
    error,
    isRetrying,
    retryCount,
    handleError,
    clearError,
    retry,
    canRetry,
  }
}

/**
 * Hook for handling async operations with automatic error handling
 */
export function useAsyncOperation<T = any>(
  operation: () => Promise<T>,
  options: UseErrorHandlerOptions & {
    autoRetry?: boolean
    loadingDelay?: number
  } = {}
) {
  const { autoRetry = false, loadingDelay = 0, ...errorOptions } = options
  
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<T | null>(null)
  
  const errorHandler = useErrorHandler(errorOptions)

  const execute = useCallback(async (): Promise<T | null> => {
    setIsLoading(true)
    
    // Optional loading delay for better UX
    if (loadingDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, loadingDelay))
    }

    try {
      const result = await operation()
      setData(result)
      errorHandler.clearError()
      return result
    } catch (error) {
      await errorHandler.handleError(error as Error)
      
      // Auto retry if enabled and error allows it
      if (autoRetry && errorHandler.canRetry) {
        setTimeout(() => {
          errorHandler.retry()
        }, 1000)
      }
      
      return null
    } finally {
      setIsLoading(false)
    }
  }, [operation, loadingDelay, autoRetry, errorHandler])

  const retry = useCallback(async () => {
    if (errorHandler.canRetry) {
      return await execute()
    }
    return await errorHandler.retry()
  }, [execute, errorHandler])

  return {
    data,
    isLoading,
    execute,
    retry,
    canRetry: errorHandler.canRetry,
    ...errorHandler,
  }
}