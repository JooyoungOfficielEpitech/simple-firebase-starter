/**
 * Query Performance Monitor
 */

import { logger } from "@/utils/logger"

export interface QueryMetrics {
  queryName: string
  duration: number
  success: boolean
}

export class QueryPerformanceMonitor {
  private metrics: QueryMetrics[] = []
  private slowQueryThreshold = 500

  startQuery(queryName: string): number {
    return Date.now()
  }

  endQuery(queryName: string, startTime: number, success: boolean): void {
    const duration = Date.now() - startTime
    this.metrics.push({ queryName, duration, success })

    if (duration > this.slowQueryThreshold) {
      logger.warn("QueryPerformanceMonitor", `Slow query: ${queryName} took ${duration}ms`)
    }
  }

  getStats() {
    if (this.metrics.length === 0) return { totalQueries: 0, avgDuration: 0 }

    const avgDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0) / this.metrics.length
    return { totalQueries: this.metrics.length, avgDuration: Math.round(avgDuration) }
  }

  reset(): void {
    this.metrics = []
  }
}

export const queryMonitor = new QueryPerformanceMonitor()
