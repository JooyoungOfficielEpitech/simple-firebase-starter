/**
 * Firebase 리스너 메모리 누수 방지 유틸리티
 * 전역적인 리스너 관리와 안전한 정리를 제공
 */

interface ListenerInfo {
  id: string
  unsubscribe: () => void
  createdAt: Date
  component?: string
  description?: string
}

class FirebaseCleanupManager {
  private listeners: Map<string, ListenerInfo> = new Map()
  private cleanupCallbacks: Array<() => void> = []

  /**
   * 새로운 Firebase 리스너 등록
   */
  registerListener(
    id: string, 
    unsubscribe: () => void, 
    options: { component?: string; description?: string } = {}
  ): void {
    // 기존 리스너가 있으면 먼저 정리
    this.unregisterListener(id)

    const listenerInfo: ListenerInfo = {
      id,
      unsubscribe,
      createdAt: new Date(),
      component: options.component,
      description: options.description
    }

    this.listeners.set(id, listenerInfo)
    
    console.log(`📝 [FirebaseCleanup] 리스너 등록: ${id}`, {
      component: options.component,
      description: options.description,
      totalListeners: this.listeners.size
    })
  }

  /**
   * 특정 리스너 해제
   */
  unregisterListener(id: string): boolean {
    const listener = this.listeners.get(id)
    if (listener) {
      try {
        listener.unsubscribe()
        this.listeners.delete(id)
        
        console.log(`🗑️ [FirebaseCleanup] 리스너 해제: ${id}`, {
          component: listener.component,
          duration: Date.now() - listener.createdAt.getTime()
        })
        
        return true
      } catch (error) {
        console.error(`❌ [FirebaseCleanup] 리스너 해제 실패: ${id}`, error)
        this.listeners.delete(id) // 실패해도 맵에서는 제거
        return false
      }
    }
    return false
  }

  /**
   * 컴포넌트별 리스너 정리
   */
  cleanupByComponent(componentName: string): number {
    let cleanedCount = 0
    
    for (const [id, listener] of this.listeners.entries()) {
      if (listener.component === componentName) {
        if (this.unregisterListener(id)) {
          cleanedCount++
        }
      }
    }
    
    console.log(`🧹 [FirebaseCleanup] ${componentName} 컴포넌트 리스너 ${cleanedCount}개 정리`)
    return cleanedCount
  }

  /**
   * 오래된 리스너 정리 (기본 1시간)
   */
  cleanupOldListeners(maxAgeMs: number = 60 * 60 * 1000): number {
    const now = Date.now()
    let cleanedCount = 0
    
    for (const [id, listener] of this.listeners.entries()) {
      const age = now - listener.createdAt.getTime()
      if (age > maxAgeMs) {
        if (this.unregisterListener(id)) {
          cleanedCount++
        }
      }
    }
    
    console.log(`🧹 [FirebaseCleanup] 오래된 리스너 ${cleanedCount}개 정리`)
    return cleanedCount
  }

  /**
   * 모든 리스너 정리
   */
  cleanupAll(): number {
    const count = this.listeners.size
    
    for (const [id] of this.listeners.entries()) {
      this.unregisterListener(id)
    }
    
    console.log(`🧹 [FirebaseCleanup] 모든 리스너 ${count}개 정리 완료`)
    return count
  }

  /**
   * 리스너 현황 조회
   */
  getStatus(): {
    totalListeners: number
    listenersByComponent: Record<string, number>
    oldestListener?: { id: string; age: number; component?: string }
  } {
    const totalListeners = this.listeners.size
    const listenersByComponent: Record<string, number> = {}
    let oldestListener: { id: string; age: number; component?: string } | undefined

    const now = Date.now()
    
    for (const [id, listener] of this.listeners.entries()) {
      // 컴포넌트별 카운트
      const component = listener.component || 'unknown'
      listenersByComponent[component] = (listenersByComponent[component] || 0) + 1
      
      // 가장 오래된 리스너 찾기
      const age = now - listener.createdAt.getTime()
      if (!oldestListener || age > oldestListener.age) {
        oldestListener = { id, age, component: listener.component }
      }
    }

    return {
      totalListeners,
      listenersByComponent,
      oldestListener
    }
  }

  /**
   * 앱 종료 시 정리 콜백 등록
   */
  registerCleanupCallback(callback: () => void): void {
    this.cleanupCallbacks.push(callback)
  }

  /**
   * 앱 종료 시 모든 정리 작업 실행
   */
  executeCleanupCallbacks(): void {
    console.log(`🧹 [FirebaseCleanup] ${this.cleanupCallbacks.length}개 정리 콜백 실행`)
    
    this.cleanupCallbacks.forEach((callback, index) => {
      try {
        callback()
        console.log(`✅ [FirebaseCleanup] 정리 콜백 ${index + 1} 완료`)
      } catch (error) {
        console.error(`❌ [FirebaseCleanup] 정리 콜백 ${index + 1} 실패:`, error)
      }
    })
    
    this.cleanupCallbacks = []
    this.cleanupAll()
  }
}

// 전역 인스턴스
export const firebaseCleanupManager = new FirebaseCleanupManager()

/**
 * 컴포넌트에서 사용하기 쉬운 헬퍼 함수들
 */

/**
 * Firebase 리스너를 안전하게 등록하는 헬퍼
 */
export function safeRegisterListener(
  id: string,
  listenerCreator: () => () => void,
  options: { component?: string; description?: string } = {}
): () => void {
  try {
    const unsubscribe = listenerCreator()
    firebaseCleanupManager.registerListener(id, unsubscribe, options)
    return () => firebaseCleanupManager.unregisterListener(id)
  } catch (error) {
    console.error(`❌ [FirebaseCleanup] 리스너 생성 실패: ${id}`, error)
    return () => {} // 빈 함수 반환
  }
}

/**
 * 컴포넌트 언마운트 시 자동 정리를 위한 헬퍼
 */
export function createComponentCleanup(componentName: string) {
  return {
    register: (id: string, unsubscribe: () => void, description?: string) => {
      firebaseCleanupManager.registerListener(
        `${componentName}_${id}`,
        unsubscribe,
        { component: componentName, description }
      )
    },
    cleanup: () => firebaseCleanupManager.cleanupByComponent(componentName)
  }
}

/**
 * 디버깅을 위한 리스너 현황 출력
 */
export function logListenerStatus(): void {
  const status = firebaseCleanupManager.getStatus()
  
  console.log('🔍 [Firebase 리스너 현황]', {
    총_리스너_수: status.totalListeners,
    컴포넌트별_리스너: status.listenersByComponent,
    가장_오래된_리스너: status.oldestListener ? {
      ID: status.oldestListener.id,
      나이_분: Math.round(status.oldestListener.age / 60000),
      컴포넌트: status.oldestListener.component
    } : null
  })
}

// 개발 모드에서 주기적으로 상태 체크
if (__DEV__) {
  setInterval(() => {
    const status = firebaseCleanupManager.getStatus()
    if (status.totalListeners > 10) {
      console.warn(`⚠️ [FirebaseCleanup] 리스너가 ${status.totalListeners}개로 많습니다. 메모리 누수를 확인하세요.`)
      logListenerStatus()
    }
  }, 30000) // 30초마다 체크
}