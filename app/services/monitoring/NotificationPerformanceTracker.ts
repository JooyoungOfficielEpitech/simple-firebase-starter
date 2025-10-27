/**
 * Notification Performance Tracking System
 *
 * Specialized tracking for push notification performance:
 * - Delivery time tracking
 * - Open rate monitoring
 * - Notification lifecycle tracking
 * - Performance bottleneck detection
 */

import { performanceMonitor } from './PerformanceMonitor'
import { businessMetricsCollector } from './BusinessMetricsCollector'

export interface NotificationDeliveryMetrics {
  notificationId: string
  sentAt: number
  deliveredAt?: number
  openedAt?: number
  deliveryTime?: number
  openTime?: number
  success: boolean
  error?: string
}

export interface NotificationPerformanceSummary {
  totalNotifications: number
  successfulDeliveries: number
  failedDeliveries: number
  deliveryRate: number
  openRate: number
  averageDeliveryTime: number
  averageOpenTime: number
  slowDeliveries: NotificationDeliveryMetrics[]
}

/**
 * Notification Performance Tracker
 *
 * Tracks the complete lifecycle of push notifications
 * and provides performance analytics
 */
export class NotificationPerformanceTracker {
  private static instance: NotificationPerformanceTracker

  private notificationMetrics: Map<string, NotificationDeliveryMetrics> = new Map()
  private readonly MAX_TRACKED_NOTIFICATIONS = 1000
  private readonly SLOW_DELIVERY_THRESHOLD = 5000 // 5 seconds

  private constructor() {
    console.log('🔔 [NotificationTracker] Performance tracker initialized')
  }

  static getInstance(): NotificationPerformanceTracker {
    if (!NotificationPerformanceTracker.instance) {
      NotificationPerformanceTracker.instance = new NotificationPerformanceTracker()
    }
    return NotificationPerformanceTracker.instance
  }

  /**
   * Track notification sent
   */
  trackNotificationSent(
    notificationId: string,
    notificationType: string,
    metadata?: Record<string, any>
  ): void {
    const sentAt = Date.now()

    this.notificationMetrics.set(notificationId, {
      notificationId,
      sentAt,
      success: false // Will be updated on delivery
    })

    this.enforceMetricsLimit()

    performanceMonitor.trackNotification('send', {
      notificationId,
      success: true
    })

    businessMetricsCollector.trackNotificationSent(notificationType, 1, metadata)

    console.log(`📤 [NotificationTracker] Notification sent: ${notificationId}`)
  }

  /**
   * Track notification delivered
   */
  trackNotificationDelivered(notificationId: string, metadata?: Record<string, any>): void {
    const deliveredAt = Date.now()
    const metrics = this.notificationMetrics.get(notificationId)

    if (metrics) {
      metrics.deliveredAt = deliveredAt
      metrics.deliveryTime = deliveredAt - metrics.sentAt
      metrics.success = true

      // Check for slow delivery
      if (metrics.deliveryTime > this.SLOW_DELIVERY_THRESHOLD) {
        console.warn(
          `⚠️ [NotificationTracker] Slow delivery detected: ${notificationId} (${metrics.deliveryTime}ms)`
        )
      }

      performanceMonitor.trackNotification('receive', {
        notificationId,
        duration: metrics.deliveryTime,
        success: true
      })

      businessMetricsCollector.trackNotificationDelivered(notificationId, metadata)

      console.log(`📥 [NotificationTracker] Notification delivered: ${notificationId} (${metrics.deliveryTime}ms)`)
    } else {
      console.warn(`⚠️ [NotificationTracker] Notification metrics not found: ${notificationId}`)
    }
  }

  /**
   * Track notification opened
   */
  trackNotificationOpened(notificationId: string, metadata?: Record<string, any>): void {
    const openedAt = Date.now()
    const metrics = this.notificationMetrics.get(notificationId)

    if (metrics && metrics.deliveredAt) {
      metrics.openedAt = openedAt
      metrics.openTime = openedAt - metrics.deliveredAt

      performanceMonitor.trackNotification('open', {
        notificationId,
        duration: metrics.openTime,
        success: true
      })

      businessMetricsCollector.trackNotificationOpened(notificationId, metrics.openTime, metadata)

      console.log(`👁️ [NotificationTracker] Notification opened: ${notificationId} (${metrics.openTime}ms after delivery)`)
    } else {
      console.warn(`⚠️ [NotificationTracker] Cannot track open for notification: ${notificationId}`)
    }
  }

  /**
   * Track notification dismissed
   */
  trackNotificationDismissed(notificationId: string, metadata?: Record<string, any>): void {
    performanceMonitor.trackNotification('dismiss', {
      notificationId,
      success: true
    })

    console.log(`🗑️ [NotificationTracker] Notification dismissed: ${notificationId}`)
  }

  /**
   * Track notification delivery failure
   */
  trackNotificationFailed(
    notificationId: string,
    error: string,
    metadata?: Record<string, any>
  ): void {
    const metrics = this.notificationMetrics.get(notificationId)

    if (metrics) {
      metrics.success = false
      metrics.error = error
    }

    performanceMonitor.trackNotification('send', {
      notificationId,
      success: false,
      error
    })

    console.error(`❌ [NotificationTracker] Notification failed: ${notificationId} - ${error}`)
  }

  /**
   * Track batch notification sent
   */
  trackBatchNotificationSent(
    notificationType: string,
    recipientCount: number,
    metadata?: Record<string, any>
  ): void {
    businessMetricsCollector.trackNotificationSent(notificationType, recipientCount, {
      ...metadata,
      batch: true
    })

    console.log(`📤 [NotificationTracker] Batch notification sent: ${notificationType} (${recipientCount} recipients)`)
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(timeWindow?: number): NotificationPerformanceSummary {
    const now = Date.now()
    const cutoffTime = timeWindow ? now - timeWindow : 0

    const metrics = Array.from(this.notificationMetrics.values()).filter(
      m => m.sentAt >= cutoffTime
    )

    const totalNotifications = metrics.length
    const successfulDeliveries = metrics.filter(m => m.success && m.deliveredAt).length
    const failedDeliveries = metrics.filter(m => !m.success).length
    const openedNotifications = metrics.filter(m => m.openedAt).length

    const deliveryRate = totalNotifications > 0
      ? (successfulDeliveries / totalNotifications) * 100
      : 0

    const openRate = successfulDeliveries > 0
      ? (openedNotifications / successfulDeliveries) * 100
      : 0

    const deliveryTimes = metrics
      .filter(m => m.deliveryTime !== undefined)
      .map(m => m.deliveryTime!)

    const averageDeliveryTime = deliveryTimes.length > 0
      ? deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length
      : 0

    const openTimes = metrics
      .filter(m => m.openTime !== undefined)
      .map(m => m.openTime!)

    const averageOpenTime = openTimes.length > 0
      ? openTimes.reduce((sum, time) => sum + time, 0) / openTimes.length
      : 0

    const slowDeliveries = metrics.filter(
      m => m.deliveryTime && m.deliveryTime > this.SLOW_DELIVERY_THRESHOLD
    )

    return {
      totalNotifications,
      successfulDeliveries,
      failedDeliveries,
      deliveryRate,
      openRate,
      averageDeliveryTime,
      averageOpenTime,
      slowDeliveries
    }
  }

  /**
   * Get notification metrics for specific notification
   */
  getNotificationMetrics(notificationId: string): NotificationDeliveryMetrics | undefined {
    return this.notificationMetrics.get(notificationId)
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport(timeWindow?: number): string {
    const summary = this.getPerformanceSummary(timeWindow)

    const timeWindowLabel = timeWindow
      ? `last ${Math.round(timeWindow / 60000)} minutes`
      : 'all time'

    let report = `
🔔 NOTIFICATION PERFORMANCE REPORT (${timeWindowLabel})
${'='.repeat(60)}

DELIVERY METRICS
${'-'.repeat(60)}
Total Notifications: ${summary.totalNotifications}
Successful Deliveries: ${summary.successfulDeliveries}
Failed Deliveries: ${summary.failedDeliveries}
Delivery Rate: ${summary.deliveryRate.toFixed(1)}%

ENGAGEMENT METRICS
${'-'.repeat(60)}
Open Rate: ${summary.openRate.toFixed(1)}%
Average Delivery Time: ${summary.averageDeliveryTime.toFixed(0)}ms
Average Open Time: ${Math.round(summary.averageOpenTime / 1000)}s

PERFORMANCE ISSUES
${'-'.repeat(60)}
Slow Deliveries: ${summary.slowDeliveries.length}
`

    if (summary.slowDeliveries.length > 0) {
      report += '\nSlow Delivery Details:\n'
      summary.slowDeliveries.slice(0, 5).forEach(metric => {
        report += `  ${metric.notificationId}: ${metric.deliveryTime}ms\n`
      })
    }

    return report
  }

  /**
   * Enforce metrics history limit
   */
  private enforceMetricsLimit(): void {
    if (this.notificationMetrics.size > this.MAX_TRACKED_NOTIFICATIONS) {
      // Remove oldest 20% of metrics
      const metricsArray = Array.from(this.notificationMetrics.entries())
        .sort(([, a], [, b]) => a.sentAt - b.sentAt)

      const removeCount = Math.floor(this.MAX_TRACKED_NOTIFICATIONS * 0.2)
      for (let i = 0; i < removeCount; i++) {
        this.notificationMetrics.delete(metricsArray[i][0])
      }

      console.log(`🧹 [NotificationTracker] Removed ${removeCount} old metrics`)
    }
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.notificationMetrics.clear()
    console.log('🧹 [NotificationTracker] All metrics cleared')
  }

  /**
   * Export metrics data
   */
  exportMetrics(timeWindow?: number): NotificationDeliveryMetrics[] {
    const now = Date.now()
    const cutoffTime = timeWindow ? now - timeWindow : 0

    return Array.from(this.notificationMetrics.values()).filter(
      m => m.sentAt >= cutoffTime
    )
  }
}

// Singleton instance export
export const notificationPerformanceTracker = NotificationPerformanceTracker.getInstance()
