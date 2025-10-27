/**
 * Monitoring System Exports
 *
 * Centralized monitoring and analytics system for the application:
 * - Performance monitoring with QueryPerformanceMonitor integration
 * - Business metrics collection and analytics
 * - Notification performance tracking
 */

export {
  PerformanceMonitor,
  performanceMonitor,
  type PerformanceMetrics,
  type BusinessMetrics,
  type NotificationMetrics,
  type MonitoringSummary
} from './PerformanceMonitor'

export {
  BusinessMetricsCollector,
  businessMetricsCollector,
  type UserEngagementMetrics,
  type PostPerformanceMetrics,
  type ApplicationMetrics,
  type NotificationEffectivenessMetrics
} from './BusinessMetricsCollector'

export {
  NotificationPerformanceTracker,
  notificationPerformanceTracker,
  type NotificationDeliveryMetrics,
  type NotificationPerformanceSummary
} from './NotificationPerformanceTracker'

/**
 * Monitoring System Helper Functions
 */

/**
 * Initialize all monitoring systems
 */
export function initializeMonitoring(): void {
  console.log('🔧 [Monitoring] Initializing monitoring systems...')

  // Systems are already initialized via singletons
  performanceMonitor
  businessMetricsCollector
  notificationPerformanceTracker

  console.log('✅ [Monitoring] All monitoring systems initialized')
}

/**
 * Generate comprehensive monitoring report
 */
export function generateComprehensiveReport(timeWindow?: number): string {
  const performanceReport = performanceMonitor.generateMonitoringReport(timeWindow)
  const businessReport = businessMetricsCollector.generateBusinessMetricsReport()
  const notificationReport = notificationPerformanceTracker.generatePerformanceReport(timeWindow)

  return `
${'='.repeat(60)}
COMPREHENSIVE MONITORING REPORT
${'='.repeat(60)}

${performanceReport}

${businessReport}

${notificationReport}

${'='.repeat(60)}
Report generated at: ${new Date().toISOString()}
${'='.repeat(60)}
`
}

/**
 * Clear all monitoring data
 */
export function clearAllMonitoringData(): void {
  performanceMonitor.clearMetrics()
  businessMetricsCollector.clearMetrics()
  notificationPerformanceTracker.clearMetrics()
  console.log('🧹 [Monitoring] All monitoring data cleared')
}

/**
 * Export all monitoring data
 */
export function exportAllMonitoringData(timeWindow?: number): {
  performance: ReturnType<typeof performanceMonitor.exportMetrics>
  business: {
    engagement: ReturnType<typeof businessMetricsCollector.getUserEngagementMetrics>
    posts: ReturnType<typeof businessMetricsCollector.getPostPerformanceMetrics>
    applications: ReturnType<typeof businessMetricsCollector.getApplicationMetricsSummary>
    notifications: ReturnType<typeof businessMetricsCollector.getNotificationEffectivenessMetrics>
  }
  notifications: ReturnType<typeof notificationPerformanceTracker.exportMetrics>
} {
  return {
    performance: performanceMonitor.exportMetrics(timeWindow),
    business: {
      engagement: businessMetricsCollector.getUserEngagementMetrics(),
      posts: businessMetricsCollector.getPostPerformanceMetrics(),
      applications: businessMetricsCollector.getApplicationMetricsSummary(),
      notifications: businessMetricsCollector.getNotificationEffectivenessMetrics()
    },
    notifications: notificationPerformanceTracker.exportMetrics(timeWindow)
  }
}
