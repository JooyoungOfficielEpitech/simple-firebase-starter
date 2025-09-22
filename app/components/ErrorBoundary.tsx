/**
 * Error Boundary component with comprehensive error handling and recovery
 */

import React, { Component, ErrorInfo, ReactNode } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { errorHandler, ErrorSeverity } from "../services/error/errorHandler"
import { useTheme } from "../theme/context"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  context?: string
  enableRecovery?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
}

class ErrorBoundaryClass extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null
  private maxRetries = 3
  private retryDelay = 1000

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })

    // Handle error through error handler
    errorHandler.handleError({
      error,
      context: this.props.context || "ErrorBoundary",
      severity: ErrorSeverity.HIGH,
      metadata: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        retryCount: this.state.retryCount,
      },
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  handleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      return
    }

    const newRetryCount = this.state.retryCount + 1
    
    // Use exponential backoff for retries
    const delay = this.retryDelay * Math.pow(2, newRetryCount - 1)
    
    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: newRetryCount,
      })
    }, delay)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <ErrorFallbackUI
          error={this.state.error}
          onRetry={this.handleRetry}
          onReset={this.handleReset}
          canRetry={this.state.retryCount < this.maxRetries && this.props.enableRecovery !== false}
          retryCount={this.state.retryCount}
        />
      )
    }

    return this.props.children
  }
}

interface ErrorFallbackUIProps {
  error: Error | null
  onRetry: () => void
  onReset: () => void
  canRetry: boolean
  retryCount: number
}

function ErrorFallbackUI({ error, onRetry, onReset, canRetry, retryCount }: ErrorFallbackUIProps) {
  const theme = useTheme()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: theme.colors.surface,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.error,
      textAlign: "center",
      marginBottom: 16,
    },
    message: {
      fontSize: 16,
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: 24,
      lineHeight: 24,
    },
    errorDetails: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginBottom: 24,
      fontFamily: "monospace",
      backgroundColor: theme.colors.surfaceVariant,
      padding: 12,
      borderRadius: 8,
    },
    buttonContainer: {
      flexDirection: "row",
      gap: 12,
    },
    button: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      minWidth: 100,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
    },
    secondaryButton: {
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    disabledButton: {
      backgroundColor: theme.colors.surfaceDisabled,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "600",
      textAlign: "center",
    },
    primaryButtonText: {
      color: theme.colors.onPrimary,
    },
    secondaryButtonText: {
      color: theme.colors.onSurface,
    },
    disabledButtonText: {
      color: theme.colors.onSurfaceDisabled,
    },
    retryInfo: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginTop: 8,
    },
  })

  const getErrorMessage = () => {
    if (error?.name === "ChunkLoadError") {
      return "앱 업데이트가 필요합니다. 페이지를 새로고침해주세요."
    }
    if (error?.message?.includes("Network")) {
      return "네트워크 연결을 확인하고 다시 시도해주세요."
    }
    return "예상치 못한 오류가 발생했습니다."
  }

  const getErrorTitle = () => {
    if (error?.name === "ChunkLoadError") {
      return "업데이트 필요"
    }
    return "오류 발생"
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{getErrorTitle()}</Text>
      
      <Text style={styles.message}>
        {getErrorMessage()}
      </Text>

      {__DEV__ && error && (
        <Text style={styles.errorDetails} numberOfLines={10}>
          {error.name}: {error.message}
          {error.stack && `\n\n${error.stack.substring(0, 200)}...`}
        </Text>
      )}

      <View style={styles.buttonContainer}>
        {canRetry && (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={onRetry}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              다시 시도
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={onReset}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            새로고침
          </Text>
        </TouchableOpacity>
      </View>

      {retryCount > 0 && (
        <Text style={styles.retryInfo}>
          재시도 {retryCount}/3
        </Text>
      )}
    </View>
  )
}

// Functional wrapper component for easier usage
export function ErrorBoundary(props: Props) {
  return <ErrorBoundaryClass {...props} />
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

export default ErrorBoundary