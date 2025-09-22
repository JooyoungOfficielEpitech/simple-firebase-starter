# Firestore 쿼리 최적화 사용 가이드

이 문서는 최적화된 Firestore 서비스들의 사용법과 모범 사례를 설명합니다.

## 📋 목차

1. [PostService 사용법](#postservice-사용법)
2. [ApplicationService 사용법](#applicationservice-사용법)
3. [페이지네이션 최적화](#페이지네이션-최적화)
4. [캐싱 전략](#캐싱-전략)
5. [실시간 리스너 최적화](#실시간-리스너-최적화)
6. [쿼리 성능 모니터링](#쿼리-성능-모니터링)
7. [인덱스 활용](#인덱스-활용)

## PostService 사용법

### 기본 게시글 조회

```typescript
import { postService } from '@/services/firestore'

// 활성 게시글 목록 조회 (페이지네이션)
const result = await postService.getPosts({
  limit: 20,
  status: 'active',
  orderBy: 'createdAt',
  orderDirection: 'desc'
})

console.log('게시글:', result.data)
console.log('다음 페이지 있음:', result.hasMore)

// 다음 페이지 로드
if (result.hasMore && result.lastDoc) {
  const nextPage = await postService.getPosts({
    limit: 20,
    startAfter: result.lastDoc,
    status: 'active'
  })
}
```

### 단체별 게시글 조회

```typescript
// 내 단체 게시글 조회
const myPosts = await postService.getMyOrganizationPosts({
  limit: 10,
  status: 'active'
})

// 특정 단체 게시글 조회
const orgPosts = await postService.getPostsByOrganization('org123', {
  limit: 15,
  status: 'active'
})
```

### 태그별 검색

```typescript
// 뮤지컬 태그로 검색
const musicalPosts = await postService.getPostsByTag('뮤지컬', {
  limit: 20,
  status: 'active'
})

// 인기 게시글 조회 (조회수 기준)
const popularPosts = await postService.getPopularPosts({
  limit: 10,
  status: 'active'
})
```

### 복합 검색

```typescript
// 제목, 설명, 태그에서 검색
const searchResults = await postService.searchPosts('햄릿', {
  limit: 20,
  status: 'active',
  tags: ['연극'],
  organizationId: 'specific-org'
})
```

### 게시글 조회수 증가

```typescript
// 게시글 조회 (조회수 증가)
const post = await postService.getPost('post123', true)

// 게시글 조회 (조회수 증가 안함, 캐시 사용 가능)
const postCached = await postService.getPost('post123', false)
```

### 실시간 구독

```typescript
// 활성 게시글 실시간 구독
const unsubscribe = postService.subscribeToActivePosts(
  (posts) => {
    console.log('실시간 게시글 업데이트:', posts)
    // UI 업데이트
  },
  20 // limit
)

// 구독 해제
unsubscribe()

// 단체별 게시글 실시간 구독
const unsubscribeOrg = postService.subscribeToOrganizationPosts(
  'org123',
  (posts) => {
    console.log('단체 게시글 업데이트:', posts)
  },
  { status: 'active', limit: 15 }
)
```

## ApplicationService 사용법

### 지원서 생성

```typescript
import { applicationService } from '@/services/firestore'

// 지원서 생성
const applicationId = await applicationService.createApplication({
  postId: 'post123',
  message: '안녕하세요. 햄릿 역할에 지원합니다.',
  portfolio: 'https://portfolio-url.com',
  phoneNumber: '010-1234-5678',
  experience: '대학 연극동아리에서 3년간 활동',
  rolePreference: '햄릿',
  availableDates: ['2024-01-15', '2024-01-16', '2024-01-17']
})
```

### 지원서 조회

```typescript
// 게시글별 지원서 목록 (운영자용)
const applications = await applicationService.getApplicationsByPost('post123', {
  limit: 20,
  status: 'pending'
})

// 내 지원서 목록
const myApplications = await applicationService.getApplicationsByApplicant(undefined, {
  limit: 10,
  status: 'pending'
})

// 특정 사용자의 지원서 목록
const userApplications = await applicationService.getApplicationsByApplicant('user456', {
  limit: 15
})
```

### 지원서 상태 관리

```typescript
// 지원서 승인 (운영자용)
await applicationService.updateApplicationStatus('app123', 'accepted')

// 지원서 거절 (운영자용)
await applicationService.updateApplicationStatus('app123', 'rejected')

// 지원서 철회 (지원자용)
await applicationService.withdrawApplication('app123')

// 지원서 수정 (지원자용)
await applicationService.updateApplication('app123', {
  message: '수정된 지원 메시지',
  portfolio: 'https://new-portfolio.com'
})
```

### 지원서 통계

```typescript
// 특정 게시글의 지원서 통계
const stats = await applicationService.getApplicationStats('post123')
console.log('총 지원자:', stats.total)
console.log('대기 중:', stats.pending)
console.log('승인됨:', stats.accepted)

// 전체 지원서 통계
const globalStats = await applicationService.getApplicationStats()
```

### 실시간 지원서 구독

```typescript
// 게시글별 지원서 실시간 구독 (운영자용)
const unsubscribeApps = applicationService.subscribeToApplicationsByPost(
  'post123',
  (applications) => {
    console.log('새 지원서:', applications)
    // UI 업데이트
  },
  { status: 'pending', limit: 50 }
)

// 내 지원서 상태 실시간 구독
const unsubscribeMyApps = applicationService.subscribeToApplicationsByApplicant(
  'currentUserId',
  (applications) => {
    console.log('내 지원서 상태 변경:', applications)
  }
)
```

## 페이지네이션 최적화

### 올바른 페이지네이션 구현

```typescript
class PostListComponent {
  private lastDoc: FirebaseFirestoreTypes.DocumentSnapshot | null = null
  private posts: Post[] = []
  private loading = false
  private hasMore = true

  async loadPosts(refresh = false) {
    if (this.loading) return
    this.loading = true

    try {
      const result = await postService.getPosts({
        limit: 20,
        startAfter: refresh ? undefined : this.lastDoc,
        status: 'active'
      })

      if (refresh) {
        this.posts = result.data
      } else {
        this.posts.push(...result.data)
      }

      this.lastDoc = result.lastDoc
      this.hasMore = result.hasMore
    } catch (error) {
      console.error('게시글 로드 실패:', error)
    } finally {
      this.loading = false
    }
  }

  async loadMore() {
    if (this.hasMore && !this.loading) {
      await this.loadPosts(false)
    }
  }

  async refresh() {
    this.lastDoc = null
    this.hasMore = true
    await this.loadPosts(true)
  }
}
```

### 무한 스크롤 구현

```typescript
// React Native FlatList 예제
<FlatList
  data={posts}
  renderItem={({ item }) => <PostItem post={item} />}
  keyExtractor={(item) => item.id}
  onEndReached={() => {
    if (hasMore && !loading) {
      loadMore()
    }
  }}
  onEndReachedThreshold={0.1}
  refreshing={loading && posts.length === 0}
  onRefresh={refresh}
  ListFooterComponent={() => 
    loading && hasMore ? <LoadingSpinner /> : null
  }
/>
```

## 캐싱 전략

### 캐시 효율적 사용

```typescript
// 읽기 전용 데이터는 캐시 활용
const post = await postService.getPost('post123', false) // 조회수 증가 안함, 캐시 사용

// 실시간 데이터는 캐시 우회
const postWithViewCount = await postService.getPost('post123', true) // 조회수 증가, 캐시 우회

// 목록의 첫 페이지는 캐시됨
const firstPage = await postService.getPosts({ limit: 20 }) // 캐시 가능

// 후속 페이지는 캐시되지 않음
const secondPage = await postService.getPosts({ 
  limit: 20, 
  startAfter: firstPage.lastDoc 
}) // 캐시 안됨
```

### 수동 캐시 무효화

```typescript
// 게시글 생성 후 자동으로 캐시 무효화됨
await postService.createPost(postData, authorName, orgId)

// 게시글 수정 후 자동으로 캐시 무효화됨
await postService.updatePost('post123', updateData)

// 실시간 리스너는 자동으로 캐시 무효화함
const unsubscribe = postService.subscribeToActivePosts((posts) => {
  // 새 데이터 수신시 관련 캐시가 자동 무효화됨
})
```

## 실시간 리스너 최적화

### 효율적인 리스너 사용

```typescript
class PostScreen {
  private unsubscribers: Array<() => void> = []

  componentDidMount() {
    // 필요한 데이터만 구독
    const unsubscribe1 = postService.subscribeToActivePosts(
      (posts) => this.updatePosts(posts),
      10 // 적절한 limit 설정
    )

    const unsubscribe2 = postService.subscribeToPost(
      this.postId,
      (post) => this.updatePost(post)
    )

    this.unsubscribers.push(unsubscribe1, unsubscribe2)
  }

  componentWillUnmount() {
    // 모든 구독 해제
    this.unsubscribers.forEach(unsubscribe => unsubscribe())
  }

  updatePosts(posts: Post[]) {
    // 중복 업데이트 방지
    if (JSON.stringify(posts) !== JSON.stringify(this.state.posts)) {
      this.setState({ posts })
    }
  }
}
```

### 조건부 구독

```typescript
// 상태에 따른 조건부 구독
class OrganizationPostsScreen {
  private currentUnsubscriber: (() => void) | null = null

  subscribeToRelevantPosts(organizationId: string, userRole: 'member' | 'admin') {
    // 기존 구독 해제
    if (this.currentUnsubscriber) {
      this.currentUnsubscriber()
    }

    if (userRole === 'admin') {
      // 관리자: 모든 상태의 게시글 구독
      this.currentUnsubscriber = postService.subscribeToOrganizationPosts(
        organizationId,
        (posts) => this.updatePosts(posts),
        { limit: 50 } // 상태 필터링 없음
      )
    } else {
      // 일반 회원: 활성 게시글만 구독
      this.currentUnsubscriber = postService.subscribeToOrganizationPosts(
        organizationId,
        (posts) => this.updatePosts(posts),
        { status: 'active', limit: 20 }
      )
    }
  }
}
```

## 쿼리 성능 모니터링

### 성능 모니터링 사용

```typescript
import { queryOptimizer } from '@/services/firestore/queryOptimization'

// 쿼리 성능 모니터링
const result = await queryOptimizer.monitorQuery(
  'getPosts-active',
  () => postService.getPosts({ status: 'active', limit: 20 }),
  { expectedDocs: 20 }
)

// 성능 리포트 조회
const report = queryOptimizer.getPerformanceReport('getPosts-active')
console.log('평균 실행 시간:', report.averageExecutionTime, 'ms')
console.log('캐시 히트율:', report.cacheHitRate, '%')
console.log('총 비용:', report.totalCost, '읽기')

// 느린 쿼리 확인
if (report.slowQueries.length > 0) {
  console.warn('느린 쿼리 감지:', report.slowQueries)
}
```

### 페이지네이션 검증

```typescript
// 페이지네이션 설정 검증
const validation = queryOptimizer.validatePaginationQuery(50, lastDoc)
if (!validation.isOptimal) {
  console.warn('페이지네이션 최적화 필요:', validation.recommendations)
}

// 복합 쿼리 검증
const queryValidation = queryOptimizer.validateCompositeQuery([
  { field: 'status', operator: '==', value: 'active' },
  { field: 'organizationId', operator: '==', value: 'org123' },
  { field: 'createdAt', operator: '>', value: yesterday }
])

if (queryValidation.needsIndex) {
  console.log('인덱스 추천:', queryValidation.recommendedIndex)
}
```

## 인덱스 활용

### 권장 인덱스 확인

```typescript
// 게시글 관련 인덱스 힌트
const postIndexes = queryOptimizer.getIndexHints('posts')
console.log('권장 인덱스:', postIndexes)

// 특정 쿼리 타입의 인덱스
const searchIndexes = queryOptimizer.getIndexHints('posts', '검색')
console.log('검색 최적화 인덱스:', searchIndexes)
```

### 인덱스 활용 쿼리 예제

```typescript
// ✅ 최적화됨: status + createdAt 복합 인덱스 사용
const optimizedQuery = await postService.getPosts({
  status: 'active',
  orderBy: 'createdAt',
  orderDirection: 'desc'
})

// ✅ 최적화됨: organizationId + createdAt 복합 인덱스 사용
const orgQuery = await postService.getPostsByOrganization('org123', {
  orderBy: 'createdAt',
  orderDirection: 'desc'
})

// ✅ 최적화됨: tags(array-contains) + status + createdAt 복합 인덱스 사용
const tagQuery = await postService.getPostsByTag('뮤지컬', {
  status: 'active'
})

// ✅ 최적화됨: status + viewCount 복합 인덱스 사용
const popularQuery = await postService.getPopularPosts({
  status: 'active'
})
```

## 배치 처리

### 대량 데이터 처리

```typescript
import { batchProcessor } from '@/services/firestore/queryOptimization'
import firestore from '@react-native-firebase/firestore'

const processor = batchProcessor(firestore())

// 대량 게시글 ID로 배치 조회
const postIds = ['post1', 'post2', 'post3', ...] // 100개 이상
const posts = await processor.processBatch(
  postIds,
  async (batch) => {
    return await postService.getBatchPosts(batch)
  },
  {
    batchSize: 10,      // Firestore 'in' 쿼리 제한 고려
    maxConcurrency: 3,  // 동시 처리 제한
    retryAttempts: 3    // 재시도 횟수
  }
)

// 배치 쓰기 작업
const operations = [
  {
    type: 'update' as const,
    ref: firestore().collection('posts').doc('post1'),
    data: { viewCount: firestore.FieldValue.increment(1) }
  },
  {
    type: 'update' as const,
    ref: firestore().collection('posts').doc('post2'),
    data: { viewCount: firestore.FieldValue.increment(1) }
  }
  // ... 더 많은 작업
]

await processor.batchWrite(operations)
```

## 에러 처리

### 견고한 에러 처리

```typescript
try {
  const posts = await postService.getPosts({ limit: 20 })
  // 성공 처리
} catch (error) {
  if (error.message.includes('permission-denied')) {
    // 권한 오류 처리
    showPermissionError()
  } else if (error.message.includes('unavailable')) {
    // 서비스 불가 처리
    showServiceUnavailableError()
  } else {
    // 일반 오류 처리
    showGenericError(error.message)
  }
}

// 재시도 로직
async function fetchPostsWithRetry(maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await postService.getPosts({ limit: 20 })
    } catch (error) {
      if (attempt === maxRetries) throw error
      
      const delay = 1000 * Math.pow(2, attempt - 1) // 지수 백오프
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}
```

## 모범 사례 요약

### DO ✅

1. **페이지네이션 사용**: 대량 데이터 조회시 항상 페이지네이션 적용
2. **인덱스 활용**: 복합 쿼리는 적절한 인덱스 생성
3. **캐시 활용**: 읽기 전용 데이터는 캐시 사용
4. **실시간 구독 최적화**: 필요한 데이터만 구독하고 적절한 limit 설정
5. **에러 처리**: 모든 비동기 작업에 try-catch 적용
6. **성능 모니터링**: 주요 쿼리의 성능 추적

### DON'T ❌

1. **대량 데이터 한번에 조회**: limit 없이 .get() 사용 금지
2. **과도한 실시간 구독**: 불필요한 리스너 생성 금지
3. **캐시 무시**: 동일한 데이터 반복 조회 금지
4. **인덱스 없는 복합 쿼리**: 성능 저하 원인
5. **구독 해제 누락**: 메모리 누수 원인
6. **에러 처리 생략**: 앱 크래시 원인

이 가이드를 따르면 Firebase Firestore를 효율적으로 사용할 수 있으며, 앱의 성능과 사용자 경험을 크게 향상시킬 수 있습니다.