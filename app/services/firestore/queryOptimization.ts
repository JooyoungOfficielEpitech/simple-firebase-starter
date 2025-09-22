import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore"

/**
 * Firestore 쿼리 최적화 유틸리티
 * 
 * 이 파일은 Firestore 쿼리 성능을 최적화하기 위한 헬퍼 함수들과
 * 모범 사례들을 제공합니다.
 */

// 쿼리 성능 모니터링 인터페이스
interface QueryPerformanceMetrics {
  queryType: string
  executionTime: number
  documentCount: number
  cacheHit: boolean
  indexUsed: boolean
  cost: number // Firestore 읽기 비용
}

// 배치 처리 옵션
interface BatchOptions {
  batchSize: number
  maxConcurrency: number
  retryAttempts: number
  retryDelay: number
}

// 인덱스 힌트 인터페이스
interface IndexHint {
  collection: string
  fields: string[]
  orderBy?: { field: string; direction: 'asc' | 'desc' }[]
  purpose: string
}

/**
 * 쿼리 성능 모니터링 클래스
 */
export class QueryPerformanceMonitor {
  private metrics: QueryPerformanceMetrics[] = []
  private readonly MAX_METRICS_HISTORY = 1000

  /**
   * 쿼리 실행 시간 측정
   */
  async measureQuery<T>(
    queryType: string,
    queryOperation: () => Promise<T>,
    options: { cacheHit?: boolean; expectedDocs?: number } = {}
  ): Promise<T> {
    const startTime = Date.now()
    
    try {
      const result = await queryOperation()
      const executionTime = Date.now() - startTime
      
      // 결과가 배열인 경우 문서 수 계산
      let documentCount = 0
      if (Array.isArray(result)) {
        documentCount = result.length
      } else if (result && typeof result === 'object' && 'docs' in result) {
        documentCount = (result as any).docs?.length || 0
      }
      
      this.recordMetric({
        queryType,
        executionTime,
        documentCount,
        cacheHit: options.cacheHit || false,
        indexUsed: executionTime < 1000, // 1초 미만이면 인덱스 사용으로 추정
        cost: documentCount // 기본적으로 읽은 문서 수 = 비용
      })
      
      // 성능 경고
      if (executionTime > 5000) {
        console.warn(`⚠️ [QueryPerformance] 느린 쿼리 감지: ${queryType} (${executionTime}ms)`)
      }
      
      if (documentCount > 100) {
        console.warn(`⚠️ [QueryPerformance] 대량 문서 조회: ${queryType} (${documentCount} docs)`)
      }
      
      return result
    } catch (error) {
      const executionTime = Date.now() - startTime
      console.error(`❌ [QueryPerformance] 쿼리 실패: ${queryType} (${executionTime}ms)`, error)
      throw error
    }
  }

  /**
   * 성능 메트릭 기록
   */
  private recordMetric(metric: QueryPerformanceMetrics): void {
    this.metrics.push(metric)
    
    // 메트릭 히스토리 제한
    if (this.metrics.length > this.MAX_METRICS_HISTORY) {
      this.metrics.shift()
    }
    
    console.log(`📊 [QueryPerformance] ${metric.queryType}: ${metric.executionTime}ms, ${metric.documentCount} docs, cost: ${metric.cost}`)
  }

  /**
   * 성능 리포트 생성
   */
  generatePerformanceReport(queryType?: string): {
    averageExecutionTime: number
    totalQueries: number
    cacheHitRate: number
    totalCost: number
    slowQueries: QueryPerformanceMetrics[]
  } {
    const filteredMetrics = queryType 
      ? this.metrics.filter(m => m.queryType === queryType)
      : this.metrics
    
    if (filteredMetrics.length === 0) {
      return {
        averageExecutionTime: 0,
        totalQueries: 0,
        cacheHitRate: 0,
        totalCost: 0,
        slowQueries: []
      }
    }
    
    const totalExecutionTime = filteredMetrics.reduce((sum, m) => sum + m.executionTime, 0)
    const cacheHits = filteredMetrics.filter(m => m.cacheHit).length
    const totalCost = filteredMetrics.reduce((sum, m) => sum + m.cost, 0)
    const slowQueries = filteredMetrics.filter(m => m.executionTime > 2000)
    
    return {
      averageExecutionTime: totalExecutionTime / filteredMetrics.length,
      totalQueries: filteredMetrics.length,
      cacheHitRate: (cacheHits / filteredMetrics.length) * 100,
      totalCost,
      slowQueries
    }
  }
}

/**
 * 배치 처리 유틸리티
 */
export class BatchProcessor {
  constructor(private db: FirebaseFirestoreTypes.Module) {}

  /**
   * 대량 문서 배치 처리
   */
  async processBatch<T, R>(
    items: T[],
    processor: (batch: T[]) => Promise<R[]>,
    options: Partial<BatchOptions> = {}
  ): Promise<R[]> {
    const {
      batchSize = 10,
      maxConcurrency = 3,
      retryAttempts = 3,
      retryDelay = 1000
    } = options

    const results: R[] = []
    const batches: T[][] = []
    
    // 배치 분할
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }
    
    // 동시성 제한하여 배치 처리
    const semaphore = new Semaphore(maxConcurrency)
    
    const batchPromises = batches.map(async (batch, index) => {
      await semaphore.acquire()
      
      try {
        const batchResults = await this.retryOperation(
          () => processor(batch),
          retryAttempts,
          retryDelay
        )
        
        console.log(`✅ [BatchProcessor] 배치 ${index + 1}/${batches.length} 완료 (${batch.length} items)`)
        return batchResults
      } finally {
        semaphore.release()
      }
    })
    
    const batchResults = await Promise.all(batchPromises)
    batchResults.forEach(result => results.push(...result))
    
    return results
  }

  /**
   * Firestore 트랜잭션 배치 쓰기
   */
  async batchWrite(
    operations: Array<{
      type: 'set' | 'update' | 'delete'
      ref: FirebaseFirestoreTypes.DocumentReference
      data?: any
    }>
  ): Promise<void> {
    const FIRESTORE_BATCH_LIMIT = 500
    const batches: Array<typeof operations> = []
    
    // 배치 분할 (Firestore 제한 고려)
    for (let i = 0; i < operations.length; i += FIRESTORE_BATCH_LIMIT) {
      batches.push(operations.slice(i, i + FIRESTORE_BATCH_LIMIT))
    }
    
    for (const [index, batchOps] of batches.entries()) {
      const batch = this.db.batch()
      
      batchOps.forEach(op => {
        switch (op.type) {
          case 'set':
            batch.set(op.ref, op.data)
            break
          case 'update':
            batch.update(op.ref, op.data)
            break
          case 'delete':
            batch.delete(op.ref)
            break
        }
      })
      
      await batch.commit()
      console.log(`✅ [BatchProcessor] Firestore 배치 ${index + 1}/${batches.length} 커밋 (${batchOps.length} ops)`)
    }
  }

  /**
   * 재시도 로직
   */
  private async retryOperation<T>(
    operation: () => Promise<T>,
    maxAttempts: number,
    delay: number
  ): Promise<T> {
    let lastError: Error
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        
        if (attempt === maxAttempts) {
          throw error
        }
        
        // 지수 백오프
        const backoffDelay = delay * Math.pow(2, attempt - 1)
        console.warn(`⚠️ [BatchProcessor] 재시도 ${attempt}/${maxAttempts} (${backoffDelay}ms 후)`)
        await new Promise(resolve => setTimeout(resolve, backoffDelay))
      }
    }
    
    throw lastError!
  }
}

/**
 * 세마포어 (동시성 제어)
 */
class Semaphore {
  private available: number
  private waiters: Array<() => void> = []

  constructor(count: number) {
    this.available = count
  }

  async acquire(): Promise<void> {
    if (this.available > 0) {
      this.available--
      return
    }
    
    return new Promise(resolve => {
      this.waiters.push(resolve)
    })
  }

  release(): void {
    if (this.waiters.length > 0) {
      const waiter = this.waiters.shift()!
      waiter()
    } else {
      this.available++
    }
  }
}

/**
 * 쿼리 최적화 헬퍼
 */
export class QueryOptimizer {
  private performanceMonitor = new QueryPerformanceMonitor()
  
  /**
   * 권장 인덱스 목록
   */
  static readonly RECOMMENDED_INDEXES: IndexHint[] = [
    {
      collection: 'posts',
      fields: ['status', 'createdAt'],
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
      purpose: '활성 게시글 목록 조회'
    },
    {
      collection: 'posts',
      fields: ['organizationId', 'createdAt'],
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
      purpose: '단체별 게시글 조회'
    },
    {
      collection: 'posts',
      fields: ['authorId', 'createdAt'],
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
      purpose: '작성자별 게시글 조회'
    },
    {
      collection: 'posts',
      fields: ['tags', 'status', 'createdAt'],
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
      purpose: '태그별 활성 게시글 검색'
    },
    {
      collection: 'posts',
      fields: ['status', 'viewCount'],
      orderBy: [{ field: 'viewCount', direction: 'desc' }],
      purpose: '인기 게시글 조회'
    },
    {
      collection: 'applications',
      fields: ['postId', 'status', 'createdAt'],
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
      purpose: '게시글별 지원서 조회'
    },
    {
      collection: 'applications',
      fields: ['applicantId', 'createdAt'],
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
      purpose: '지원자별 지원서 조회'
    },
    {
      collection: 'organizations',
      fields: ['createdBy', 'createdAt'],
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
      purpose: '사용자별 단체 조회'
    }
  ]

  /**
   * 쿼리 성능 모니터링
   */
  async monitorQuery<T>(
    queryType: string,
    queryOperation: () => Promise<T>,
    options?: { cacheHit?: boolean; expectedDocs?: number }
  ): Promise<T> {
    return this.performanceMonitor.measureQuery(queryType, queryOperation, options)
  }

  /**
   * 성능 리포트 조회
   */
  getPerformanceReport(queryType?: string) {
    return this.performanceMonitor.generatePerformanceReport(queryType)
  }

  /**
   * 페이지네이션 최적화 검증
   */
  validatePaginationQuery(
    limit: number,
    startAfter?: FirebaseFirestoreTypes.DocumentSnapshot
  ): { isOptimal: boolean; recommendations: string[] } {
    const recommendations: string[] = []
    let isOptimal = true

    // 페이지 크기 검증
    if (limit > 100) {
      isOptimal = false
      recommendations.push('페이지 크기를 100 이하로 제한하세요 (현재: ' + limit + ')')
    }

    if (limit < 5) {
      recommendations.push('페이지 크기가 너무 작을 수 있습니다 (현재: ' + limit + ')')
    }

    // startAfter 사용 권장
    if (!startAfter && limit > 20) {
      recommendations.push('대량 데이터 조회시 페이지네이션을 사용하세요')
    }

    return { isOptimal, recommendations }
  }

  /**
   * 복합 쿼리 최적화 검증
   */
  validateCompositeQuery(filters: Array<{ field: string; operator: string; value: any }>): {
    needsIndex: boolean
    recommendedIndex: IndexHint | null
    suggestions: string[]
  } {
    const suggestions: string[] = []
    let needsIndex = false
    let recommendedIndex: IndexHint | null = null

    // 복합 필터가 2개 이상이면 인덱스 필요
    if (filters.length >= 2) {
      needsIndex = true
      
      // 인덱스 추천
      const fields = filters.map(f => f.field)
      recommendedIndex = {
        collection: 'unknown',
        fields,
        purpose: '복합 쿼리 최적화'
      }
      
      suggestions.push(`복합 인덱스 필요: [${fields.join(', ')}]`)
    }

    // array-contains와 다른 필터 조합 검증
    const arrayContainsFilters = filters.filter(f => f.operator === 'array-contains')
    if (arrayContainsFilters.length > 0 && filters.length > 1) {
      suggestions.push('array-contains와 다른 필터 조합시 성능에 주의하세요')
    }

    // inequality 필터 검증
    const inequalityFilters = filters.filter(f => 
      ['<', '<=', '>', '>=', '!='].includes(f.operator)
    )
    if (inequalityFilters.length > 1) {
      suggestions.push('inequality 필터는 하나의 필드에만 사용 가능합니다')
    }

    return { needsIndex, recommendedIndex, suggestions }
  }

  /**
   * 인덱스 사용 힌트 제공
   */
  getIndexHints(collection: string, queryType?: string): IndexHint[] {
    let hints = QueryOptimizer.RECOMMENDED_INDEXES.filter(hint => 
      hint.collection === collection
    )

    if (queryType) {
      hints = hints.filter(hint => 
        hint.purpose.toLowerCase().includes(queryType.toLowerCase())
      )
    }

    return hints
  }
}

/**
 * 캐시 최적화 전략
 */
export class CacheOptimizer {
  /**
   * TTL 계산 (데이터 변경 빈도에 따라)
   */
  static calculateOptimalTTL(dataType: 'static' | 'dynamic' | 'realtime'): number {
    switch (dataType) {
      case 'static':
        return 60 * 60 * 1000 // 1시간 (설정, 메타데이터)
      case 'dynamic':
        return 5 * 60 * 1000  // 5분 (게시글, 사용자 정보)
      case 'realtime':
        return 1 * 60 * 1000  // 1분 (지원서, 알림)
      default:
        return 5 * 60 * 1000
    }
  }

  /**
   * 캐시 키 최적화
   */
  static generateOptimalCacheKey(
    collection: string,
    operation: string,
    params: Record<string, any>
  ): string {
    // 매개변수 정렬하여 일관된 키 생성
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('_')
    
    return `${collection}:${operation}:${sortedParams}`
  }

  /**
   * 캐시 무효화 패턴 추천
   */
  static getInvalidationPatterns(operation: 'create' | 'update' | 'delete'): string[] {
    switch (operation) {
      case 'create':
        return ['list', 'count', 'stats'] // 목록, 개수, 통계 캐시 무효화
      case 'update':
        return ['single', 'list', 'stats'] // 단일, 목록, 통계 캐시 무효화
      case 'delete':
        return ['single', 'list', 'count', 'stats'] // 모든 관련 캐시 무효화
      default:
        return []
    }
  }
}

// 싱글톤 인스턴스 export
export const queryOptimizer = new QueryOptimizer()
export const batchProcessor = (db: FirebaseFirestoreTypes.Module) => new BatchProcessor(db)