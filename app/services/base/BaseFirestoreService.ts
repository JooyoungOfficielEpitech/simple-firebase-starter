/**
 * Base Firestore Service
 * 모든 Firestore 서비스의 기본 클래스
 */

import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore"
import { logger } from "@/utils/logger"
import { withRetry } from "@/services/error/firebaseErrorHandler"
import type { CacheEntry, ServiceConfig, PerformanceMetrics } from "./types"

export abstract class BaseFirestoreService<T = any> {
  protected collectionName: string
  protected cache: Map<string, CacheEntry<T>>
  protected config: Required<ServiceConfig>
  protected metrics: PerformanceMetrics

  constructor(collectionName: string, config: Partial<ServiceConfig> = {}) {
    this.collectionName = collectionName
    this.cache = new Map()
    this.config = {
      cache: config.cache || { enabled: true, ttl: 300000 }, // 5분
      retry: config.retry || { maxRetries: 3, initialDelay: 1000, maxDelay: 10000 },
      enablePerformanceTracking: config.enablePerformanceTracking ?? true,
    }
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      dbReads: 0,
      dbWrites: 0,
      avgResponseTime: 0,
    }
  }

  /**
   * Firestore 컬렉션 참조
   */
  protected get collection(): FirebaseFirestoreTypes.CollectionReference {
    return firestore().collection(this.collectionName)
  }

  /**
   * 캐시에서 데이터 가져오기
   */
  protected getFromCache(key: string): T | null {
    if (!this.config.cache.enabled) return null

    const entry = this.cache.get(key)
    if (!entry) {
      this.metrics.cacheMisses++
      return null
    }

    const isExpired = Date.now() - entry.timestamp > this.config.cache.ttl
    if (isExpired) {
      this.cache.delete(key)
      this.metrics.cacheMisses++
      return null
    }

    this.metrics.cacheHits++
    return entry.data
  }

  /**
   * 캐시에 데이터 저장
   */
  protected setCache(key: string, data: T): void {
    if (!this.config.cache.enabled) return

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  /**
   * 캐시 무효화
   */
  protected invalidateCache(key?: string): void {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }

  /**
   * 문서 가져오기 (캐싱 포함)
   */
  protected async getDocument(docId: string): Promise<T | null> {
    const startTime = Date.now()

    try {
      // 캐시 확인
      const cached = this.getFromCache(docId)
      if (cached) {
        logger.debug(this.collectionName, `Cache hit for ${docId}`)
        return cached
      }

      // Firestore에서 가져오기
      const doc = await withRetry(
        () => this.collection.doc(docId).get(),
        `Get document ${docId}`,
        { maxRetries: this.config.retry.maxRetries }
      )

      this.metrics.dbReads++

      if (!doc.exists) {
        return null
      }

      const data = { id: doc.id, ...doc.data() } as T
      this.setCache(docId, data)

      return data
    } finally {
      const duration = Date.now() - startTime
      this.updateAvgResponseTime(duration)
    }
  }

  /**
   * 문서 생성
   */
  protected async createDocument(data: Partial<T>): Promise<string> {
    const startTime = Date.now()

    try {
      const docRef = await withRetry(
        () => this.collection.add(data),
        `Create document`,
        { maxRetries: this.config.retry.maxRetries }
      )

      this.metrics.dbWrites++
      this.invalidateCache() // 리스트 캐시 무효화

      return docRef.id
    } finally {
      const duration = Date.now() - startTime
      this.updateAvgResponseTime(duration)
    }
  }

  /**
   * 문서 업데이트
   */
  protected async updateDocument(docId: string, data: Partial<T>): Promise<void> {
    const startTime = Date.now()

    try {
      await withRetry(
        () => this.collection.doc(docId).update(data),
        `Update document ${docId}`,
        { maxRetries: this.config.retry.maxRetries }
      )

      this.metrics.dbWrites++
      this.invalidateCache(docId)
    } finally {
      const duration = Date.now() - startTime
      this.updateAvgResponseTime(duration)
    }
  }

  /**
   * 문서 삭제
   */
  protected async deleteDocument(docId: string): Promise<void> {
    const startTime = Date.now()

    try {
      await withRetry(
        () => this.collection.doc(docId).delete(),
        `Delete document ${docId}`,
        { maxRetries: this.config.retry.maxRetries }
      )

      this.metrics.dbWrites++
      this.invalidateCache(docId)
    } finally {
      const duration = Date.now() - startTime
      this.updateAvgResponseTime(duration)
    }
  }

  /**
   * 평균 응답 시간 업데이트
   */
  private updateAvgResponseTime(duration: number): void {
    const totalOps = this.metrics.dbReads + this.metrics.dbWrites
    this.metrics.avgResponseTime = 
      (this.metrics.avgResponseTime * (totalOps - 1) + duration) / totalOps
  }

  /**
   * 성능 메트릭 가져오기
   */
  getPerformanceMetrics(): PerformanceMetrics & { cacheHitRate: string } {
    const totalCacheAccess = this.metrics.cacheHits + this.metrics.cacheMisses
    const cacheHitRate = totalCacheAccess > 0 
      ? ((this.metrics.cacheHits / totalCacheAccess) * 100).toFixed(1)
      : "0.0"

    return {
      ...this.metrics,
      cacheHitRate: `${cacheHitRate}%`,
    }
  }

  /**
   * 메트릭 초기화
   */
  resetMetrics(): void {
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      dbReads: 0,
      dbWrites: 0,
      avgResponseTime: 0,
    }
  }
}
