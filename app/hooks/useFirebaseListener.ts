import { useEffect, useRef, useCallback } from 'react'

/**
 * Firebase 리스너의 안전한 클린업을 보장하는 커스텀 훅
 * 메모리 누수 방지와 컴포넌트 언마운트 시 안전한 정리를 제공
 */
export function useFirebaseListener() {
  const unsubscribersRef = useRef<Array<() => void>>([])
  const isMountedRef = useRef(true)

  /**
   * Firebase 리스너를 등록하고 자동 클린업을 보장
   */
  const addListener = useCallback((unsubscriber: () => void) => {
    if (isMountedRef.current) {
      unsubscribersRef.current.push(unsubscriber)
    } else {
      // 컴포넌트가 이미 언마운트된 경우 즉시 정리
      unsubscriber()
    }
  }, [])

  /**
   * 특정 리스너를 수동으로 제거
   */
  const removeListener = useCallback((unsubscriber: () => void) => {
    const index = unsubscribersRef.current.indexOf(unsubscriber)
    if (index > -1) {
      unsubscribersRef.current.splice(index, 1)
      unsubscriber()
    }
  }, [])

  /**
   * 모든 리스너를 안전하게 정리
   */
  const cleanup = useCallback(() => {
    console.log(`🧹 [useFirebaseListener] ${unsubscribersRef.current.length}개 리스너 정리 시작`)
    
    unsubscribersRef.current.forEach((unsubscribe, index) => {
      try {
        unsubscribe()
        console.log(`✅ [useFirebaseListener] 리스너 ${index + 1} 정리 완료`)
      } catch (error) {
        console.error(`❌ [useFirebaseListener] 리스너 ${index + 1} 정리 실패:`, error)
      }
    })
    
    unsubscribersRef.current = []
    console.log(`✅ [useFirebaseListener] 모든 리스너 정리 완료`)
  }, [])

  // 컴포넌트 언마운트 시 자동 정리
  useEffect(() => {
    isMountedRef.current = true
    
    return () => {
      isMountedRef.current = false
      cleanup()
    }
  }, [cleanup])

  return {
    addListener,
    removeListener,
    cleanup,
    listenerCount: unsubscribersRef.current.length
  }
}

/**
 * 단일 Firebase 리스너를 위한 간단한 훅
 */
export function useSingleFirebaseListener() {
  const unsubscribeRef = useRef<(() => void) | null>(null)
  const isMountedRef = useRef(true)

  const setListener = useCallback((unsubscriber: () => void) => {
    // 기존 리스너가 있으면 먼저 정리
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
    }

    if (isMountedRef.current) {
      unsubscribeRef.current = unsubscriber
    } else {
      // 컴포넌트가 이미 언마운트된 경우 즉시 정리
      unsubscriber()
    }
  }, [])

  const cleanup = useCallback(() => {
    if (unsubscribeRef.current) {
      try {
        unsubscribeRef.current()
        console.log('✅ [useSingleFirebaseListener] 리스너 정리 완료')
      } catch (error) {
        console.error('❌ [useSingleFirebaseListener] 리스너 정리 실패:', error)
      }
      unsubscribeRef.current = null
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    
    return () => {
      isMountedRef.current = false
      cleanup()
    }
  }, [cleanup])

  return {
    setListener,
    cleanup,
    hasListener: !!unsubscribeRef.current
  }
}

/**
 * 타임아웃을 포함한 Firebase 리스너 훅
 * 긴 시간 동안 응답이 없는 리스너를 자동으로 정리
 */
export function useFirebaseListenerWithTimeout(timeoutMs: number = 30000) {
  const { addListener, removeListener, cleanup, listenerCount } = useFirebaseListener()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const addListenerWithTimeout = useCallback((
    unsubscriber: () => void,
    onTimeout?: () => void
  ) => {
    addListener(unsubscriber)

    // 기존 타임아웃 정리
    if (timeoutRef.current) {
      globalThis.clearTimeout(timeoutRef.current)
    }

    // 새 타임아웃 설정
    timeoutRef.current = setTimeout(() => {
      console.warn(`⚠️ [useFirebaseListenerWithTimeout] ${timeoutMs}ms 타임아웃 - 리스너 정리`)
      removeListener(unsubscriber)
      onTimeout?.()
    }, timeoutMs)
  }, [addListener, removeListener, timeoutMs])

  const clearListenerTimeout = useCallback(() => {
    if (timeoutRef.current) {
      globalThis.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      clearListenerTimeout()
    }
  }, [clearListenerTimeout])

  return {
    addListener: addListenerWithTimeout,
    removeListener,
    cleanup,
    clearTimeout,
    listenerCount
  }
}