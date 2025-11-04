import { useState, useEffect, useRef } from 'react'
import { AppState, AppStateStatus } from 'react-native'

interface PerformanceStats {
  memoryUsage: number
  jsHeapSize: number
  appStateChanges: number
  lastCrash: string | null
  freezeCount: number
  backgroundTime: number
}

export const usePerformanceMonitoring = (addLog: (message: string) => void) => {
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats>({
    memoryUsage: 0,
    jsHeapSize: 0,
    appStateChanges: 0,
    lastCrash: null,
    freezeCount: 0,
    backgroundTime: 0,
  })
  const [lastAppState, setLastAppState] = useState(AppState.currentState)
  const lastHeartbeatRef = useRef(Date.now())

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      addLog(`📱 AppState: ${lastAppState} → ${nextAppState}`)
      
      if (lastAppState === 'background' && nextAppState === 'active') {
        setPerformanceStats(prev => ({
          ...prev,
          backgroundTime: prev.backgroundTime + 1
        }))
        addLog(`⏰ 백그라운드에서 복귀 (총 ${performanceStats.backgroundTime + 1}회)`)
      }
      
      setLastAppState(nextAppState)
      setPerformanceStats(prev => ({
        ...prev,
        appStateChanges: prev.appStateChanges + 1
      }))
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)

    const memoryInterval = setInterval(() => {
      try {
        const now = performance.now()
        const performanceMemory = (global.performance as any)?.memory
        setPerformanceStats(prev => ({
          ...prev,
          memoryUsage: Math.round(now / 1000),
          jsHeapSize: performanceMemory?.usedJSHeapSize || 0
        }))
      } catch (error: any) {
        addLog(`❌ 메모리 모니터링 오류: ${error.message}`)
      }
    }, 5000)

    const freezeInterval = setInterval(() => {
      const now = Date.now()
      const timeDiff = now - lastHeartbeatRef.current
      
      if (timeDiff > 35000) {
        setPerformanceStats(prev => ({
          ...prev,
          freezeCount: prev.freezeCount + 1
        }))
        addLog(`🚨 UI Freeze 감지! ${Math.round(timeDiff/1000)}초`)
      }
      
      lastHeartbeatRef.current = now
    }, 30000)

    const errorUtils = (global as any).ErrorUtils
    const originalErrorHandler = errorUtils?.getGlobalHandler?.()
    errorUtils?.setGlobalHandler?.((error: Error, isFatal: boolean) => {
      addLog(`💥 Global Error: ${error.message} (Fatal: ${isFatal})`)
      setPerformanceStats(prev => ({
        ...prev,
        lastCrash: new Date().toISOString()
      }))
      
      if (originalErrorHandler) {
        originalErrorHandler(error, isFatal)
      }
    })

    return () => {
      subscription?.remove()
      clearInterval(memoryInterval)
      clearInterval(freezeInterval)
      if (originalErrorHandler) {
        const errorUtils = (global as any).ErrorUtils
        errorUtils?.setGlobalHandler?.(originalErrorHandler)
      }
    }
  }, [lastAppState, performanceStats.backgroundTime])

  const resetStats = () => {
    setPerformanceStats({
      memoryUsage: 0,
      jsHeapSize: 0,
      appStateChanges: 0,
      lastCrash: null,
      freezeCount: 0,
      backgroundTime: 0,
    })
  }

  return { performanceStats, lastAppState, resetStats }
}
