/**
 * Monitoring System Configuration
 *
 * Configuration for performance monitoring, business metrics,
 * and notification tracking systems.
 */

export interface MonitoringConfig {
  /** Enable/disable performance monitoring */
  enablePerformanceMonitoring: boolean

  /** Enable/disable business metrics collection */
  enableBusinessMetrics: boolean

  /** Enable/disable notification tracking */
  enableNotificationTracking: boolean

  /** Maximum number of metrics to keep in memory */
  maxMetricsHistory: number

  /** Threshold for slow operation warnings (ms) */
  slowOperationThreshold: number

  /** Threshold for slow notification delivery (ms) */
  slowDeliveryThreshold: number

  /** Auto-generate reports interval (ms), 0 to disable */
  autoReportInterval: number

  /** Enable console logging for monitoring events */
  enableConsoleLogging: boolean

  /** Enable detailed debug logging */
  enableDebugLogging: boolean
}

/**
 * Default monitoring configuration
 */
export const defaultMonitoringConfig: MonitoringConfig = {
  enablePerformanceMonitoring: true,
  enableBusinessMetrics: true,
  enableNotificationTracking: true,
  maxMetricsHistory: 5000,
  slowOperationThreshold: 2000, // 2 seconds
  slowDeliveryThreshold: 5000, // 5 seconds
  autoReportInterval: 0, // Disabled by default
  enableConsoleLogging: true,
  enableDebugLogging: __DEV__ // Only in development
}

/**
 * Production monitoring configuration
 */
export const productionMonitoringConfig: MonitoringConfig = {
  enablePerformanceMonitoring: true,
  enableBusinessMetrics: true,
  enableNotificationTracking: true,
  maxMetricsHistory: 3000,
  slowOperationThreshold: 3000,
  slowDeliveryThreshold: 7000,
  autoReportInterval: 3600000, // 1 hour
  enableConsoleLogging: false,
  enableDebugLogging: false
}

/**
 * Development monitoring configuration
 */
export const developmentMonitoringConfig: MonitoringConfig = {
  enablePerformanceMonitoring: true,
  enableBusinessMetrics: true,
  enableNotificationTracking: true,
  maxMetricsHistory: 10000,
  slowOperationThreshold: 1000,
  slowDeliveryThreshold: 3000,
  autoReportInterval: 300000, // 5 minutes
  enableConsoleLogging: true,
  enableDebugLogging: true
}

/**
 * Get appropriate monitoring config based on environment
 */
export function getMonitoringConfig(): MonitoringConfig {
  if (__DEV__) {
    return developmentMonitoringConfig
  }
  return productionMonitoringConfig
}

/**
 * Alert thresholds for automated monitoring
 */
export interface AlertThresholds {
  /** Maximum acceptable failure rate (%) */
  maxFailureRate: number

  /** Maximum acceptable slow operation rate (%) */
  maxSlowOperationRate: number

  /** Minimum acceptable cache hit rate (%) */
  minCacheHitRate: number

  /** Maximum acceptable average response time (ms) */
  maxAverageResponseTime: number

  /** Minimum acceptable notification open rate (%) */
  minNotificationOpenRate: number

  /** Maximum acceptable notification delivery time (ms) */
  maxNotificationDeliveryTime: number
}

/**
 * Default alert thresholds
 */
export const defaultAlertThresholds: AlertThresholds = {
  maxFailureRate: 5, // 5%
  maxSlowOperationRate: 10, // 10%
  minCacheHitRate: 80, // 80%
  maxAverageResponseTime: 2000, // 2 seconds
  minNotificationOpenRate: 30, // 30%
  maxNotificationDeliveryTime: 5000 // 5 seconds
}

/**
 * Monitoring report configuration
 */
export interface ReportConfig {
  /** Include performance metrics in reports */
  includePerformance: boolean

  /** Include business metrics in reports */
  includeBusiness: boolean

  /** Include notification metrics in reports */
  includeNotifications: boolean

  /** Include query performance details */
  includeQueryDetails: boolean

  /** Maximum number of slow operations to list */
  maxSlowOperationsToList: number

  /** Maximum number of failed operations to list */
  maxFailedOperationsToList: number

  /** Time window for reports (ms), 0 for all time */
  reportTimeWindow: number
}

/**
 * Default report configuration
 */
export const defaultReportConfig: ReportConfig = {
  includePerformance: true,
  includeBusiness: true,
  includeNotifications: true,
  includeQueryDetails: true,
  maxSlowOperationsToList: 10,
  maxFailedOperationsToList: 10,
  reportTimeWindow: 3600000 // 1 hour
}
