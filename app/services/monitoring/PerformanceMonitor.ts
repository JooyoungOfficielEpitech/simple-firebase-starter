/**
 * Performance Monitoring System
 *
 * Centralized performance monitoring with business metrics,
 * notification tracking, and comprehensive analytics.
 */

import { QueryPerformanceMonitor } from '../firestore/queryOptimization'

// Performance Metrics Types
export interface PerformanceMetrics {
  timestamp: number
  category: 'query' | 'notification' | 'business' | 'api' | 'ui'
  operation: string
  duration: number
  success: boolean
  metadata?: Record<string, any>
}

export interface BusinessMetrics {
  timestamp: number
  metric: string
  value: number
  metadata?: Record<string, any>
}

export interface NotificationMetrics {
  timestamp: number
  type: 'send' | 'receive' | 'open' | 'dismiss'
  notificationId?: string
  userId?: string
  duration?: number
  success: boolean
  error?: string
}

export interface MonitoringSummary {
  totalOperations: number
  successRate: number
  averageDuration: number
  slowOperations: PerformanceMetrics[]
  failedOperations: PerformanceMetrics[]
  businessMetrics: BusinessMetrics[]
  notificationMetrics: NotificationMetrics[]
}

/**
 * Centralized Performance Monitor
 *
 * Integrates with QueryPerformanceMonitor and adds
 * business metrics and notification tracking
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private queryMonitor: QueryPerformanceMonitor
  private performanceMetrics: PerformanceMetrics[] = []
  private businessMetrics: BusinessMetrics[] = []
  private notificationMetrics: NotificationMetrics[] = []

  private readonly MAX_METRICS_HISTORY = 5000
  private readonly SLOW_OPERATION_THRESHOLD = 2000 // 2 seconds

  private constructor() {
    this.queryMonitor = new QueryPerformanceMonitor()
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * Track general performance metrics
   */
  async trackOperation<T>(
    category: PerformanceMetrics['category'],
    operation: string,
    executor: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = Date.now()
    let success = true
    let result: T

    try {
      result = await executor()
      return result
    } catch (error) {
      success = false
      throw error
    } finally {
      const duration = Date.now() - startTime

      this.recordPerformanceMetric({
        timestamp: Date.now(),
        category,
        operation,
        duration,
        success,
        metadata
      })

      // Log slow operations
      if (duration > this.SLOW_OPERATION_THRESHOLD) {
        console.warn(
          `⚠️ [PerformanceMonitor] Slow ${category} operation: ${operation} (${duration}ms)`,
          metadata
        )
      }

      // Log failures
      if (!success) {
        console.error(
          `❌ [PerformanceMonitor] Failed ${category} operation: ${operation} (${duration}ms)`,
          metadata
        )
      }
    }
  }

  /**
   * Track Firestore query performance
   */
  async trackQuery<T>(
    queryType: string,
    queryOperation: () => Promise<T>,
    options?: { cacheHit?: boolean; expectedDocs?: number }
  ): Promise<T> {
    return this.queryMonitor.measureQuery(queryType, queryOperation, options)
  }

  /**
   * Record business metric
   */
  recordBusinessMetric(metric: string, value: number, metadata?: Record<string, any>): void {
    const businessMetric: BusinessMetrics = {
      timestamp: Date.now(),
      metric,
      value,
      metadata
    }

    this.businessMetrics.push(businessMetric)
    this.enforceHistoryLimit(this.businessMetrics)

    console.log(`📊 [BusinessMetrics] ${metric}: ${value}`, metadata)
  }

  /**
   * Track notification performance
   */
  trackNotification(
    type: NotificationMetrics['type'],
    options: {
      notificationId?: string
      userId?: string
      duration?: number
      success: boolean
      error?: string
    }
  ): void {
    const notificationMetric: NotificationMetrics = {
      timestamp: Date.now(),
      type,
      ...options
    }

    this.notificationMetrics.push(notificationMetric)
    this.enforceHistoryLimit(this.notificationMetrics)

    if (options.success) {
      console.log(`🔔 [NotificationMetrics] ${type}:`, {
        notificationId: options.notificationId,
        duration: options.duration
      })
    } else {
      console.error(`❌ [NotificationMetrics] ${type} failed:`, {
        notificationId: options.notificationId,
        error: options.error
      })
    }
  }

  /**
   * Record performance metric
   */
  private recordPerformanceMetric(metric: PerformanceMetrics): void {
    this.performanceMetrics.push(metric)
    this.enforceHistoryLimit(this.performanceMetrics)
  }

  /**
   * Enforce history limits for metrics arrays
   */
  private enforceHistoryLimit<T>(metricsArray: T[]): void {
    while (metricsArray.length > this.MAX_METRICS_HISTORY) {
      metricsArray.shift()
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(
    category?: PerformanceMetrics['category'],
    timeWindow?: number // milliseconds
  ): MonitoringSummary {
    const now = Date.now()
    const cutoffTime = timeWindow ? now - timeWindow : 0

    // Filter metrics by category and time window
    let filteredMetrics = this.performanceMetrics.filter(
      m => m.timestamp >= cutoffTime
    )

    if (category) {
      filteredMetrics = filteredMetrics.filter(m => m.category === category)
    }

    const totalOperations = filteredMetrics.length
    const successfulOps = filteredMetrics.filter(m => m.success).length
    const successRate = totalOperations > 0 ? (successfulOps / totalOperations) * 100 : 0

    const totalDuration = filteredMetrics.reduce((sum, m) => sum + m.duration, 0)
    const averageDuration = totalOperations > 0 ? totalDuration / totalOperations : 0

    const slowOperations = filteredMetrics.filter(
      m => m.duration > this.SLOW_OPERATION_THRESHOLD
    )

    const failedOperations = filteredMetrics.filter(m => !m.success)

    // Filter business and notification metrics by time window
    const filteredBusinessMetrics = this.businessMetrics.filter(
      m => m.timestamp >= cutoffTime
    )

    const filteredNotificationMetrics = this.notificationMetrics.filter(
      m => m.timestamp >= cutoffTime
    )

    return {
      totalOperations,
      successRate,
      averageDuration,
      slowOperations,
      failedOperations,
      businessMetrics: filteredBusinessMetrics,
      notificationMetrics: filteredNotificationMetrics
    }
  }

  /**
   * Get query performance report from QueryPerformanceMonitor
   */
  getQueryPerformanceReport(queryType?: string) {
    return this.queryMonitor.generatePerformanceReport(queryType)
  }

  /**
   * Get business metrics summary
   */
  getBusinessMetricsSummary(metric?: string, timeWindow?: number): {
    metric: string
    count: number
    total: number
    average: number
    min: number
    max: number
  }[] {
    const now = Date.now()
    const cutoffTime = timeWindow ? now - timeWindow : 0

    // Filter metrics
    let filteredMetrics = this.businessMetrics.filter(
      m => m.timestamp >= cutoffTime
    )

    if (metric) {
      filteredMetrics = filteredMetrics.filter(m => m.metric === metric)
    }

    // Group by metric name
    const metricGroups = new Map<string, number[]>()

    filteredMetrics.forEach(m => {
      if (!metricGroups.has(m.metric)) {
        metricGroups.set(m.metric, [])
      }
      metricGroups.get(m.metric)!.push(m.value)
    })

    // Calculate statistics for each metric
    return Array.from(metricGroups.entries()).map(([metricName, values]) => {
      const total = values.reduce((sum, v) => sum + v, 0)
      const count = values.length
      const average = count > 0 ? total / count : 0
      const min = Math.min(...values)
      const max = Math.max(...values)

      return {
        metric: metricName,
        count,
        total,
        average,
        min,
        max
      }
    })
  }

  /**
   * Get notification metrics summary
   */
  getNotificationMetricsSummary(timeWindow?: number): {
    type: NotificationMetrics['type']
    count: number
    successRate: number
    averageDuration: number
  }[] {
    const now = Date.now()
    const cutoffTime = timeWindow ? now - timeWindow : 0

    const filteredMetrics = this.notificationMetrics.filter(
      m => m.timestamp >= cutoffTime
    )

    // Group by type
    const typeGroups = new Map<NotificationMetrics['type'], NotificationMetrics[]>()

    filteredMetrics.forEach(m => {
      if (!typeGroups.has(m.type)) {
        typeGroups.set(m.type, [])
      }
      typeGroups.get(m.type)!.push(m)
    })

    // Calculate statistics for each type
    return Array.from(typeGroups.entries()).map(([type, metrics]) => {
      const count = metrics.length
      const successCount = metrics.filter(m => m.success).length
      const successRate = count > 0 ? (successCount / count) * 100 : 0

      const durationsWithValue = metrics.filter(m => m.duration !== undefined)
      const totalDuration = durationsWithValue.reduce((sum, m) => sum + (m.duration || 0), 0)
      const averageDuration = durationsWithValue.length > 0
        ? totalDuration / durationsWithValue.length
        : 0

      return {
        type,
        count,
        successRate,
        averageDuration
      }
    })
  }

  /**
   * Generate comprehensive monitoring report
   */
  generateMonitoringReport(timeWindow?: number): string {
    const summary = this.getPerformanceSummary(undefined, timeWindow)
    const queryReport = this.getQueryPerformanceReport()
    const businessSummary = this.getBusinessMetricsSummary(undefined, timeWindow)
    const notificationSummary = this.getNotificationMetricsSummary(timeWindow)

    const timeWindowLabel = timeWindow
      ? `last ${Math.round(timeWindow / 60000)} minutes`
      : 'all time'

    let report = `
📊 MONITORING REPORT (${timeWindowLabel})
${'='.repeat(60)}

PERFORMANCE OVERVIEW
${'-'.repeat(60)}
Total Operations: ${summary.totalOperations}
Success Rate: ${summary.successRate.toFixed(1)}%
Average Duration: ${summary.averageDuration.toFixed(1)}ms
Slow Operations: ${summary.slowOperations.length}
Failed Operations: ${summary.failedOperations.length}

QUERY PERFORMANCE
${'-'.repeat(60)}
Total Queries: ${queryReport.totalQueries}
Average Execution Time: ${queryReport.averageExecutionTime.toFixed(1)}ms
Cache Hit Rate: ${queryReport.cacheHitRate.toFixed(1)}%
Total Cost: ${queryReport.totalCost} reads
Slow Queries: ${queryReport.slowQueries.length}

BUSINESS METRICS
${'-'.repeat(60)}
`

    businessSummary.forEach(metric => {
      report += `${metric.metric}: ${metric.total} (avg: ${metric.average.toFixed(1)})\n`
    })

    report += `
NOTIFICATION METRICS
${'-'.repeat(60)}
`

    notificationSummary.forEach(metric => {
      report += `${metric.type}: ${metric.count} ops (${metric.successRate.toFixed(1)}% success, avg: ${metric.averageDuration.toFixed(1)}ms)\n`
    })

    if (summary.slowOperations.length > 0) {
      report += `
⚠️ SLOW OPERATIONS
${'-'.repeat(60)}
`
      summary.slowOperations.slice(0, 10).forEach(op => {
        report += `${op.category} - ${op.operation}: ${op.duration}ms\n`
      })
    }

    if (summary.failedOperations.length > 0) {
      report += `
❌ FAILED OPERATIONS
${'-'.repeat(60)}
`
      summary.failedOperations.slice(0, 10).forEach(op => {
        report += `${op.category} - ${op.operation}\n`
      })
    }

    return report
  }

  /**
   * Clear all metrics history
   */
  clearMetrics(): void {
    this.performanceMetrics = []
    this.businessMetrics = []
    this.notificationMetrics = []
    console.log('🧹 [PerformanceMonitor] All metrics cleared')
  }

  /**
   * Export metrics data for analysis
   */
  exportMetrics(timeWindow?: number): {
    performance: PerformanceMetrics[]
    business: BusinessMetrics[]
    notifications: NotificationMetrics[]
  } {
    const now = Date.now()
    const cutoffTime = timeWindow ? now - timeWindow : 0

    return {
      performance: this.performanceMetrics.filter(m => m.timestamp >= cutoffTime),
      business: this.businessMetrics.filter(m => m.timestamp >= cutoffTime),
      notifications: this.notificationMetrics.filter(m => m.timestamp >= cutoffTime)
    }
  }
}

// Singleton instance export
export const performanceMonitor = PerformanceMonitor.getInstance()
