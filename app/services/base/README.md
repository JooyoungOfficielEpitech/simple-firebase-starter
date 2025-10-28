# Base Service Layer Architecture

## Overview

The Base Service Layer provides a unified foundation for all Firebase Firestore services in the application. It implements:

- **Single Responsibility Principle**: Each service handles one domain
- **Dependency Injection**: Services are managed through ServiceContainer
- **Caching Strategy**: Intelligent caching with configurable TTL
- **Error Handling**: Automatic retry with exponential backoff
- **Performance Monitoring**: Integrated with Firebase Performance SDK
- **Type Safety**: Full TypeScript support

## Architecture

```
app/services/
├── base/
│   ├── BaseFirestoreService.ts    # Abstract base class
│   ├── ServiceContainer.ts         # DI container
│   ├── types.ts                    # Shared types
│   └── index.ts                    # Public exports
├── firestore/
│   ├── postService.ts             # Extends BaseFirestoreService
│   ├── organizationService.ts     # Extends BaseFirestoreService
│   └── notificationService.ts     # Extends BaseFirestoreService
└── monitoring/
    ├── PerformanceMonitor.ts
    ├── BusinessMetricsCollector.ts
    ├── NotificationPerformanceTracker.ts
    └── FirebasePerformanceSDK.ts
```

## BaseFirestoreService

### Core Features

#### 1. CRUD Operations
- `getById(id: string)`: Get single document with caching
- `getMany(options: QueryOptions)`: Get multiple documents with pagination
- `create(data: CreateDocument<T>)`: Create new document
- `update(id: string, data: UpdateDocument<T>)`: Update existing document
- `delete(id: string)`: Delete document

#### 2. Real-time Subscriptions
- `subscribeToDocument(id, callback)`: Subscribe to single document changes
- `subscribeToQuery(options, callback)`: Subscribe to query results

#### 3. Caching System

**Two-tier cache:**
- **Single cache**: Individual documents (default TTL: 5 minutes)
- **List cache**: Query results (default TTL: 2 minutes)

**Cache invalidation:**
- Automatic on create/update/delete operations
- Manual via `invalidateSingleCache()`, `invalidateListCache()`, `invalidateAllCaches()`

#### 4. Performance Tracking

All operations are automatically tracked with:
- Execution duration
- Success/failure status
- Cache hit/miss
- Custom metadata

Access metrics via `getPerformanceSummary()`:
```typescript
{
  totalOperations: number
  cacheHitRate: number
  averageDuration: number
  errorCount: number
  slowOperations: OperationMetrics[]
}
```

#### 5. Error Handling

Automatic retry with exponential backoff for:
- Network errors (`firestore/unavailable`, `firestore/deadline-exceeded`)
- Transient errors
- Configurable retry count (default: 3)

User-friendly error messages via `getUserFriendlyError()`

## ServiceContainer

### Dependency Injection Pattern

```typescript
import { serviceContainer } from '@/services/base'

// Register service
serviceContainer.register(
  'postService',
  () => new PostService(firestore()),
  { singleton: true }
)

// Resolve service
const postService = serviceContainer.resolve<PostService>('postService')
```

### Benefits

- **Testability**: Easy to mock services for testing
- **Lifecycle Management**: Singleton pattern for shared instances
- **Loose Coupling**: Services depend on abstractions, not implementations

## Usage Example

### Creating a New Service

```typescript
import { BaseFirestoreService, BaseDocument, CreateDocument, UpdateDocument } from '@/services/base'
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore'

// 1. Define your document type
interface Post extends BaseDocument {
  title: string
  content: string
  authorId: string
  status: 'active' | 'closed'
}

// 2. Extend BaseFirestoreService
export class PostService extends BaseFirestoreService<Post> {
  constructor(db: FirebaseFirestoreTypes.Module) {
    super(db, {
      collectionName: 'posts',
      cacheConfig: {
        single: { ttl: 5 * 60 * 1000 }, // 5 minutes
        list: { ttl: 2 * 60 * 1000 }    // 2 minutes
      },
      enablePerformanceTracking: true,
      enableLogging: true
    })
  }

  // 3. Add custom methods
  async getActivePosts(): Promise<Post[]> {
    const result = await this.getMany({
      where: [{ field: 'status', operator: '==', value: 'active' }],
      orderBy: { field: 'createdAt', direction: 'desc' },
      limit: 20
    })
    return result.data
  }

  async createPost(title: string, content: string, authorId: string): Promise<string> {
    return this.create({
      title,
      content,
      authorId,
      status: 'active'
    } as CreateDocument<Post>)
  }
}
```

### Using the Service

```typescript
import firestore from '@react-native-firebase/firestore'
import { PostService } from '@/services/firestore/postService'

const db = firestore()
const postService = new PostService(db)

// Create post
const postId = await postService.createPost('Hello', 'World', 'user123')

// Get post (uses cache if available)
const post = await postService.getById(postId)

// Get active posts with pagination
const { data, lastDoc, hasMore } = await postService.getMany({
  where: [{ field: 'status', operator: '==', value: 'active' }],
  limit: 20
})

// Subscribe to real-time updates
const unsubscribe = postService.subscribeToQuery(
  { where: [{ field: 'status', operator: '==', value: 'active' }] },
  (posts) => {
    console.log('Updated posts:', posts)
  }
)

// Clean up
unsubscribe()
```

## Performance Optimization

### Caching Strategy

1. **Read-Through Cache**: Check cache before database
2. **Write-Through Cache**: Invalidate on write operations
3. **TTL-based Expiration**: Automatic cleanup of stale data
4. **Size Limits**: Prevent memory exhaustion

### Query Optimization

1. **Server-side Filtering**: Use Firestore `where` clauses
2. **Pagination**: Limit results and use `startAfter`
3. **Composite Indexes**: Required for complex queries
4. **Denormalization**: Store frequently accessed data together

## Monitoring Integration

### Firebase Performance SDK

```typescript
import { firebasePerformance, tracePostCreation } from '@/services/monitoring'

// Automatic trace
const postId = await tracePostCreation(
  () => postService.create(postData),
  'announcement'
)

// Manual trace
await firebasePerformance.startTrace('trace_post_creation', {
  attributes: { postType: 'announcement' }
})
// ... operation ...
await firebasePerformance.stopTrace('trace_post_creation', {
  success: 1
})
```

### Performance Metrics

Access service-level metrics:
```typescript
const summary = postService.getPerformanceSummary()
console.log('Cache hit rate:', summary.cacheHitRate)
console.log('Average duration:', summary.averageDuration)
console.log('Error count:', summary.errorCount)
```

Access cache statistics:
```typescript
const stats = postService.getCacheStats()
console.log('Single cache size:', stats.singleCacheSize)
console.log('List cache size:', stats.listCacheSize)
```

## Testing

### Unit Testing

```typescript
import { PostService } from '@/services/firestore/postService'
import { MockFirestore } from '@/services/__tests__/mocks/firebase'

describe('PostService', () => {
  let service: PostService
  let mockDb: MockFirestore

  beforeEach(() => {
    mockDb = new MockFirestore()
    service = new PostService(mockDb as any)
  })

  afterEach(() => {
    service.reset() // Clear caches and metrics
  })

  it('should create post and invalidate cache', async () => {
    const postId = await service.create({
      title: 'Test',
      content: 'Content',
      authorId: 'user123',
      status: 'active'
    })

    expect(postId).toBeDefined()
    expect(mockDb.collection).toHaveBeenCalledWith('posts')
  })

  it('should use cache for repeated reads', async () => {
    const postId = 'post123'

    // First read - cache miss
    await service.getById(postId)

    // Second read - cache hit
    const post = await service.getById(postId)

    const summary = service.getPerformanceSummary()
    expect(summary.cacheHitRate).toBeGreaterThan(0)
  })
})
```

## Migration Guide

### Migrating Existing Services

1. **Preserve existing public API** - Don't break existing code
2. **Extend BaseFirestoreService** - Inherit common functionality
3. **Move caching logic** - Use built-in cache methods
4. **Update error handling** - Use `trackOperation` wrapper
5. **Test thoroughly** - Verify backward compatibility

Example:
```typescript
// Before
class PostService {
  private cache: Map<string, Post> = new Map()

  async getPost(id: string): Promise<Post | null> {
    // Custom caching logic
    const cached = this.cache.get(id)
    if (cached) return cached

    const doc = await firestore().collection('posts').doc(id).get()
    if (!doc.exists) return null

    const post = { id: doc.id, ...doc.data() } as Post
    this.cache.set(id, post)
    return post
  }
}

// After
class PostService extends BaseFirestoreService<Post> {
  constructor(db: FirebaseFirestoreTypes.Module) {
    super(db, { collectionName: 'posts' })
  }

  // Existing API preserved - just delegate to base class
  async getPost(id: string): Promise<Post | null> {
    return this.getById(id)
  }
}
```

## Best Practices

1. **Use TypeScript interfaces** - Define clear document types
2. **Validate input data** - Check before database operations
3. **Handle errors gracefully** - Use getUserFriendlyError()
4. **Monitor performance** - Check getPerformanceSummary() regularly
5. **Test with real Firebase** - Use emulator for integration tests
6. **Document custom methods** - Add JSDoc comments
7. **Follow naming conventions** - Use consistent method names
8. **Avoid circular dependencies** - Services should not depend on each other directly

## Performance Targets

- **Cache hit rate**: > 60%
- **Average query time**: < 200ms (cached) / < 500ms (uncached)
- **Error rate**: < 1%
- **Slow operations**: < 5% exceeding 2000ms

## Support

For questions or issues:
1. Check this documentation
2. Review BaseFirestoreService source code
3. Check monitoring metrics for performance issues
4. Create an issue with detailed logs and reproduction steps
