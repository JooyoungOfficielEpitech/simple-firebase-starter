/**
 * Firebase Performance SDK Integration
 *
 * Integrates with @react-native-firebase/perf for custom traces:
 * - Post creation/fetching traces
 * - Notification sending traces
 * - Image upload traces
 * - Custom business operation traces
 */

import perf, { FirebasePerformanceTypes } from '@react-native-firebase/perf'
import { logger } from '@/utils/logger'

export type TraceMetricName =
  | 'trace_post_creation'
  | 'trace_post_fetch'
  | 'trace_notification_send'
  | 'trace_image_upload'
  | 'trace_application_submission'
  | 'trace_organization_fetch'
  | 'trace_user_auth'

export interface TraceOptions {
  attributes?: Record<string, string>
  metrics?: Record<string, number>
}

/**
 * Firebase Performance SDK Wrapper
 *
 * Provides simplified API for creating custom traces
 * with automatic error handling and logging
 */
export class FirebasePerformanceSDK {
  private static instance: FirebasePerformanceSDK
  private activeTraces: Map<string, FirebasePerformanceTypes.Trace> = new Map()
  private traceMetrics: Map<string, { startTime: number; endTime?: number; duration?: number }> = new Map()

  private constructor() {
    logger.info('[FirebasePerformance] SDK initialized')
  }

  static getInstance(): FirebasePerformanceSDK {
    if (!FirebasePerformanceSDK.instance) {
      FirebasePerformanceSDK.instance = new FirebasePerformanceSDK()
    }
    return FirebasePerformanceSDK.instance
  }

  /**
   * Start a custom trace
   */
  async startTrace(traceName: TraceMetricName, options?: TraceOptions): Promise<void> {
    try {
      const trace = await perf().startTrace(traceName)

      // Add custom attributes
      if (options?.attributes) {
        for (const [key, value] of Object.entries(options.attributes)) {
          await trace.putAttribute(key, value)
        }
      }

      // Add custom metrics
      if (options?.metrics) {
        for (const [key, value] of Object.entries(options.metrics)) {
          await trace.putMetric(key, value)
        }
      }

      this.activeTraces.set(traceName, trace)
      this.traceMetrics.set(traceName, { startTime: Date.now() })

      logger.info(`[FirebasePerformance] Trace started: ${traceName}`, options)
    } catch (error) {
      logger.error(`[FirebasePerformance] Failed to start trace: ${traceName}`, error)
    }
  }

  /**
   * Stop a custom trace
   */
  async stopTrace(traceName: TraceMetricName, additionalMetrics?: Record<string, number>): Promise<void> {
    try {
      const trace = this.activeTraces.get(traceName)
      if (!trace) {
        logger.warn(`[FirebasePerformance] No active trace found: ${traceName}`)
        return
      }

      // Add additional metrics before stopping
      if (additionalMetrics) {
        for (const [key, value] of Object.entries(additionalMetrics)) {
          await trace.putMetric(key, value)
        }
      }

      await trace.stop()

      // Update metrics
      const metric = this.traceMetrics.get(traceName)
      if (metric) {
        metric.endTime = Date.now()
        metric.duration = metric.endTime - metric.startTime
      }

      this.activeTraces.delete(traceName)

      logger.info(`[FirebasePerformance] Trace stopped: ${traceName}`, {
        duration: metric?.duration,
        additionalMetrics
      })
    } catch (error) {
      logger.error(`[FirebasePerformance] Failed to stop trace: ${traceName}`, error)
    }
  }

  /**
   * Execute operation within a trace
   */
  async traceOperation<T>(
    traceName: TraceMetricName,
    operation: () => Promise<T>,
    options?: TraceOptions
  ): Promise<T> {
    await this.startTrace(traceName, options)

    try {
      const result = await operation()
      await this.stopTrace(traceName, { success: 1 })
      return result
    } catch (error) {
      await this.stopTrace(traceName, { success: 0, error: 1 })
      throw error
    }
  }

  /**
   * Add attribute to active trace
   */
  async addTraceAttribute(traceName: TraceMetricName, key: string, value: string): Promise<void> {
    try {
      const trace = this.activeTraces.get(traceName)
      if (!trace) {
        logger.warn(`[FirebasePerformance] No active trace found: ${traceName}`)
        return
      }

      await trace.putAttribute(key, value)
      logger.info(`[FirebasePerformance] Attribute added to ${traceName}: ${key}=${value}`)
    } catch (error) {
      logger.error(`[FirebasePerformance] Failed to add attribute to trace: ${traceName}`, error)
    }
  }

  /**
   * Increment metric in active trace
   */
  async incrementTraceMetric(traceName: TraceMetricName, metricName: string, value: number = 1): Promise<void> {
    try {
      const trace = this.activeTraces.get(traceName)
      if (!trace) {
        logger.warn(`[FirebasePerformance] No active trace found: ${traceName}`)
        return
      }

      await trace.incrementMetric(metricName, value)
      logger.info(`[FirebasePerformance] Metric incremented in ${traceName}: ${metricName} +${value}`)
    } catch (error) {
      logger.error(`[FirebasePerformance] Failed to increment metric: ${traceName}`, error)
    }
  }

  /**
   * Get trace duration (for active or completed traces)
   */
  getTraceDuration(traceName: TraceMetricName): number | null {
    const metric = this.traceMetrics.get(traceName)
    if (!metric) return null

    if (metric.duration) {
      return metric.duration
    }

    // Calculate current duration for active trace
    if (!metric.endTime) {
      return Date.now() - metric.startTime
    }

    return null
  }

  /**
   * Check if trace is active
   */
  isTraceActive(traceName: TraceMetricName): boolean {
    return this.activeTraces.has(traceName)
  }

  /**
   * Get all active traces
   */
  getActiveTraces(): TraceMetricName[] {
    return Array.from(this.activeTraces.keys()) as TraceMetricName[]
  }

  /**
   * Clear all active traces (for cleanup)
   */
  async clearAllTraces(): Promise<void> {
    const activeTraceNames = Array.from(this.activeTraces.keys())

    for (const traceName of activeTraceNames) {
      await this.stopTrace(traceName as TraceMetricName)
    }

    this.traceMetrics.clear()
    logger.info('[FirebasePerformance] All traces cleared')
  }

  /**
   * Enable/disable performance monitoring
   */
  async setPerformanceCollectionEnabled(enabled: boolean): Promise<void> {
    try {
      await perf().setPerformanceCollectionEnabled(enabled)
      logger.info(`[FirebasePerformance] Collection ${enabled ? 'enabled' : 'disabled'}`)
    } catch (error) {
      logger.error('[FirebasePerformance] Failed to set collection enabled', error)
    }
  }

  /**
   * Check if performance monitoring is enabled
   */
  async isPerformanceCollectionEnabled(): Promise<boolean> {
    try {
      return await perf().isPerformanceCollectionEnabled()
    } catch (error) {
      logger.error('[FirebasePerformance] Failed to check collection enabled', error)
      return false
    }
  }
}

// Singleton instance export
export const firebasePerformance = FirebasePerformanceSDK.getInstance()

/**
 * Convenience functions for common traces
 */

/**
 * Trace post creation
 */
export async function tracePostCreation<T>(
  operation: () => Promise<T>,
  postType?: string
): Promise<T> {
  return firebasePerformance.traceOperation(
    'trace_post_creation',
    operation,
    { attributes: postType ? { postType } : undefined }
  )
}

/**
 * Trace post fetching
 */
export async function tracePostFetch<T>(
  operation: () => Promise<T>,
  fetchType: 'single' | 'list' = 'list',
  limit?: number
): Promise<T> {
  return firebasePerformance.traceOperation(
    'trace_post_fetch',
    operation,
    {
      attributes: { fetchType },
      metrics: limit ? { limit } : undefined
    }
  )
}

/**
 * Trace notification sending
 */
export async function traceNotificationSend<T>(
  operation: () => Promise<T>,
  notificationType: string,
  recipientCount?: number
): Promise<T> {
  return firebasePerformance.traceOperation(
    'trace_notification_send',
    operation,
    {
      attributes: { notificationType },
      metrics: recipientCount ? { recipientCount } : undefined
    }
  )
}

/**
 * Trace image upload
 */
export async function traceImageUpload<T>(
  operation: () => Promise<T>,
  imageCount: number,
  totalSizeKB?: number
): Promise<T> {
  return firebasePerformance.traceOperation(
    'trace_image_upload',
    operation,
    {
      metrics: {
        imageCount,
        ...(totalSizeKB ? { totalSizeKB } : {})
      }
    }
  )
}

/**
 * Trace application submission
 */
export async function traceApplicationSubmission<T>(
  operation: () => Promise<T>,
  postId: string
): Promise<T> {
  return firebasePerformance.traceOperation(
    'trace_application_submission',
    operation,
    { attributes: { postId } }
  )
}
