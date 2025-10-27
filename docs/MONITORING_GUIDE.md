# Monitoring System Guide

Comprehensive monitoring and performance tracking system for the Firebase React Native application.

## Overview

The monitoring system provides three layers of observability:

1. **Performance Monitoring** - Track query performance, API calls, and UI operations
2. **Business Metrics** - Track user engagement, conversions, and business KPIs
3. **Notification Tracking** - Monitor push notification delivery and engagement

## Quick Start

### Initialize Monitoring

```typescript
import { initializeMonitoring } from '@/services/monitoring'

// In your App.tsx or root component
useEffect(() => {
  initializeMonitoring()
}, [])
```

### Basic Usage

```typescript
import {
  performanceMonitor,
  businessMetricsCollector,
  notificationPerformanceTracker
} from '@/services/monitoring'

// Track a query operation
const posts = await performanceMonitor.trackQuery(
  'getPosts',
  () => postService.getPosts(20)
)

// Track user interaction
businessMetricsCollector.trackInteraction('post_viewed', { postId: '123' })

// Track notification sent
notificationPerformanceTracker.trackNotificationSent(
  'notif-123',
  'application_received'
)
```

## Performance Monitoring

### Track Operations

```typescript
// Track any async operation
const result = await performanceMonitor.trackOperation(
  'api', // category: 'query' | 'notification' | 'business' | 'api' | 'ui'
  'fetchUserProfile',
  async () => {
    return await api.getUserProfile(userId)
  },
  { userId } // optional metadata
)
```

### Track Firestore Queries

```typescript
// Automatically tracks execution time, cache hits, and costs
const posts = await performanceMonitor.trackQuery(
  'getPosts',
  () => postService.getPosts(20),
  { cacheHit: false, expectedDocs: 20 }
)
```

### Get Performance Reports

```typescript
// Get summary for all operations
const summary = performanceMonitor.getPerformanceSummary()

// Get summary for specific category
const querySummary = performanceMonitor.getPerformanceSummary('query')

// Get summary for time window (last hour)
const recentSummary = performanceMonitor.getPerformanceSummary(
  undefined,
  3600000
)

// Get query-specific report
const queryReport = performanceMonitor.getQueryPerformanceReport('getPosts')

// Generate full report
const report = performanceMonitor.generateMonitoringReport()
console.log(report)
```

## Business Metrics Collection

### Track User Engagement

```typescript
// Track session
businessMetricsCollector.startSession()
businessMetricsCollector.endSession()

// Track screen views
businessMetricsCollector.trackScreenView('HomeScreen')
businessMetricsCollector.trackScreenView('PostDetailScreen')

// Track interactions
businessMetricsCollector.trackInteraction('button_clicked', {
  buttonName: 'apply_now'
})

businessMetricsCollector.trackInteraction('search_performed', {
  query: 'react developer'
})
```

### Track Post Performance

```typescript
// Track post view
businessMetricsCollector.trackPostView('post-123', {
  title: 'React Developer Position'
})

// Track application submission
businessMetricsCollector.trackApplicationSubmission(
  'post-123',
  300000, // time to apply (ms)
  { fromScreen: 'PostDetail' }
)

// Track application status
businessMetricsCollector.trackApplicationStatusChange('accepted', {
  postId: 'post-123',
  applicantId: 'user-456'
})
```

### Track Notifications

```typescript
// Track notification sent
businessMetricsCollector.trackNotificationSent(
  'application_received',
  1,
  { postId: 'post-123' }
)

// Track notification delivered
businessMetricsCollector.trackNotificationDelivered('notif-123')

// Track notification opened
businessMetricsCollector.trackNotificationOpened(
  'notif-123',
  5000, // time to open (ms)
  { fromScreen: 'NotificationList' }
)
```

### Get Business Metrics

```typescript
// Get user engagement metrics
const engagement = businessMetricsCollector.getUserEngagementMetrics()
console.log('Session duration:', engagement.sessionDuration)
console.log('Screen views:', engagement.screenViews)

// Get post performance
const postMetrics = businessMetricsCollector.getPostPerformanceMetrics()
postMetrics.forEach(post => {
  console.log(`Post ${post.postId}: ${post.conversionRate}% conversion`)
})

// Get application metrics
const appMetrics = businessMetricsCollector.getApplicationMetricsSummary()
console.log('Acceptance rate:', appMetrics.acceptanceRate)

// Get notification effectiveness
const notifMetrics = businessMetricsCollector.getNotificationEffectivenessMetrics()
console.log('Open rate:', notifMetrics.openRate)

// Generate business report
const report = businessMetricsCollector.generateBusinessMetricsReport()
console.log(report)
```

## Notification Performance Tracking

### Track Notification Lifecycle

```typescript
const notificationId = 'notif-123'

// 1. Track sent
notificationPerformanceTracker.trackNotificationSent(
  notificationId,
  'application_received',
  { userId: 'user-456' }
)

// 2. Track delivered (called when FCM confirms delivery)
notificationPerformanceTracker.trackNotificationDelivered(
  notificationId,
  { platform: 'ios' }
)

// 3. Track opened (called when user taps notification)
notificationPerformanceTracker.trackNotificationOpened(
  notificationId,
  { fromScreen: 'Background' }
)

// Or track dismissed
notificationPerformanceTracker.trackNotificationDismissed(notificationId)

// Track failure
notificationPerformanceTracker.trackNotificationFailed(
  notificationId,
  'Token invalid'
)
```

### Track Batch Notifications

```typescript
// Track batch notification sent to multiple recipients
notificationPerformanceTracker.trackBatchNotificationSent(
  'post_status_changed',
  150, // recipient count
  { postId: 'post-123' }
)
```

### Get Notification Performance

```typescript
// Get performance summary
const summary = notificationPerformanceTracker.getPerformanceSummary()
console.log('Delivery rate:', summary.deliveryRate)
console.log('Open rate:', summary.openRate)

// Get specific notification metrics
const metrics = notificationPerformanceTracker.getNotificationMetrics('notif-123')
console.log('Delivery time:', metrics?.deliveryTime)

// Generate performance report
const report = notificationPerformanceTracker.generatePerformanceReport()
console.log(report)
```

## Integration Examples

### With PostService

```typescript
// app/services/firestore/postService.ts
import { performanceMonitor, businessMetricsCollector } from '@/services/monitoring'

class PostService {
  async getPosts(limit: number = 20): Promise<Post[]> {
    // Track query performance
    return performanceMonitor.trackQuery(
      'getPosts',
      async () => {
        const posts = await this.db
          .collection('posts')
          .where('status', '==', 'active')
          .orderBy('createdAt', 'desc')
          .limit(limit)
          .get()

        return posts.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post))
      },
      { expectedDocs: limit }
    )
  }

  async createPost(postData: CreatePost): Promise<string> {
    return performanceMonitor.trackOperation(
      'query',
      'createPost',
      async () => {
        const docRef = await this.db.collection('posts').add(postData)

        // Track business metric
        businessMetricsCollector.trackInteraction('post_created', {
          postId: docRef.id
        })

        return docRef.id
      }
    )
  }
}
```

### With NotificationService

```typescript
// app/services/firestore/notificationService.ts
import { notificationPerformanceTracker } from '@/services/monitoring'

class NotificationService {
  async notifyApplicationReceived(params: NotificationParams): Promise<void> {
    const notificationId = `notif-${Date.now()}`

    // Track notification sent
    notificationPerformanceTracker.trackNotificationSent(
      notificationId,
      'application_received',
      { organizerId: params.organizerId }
    )

    await this.createNotification({
      id: notificationId,
      ...params
    })
  }
}
```

### With PushNotificationService

```typescript
// app/utils/pushNotificationService.ts
import { notificationPerformanceTracker } from '@/services/monitoring'

class PushNotificationService {
  onForegroundMessage(): () => void {
    return messaging().onMessage(async (remoteMessage) => {
      const notificationId = remoteMessage.messageId || `notif-${Date.now()}`

      // Track delivery
      notificationPerformanceTracker.trackNotificationDelivered(notificationId)

      // Show notification
      this.showForegroundNotification(remoteMessage)
    })
  }

  onNotificationOpenedApp(): () => void {
    return messaging().onNotificationOpenedApp((remoteMessage) => {
      const notificationId = remoteMessage.messageId || ''

      // Track opened
      notificationPerformanceTracker.trackNotificationOpened(notificationId)

      // Handle navigation
      this.handleNotificationOpen(remoteMessage)
    })
  }
}
```

### With Screen Components

```typescript
// app/screens/PostDetailScreen.tsx
import { businessMetricsCollector } from '@/services/monitoring'

function PostDetailScreen({ route }) {
  const { postId } = route.params

  useEffect(() => {
    // Track screen view
    businessMetricsCollector.trackScreenView('PostDetailScreen')

    // Track post view
    businessMetricsCollector.trackPostView(postId)
  }, [postId])

  const handleApply = async () => {
    const startTime = Date.now()

    // Track interaction
    businessMetricsCollector.trackInteraction('apply_button_clicked', {
      postId
    })

    await applicationService.createApplication(postId)

    // Track application submission with time
    businessMetricsCollector.trackApplicationSubmission(
      postId,
      Date.now() - startTime
    )
  }

  return (
    <View>
      <Button onPress={handleApply}>Apply Now</Button>
    </View>
  )
}
```

## Comprehensive Reporting

### Generate All Reports

```typescript
import { generateComprehensiveReport } from '@/services/monitoring'

// Generate report for last hour
const report = generateComprehensiveReport(3600000)
console.log(report)

// Generate full report
const fullReport = generateComprehensiveReport()
console.log(fullReport)
```

### Export Data

```typescript
import { exportAllMonitoringData } from '@/services/monitoring'

// Export all monitoring data
const data = exportAllMonitoringData(3600000)

// Send to analytics service
await analyticsService.sendData(data)

// Or save locally
await FileSystem.writeAsStringAsync(
  'monitoring-data.json',
  JSON.stringify(data, null, 2)
)
```

### Clear Data

```typescript
import { clearAllMonitoringData } from '@/services/monitoring'

// Clear all monitoring data
clearAllMonitoringData()
```

## Configuration

### Custom Configuration

```typescript
import { getMonitoringConfig } from '@/services/monitoring/config'

const config = getMonitoringConfig()

// Customize thresholds
config.slowOperationThreshold = 3000 // 3 seconds
config.maxMetricsHistory = 10000
```

### Alert Thresholds

```typescript
import { defaultAlertThresholds } from '@/services/monitoring/config'

// Check if metrics exceed thresholds
const summary = performanceMonitor.getPerformanceSummary()

if (summary.successRate < (100 - defaultAlertThresholds.maxFailureRate)) {
  console.error('❌ Failure rate exceeded threshold!')
}

const notifSummary = notificationPerformanceTracker.getPerformanceSummary()

if (notifSummary.openRate < defaultAlertThresholds.minNotificationOpenRate) {
  console.warn('⚠️ Notification open rate below threshold!')
}
```

## Best Practices

### 1. Track at Service Boundaries

```typescript
// ✅ Good - Track at service level
class PostService {
  async getPosts() {
    return performanceMonitor.trackQuery('getPosts', async () => {
      // Query logic
    })
  }
}

// ❌ Bad - Don't track in components directly
function PostList() {
  const posts = await performanceMonitor.trackQuery(/* ... */)
}
```

### 2. Use Meaningful Operation Names

```typescript
// ✅ Good - Descriptive names
performanceMonitor.trackOperation('api', 'fetchUserProfile', ...)
performanceMonitor.trackOperation('query', 'getActivePostsByOrg', ...)

// ❌ Bad - Generic names
performanceMonitor.trackOperation('api', 'fetch', ...)
performanceMonitor.trackOperation('query', 'query1', ...)
```

### 3. Include Relevant Metadata

```typescript
// ✅ Good - Include context
businessMetricsCollector.trackInteraction('search', {
  query: searchQuery,
  resultCount: results.length,
  screen: 'PostList'
})

// ❌ Bad - Missing context
businessMetricsCollector.trackInteraction('search')
```

### 4. Regular Report Generation

```typescript
// Set up periodic reporting in development
if (__DEV__) {
  setInterval(() => {
    const report = generateComprehensiveReport(3600000)
    console.log(report)
  }, 300000) // Every 5 minutes
}
```

### 5. Clean Up Old Data

```typescript
// Periodically clear old data
useEffect(() => {
  const interval = setInterval(() => {
    clearAllMonitoringData()
  }, 86400000) // Daily

  return () => clearInterval(interval)
}, [])
```

## Performance Impact

The monitoring system is designed to be lightweight:

- **Memory**: ~5MB for 5000 metrics
- **CPU**: <1% overhead for tracking operations
- **Network**: Zero (all data stored locally)

In production, consider:
- Reducing `maxMetricsHistory` to 3000
- Disabling debug logging
- Using sampling for high-frequency operations

## Troubleshooting

### High Memory Usage

```typescript
// Reduce metrics history
config.maxMetricsHistory = 2000

// Clear data more frequently
clearAllMonitoringData()
```

### Missing Metrics

```typescript
// Verify monitoring is initialized
initializeMonitoring()

// Check if tracking is enabled
console.log(config.enablePerformanceMonitoring)
console.log(config.enableBusinessMetrics)
```

### Slow Performance

```typescript
// Disable debug logging in production
config.enableDebugLogging = false

// Use sampling for high-frequency operations
if (Math.random() < 0.1) { // 10% sample rate
  performanceMonitor.trackOperation(...)
}
```

## Integration with QueryPerformanceMonitor

The monitoring system integrates with the existing `QueryPerformanceMonitor`:

```typescript
import { queryOptimizer } from '@/services/firestore/queryOptimization'
import { performanceMonitor } from '@/services/monitoring'

// Use QueryPerformanceMonitor directly
await queryOptimizer.monitorQuery('getPosts', async () => {
  // Query logic
})

// Or use PerformanceMonitor (which uses QueryPerformanceMonitor internally)
await performanceMonitor.trackQuery('getPosts', async () => {
  // Query logic
})

// Get combined reports
const queryReport = performanceMonitor.getQueryPerformanceReport()
const fullReport = performanceMonitor.generateMonitoringReport()
```

## Next Steps

1. Integrate monitoring into all service methods
2. Add monitoring to screen components for user flow tracking
3. Set up automated alerting based on thresholds
4. Export data to external analytics services
5. Create monitoring dashboard UI component

## Support

For issues or questions:
- Check console logs for monitoring events
- Review generated reports for anomalies
- Export data for detailed analysis
- Adjust configuration for your needs
