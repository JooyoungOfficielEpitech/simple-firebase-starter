import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore"
import { 
  Notification, 
  CreateNotification, 
  UpdateNotification,
  NotificationType,
  NotificationTemplates
} from "@/types/notification"

export class NotificationService {
  private db: FirebaseFirestoreTypes.Module

  constructor(firestoreInstance = firestore()) {
    this.db = firestoreInstance
  }

  /**
   * 새 알림 생성
   */
  async createNotification(data: CreateNotification): Promise<string> {
    try {
      const docRef = await this.db.collection('notifications').add({
        ...data,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp()
      })
      
      console.log('🔔 [NotificationService] 알림 생성됨:', docRef.id)
      return docRef.id
    } catch (error) {
      console.error('❌ [NotificationService] 알림 생성 실패:', error)
      throw error
    }
  }

  /**
   * 사용자별 알림 목록 실시간 구독
   */
  subscribeToUserNotifications(
    userId: string, 
    callback: (notifications: Notification[]) => void
  ): () => void {
    console.log('🔔 [NotificationService] 사용자 알림 구독 시작:', userId)
    
    return this.db
      .collection('notifications')
      .where('userId', '==', userId)
      .onSnapshot(
        (snapshot) => {
          const notifications: Notification[] = []
          
          snapshot.forEach((doc) => {
            const data = doc.data()
            notifications.push({
              id: doc.id,
              ...data,
            } as Notification)
          })
          
          // 클라이언트에서 정렬 및 제한
          notifications.sort((a, b) => {
            const aTime = a.createdAt?.toDate?.() || new Date(0)
            const bTime = b.createdAt?.toDate?.() || new Date(0)
            return bTime.getTime() - aTime.getTime() // 최신순
          })
          
          // 최근 50개만 유지
          const limitedNotifications = notifications.slice(0, 50)
          
          console.log(`🔔 [NotificationService] 알림 업데이트됨: ${limitedNotifications.length}개`)
          callback(limitedNotifications)
        },
        (error) => {
          console.error('❌ [NotificationService] 알림 구독 오류:', error)
          callback([])
        }
      )
  }

  /**
   * 알림 읽음 처리
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await this.db.collection('notifications').doc(notificationId).update({
        isRead: true,
        readAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp()
      })
      
      console.log('✅ [NotificationService] 알림 읽음 처리됨:', notificationId)
    } catch (error) {
      console.error('❌ [NotificationService] 알림 읽음 처리 실패:', error)
      throw error
    }
  }

  /**
   * 읽지 않은 알림 수 조회
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const snapshot = await this.db
        .collection('notifications')
        .where('userId', '==', userId)
        .get()
      
      // 클라이언트에서 읽지 않은 알림만 필터링
      const unreadCount = snapshot.docs.filter(doc => {
        const data = doc.data()
        return data.isRead === false
      }).length
      
      return unreadCount
    } catch (error) {
      console.error('❌ [NotificationService] 읽지 않은 알림 수 조회 실패:', error)
      return 0
    }
  }

  /**
   * 읽지 않은 알림 수 실시간 구독
   */
  subscribeToUnreadCount(userId: string, callback: (count: number) => void): () => void {
    return this.db
      .collection('notifications')
      .where('userId', '==', userId)
      .onSnapshot(
        (snapshot) => {
          // 클라이언트에서 읽지 않은 알림만 필터링
          const unreadCount = snapshot.docs.filter(doc => {
            const data = doc.data()
            return data.isRead === false
          }).length
          
          callback(unreadCount)
        },
        (error) => {
          console.error('❌ [NotificationService] 읽지 않은 알림 수 구독 오류:', error)
          callback(0)
        }
      )
  }

  /**
   * 오래된 알림 정리 (30일 이상된 읽은 알림 삭제)
   */
  async cleanupOldNotifications(userId?: string, daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)
      const cutoffTimestamp = firestore.Timestamp.fromDate(cutoffDate)

      console.log(`🧹 [NotificationService] ${daysOld}일 이전 알림 정리 시작 (기준: ${cutoffDate.toISOString()})`)

      let query = this.db.collection('notifications')
      
      // 특정 사용자 지정된 경우
      if (userId) {
        query = query.where('userId', '==', userId)
        console.log(`🧹 [NotificationService] 사용자별 정리: ${userId}`)
      }

      const snapshot = await query.get()
      
      if (snapshot.empty) {
        console.log('🧹 [NotificationService] 정리할 알림이 없습니다')
        return 0
      }

      // 메모리에서 필터링: 읽음 상태이고 30일 이상 된 알림만
      const docsToDelete = snapshot.docs.filter((doc) => {
        const data = doc.data()
        const isRead = data.isRead === true
        const createdAt = data.createdAt
        const isOld = createdAt && createdAt.toDate() < cutoffDate
        return isRead && isOld
      })

      if (docsToDelete.length === 0) {
        console.log('🧹 [NotificationService] 정리할 알림이 없습니다')
        return 0
      }

      console.log(`🧹 [NotificationService] ${docsToDelete.length}개 알림 정리 중...`)

      // 배치 삭제 (500개씩)
      const batch = this.db.batch()
      docsToDelete.forEach((doc) => {
        batch.delete(doc.ref)
      })

      await batch.commit()

      console.log(`✅ [NotificationService] ${docsToDelete.length}개 알림 정리 완료`)
      return docsToDelete.length
    } catch (error) {
      console.error('❌ [NotificationService] 알림 정리 실패:', error)
      return 0 // 에러가 발생해도 앱 실행을 막지 않음
    }
  }

  /**
   * 전체 사용자 알림 정리 (관리자용)
   */
  async cleanupAllUsersNotifications(daysOld: number = 30): Promise<number> {
    return this.cleanupOldNotifications(undefined, daysOld)
  }

  /**
   * 사용자별 알림 수 제한 (최신 100개만 유지)
   */
  async limitUserNotifications(userId: string, maxCount: number = 100): Promise<number> {
    try {
      console.log(`📊 [NotificationService] 사용자 ${userId} 알림 수 제한 (최대 ${maxCount}개)`)

      // 사용자의 알림을 조회 (orderBy 제거)
      const snapshot = await this.db
        .collection('notifications')
        .where('userId', '==', userId)
        .get()

      if (snapshot.size <= maxCount) {
        console.log(`📊 [NotificationService] 현재 ${snapshot.size}개로 제한 불필요`)
        return 0
      }

      // 클라이언트에서 정렬 후 초과분 삭제
      const sortedDocs = snapshot.docs.sort((a, b) => {
        const aTime = a.data().createdAt?.toDate?.() || new Date(0)
        const bTime = b.data().createdAt?.toDate?.() || new Date(0)
        return bTime.getTime() - aTime.getTime() // 최신순
      })

      // 초과된 알림 삭제 (오래된 것부터)
      const docsToDelete = sortedDocs.slice(maxCount)
      console.log(`📊 [NotificationService] ${docsToDelete.length}개 초과 알림 삭제`)

      if (docsToDelete.length === 0) {
        return 0
      }

      const batch = this.db.batch()
      docsToDelete.forEach((doc) => {
        batch.delete(doc.ref)
      })

      await batch.commit()

      console.log(`✅ [NotificationService] 사용자 ${userId} 알림 수 제한 완료`)
      return docsToDelete.length
    } catch (error) {
      console.error('❌ [NotificationService] 알림 수 제한 실패:', error)
      return 0 // 에러가 발생해도 앱 실행을 막지 않음
    }
  }

  // === 특정 이벤트별 알림 생성 메서드들 ===

  /**
   * 지원자 등록 알림 (운영자에게)
   */
  async notifyApplicationReceived(params: {
    organizerId: string
    postId: string
    postTitle: string
    applicantId: string
    applicantName: string
  }): Promise<void> {
    const { title, message } = NotificationTemplates.applicationReceived(
      params.postTitle, 
      params.applicantName
    )

    await this.createNotification({
      userId: params.organizerId,
      type: 'application_received',
      title,
      message,
      postId: params.postId,
      postTitle: params.postTitle,
      applicantId: params.applicantId,
      applicantName: params.applicantName,
      isRead: false,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp()
    })

    console.log('🔔 [NotificationService] 지원자 등록 알림 발송:', {
      to: params.organizerId,
      post: params.postTitle,
      applicant: params.applicantName
    })
  }

  /**
   * 지원 수락 알림 (지원자에게)
   */
  async notifyApplicationAccepted(params: {
    applicantId: string
    postId: string
    postTitle: string
    organizerId: string
    organizerName: string
  }): Promise<void> {
    const { title, message } = NotificationTemplates.applicationAccepted(
      params.postTitle,
      params.organizerName
    )

    await this.createNotification({
      userId: params.applicantId,
      type: 'application_accepted',
      title,
      message,
      postId: params.postId,
      postTitle: params.postTitle,
      organizerId: params.organizerId,
      organizerName: params.organizerName,
      isRead: false,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp()
    })

    console.log('🔔 [NotificationService] 지원 수락 알림 발송:', {
      to: params.applicantId,
      post: params.postTitle,
      organizer: params.organizerName
    })
  }

  /**
   * 지원 거절 알림 (지원자에게)
   */
  async notifyApplicationRejected(params: {
    applicantId: string
    postId: string
    postTitle: string
    organizerId: string
    organizerName: string
  }): Promise<void> {
    const { title, message } = NotificationTemplates.applicationRejected(
      params.postTitle,
      params.organizerName
    )

    await this.createNotification({
      userId: params.applicantId,
      type: 'application_rejected',
      title,
      message,
      postId: params.postId,
      postTitle: params.postTitle,
      organizerId: params.organizerId,
      organizerName: params.organizerName,
      isRead: false,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp()
    })

    console.log('🔔 [NotificationService] 지원 거절 알림 발송:', {
      to: params.applicantId,
      post: params.postTitle,
      organizer: params.organizerName
    })
  }

  /**
   * 지원 취소 알림 (운영자에게)
   */
  async notifyApplicationCancelled(params: {
    organizerId: string
    postId: string
    postTitle: string
    applicantId: string
    applicantName: string
  }): Promise<void> {
    const { title, message } = NotificationTemplates.applicationCancelled(
      params.postTitle,
      params.applicantName
    )

    await this.createNotification({
      userId: params.organizerId,
      type: 'application_cancelled',
      title,
      message,
      postId: params.postId,
      postTitle: params.postTitle,
      applicantId: params.applicantId,
      applicantName: params.applicantName,
      isRead: false,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp()
    })

    console.log('🔔 [NotificationService] 지원 취소 알림 발송:', {
      to: params.organizerId,
      post: params.postTitle,
      applicant: params.applicantName
    })
  }

  /**
   * 공고 상태 변경 알림 (해당 공고 지원자들에게)
   */
  async notifyPostStatusChanged(params: {
    postId: string
    postTitle: string
    newStatus: 'active' | 'closed'
    applicantIds: string[]
  }): Promise<void> {
    const { title, message } = NotificationTemplates.postStatusChanged(
      params.postTitle,
      params.newStatus
    )

    // 모든 지원자에게 알림 발송
    const promises = params.applicantIds.map(applicantId =>
      this.createNotification({
        userId: applicantId,
        type: 'post_status_changed',
        title,
        message,
        postId: params.postId,
        postTitle: params.postTitle,
        isRead: false,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp()
      })
    )

    await Promise.all(promises)

    console.log('🔔 [NotificationService] 공고 상태 변경 알림 발송:', {
      post: params.postTitle,
      status: params.newStatus,
      recipients: params.applicantIds.length
    })
  }

  /**
   * 공고 수정 알림 (해당 공고 지원자들에게)
   */
  async notifyPostUpdated(params: {
    postId: string
    postTitle: string
    applicantIds: string[]
  }): Promise<void> {
    const { title, message } = NotificationTemplates.postUpdated(params.postTitle)

    // 모든 지원자에게 알림 발송
    const promises = params.applicantIds.map(applicantId =>
      this.createNotification({
        userId: applicantId,
        type: 'post_updated',
        title,
        message,
        postId: params.postId,
        postTitle: params.postTitle,
        isRead: false,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp()
      })
    )

    await Promise.all(promises)

    console.log('🔔 [NotificationService] 공고 수정 알림 발송:', {
      post: params.postTitle,
      recipients: params.applicantIds.length
    })
  }
}

// 싱글톤 인스턴스 생성
export const notificationService = new NotificationService()