/**
 * Notification Performance Monitor
 * FCM 알림 성능 추적
 */

import { logger } from "@/core/utils/logger"

export interface NotificationMetrics {
  sent: number
  delivered: number
  failed: number
  clicked: number
  avgDeliveryTime: number
  unreadCount: number
}

export class NotificationMonitor {
  private metrics: NotificationMetrics = {
    sent: 0,
    delivered: 0,
    failed: 0,
    clicked: 0,
    avgDeliveryTime: 0,
    unreadCount: 0,
  }

  private deliveryTimes: number[] = []

  /**
   * 알림 발송 기록
   */
  trackSent(): void {
    this.metrics.sent++
  }

  /**
   * 알림 전달 기록
   */
  trackDelivered(deliveryTimeMs: number): void {
    this.metrics.delivered++
    this.deliveryTimes.push(deliveryTimeMs)
    this.updateAvgDeliveryTime()
  }

  /**
   * 알림 실패 기록
   */
  trackFailed(reason?: string): void {
    this.metrics.failed++
    logger.warn("NotificationMonitor", `❌ Notification failed: ${reason}`)
  }

  /**
   * 알림 클릭 기록
   */
  trackClicked(): void {
    this.metrics.clicked++
  }

  /**
   * 읽지 않은 알림 업데이트
   */
  updateUnreadCount(count: number): void {
    this.metrics.unreadCount = count
  }

  /**
   * 평균 전달 시간 계산
   */
  private updateAvgDeliveryTime(): void {
    if (this.deliveryTimes.length > 0) {
      const sum = this.deliveryTimes.reduce((a, b) => a + b, 0)
      this.metrics.avgDeliveryTime = Math.round(sum / this.deliveryTimes.length)
    }
  }

  /**
   * 메트릭 조회
   */
  getMetrics() {
    const deliveryRate = this.metrics.sent > 0
      ? ((this.metrics.delivered / this.metrics.sent) * 100).toFixed(1)
      : "0.0"

    const clickRate = this.metrics.delivered > 0
      ? ((this.metrics.clicked / this.metrics.delivered) * 100).toFixed(1)
      : "0.0"

    return {
      ...this.metrics,
      deliveryRate: `${deliveryRate}%`,
      clickRate: `${clickRate}%`,
    }
  }

  /**
   * 메트릭 초기화
   */
  reset(): void {
    this.metrics = {
      sent: 0,
      delivered: 0,
      failed: 0,
      clicked: 0,
      avgDeliveryTime: 0,
      unreadCount: 0,
    }
    this.deliveryTimes = []
  }
}

// 전역 인스턴스
export const notificationMonitor = new NotificationMonitor()
