/**
 * Centralized logging utility with environment-based filtering
 * Prevents console.log in production while maintaining development debugging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogMessage {
  level: LogLevel
  component: string
  message: string
  data?: any
}

class Logger {
  private isDevelopment = __DEV__

  private formatMessage(level: LogLevel, component: string, message: string): string {
    const timestamp = new Date().toISOString().slice(11, 23)
    const levelEmoji = this.getLevelEmoji(level)
    return `${levelEmoji} [${timestamp}] [${component}] ${message}`
  }

  private getLevelEmoji(level: LogLevel): string {
    switch (level) {
      case 'debug': return '🔍'
      case 'info': return 'ℹ️'
      case 'warn': return '⚠️'
      case 'error': return '❌'
      default: return '📝'
    }
  }

  private shouldLog(level: LogLevel): boolean {
    // In production, only log warnings and errors
    if (!this.isDevelopment) {
      return level === 'warn' || level === 'error'
    }
    return true
  }

  private getConsoleMethod(level: LogLevel): (...args: any[]) => void {
    switch (level) {
      case 'debug':
      case 'info':
        return console.log
      case 'warn':
        return console.warn
      case 'error':
        return console.error
      default:
        return console.log
    }
  }

  private log(logMessage: LogMessage): void {
    if (!this.shouldLog(logMessage.level)) return

    const formattedMessage = this.formatMessage(
      logMessage.level,
      logMessage.component,
      logMessage.message
    )

    const consoleMethod = this.getConsoleMethod(logMessage.level)

    if (logMessage.data) {
      consoleMethod(formattedMessage, logMessage.data)
    } else {
      consoleMethod(formattedMessage)
    }
  }

  debug(component: string, message: string, data?: any): void {
    this.log({ level: 'debug', component, message, data })
  }

  info(component: string, message: string, data?: any): void {
    this.log({ level: 'info', component, message, data })
  }

  warn(component: string, message: string, data?: any): void {
    this.log({ level: 'warn', component, message, data })
  }

  error(component: string, message: string, data?: any): void {
    this.log({ level: 'error', component, message, data })
  }

  // Convenience method for Firebase auth logging (remove sensitive data)
  authInfo(component: string, user: any): void {
    if (!user) {
      this.info(component, 'User not authenticated')
      return
    }
    
    // Only log non-sensitive user info
    const safeUserInfo = {
      uid: user.uid,
      email: user.email ? '***@***.***' : 'No email', // Mask email for privacy
      isVerified: user.emailVerified
    }
    this.info(component, 'User authenticated', safeUserInfo)
  }
}

export const logger = new Logger()

// Legacy support - gradually replace console.log with logger
export const createComponentLogger = (componentName: string) => ({
  debug: (message: string, data?: any) => logger.debug(componentName, message, data),
  info: (message: string, data?: any) => logger.info(componentName, message, data),
  warn: (message: string, data?: any) => logger.warn(componentName, message, data),
  error: (message: string, data?: any) => logger.error(componentName, message, data),
  authInfo: (user: any) => logger.authInfo(componentName, user),
})