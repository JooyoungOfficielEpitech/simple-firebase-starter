export interface LogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'warn' | 'error' | 'success'
  category: string
  message: string
  data?: any
}

class SimpleEventEmitter {
  private listeners: { [event: string]: Function[] } = {}

  emit(event: string, ...args: any[]) {
    const eventListeners = this.listeners[event]
    if (eventListeners) {
      eventListeners.forEach(listener => listener(...args))
    }
  }

  on(event: string, listener: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(listener)
  }

  off(event: string, listener: Function) {
    const eventListeners = this.listeners[event]
    if (eventListeners) {
      const index = eventListeners.indexOf(listener)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }
}

class InAppLogger extends SimpleEventEmitter {
  private logs: LogEntry[] = []
  private maxLogs = 100

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  private addLog(level: LogEntry['level'], category: string, message: string, data?: any) {
    const logEntry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      level,
      category,
      message,
      data
    }

    this.logs.unshift(logEntry) // 최신 로그를 맨 위에
    
    // 최대 로그 수 제한
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    // 이벤트 발생으로 UI 업데이트
    this.emit('newLog', logEntry)

    // 콘솔에도 출력 (개발 환경)
    if (__DEV__) {
      const prefix = `[${category}]`
      switch (level) {
        case 'info':
          console.log(prefix, message, data || '')
          break
        case 'warn':
          console.warn(prefix, message, data || '')
          break
        case 'error':
          console.error(prefix, message, data || '')
          break
        case 'success':
          console.log(`✅ ${prefix}`, message, data || '')
          break
      }
    }
  }

  info(category: string, message: string, data?: any) {
    this.addLog('info', category, message, data)
  }

  warn(category: string, message: string, data?: any) {
    this.addLog('warn', category, message, data)
  }

  error(category: string, message: string, data?: any) {
    this.addLog('error', category, message, data)
  }

  success(category: string, message: string, data?: any) {
    this.addLog('success', category, message, data)
  }

  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  getLogsByCategory(category: string): LogEntry[] {
    return this.logs.filter(log => log.category === category)
  }

  clearLogs() {
    this.logs = []
    this.emit('logsCleared')
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}

export const inAppLogger = new InAppLogger()
export default inAppLogger