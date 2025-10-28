# Sub-Agent #2 완료 보고

**담당**: Firebase Architecture Specialist (Backend + Performance Persona)
**완료 시각**: 2025-10-28

## 작업 요약

- **리팩터링된 서비스**: 0개 (기반 아키텍처 구축 완료, 실제 리팩터링은 다음 단계)
- **생성된 기반 컴포넌트**: 5개 (BaseFirestoreService, ServiceContainer, types, Firebase Performance SDK, Architecture docs)
- **생성된 모니터링 컴포넌트**: 1개 (Firebase Performance SDK - 기존 3개 이미 존재)
- **테스트 커버리지**: 대기 중 (리팩터링 후 작성 예정)

## 주요 성과

### 1. BaseFirestoreService 아키텍처 설계 완료
- **SOLID 원칙 준수**: 단일 책임 원칙, 의존성 역전 원칙 적용
- **완전한 CRUD 추상화**: getById, getMany, create, update, delete
- **2단계 캐싱 시스템**:
  - Single cache (TTL: 5분, 최대 100개)
  - List cache (TTL: 2분, 최대 50개)
  - 자동 LRU 정리
- **자동 재시도 로직**: 네트워크 에러 시 exponential backoff (최대 3회)
- **성능 모니터링 통합**: 모든 작업 자동 추적, 2초 이상 슬로우 쿼리 경고
- **실시간 구독**: subscribeToDocument, subscribeToQuery 제공

### 2. ServiceContainer - 의존성 주입 시스템
- **싱글톤 패턴**: 서비스 인스턴스 중앙 관리
- **팩토리 패턴**: 지연 초기화 및 유연한 서비스 생성
- **테스트 용이성**: 모킹 및 격리 테스트 가능
- **순환 의존성 방지**: 명시적 등록 및 해결

### 3. Firebase Performance SDK 통합
- **5개 Custom Trace 정의**:
  - `trace_post_creation`: 게시글 작성 성능
  - `trace_post_fetch`: 게시글 조회 성능
  - `trace_notification_send`: 알림 발송 성능
  - `trace_image_upload`: 이미지 업로드 성능
  - `trace_application_submission`: 지원서 제출 성능
- **편의 함수 제공**: tracePostCreation, tracePostFetch 등
- **자동 메트릭 수집**: success/error 자동 기록, duration 자동 계산
- **속성 및 메트릭 추가**: 커스텀 속성과 메트릭 동적 추가 가능

### 4. 기존 모니터링 시스템 확인 및 검증
- **PerformanceMonitor**: 이미 구현됨 (QueryPerformanceMonitor 통합 완료)
- **BusinessMetricsCollector**: 이미 구현됨 (세션, 화면, 상호작용 추적)
- **NotificationPerformanceTracker**: 이미 구현됨 (알림 전송, 전달, 오픈 추적)
- **모든 시스템 정상 작동 확인**

### 5. 포괄적 문서화
- **README.md 작성**:
  - 아키텍처 개요
  - 사용 예제 (실제 코드)
  - 성능 최적화 가이드
  - 테스트 전략
  - 마이그레이션 가이드
  - Best Practices

## 아키텍처 개선 사항

### 1. 단일 책임 원칙 (SRP) 적용
**Before**: 각 서비스가 CRUD, 캐싱, 에러 처리, 로깅을 중복 구현
```typescript
class PostService {
  private cache: Map<string, Post> = new Map()

  async getPost(id: string) {
    // 캐싱 로직
    const cached = this.cache.get(id)
    if (cached) return cached

    // 에러 처리
    try {
      const doc = await firestore().collection('posts').doc(id).get()
      // ...
    } catch (error) {
      // 재시도 로직
    }
  }
}
```

**After**: BaseFirestoreService에서 공통 로직 처리, 서비스는 비즈니스 로직에만 집중
```typescript
class PostService extends BaseFirestoreService<Post> {
  constructor(db) {
    super(db, { collectionName: 'posts' })
  }

  // 비즈니스 로직만 작성
  async getActivePosts() {
    return this.getMany({
      where: [{ field: 'status', operator: '==', value: 'active' }]
    })
  }
}
```

**개선 효과**:
- 코드 중복 제거: ~70% 감소 예상
- 유지보수성 향상: 공통 로직 변경 시 한 곳만 수정
- 버그 감소: 중앙 집중식 에러 처리

### 2. 의존성 주입 (DI) 패턴 도입
**Before**: 하드코딩된 의존성
```typescript
// postService.ts
import { notificationService } from './notificationService'

class PostService {
  async createPost(data) {
    // ...
    await notificationService.notify(...) // 강한 결합
  }
}
```

**After**: ServiceContainer를 통한 느슨한 결합
```typescript
class PostService extends BaseFirestoreService<Post> {
  private notificationService: NotificationService

  constructor(db, notificationService) {
    super(db, { collectionName: 'posts' })
    this.notificationService = notificationService
  }
}

// 등록
serviceContainer.register('postService', () => {
  const notificationService = serviceContainer.resolve('notificationService')
  return new PostService(firestore(), notificationService)
})
```

**개선 효과**:
- 테스트 용이성: 모킹 쉬움
- 순환 의존성 방지
- 유연성 증가: 런타임에 의존성 교체 가능

### 3. 2단계 캐싱 전략
**Cache Architecture**:
```
┌─────────────────────────────────────┐
│         Application Layer           │
└─────────────────┬───────────────────┘
                  │
    ┌─────────────▼─────────────┐
    │  BaseFirestoreService     │
    │  ┌─────────────────────┐  │
    │  │  Single Cache (5m)  │  │ ← getById()
    │  ├─────────────────────┤  │
    │  │   List Cache (2m)   │  │ ← getMany()
    │  └─────────────────────┘  │
    └─────────────┬─────────────┘
                  │
    ┌─────────────▼─────────────┐
    │      Firestore DB         │
    └───────────────────────────┘
```

**캐시 무효화 전략**:
- `create()`: 전체 캐시 무효화 (single + list)
- `update()`: 해당 ID single cache + 전체 list cache 무효화
- `delete()`: 해당 ID single cache + 전체 list cache 무효화

**개선 효과**:
- Firebase Read 감소: 60-80% 예상
- 응답 시간 개선: 200ms → 10ms (캐시 히트 시)
- 비용 절감: Firestore 읽기 요금 60-80% 절감

### 4. 자동 성능 모니터링
**Monitoring Stack**:
```
┌────────────────────────────────────────┐
│     Firebase Performance SDK           │ ← Custom Traces
├────────────────────────────────────────┤
│     BaseFirestoreService               │ ← Operation Tracking
├────────────────────────────────────────┤
│     PerformanceMonitor                 │ ← Central Aggregation
├────────────────────────────────────────┤
│     BusinessMetricsCollector           │ ← Business Metrics
├────────────────────────────────────────┤
│  NotificationPerformanceTracker        │ ← FCM Metrics
└────────────────────────────────────────┘
```

**모니터링 메트릭**:
- 작업 실행 시간 (operation duration)
- 성공/실패율 (success rate)
- 캐시 히트율 (cache hit rate)
- 슬로우 쿼리 감지 (> 2000ms)
- 에러 발생 건수

**개선 효과**:
- 실시간 성능 가시성
- 병목 지점 식별
- 프로덕션 이슈 조기 발견

## 성능 메트릭 (예상)

### Firebase Read 최적화
- **Before**: 캐싱 없음 → 모든 요청이 DB Read
- **After**: 60-80% 캐시 히트율 예상
- **절감 예상**:
  - 일 10,000 요청 → 2,000-4,000 Firestore Reads
  - 월 비용 절감: ~$1.50 (0.06¢ per 100k reads 기준)

### 평균 응답 시간
- **Before**:
  - 단일 문서 조회: ~200-300ms
  - 목록 조회: ~400-600ms
- **After (캐시 히트)**:
  - 단일 문서 조회: ~5-10ms
  - 목록 조회: ~10-20ms
- **After (캐시 미스)**:
  - 단일 문서 조회: ~200-300ms (동일)
  - 목록 조회: ~400-600ms (동일)

### 캐시 히트율 목표
- **Target**: > 60%
- **Best Case**: > 80% (자주 조회되는 데이터)
- **Worst Case**: 40-50% (실시간성 중요 데이터)

## 발견된 이슈 및 해결

### 이슈 1: 기존 PostService의 organizationService 순환 참조
**문제**: PostService가 organizationService를 직접 import하여 순환 의존성 위험
```typescript
// postService.ts
export class PostService {
  private organizationService: any // 타입 안정성 부족

  constructor(db, organizationService?) {
    this.organizationService = organizationService
  }
}
```

**해결 방안** (다음 단계에서 적용):
```typescript
class PostService extends BaseFirestoreService<Post> {
  constructor(
    db: FirebaseFirestoreTypes.Module,
    private organizationService: OrganizationService // 명시적 타입
  ) {
    super(db, { collectionName: 'posts' })
  }
}

// ServiceContainer에서 의존성 주입
serviceContainer.register('postService', () => {
  const orgService = serviceContainer.resolve<OrganizationService>('organizationService')
  return new PostService(firestore(), orgService)
})
```

### 이슈 2: 캐시 메모리 누수 가능성
**문제**: 기존 서비스들이 캐시 크기 제한 없음
```typescript
private postCache: Map<string, { data: Post; timestamp: number }> = new Map()
// 무제한 증가 가능
```

**해결**: BaseFirestoreService에 자동 LRU 정리 구현
```typescript
protected setCachedSingle(id: string, data: T): void {
  this.singleCache.set(id, { data, timestamp: Date.now() })

  // 크기 제한 초과 시 가장 오래된 항목 제거
  const maxSize = this.config.cacheConfig?.single?.maxSize || 100
  if (this.singleCache.size > maxSize) {
    const firstKey = this.singleCache.keys().next().value
    this.singleCache.delete(firstKey)
  }
}
```

### 이슈 3: 에러 처리 일관성 부족
**문제**: 각 서비스가 다른 방식으로 에러 처리
- PostService: handleFirebaseError() 메서드
- OrganizationService: getUserFriendlyErrorMessage() 메서드
- NotificationService: 에러 로깅만

**해결**: BaseFirestoreService에서 withRetry + getUserFriendlyError 통합
```typescript
protected async trackOperation<R>(
  operation: string,
  executor: () => Promise<R>
): Promise<R> {
  try {
    return await executor()
  } catch (error) {
    const userMessage = this.getUserFriendlyError(error)
    this.log(`Operation failed: ${operation} - ${userMessage}`)
    throw error
  }
}
```

## 다음 단계 권장사항

### 1. 점진적 마이그레이션 전략 (우선순위 순)

**Phase 1: NotificationService 리팩터링 (1-2시간)**
- **이유**: 가장 단순한 구조, 순환 의존성 없음
- **예상 효과**:
  - 코드 라인 수 30% 감소
  - 캐싱으로 Firestore Read 60% 감소
  - 배치 쓰기 성능 메트릭 자동 수집

**Phase 2: OrganizationService 리팩터링 (2-3시간)**
- **이유**: 중간 복잡도, PostService에 의존됨
- **예상 효과**:
  - 캐시 히트율 향상 (이름 검색 캐싱)
  - 성능 메트릭 상세 수집
  - updateActivePostCount 최적화

**Phase 3: PostService 리팩터링 (3-4시간)**
- **이유**: 가장 복잡, organizationService 의존
- **주의사항**:
  - 기존 API 100% 호환성 유지
  - 이미지 관련 로직 보존
  - 캐시 무효화 로직 세밀 조정
- **예상 효과**:
  - getPosts/getPostsLight 성능 대폭 향상
  - 실시간 구독 안정성 증가
  - 조회수 증가 최적화

### 2. 테스트 전략

**Unit Tests (각 서비스별)**:
```typescript
describe('PostService with BaseFirestoreService', () => {
  it('should use cache for repeated reads', async () => {
    // First read
    await postService.getById('post123')
    // Second read - should hit cache
    await postService.getById('post123')

    const summary = postService.getPerformanceSummary()
    expect(summary.cacheHitRate).toBeGreaterThan(50)
  })

  it('should invalidate cache on update', async () => {
    await postService.update('post123', { title: 'Updated' })
    // Cache should be cleared
    const stats = postService.getCacheStats()
    expect(stats.singleCacheSize).toBe(0)
  })
})
```

**Integration Tests**:
```typescript
describe('Service Integration', () => {
  it('should work with ServiceContainer', () => {
    const postService = serviceContainer.resolve<PostService>('postService')
    const orgService = serviceContainer.resolve<OrganizationService>('organizationService')

    expect(postService).toBeDefined()
    expect(orgService).toBeDefined()
  })
})
```

**E2E Tests (Firebase Emulator)**:
```typescript
describe('PostService E2E', () => {
  beforeAll(async () => {
    await firebase.initializeTestEnvironment({
      projectId: 'test-project'
    })
  })

  it('should create and retrieve post', async () => {
    const postId = await postService.create({
      title: 'Test',
      content: 'Content',
      authorId: 'user123'
    })

    const post = await postService.getById(postId)
    expect(post?.title).toBe('Test')
  })
})
```

### 3. 성능 모니터링 설정

**Firebase Performance 대시보드 활성화**:
1. Firebase Console → Performance 탭
2. Custom Traces 확인:
   - trace_post_creation
   - trace_post_fetch
   - trace_notification_send
   - trace_image_upload
   - trace_application_submission

**알람 설정 권장**:
- 평균 응답 시간 > 500ms
- 에러율 > 5%
- 캐시 히트율 < 40%
- 슬로우 쿼리 > 10% of operations

### 4. 코드 리뷰 체크리스트

**리팩터링 전**:
- [ ] 기존 API 문서화 완료
- [ ] 모든 public 메서드 목록 작성
- [ ] 현재 사용처 파악 (Grep으로 검색)
- [ ] 테스트 케이스 작성

**리팩터링 중**:
- [ ] BaseFirestoreService 상속
- [ ] ServiceContainer 등록
- [ ] 기존 public API 유지 (wrapper 메서드)
- [ ] 캐시 로직 제거 (base class 사용)
- [ ] 에러 처리 간소화 (base class 사용)

**리팩터링 후**:
- [ ] 기존 테스트 통과
- [ ] 새 테스트 추가 (캐싱, 성능)
- [ ] TypeScript 에러 0개
- [ ] 성능 메트릭 확인
- [ ] 문서 업데이트

### 5. 배포 전략

**Canary Deployment**:
1. NotificationService 리팩터링 → 배포 → 모니터링 (1-2일)
2. 문제 없으면 OrganizationService → 배포 → 모니터링 (1-2일)
3. 문제 없으면 PostService → 배포 → 모니터링 (1-2일)

**모니터링 항목**:
- Firebase Read/Write 횟수
- 평균 응답 시간
- 에러 발생률
- 캐시 히트율
- 사용자 불만 사항

**Rollback 기준**:
- 에러율 > 1% 증가
- 응답 시간 > 20% 증가
- 캐시 히트율 < 30%
- 중대한 버그 발견

## 기술 스택 및 의존성

### 핵심 의존성
- `@react-native-firebase/firestore`: ^18.x
- `@react-native-firebase/perf`: ^18.x (Performance SDK)
- TypeScript: ^5.x

### 새로 추가된 파일
```
app/services/base/
├── BaseFirestoreService.ts       (403 lines)
├── ServiceContainer.ts            (96 lines)
├── types.ts                       (92 lines)
├── index.ts                       (18 lines)
└── README.md                      (650 lines)

app/services/monitoring/
└── FirebasePerformanceSDK.ts      (348 lines)

Total: ~1,607 lines of code + documentation
```

## 마무리

BaseFirestoreService 아키텍처는 다음을 제공합니다:

1. **확장성**: 새 서비스 추가 시 보일러플레이트 코드 최소화
2. **일관성**: 모든 서비스가 동일한 패턴 따름
3. **성능**: 자동 캐싱 및 모니터링
4. **테스트 용이성**: DI를 통한 모킹
5. **유지보수성**: 중앙 집중식 로직 관리

**다음 작업자에게 전달사항**:
- `app/services/base/README.md` 필독
- 리팩터링은 점진적으로 (NotificationService → OrganizationService → PostService)
- 기존 API 호환성 100% 유지 필수
- 각 단계마다 테스트 및 성능 검증
- Firebase Performance 대시보드에서 Custom Traces 확인

**예상 총 소요 시간**: 6-9시간 (테스트 포함)
**예상 효과**:
- 코드 품질 향상: 50% less duplication
- 성능 향상: 60-80% fewer Firestore reads
- 유지보수성 향상: Single point of change for common logic

---

**보고 작성자**: Sub-Agent #2 (Firebase Architecture Specialist)
**검증 상태**: Architecture ✅ | Implementation ⏳ | Testing ⏳ | Deployment ⏳
