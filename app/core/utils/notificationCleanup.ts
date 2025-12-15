import { notificationService } from "@/core/services/firestore/notificationService"

/**
 * 알림 자동 정리 유틸리티
 */
export class NotificationCleanupUtils {
  
  /**
   * 사용자 로그인 시 개인 알림 정리
   * - 30일 이상된 읽은 알림 삭제
   * - 최신 100개만 유지
   */
  static async cleanupUserNotificationsOnLogin(userId: string): Promise<void> {
    try {
      console.log('🧹 [NotificationCleanup] 사용자 로그인 시 알림 정리 시작:', userId)

      // 30일 이상된 읽은 알림 정리
      const oldNotificationsDeleted = await notificationService.cleanupOldNotifications(userId, 30)
      
      // 알림 수 제한 (최신 100개만 유지)
      const excessNotificationsDeleted = await notificationService.limitUserNotifications(userId, 100)
      
      const totalDeleted = oldNotificationsDeleted + excessNotificationsDeleted
      
      if (totalDeleted > 0) {
        console.log(`✅ [NotificationCleanup] 사용자 ${userId} 알림 정리 완료: ${totalDeleted}개 삭제`)
      } else {
        console.log(`✅ [NotificationCleanup] 사용자 ${userId} 정리할 알림 없음`)
      }
    } catch (error) {
      console.error('❌ [NotificationCleanup] 사용자 알림 정리 실패:', error)
    }
  }

  /**
   * 앱 시작 시 전역 알림 정리 (주기적 실행)
   * - 읽은 알림 중 30일 이상된 것들 정리
   */
  static async performGlobalCleanup(): Promise<void> {
    try {
      console.log('🧹 [NotificationCleanup] 전역 알림 정리 시작')

      const deletedCount = await notificationService.cleanupAllUsersNotifications(30)
      
      if (deletedCount > 0) {
        console.log(`✅ [NotificationCleanup] 전역 알림 정리 완료: ${deletedCount}개 삭제`)
      } else {
        console.log('✅ [NotificationCleanup] 정리할 알림 없음')
      }
    } catch (error) {
      console.error('❌ [NotificationCleanup] 전역 알림 정리 실패:', error)
    }
  }

  /**
   * 주기적 정리 스케줄러 시작
   * 매일 자정에 전역 정리 실행
   */
  static startPeriodicCleanup(): void {
    // 다음 자정까지의 시간 계산
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const msUntilMidnight = tomorrow.getTime() - now.getTime()

    console.log(`⏰ [NotificationCleanup] 주기적 정리 스케줄 시작 (다음 실행: ${tomorrow.toISOString()})`)

    // 첫 번째 실행 (다음 자정)
    setTimeout(() => {
      this.performGlobalCleanup()
      
      // 이후 24시간마다 실행
      setInterval(() => {
        this.performGlobalCleanup()
      }, 24 * 60 * 60 * 1000) // 24시간
      
    }, msUntilMidnight)
  }

  /**
   * 개발용: 즉시 정리 실행
   */
  static async performImmediateCleanup(userId?: string): Promise<void> {
    if (userId) {
      await this.cleanupUserNotificationsOnLogin(userId)
    } else {
      await this.performGlobalCleanup()
    }
  }
}