import React from "react"
import { InteractionManager, Platform } from "react-native"

// Performance monitoring utilities for React Native optimization

export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map()
  private static enabled = __DEV__ // Only enable in development

  static startTimer(label: string) {
    if (!this.enabled) return
    this.timers.set(label, performance.now())
  }

  static endTimer(label: string) {
    if (!this.enabled) return
    
    const startTime = this.timers.get(label)
    if (startTime) {
      const duration = performance.now() - startTime
      console.log(`⏱️ [Performance] ${label}: ${duration.toFixed(2)}ms`)
      this.timers.delete(label)
      return duration
    }
  }

  static measureRender<T>(componentName: string, renderFn: () => T): T {
    if (!this.enabled) return renderFn()
    
    this.startTimer(`${componentName} render`)
    const result = renderFn()
    this.endTimer(`${componentName} render`)
    return result
  }

  static logMemoryUsage(label?: string) {
    if (!this.enabled || Platform.OS !== 'android') return
    
    // Memory monitoring is limited on React Native
    console.log(`🧠 [Memory] ${label || 'Current'}`)
  }
}

// Debounce utility for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// Throttle utility for scroll performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

// Interaction manager utilities for smooth animations
export const afterInteractions = (callback: () => void) => {
  InteractionManager.runAfterInteractions(callback)
}

export const createInteractionHandle = () => {
  return InteractionManager.createInteractionHandle()
}

export const clearInteractionHandle = (handle: number) => {
  InteractionManager.clearInteractionHandle(handle)
}

// React Native specific optimizations
export const performanceUtils = {
  // Optimize large list rendering
  getFlatListProps: () => ({
    removeClippedSubviews: true,
    maxToRenderPerBatch: 5,
    updateCellsBatchingPeriod: 50,
    initialNumToRender: 8,
    windowSize: 8,
    getItemLayout: undefined, // Let FlatList calculate automatically for dynamic content
    keyboardShouldPersistTaps: "handled" as const,
    scrollEventThrottle: 16,
  }),

  // Image optimization props
  getImageProps: () => ({
    removeClippedSubviews: true,
    progressiveRenderingEnabled: true,
    fadeDuration: 200,
    resizeMode: "cover" as const,
  }),

  // Text input optimization
  getTextInputProps: () => ({
    blurOnSubmit: true,
    returnKeyType: "done" as const,
    enablesReturnKeyAutomatically: true,
  }),

  // Animation optimization
  getAnimationConfig: (duration = 250) => ({
    duration,
    useNativeDriver: true,
  }),
}

// Component performance wrapper
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  const WrappedComponent = React.memo((props: P) => {
    return PerformanceMonitor.measureRender(componentName, () => (
      <Component {...props} />
    ))
  })

  WrappedComponent.displayName = `withPerformanceMonitoring(${componentName})`
  return WrappedComponent
}

// Memory leak detection for development
export const memoryLeakDetector = {
  listeners: new Set<string>(),
  
  addListener(name: string) {
    if (__DEV__) {
      this.listeners.add(name)
      console.log(`📡 [Memory] Added listener: ${name} (total: ${this.listeners.size})`)
    }
  },
  
  removeListener(name: string) {
    if (__DEV__) {
      this.listeners.delete(name)
      console.log(`📡 [Memory] Removed listener: ${name} (total: ${this.listeners.size})`)
    }
  },
  
  checkLeaks() {
    if (__DEV__ && this.listeners.size > 10) {
      console.warn(`🔴 [Memory] Potential leak detected: ${this.listeners.size} listeners active`)
      console.log('Active listeners:', Array.from(this.listeners))
    }
  }
}

// Bundle size analyzer (development only)
export const bundleAnalyzer = {
  logComponentSize(componentName: string, props: any) {
    if (__DEV__) {
      const propsSize = JSON.stringify(props).length
      if (propsSize > 1000) {
        console.warn(`📦 [Bundle] Large props detected in ${componentName}: ${propsSize} bytes`)
      }
    }
  }
}