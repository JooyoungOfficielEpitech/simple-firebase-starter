import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore"
import { 
  Notification, 
  CreateNotification, 
  UpdateNotification,
  NotificationType,
  NotificationTemplates
} from "@/core/types/notification"

export class NotificationService {
  private db: FirebaseFirestoreTypes.Module
  private unreadCountCache: Map<string, { count: number; timestamp: number }> = new Map()
  private notificationListCache: Map<string, { notifications: Notification[]; timestamp: number }> = new Map()
  private readonly UNREAD_COUNT_CACHE_TTL = 1 * 60 * 1000 // 1분 (실시간성 중요)
  private readonly LIST_CACHE_TTL = 2 * 60 * 1000 // 2분

  // 성능 메트릭
  private cacheHits = 0
  private cacheMisses = 0
  private dbReads = 0
  private batchWrites = 0

  constructor(firestoreInstance = firestore()) {
    this.db = firestoreInstance
  }

  /**
   * 캐시에서 읽지 않은 알림 수 조회
   */
  private getCachedUnreadCount(userId: string): number | null {
    const cached = this.unreadCountCache.get(userId)
    if (cached && Date.now() - cached.timestamp < this.UNREAD_COUNT_CACHE_TTL) {
      this.cacheHits++
      console.log(`💾 [NotificationService] 읽지 않은 알림 수 캐시 조회: ${userId}`)
      return cached.count
    }
    this.cacheMisses++
    return null
  }

  /**
   * 캐시에 읽지 않은 알림 수 저장
   */
  private setCachedUnreadCount(userId: string, count: number): void {
    this.unreadCountCache.set(userId, {
      count,
      timestamp: Date.now()
    })
  }

  /**
   * 캐시에서 알림 목록 조회
   */
  private getCachedNotificationList(cacheKey: string): Notification[] | null {
    const cached = this.notificationListCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.LIST_CACHE_TTL) {
      this.cacheHits++
      console.log(`💾 [NotificationService] 알림 목록 캐시 조회: ${cacheKey}`)
      return cached.notifications
    }
    this.cacheMisses++
    return null
  }

  /**
   * 캐시에 알림 목록 저장
   */
  private setCachedNotificationList(cacheKey: string, notifications: Notification[]): void {
    this.notificationListCache.set(cacheKey, {
      notifications,
      timestamp: Date.now()
    })
  }

  /**
   * 읽지 않은 알림 수 캐시 무효화
   */
  private invalidateUnreadCountCache(userId: string): void {
    this.unreadCountCache.delete(userId)
    console.log(`🗑️ [NotificationService] 읽지 않은 알림 수 캐시 무효화: ${userId}`)
  }

  /**
   * 알림 목록 캐시 무효화
   */
  private invalidateNotificationListCache(userId: string): void {
    // userId를 포함하는 모든 캐시 키 삭제
    const keysToDelete: string[] = []
    this.notificationListCache.forEach((_, key) => {
      if (key.includes(userId)) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => this.notificationListCache.delete(key))
    console.log(`🗑️ [NotificationService] 알림 목록 캐시 무효화: ${userId}`)
  }

  /**
   * 모든 캐시 무효화
   */
  private invalidateAllCaches(userId: string): void {
    this.invalidateUnreadCountCache(userId)
    this.invalidateNotificationListCache(userId)
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

      // 캐시 무효화 (새 알림 생성)
      this.invalidateAllCaches(data.userId)

      console.log('🔔 [NotificationService] 알림 생성됨:', docRef.id)
      return docRef.id
    } catch (error) {
      console.error('❌ [NotificationService] 알림 생성 실패:', error)
      throw error
    }
  }

  /**
   * 사용자별 알림 목록 실시간 구독 - 서버 사이드 최적화
   */
  subscribeToUserNotifications(
    userId: string, 
    callback: (notifications: Notification[]) => void,
    maxLimit = 50
  ): () => void {
    console.log('🔥 [NotificationService] 서버 사이드 최적화된 알림 구독 시작:', { userId: '로그인 상태', maxLimit })
    
    return this.db
      .collection('notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc') // 서버에서 정렬
      .limit(maxLimit) // 서버에서 제한
      .onSnapshot(
        (snapshot) => {
          console.log(`📊 [NotificationService] 서버 사이드 필터링된 알림 수: ${snapshot.docs.length}`)
          
          const notifications: Notification[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          } as Notification))
          
          console.log(`✅ [NotificationService] 서버 사이드 최적화 완료: 클라이언트 정렬/제한 제거`)
          callback(notifications)
        },
        (error) => {
          const firestoreError = error as { code?: string; message: string }
          if (firestoreError.code === 'firestore/failed-precondition' && error.message.includes('index')) {
            console.warn("⏳ [NotificationService] 인덱스 생성 중 - 잠시 후 다시 시도하세요")
          } else {
            console.error('❌ [NotificationService] 알림 구독 오류:', firestoreError.code || error.message)
          }
          callback([])
        }
      )
  }

  /**
   * 알림 읽음 처리
   */
  async markAsRead(notificationId: string, userId?: string): Promise<void> {
    try {
      await this.db.collection('notifications').doc(notificationId).update({
        isRead: true,
        readAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp()
      })

      // 캐시 무효화
      if (userId) {
        this.invalidateAllCaches(userId)
      }

      console.log('✅ [NotificationService] 알림 읽음 처리됨:', notificationId)
    } catch (error) {
      console.error('❌ [NotificationService] 알림 읽음 처리 실패:', error)
      throw error
    }
  }

  /**
   * 여러 알림 읽음 처리 - 배치 처리
   */
  async markMultipleAsRead(notificationIds: string[], userId?: string): Promise<void> {
    try {
      if (notificationIds.length === 0) return

      // Firestore 배치 쓰기 (최대 500개)
      const batch = this.db.batch()

      notificationIds.forEach(id => {
        const docRef = this.db.collection('notifications').doc(id)
        batch.update(docRef, {
          isRead: true,
          readAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp()
        })
      })

      this.batchWrites++
      await batch.commit()

      // 캐시 무효화
      if (userId) {
        this.invalidateAllCaches(userId)
      }

      console.log(`✅ [NotificationService] ${notificationIds.length}개 알림 일괄 읽음 처리 완료 (배치: ${this.batchWrites})`)
    } catch (error) {
      console.error('❌ [NotificationService] 일괄 읽음 처리 실패:', error)
      throw error
    }
  }

  /**
   * 읽지 않은 알림 수 조회 - 서버 사이드 필터링 + 캐싱
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      // 캐시 확인
      const cached = this.getCachedUnreadCount(userId)
      if (cached !== null) {
        return cached
      }

      console.log('🔥 [NotificationService] 서버 사이드 읽지 않은 알림 수 조회')
      this.dbReads++

      const snapshot = await this.db
        .collection('notifications')
        .where('userId', '==', userId)
        .where('isRead', '==', false) // 서버에서 필터링
        .get()

      const count = snapshot.size
      console.log(`✅ [NotificationService] 서버 사이드 필터링 완료: ${count}개 읽지 않은 알림`)

      // 캐시 저장
      this.setCachedUnreadCount(userId, count)

      return count
    } catch (error) {
      if (error.code === 'firestore/failed-precondition' && error.message.includes('index')) {
        console.warn("⏳ [NotificationService] 인덱스 생성 중 - 0 반환")
        return 0
      }
      console.error('❌ [NotificationService] 읽지 않은 알림 수 조회 실패:', error.code || error.message)
      return 0
    }
  }

  /**
   * 읽지 않은 알림 수 실시간 구독 - 서버 사이드 필터링
   */
  subscribeToUnreadCount(userId: string, callback: (count: number) => void): () => void {
    console.log('🔥 [NotificationService] 서버 사이드 읽지 않은 알림 수 구독 시작')
    
    return this.db
      .collection('notifications')
      .where('userId', '==', userId)
      .where('isRead', '==', false) // 서버에서 필터링
      .onSnapshot(
        (snapshot) => {
          console.log(`📊 [NotificationService] 서버 사이드 필터링된 읽지 않은 알림: ${snapshot.size}개`)
          callback(snapshot.size)
        },
        (error) => {
          const firestoreError = error as { code?: string; message: string }
          if (firestoreError.code === 'firestore/failed-precondition' && error.message.includes('index')) {
            console.warn("⏳ [NotificationService] 인덱스 생성 중 - 0 반환")
          } else {
            console.error('❌ [NotificationService] 읽지 않은 알림 수 구독 오류:', firestoreError.code || error.message)
          }
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

      let query: FirebaseFirestoreTypes.Query<FirebaseFirestoreTypes.DocumentData> = this.db.collection('notifications')
      
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
   * 공고 상태 변경 알림 (해당 공고 지원자들에게) - 배치 처리 최적화
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

    if (params.applicantIds.length === 0) return

    // 배치 쓰기로 최적화 (최대 500개)
    const batch = this.db.batch()
    const timestamp = firestore.FieldValue.serverTimestamp()

    // 필수 필드만 전송하여 데이터 전송량 최소화
    params.applicantIds.forEach(applicantId => {
      const docRef = this.db.collection('notifications').doc()
      batch.set(docRef, {
        userId: applicantId,
        type: 'post_status_changed',
        title,
        message,
        postId: params.postId,
        postTitle: params.postTitle,
        isRead: false,
        createdAt: timestamp,
        updatedAt: timestamp
      })
    })

    this.batchWrites++
    await batch.commit()

    // 캐시 무효화
    params.applicantIds.forEach(id => this.invalidateAllCaches(id))

    console.log('🔔 [NotificationService] 공고 상태 변경 알림 발송:', {
      post: params.postTitle,
      status: params.newStatus,
      recipients: params.applicantIds.length,
      batchCount: this.batchWrites
    })
  }

  /**
   * 공고 수정 알림 (해당 공고 지원자들에게) - 배치 처리 최적화
   */
  async notifyPostUpdated(params: {
    postId: string
    postTitle: string
    applicantIds: string[]
  }): Promise<void> {
    const { title, message } = NotificationTemplates.postUpdated(params.postTitle)

    if (params.applicantIds.length === 0) return

    // 배치 쓰기로 최적화 (최대 500개)
    const batch = this.db.batch()
    const timestamp = firestore.FieldValue.serverTimestamp()

    // 필수 필드만 전송하여 데이터 전송량 최소화
    params.applicantIds.forEach(applicantId => {
      const docRef = this.db.collection('notifications').doc()
      batch.set(docRef, {
        userId: applicantId,
        type: 'post_updated',
        title,
        message,
        postId: params.postId,
        postTitle: params.postTitle,
        isRead: false,
        createdAt: timestamp,
        updatedAt: timestamp
      })
    })

    this.batchWrites++
    await batch.commit()

    // 캐시 무효화
    params.applicantIds.forEach(id => this.invalidateAllCaches(id))

    console.log('🔔 [NotificationService] 공고 수정 알림 발송:', {
      post: params.postTitle,
      recipients: params.applicantIds.length,
      batchCount: this.batchWrites
    })
  }

  /**
   * 성능 메트릭 조회
   */
  getPerformanceMetrics(): {
    cacheHits: number
    cacheMisses: number
    dbReads: number
    batchWrites: number
    hitRate: string
  } {
    const total = this.cacheHits + this.cacheMisses
    const hitRate = total > 0 ? ((this.cacheHits / total) * 100).toFixed(2) : '0.00'
    return {
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      dbReads: this.dbReads,
      batchWrites: this.batchWrites,
      hitRate: `${hitRate}%`
    }
  }

  /**
   * 성능 메트릭 리셋
   */
  resetPerformanceMetrics(): void {
    this.cacheHits = 0
    this.cacheMisses = 0
    this.dbReads = 0
    this.batchWrites = 0
    console.log('🔄 [NotificationService] 성능 메트릭 초기화')
  }
}

// 싱글톤 인스턴스 생성
export const notificationService = new NotificationService()