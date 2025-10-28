/**
 * Firebase Service Base Types
 */

export interface CacheConfig {
  enabled: boolean
  ttl: number // milliseconds
}

export interface RetryConfig {
  maxRetries: number
  initialDelay: number
  maxDelay: number
}

export interface ServiceConfig {
  cache?: CacheConfig
  retry?: RetryConfig
  enablePerformanceTracking?: boolean
}

export interface CacheEntry<T> {
  data: T
  timestamp: number
}

export interface PerformanceMetrics {
  cacheHits: number
  cacheMisses: number
  dbReads: number
  dbWrites: number
  avgResponseTime: number
}
