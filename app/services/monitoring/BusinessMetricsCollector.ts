/**
 * Business Metrics Collection System
 *
 * Tracks key business metrics for analytics and monitoring:
 * - User engagement metrics
 * - Post performance metrics
 * - Application conversion metrics
 * - Notification effectiveness metrics
 */

import { performanceMonitor } from './PerformanceMonitor'

export interface UserEngagementMetrics {
  activeUsers: number
  sessionDuration: number
  screenViews: Record<string, number>
  interactions: Record<string, number>
}

export interface PostPerformanceMetrics {
  postId: string
  views: number
  applications: number
  conversionRate: number
  averageTimeToApply: number
}

export interface ApplicationMetrics {
  totalApplications: number
  acceptedApplications: number
  rejectedApplications: number
  pendingApplications: number
  acceptanceRate: number
}

export interface NotificationEffectivenessMetrics {
  sent: number
  delivered: number
  opened: number
  openRate: number
  averageOpenTime: number
}

/**
 * Business Metrics Collector
 *
 * Collects and aggregates business-level metrics
 * for analytics and performance tracking
 */
export class BusinessMetricsCollector {
  private static instance: BusinessMetricsCollector

  private sessionStartTime: number = Date.now()
  private screenViews: Map<string, number> = new Map()
  private interactions: Map<string, number> = new Map()
  private postMetrics: Map<string, Partial<PostPerformanceMetrics>> = new Map()

  private constructor() {
    this.initializeCollector()
  }

  static getInstance(): BusinessMetricsCollector {
    if (!BusinessMetricsCollector.instance) {
      BusinessMetricsCollector.instance = new BusinessMetricsCollector()
    }
    return BusinessMetricsCollector.instance
  }

  private initializeCollector(): void {
    console.log('📊 [BusinessMetrics] Collector initialized')
  }

  /**
   * Track user session start
   */
  startSession(): void {
    this.sessionStartTime = Date.now()
    performanceMonitor.recordBusinessMetric('session_start', 1, {
      timestamp: this.sessionStartTime
    })
    console.log('👤 [BusinessMetrics] Session started')
  }

  /**
   * Track user session end
   */
  endSession(): void {
    const sessionDuration = Date.now() - this.sessionStartTime
    performanceMonitor.recordBusinessMetric('session_duration', sessionDuration, {
      durationMs: sessionDuration,
      durationMinutes: Math.round(sessionDuration / 60000)
    })
    console.log(`👤 [BusinessMetrics] Session ended (${Math.round(sessionDuration / 60000)}m)`)
  }

  /**
   * Track screen view
   */
  trackScreenView(screenName: string): void {
    const currentCount = this.screenViews.get(screenName) || 0
    this.screenViews.set(screenName, currentCount + 1)

    performanceMonitor.recordBusinessMetric('screen_view', 1, {
      screenName,
      totalViews: currentCount + 1
    })

    console.log(`📱 [BusinessMetrics] Screen view: ${screenName} (${currentCount + 1})`)
  }

  /**
   * Track user interaction
   */
  trackInteraction(interactionType: string, metadata?: Record<string, any>): void {
    const currentCount = this.interactions.get(interactionType) || 0
    this.interactions.set(interactionType, currentCount + 1)

    performanceMonitor.recordBusinessMetric('user_interaction', 1, {
      interactionType,
      totalInteractions: currentCount + 1,
      ...metadata
    })

    console.log(`👆 [BusinessMetrics] Interaction: ${interactionType} (${currentCount + 1})`)
  }

  /**
   * Track post view
   */
  trackPostView(postId: string, metadata?: Record<string, any>): void {
    const currentMetrics = this.postMetrics.get(postId) || { postId, views: 0 }
    currentMetrics.views = (currentMetrics.views || 0) + 1
    this.postMetrics.set(postId, currentMetrics)

    performanceMonitor.recordBusinessMetric('post_view', 1, {
      postId,
      totalViews: currentMetrics.views,
      ...metadata
    })

    console.log(`📄 [BusinessMetrics] Post view: ${postId} (${currentMetrics.views})`)
  }

  /**
   * Track application submission
   */
  trackApplicationSubmission(postId: string, timeToApply?: number, metadata?: Record<string, any>): void {
    const currentMetrics = this.postMetrics.get(postId) || { postId, applications: 0 }
    currentMetrics.applications = (currentMetrics.applications || 0) + 1
    this.postMetrics.set(postId, currentMetrics)

    performanceMonitor.recordBusinessMetric('application_submission', 1, {
      postId,
      totalApplications: currentMetrics.applications,
      timeToApply,
      ...metadata
    })

    if (timeToApply) {
      performanceMonitor.recordBusinessMetric('time_to_apply', timeToApply, {
        postId,
        timeMinutes: Math.round(timeToApply / 60000)
      })
    }

    console.log(`📝 [BusinessMetrics] Application submitted: ${postId} (${currentMetrics.applications})`)
  }

  /**
   * Track application status change
   */
  trackApplicationStatusChange(
    status: 'accepted' | 'rejected' | 'pending',
    metadata?: Record<string, any>
  ): void {
    performanceMonitor.recordBusinessMetric(`application_${status}`, 1, metadata)
    console.log(`📊 [BusinessMetrics] Application ${status}`)
  }

  /**
   * Track notification sent
   */
  trackNotificationSent(notificationType: string, recipientCount: number, metadata?: Record<string, any>): void {
    performanceMonitor.recordBusinessMetric('notification_sent', recipientCount, {
      notificationType,
      recipientCount,
      ...metadata
    })
    console.log(`🔔 [BusinessMetrics] Notification sent: ${notificationType} (${recipientCount} recipients)`)
  }

  /**
   * Track notification delivery
   */
  trackNotificationDelivered(notificationId: string, metadata?: Record<string, any>): void {
    performanceMonitor.recordBusinessMetric('notification_delivered', 1, {
      notificationId,
      ...metadata
    })
    console.log(`✅ [BusinessMetrics] Notification delivered: ${notificationId}`)
  }

  /**
   * Track notification opened
   */
  trackNotificationOpened(notificationId: string, timeToOpen?: number, metadata?: Record<string, any>): void {
    performanceMonitor.recordBusinessMetric('notification_opened', 1, {
      notificationId,
      timeToOpen,
      ...metadata
    })

    if (timeToOpen) {
      performanceMonitor.recordBusinessMetric('notification_open_time', timeToOpen, {
        notificationId,
        timeMinutes: Math.round(timeToOpen / 60000)
      })
    }

    console.log(`👁️ [BusinessMetrics] Notification opened: ${notificationId}`)
  }

  /**
   * Track search query
   */
  trackSearch(query: string, resultCount: number, metadata?: Record<string, any>): void {
    performanceMonitor.recordBusinessMetric('search_query', 1, {
      query,
      resultCount,
      ...metadata
    })
    console.log(`🔍 [BusinessMetrics] Search: "${query}" (${resultCount} results)`)
  }

  /**
   * Track error occurrence
   */
  trackError(errorType: string, errorMessage: string, metadata?: Record<string, any>): void {
    performanceMonitor.recordBusinessMetric('error_occurred', 1, {
      errorType,
      errorMessage,
      ...metadata
    })
    console.error(`❌ [BusinessMetrics] Error: ${errorType} - ${errorMessage}`)
  }

  /**
   * Get user engagement summary
   */
  getUserEngagementMetrics(): UserEngagementMetrics {
    const sessionDuration = Date.now() - this.sessionStartTime

    return {
      activeUsers: 1, // Single user session
      sessionDuration,
      screenViews: Object.fromEntries(this.screenViews),
      interactions: Object.fromEntries(this.interactions)
    }
  }

  /**
   * Get post performance metrics
   */
  getPostPerformanceMetrics(postId?: string): PostPerformanceMetrics[] {
    const metrics: PostPerformanceMetrics[] = []

    const postsToAnalyze = postId
      ? [this.postMetrics.get(postId)].filter(Boolean)
      : Array.from(this.postMetrics.values())

    postsToAnalyze.forEach(postMetric => {
      if (postMetric && postMetric.postId) {
        const views = postMetric.views || 0
        const applications = postMetric.applications || 0
        const conversionRate = views > 0 ? (applications / views) * 100 : 0

        metrics.push({
          postId: postMetric.postId,
          views,
          applications,
          conversionRate,
          averageTimeToApply: postMetric.averageTimeToApply || 0
        })
      }
    })

    return metrics
  }

  /**
   * Get application metrics summary
   */
  getApplicationMetricsSummary(): ApplicationMetrics {
    const businessSummary = performanceMonitor.getBusinessMetricsSummary()

    const totalApplications = businessSummary.find(m => m.metric === 'application_submission')?.total || 0
    const acceptedApplications = businessSummary.find(m => m.metric === 'application_accepted')?.total || 0
    const rejectedApplications = businessSummary.find(m => m.metric === 'application_rejected')?.total || 0
    const pendingApplications = totalApplications - acceptedApplications - rejectedApplications

    const acceptanceRate = totalApplications > 0
      ? (acceptedApplications / totalApplications) * 100
      : 0

    return {
      totalApplications,
      acceptedApplications,
      rejectedApplications,
      pendingApplications,
      acceptanceRate
    }
  }

  /**
   * Get notification effectiveness metrics
   */
  getNotificationEffectivenessMetrics(): NotificationEffectivenessMetrics {
    const businessSummary = performanceMonitor.getBusinessMetricsSummary()

    const sent = businessSummary.find(m => m.metric === 'notification_sent')?.total || 0
    const delivered = businessSummary.find(m => m.metric === 'notification_delivered')?.total || 0
    const opened = businessSummary.find(m => m.metric === 'notification_opened')?.total || 0

    const openRate = delivered > 0 ? (opened / delivered) * 100 : 0

    const averageOpenTime = businessSummary.find(m => m.metric === 'notification_open_time')?.average || 0

    return {
      sent,
      delivered,
      opened,
      openRate,
      averageOpenTime
    }
  }

  /**
   * Generate business metrics report
   */
  generateBusinessMetricsReport(): string {
    const engagement = this.getUserEngagementMetrics()
    const postMetrics = this.getPostPerformanceMetrics()
    const applicationMetrics = this.getApplicationMetricsSummary()
    const notificationMetrics = this.getNotificationEffectivenessMetrics()

    let report = `
📊 BUSINESS METRICS REPORT
${'='.repeat(60)}

USER ENGAGEMENT
${'-'.repeat(60)}
Session Duration: ${Math.round(engagement.sessionDuration / 60000)} minutes
Total Screen Views: ${Object.values(engagement.screenViews).reduce((sum, count) => sum + count, 0)}
Total Interactions: ${Object.values(engagement.interactions).reduce((sum, count) => sum + count, 0)}

Top Screens:
`
    const sortedScreens = Object.entries(engagement.screenViews)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    sortedScreens.forEach(([screen, count]) => {
      report += `  ${screen}: ${count} views\n`
    })

    report += `
POST PERFORMANCE
${'-'.repeat(60)}
Total Posts Tracked: ${postMetrics.length}
`

    postMetrics.slice(0, 5).forEach(post => {
      report += `  Post ${post.postId}: ${post.views} views, ${post.applications} applications (${post.conversionRate.toFixed(1)}% conversion)\n`
    })

    report += `
APPLICATION METRICS
${'-'.repeat(60)}
Total Applications: ${applicationMetrics.totalApplications}
Accepted: ${applicationMetrics.acceptedApplications}
Rejected: ${applicationMetrics.rejectedApplications}
Pending: ${applicationMetrics.pendingApplications}
Acceptance Rate: ${applicationMetrics.acceptanceRate.toFixed(1)}%

NOTIFICATION EFFECTIVENESS
${'-'.repeat(60)}
Sent: ${notificationMetrics.sent}
Delivered: ${notificationMetrics.delivered}
Opened: ${notificationMetrics.opened}
Open Rate: ${notificationMetrics.openRate.toFixed(1)}%
Average Open Time: ${Math.round(notificationMetrics.averageOpenTime / 60000)} minutes
`

    return report
  }

  /**
   * Clear all collected metrics
   */
  clearMetrics(): void {
    this.screenViews.clear()
    this.interactions.clear()
    this.postMetrics.clear()
    console.log('🧹 [BusinessMetrics] All metrics cleared')
  }
}

// Singleton instance export
export const businessMetricsCollector = BusinessMetricsCollector.getInstance()
