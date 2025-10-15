/**
 * Firestore 쿼리 성능 벤치마크 스크립트
 * 
 * 이 스크립트는 최적화된 쿼리들의 성능을 측정하고
 * 최적화 전후의 성능 차이를 비교합니다.
 */

import firestore from '@react-native-firebase/firestore'
import { PostService } from '../app/services/firestore/postService'
import { ApplicationService } from '../app/services/firestore/applicationService'
import { queryOptimizer, QueryPerformanceMonitor } from '../app/services/firestore/queryOptimization'

interface BenchmarkResult {
  operation: string
  executionTime: number
  documentCount: number
  cacheHit: boolean
  success: boolean
  error?: string
}

interface BenchmarkSuite {
  name: string
  results: BenchmarkResult[]
  averageTime: number
  totalDocuments: number
  successRate: number
}

class FirestoreBenchmark {
  private db = firestore()
  private postService: PostService
  private applicationService: ApplicationService
  private performanceMonitor = new QueryPerformanceMonitor()

  constructor() {
    this.postService = new PostService(this.db)
    this.applicationService = new ApplicationService(this.db)
  }

  /**
   * 개별 작업 벤치마크
   */
  private async benchmarkOperation(
    name: string,
    operation: () => Promise<any>,
    iterations: number = 5
  ): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = []

    console.log(`🚀 벤치마킹 시작: ${name} (${iterations}회 반복)`)

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now()
      let success = true
      let error: string | undefined
      let documentCount = 0

      try {
        const result = await operation()
        
        // 결과에서 문서 개수 추출
        if (Array.isArray(result)) {
          documentCount = result.length
        } else if (result && typeof result === 'object') {
          if ('data' in result && Array.isArray(result.data)) {
            documentCount = result.data.length
          } else if ('docs' in result) {
            documentCount = result.docs?.length || 0
          }
        } else if (result) {
          documentCount = 1
        }

      } catch (err) {
        success = false
        error = err.message
        console.error(`❌ ${name} 실패 (${i + 1}/${iterations}):`, err.message)
      }

      const executionTime = Date.now() - startTime
      
      results.push({
        operation: name,
        executionTime,
        documentCount,
        cacheHit: i > 0, // 첫 번째 이후는 캐시 히트 가능성 있음
        success,
        error
      })

      console.log(`  ${i + 1}/${iterations}: ${executionTime}ms (${documentCount} docs) ${success ? '✅' : '❌'}`)
      
      // 연속 요청 간 간격
      if (i < iterations - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    return results
  }

  /**
   * 벤치마크 결과 분석
   */
  private analyzeBenchmarkResults(results: BenchmarkResult[]): BenchmarkSuite {
    const successfulResults = results.filter(r => r.success)
    const averageTime = successfulResults.length > 0 
      ? successfulResults.reduce((sum, r) => sum + r.executionTime, 0) / successfulResults.length
      : 0
    
    const totalDocuments = successfulResults.reduce((sum, r) => sum + r.documentCount, 0)
    const successRate = (successfulResults.length / results.length) * 100

    return {
      name: results[0]?.operation || 'Unknown',
      results,
      averageTime,
      totalDocuments,
      successRate
    }
  }

  /**
   * 게시글 쿼리 벤치마크
   */
  async benchmarkPostQueries(): Promise<BenchmarkSuite[]> {
    console.log('\n📊 게시글 쿼리 벤치마크 시작\n')

    const suites: BenchmarkSuite[] = []

    // 1. 기본 게시글 목록 조회 (최적화된 버전)
    const getPostsResults = await this.benchmarkOperation(
      'getPosts (활성 게시글 20개) - 최적화됨',
      async () => {
        const result = await this.postService.getPosts(20)
        return Array.isArray(result) ? result : result.posts
      }
    )
    suites.push(this.analyzeBenchmarkResults(getPostsResults))

    // 2. 페이지네이션 테스트 (최적화된 버전)
    const paginationResults = await this.benchmarkOperation(
      'getPosts 페이지네이션 - 최적화됨',
      async () => {
        const firstPage = await this.postService.getPosts(10)
        if (firstPage.hasMore && firstPage.lastDoc) {
          const secondPage = await this.postService.getPosts(10, firstPage.lastDoc)
          return { first: firstPage.posts, second: secondPage.posts }
        }
        return firstPage.posts
      }
    )
    suites.push(this.analyzeBenchmarkResults(paginationResults))

    // 3. 경량화된 게시글 조회 테스트
    const lightPostsResults = await this.benchmarkOperation(
      'getPostsLight (경량화) - 최적화됨',
      async () => {
        const result = await this.postService.getPostsLight(15)
        return result.posts
      }
    )
    suites.push(this.analyzeBenchmarkResults(lightPostsResults))

    // 4. 단일 게시글 조회
    let testPostId: string | null = null
    const singlePostResults = await this.benchmarkOperation(
      'getPost (단일 조회)',
      async () => {
        if (!testPostId) {
          const result = await this.postService.getPosts(1)
          const posts = Array.isArray(result) ? result : result.posts
          testPostId = posts[0]?.id
        }
        return testPostId ? await this.postService.getPost(testPostId) : null
      }
    )
    suites.push(this.analyzeBenchmarkResults(singlePostResults))

    return suites
  }

  /**
   * 지원서 쿼리 벤치마크
   */
  async benchmarkApplicationQueries(): Promise<BenchmarkSuite[]> {
    console.log('\n📋 지원서 쿼리 벤치마크 시작\n')

    const suites: BenchmarkSuite[] = []

    // 테스트용 데이터 확인
    let testPostId: string | null = null
    const result = await this.postService.getPosts(1)
    const posts = Array.isArray(result) ? result : result.posts
    testPostId = posts[0]?.id

    if (!testPostId) {
      console.warn('⚠️ 테스트할 게시글이 없어 지원서 벤치마크를 건너뜁니다.')
      return suites
    }

    // 1. 게시글별 지원서 조회
    const postApplicationsResults = await this.benchmarkOperation(
      'getApplicationsByPost',
      () => this.applicationService.getApplicationsByPost(testPostId!, { limit: 20 })
    )
    suites.push(this.analyzeBenchmarkResults(postApplicationsResults))

    // 2. 지원자별 지원서 조회 (현재 사용자)
    const applicantApplicationsResults = await this.benchmarkOperation(
      'getApplicationsByApplicant',
      () => this.applicationService.getApplicationsByApplicant(undefined, { limit: 10 })
    )
    suites.push(this.analyzeBenchmarkResults(applicantApplicationsResults))

    // 3. 지원서 통계 조회
    const statsResults = await this.benchmarkOperation(
      'getApplicationStats',
      () => this.applicationService.getApplicationStats(testPostId!)
    )
    suites.push(this.analyzeBenchmarkResults(statsResults))

    return suites
  }

  /**
   * 실시간 리스너 성능 테스트
   */
  async benchmarkRealtimeListeners(): Promise<void> {
    console.log('\n🔔 실시간 리스너 성능 테스트\n')

    return new Promise((resolve) => {
      let updateCount = 0
      const startTime = Date.now()
      const testDuration = 10000 // 10초

      console.log('실시간 리스너 구독 시작 (10초간 모니터링)...')

      const unsubscribe = this.postService.subscribeToActivePosts(
        (posts) => {
          updateCount++
          const currentTime = Date.now() - startTime
          console.log(`  업데이트 ${updateCount}: ${posts.length}개 게시글 (${currentTime}ms)`)
        },
        10
      )

      setTimeout(() => {
        unsubscribe()
        const totalTime = Date.now() - startTime
        console.log(`\n실시간 리스너 테스트 완료:`)
        console.log(`  총 업데이트: ${updateCount}회`)
        console.log(`  총 시간: ${totalTime}ms`)
        console.log(`  평균 간격: ${updateCount > 0 ? totalTime / updateCount : 0}ms`)
        resolve()
      }, testDuration)
    })
  }

  /**
   * 캐시 효율성 테스트
   */
  async benchmarkCacheEfficiency(): Promise<void> {
    console.log('\n💾 캐시 효율성 테스트\n')

    // 첫 번째 요청 (캐시 미스)
    console.log('첫 번째 요청 (캐시 미스):')
    const firstRequest = await this.benchmarkOperation(
      'getPosts (캐시 미스)',
      async () => {
        const result = await this.postService.getPosts(10)
        return Array.isArray(result) ? result : result.posts
      },
      1
    )

    // 즉시 두 번째 요청 (캐시 히트 예상)
    console.log('\n두 번째 요청 (캐시 히트 예상):')
    const secondRequest = await this.benchmarkOperation(
      'getPosts (캐시 히트)',
      async () => {
        const result = await this.postService.getPosts(10)
        return Array.isArray(result) ? result : result.posts
      },
      1
    )

    const cacheSpeedup = firstRequest[0].executionTime / secondRequest[0].executionTime
    console.log(`\n캐시 성능 향상: ${cacheSpeedup.toFixed(2)}x 빠름`)
  }

  /**
   * 메모리 사용량 모니터링
   */
  private getMemoryUsage(): { used: number; total: number } {
    if (global.performance && global.performance.memory) {
      return {
        used: global.performance.memory.usedJSHeapSize / 1024 / 1024, // MB
        total: global.performance.memory.totalJSHeapSize / 1024 / 1024 // MB
      }
    }
    return { used: 0, total: 0 }
  }

  /**
   * 종합 벤치마크 실행
   */
  async runFullBenchmark(): Promise<void> {
    console.log('🏁 Firestore 종합 성능 벤치마크 시작')
    console.log('=====================================\n')

    const initialMemory = this.getMemoryUsage()
    const benchmarkStartTime = Date.now()

    try {
      // 게시글 쿼리 벤치마크
      const postSuites = await this.benchmarkPostQueries()
      
      // 지원서 쿼리 벤치마크
      const applicationSuites = await this.benchmarkApplicationQueries()
      
      // 실시간 리스너 테스트
      await this.benchmarkRealtimeListeners()
      
      // 캐시 효율성 테스트
      await this.benchmarkCacheEfficiency()

      // 결과 요약
      const totalBenchmarkTime = Date.now() - benchmarkStartTime
      const finalMemory = this.getMemoryUsage()

      console.log('\n📈 벤치마크 결과 요약')
      console.log('====================')

      console.log('\n게시글 쿼리 성능:')
      postSuites.forEach(suite => {
        console.log(`  ${suite.name}: ${suite.averageTime.toFixed(1)}ms (성공률: ${suite.successRate.toFixed(1)}%)`)
      })

      if (applicationSuites.length > 0) {
        console.log('\n지원서 쿼리 성능:')
        applicationSuites.forEach(suite => {
          console.log(`  ${suite.name}: ${suite.averageTime.toFixed(1)}ms (성공률: ${suite.successRate.toFixed(1)}%)`)
        })
      }

      console.log(`\n전체 벤치마크 시간: ${(totalBenchmarkTime / 1000).toFixed(1)}초`)
      
      if (finalMemory.used > 0) {
        console.log(`메모리 사용량: ${initialMemory.used.toFixed(1)}MB → ${finalMemory.used.toFixed(1)}MB`)
        console.log(`메모리 증가: ${(finalMemory.used - initialMemory.used).toFixed(1)}MB`)
      }

      // 성능 권장사항
      this.generateRecommendations([...postSuites, ...applicationSuites])

    } catch (error) {
      console.error('❌ 벤치마크 실행 중 오류:', error)
    }
  }

  /**
   * 성능 권장사항 생성
   */
  private generateRecommendations(suites: BenchmarkSuite[]): void {
    console.log('\n💡 성능 최적화 권장사항')
    console.log('======================')

    const slowSuites = suites.filter(suite => suite.averageTime > 2000)
    const lowSuccessRateSuites = suites.filter(suite => suite.successRate < 95)

    if (slowSuites.length > 0) {
      console.log('\n⚠️ 느린 쿼리 감지:')
      slowSuites.forEach(suite => {
        console.log(`  - ${suite.name}: ${suite.averageTime.toFixed(1)}ms`)
        console.log(`    권장: 인덱스 최적화 또는 쿼리 조건 개선 필요`)
      })
    }

    if (lowSuccessRateSuites.length > 0) {
      console.log('\n❌ 낮은 성공률 감지:')
      lowSuccessRateSuites.forEach(suite => {
        console.log(`  - ${suite.name}: ${suite.successRate.toFixed(1)}% 성공률`)
        console.log(`    권장: 에러 처리 및 재시도 로직 강화 필요`)
      })
    }

    if (slowSuites.length === 0 && lowSuccessRateSuites.length === 0) {
      console.log('\n✅ 모든 쿼리가 좋은 성능을 보이고 있습니다!')
      console.log('   - 평균 응답 시간: 2초 이하')
      console.log('   - 성공률: 95% 이상')
    }

    console.log('\n📚 추가 최적화 팁:')
    console.log('  1. 자주 사용되는 쿼리는 캐싱 적극 활용')
    console.log('  2. 페이지네이션으로 대량 데이터 조회 최적화')
    console.log('  3. 실시간 리스너는 필요한 범위로 제한')
    console.log('  4. 복합 쿼리는 적절한 인덱스 생성 확인')
    console.log('  5. 성능 모니터링을 통한 지속적인 개선')
  }
}

// 벤치마크 실행 함수
export async function runFirestoreBenchmark(): Promise<void> {
  const benchmark = new FirestoreBenchmark()
  await benchmark.runFullBenchmark()
}

// CLI에서 직접 실행 가능
if (require.main === module) {
  runFirestoreBenchmark()
    .then(() => {
      console.log('\n✅ 벤치마크 완료')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ 벤치마크 실패:', error)
      process.exit(1)
    })
}