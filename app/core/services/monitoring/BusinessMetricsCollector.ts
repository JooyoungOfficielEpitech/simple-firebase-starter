/**
 * Business Metrics Collector
 */

export interface BusinessMetrics {
  postCreated: number
  postViewed: number
  userRegistered: number
  notificationSent: number
}

export class BusinessMetricsCollector {
  private metrics: BusinessMetrics = {
    postCreated: 0,
    postViewed: 0,
    userRegistered: 0,
    notificationSent: 0,
  }

  trackPostCreated(): void { this.metrics.postCreated++ }
  trackPostViewed(): void { this.metrics.postViewed++ }
  trackUserRegistered(): void { this.metrics.userRegistered++ }
  trackNotificationSent(): void { this.metrics.notificationSent++ }

  getMetrics(): BusinessMetrics {
    return { ...this.metrics }
  }

  reset(): void {
    this.metrics = { postCreated: 0, postViewed: 0, userRegistered: 0, notificationSent: 0 }
  }
}

export const businessMetrics = new BusinessMetricsCollector()
