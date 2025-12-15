/**
 * Performance Dashboard
 */

import { queryMonitor } from "./QueryPerformanceMonitor"
import { businessMetrics } from "./BusinessMetricsCollector"

export class PerformanceDashboard {
  getDashboardData() {
    return {
      timestamp: new Date().toISOString(),
      query: queryMonitor.getStats(),
      business: businessMetrics.getMetrics(),
    }
  }

  getSummary() {
    const queryStats = queryMonitor.getStats()
    return {
      totalQueries: queryStats.totalQueries,
      avgQueryTime: queryStats.avgDuration,
    }
  }

  reset(): void {
    queryMonitor.reset()
    businessMetrics.reset()
  }
}

export const dashboard = new PerformanceDashboard()
