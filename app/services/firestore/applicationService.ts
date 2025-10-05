import auth from "@react-native-firebase/auth"
import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore"

import { translate } from "@/i18n/translate"
import { notificationService } from "./notificationService"

// 지원서 상태
export type ApplicationStatus = "pending" | "accepted" | "rejected" | "withdrawn"

// 지원서 인터페이스
export interface Application {
  id: string
  postId: string
  applicantId: string
  applicantName: string
  applicantEmail: string
  status: ApplicationStatus
  message?: string
  portfolio?: string
  phoneNumber?: string
  experience?: string
  rolePreference?: string
  availableDates?: string[]
  createdAt: FirebaseFirestoreTypes.Timestamp
  updatedAt: FirebaseFirestoreTypes.Timestamp
}

// 지원서 생성 페이로드
export type CreateApplication = {
  postId: string
  message?: string
  portfolio?: string
  phoneNumber?: string
  experience?: string
  rolePreference?: string
  availableDates?: string[]
}

// 지원서 업데이트 페이로드
export type UpdateApplication = Partial<
  Pick<Application, "status" | "message" | "portfolio" | "phoneNumber" | "experience" | "rolePreference" | "availableDates">
>

// 캐시 인터페이스
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

// 페이지네이션 결과 인터페이스
interface PaginatedResult<T> {
  data: T[]
  lastDoc: FirebaseFirestoreTypes.DocumentSnapshot | null
  hasMore: boolean
  total?: number
}

// 쿼리 옵션 인터페이스
interface ApplicationQueryOptions {
  limit?: number
  startAfter?: FirebaseFirestoreTypes.DocumentSnapshot
  orderBy?: 'createdAt' | 'updatedAt'
  orderDirection?: 'asc' | 'desc'
  status?: ApplicationStatus
  postId?: string
  applicantId?: string
}

/**
 * 지원서 관련 Firestore 서비스 - 최적화된 쿼리와 캐싱 지원
 * 인덱스 활용:
 * - postId + status + createdAt (desc)
 * - applicantId + createdAt (desc)
 */
export class ApplicationService {
  public db: FirebaseFirestoreTypes.Module
  private cache: Map<string, CacheEntry<any>> = new Map()
  private readonly CACHE_TTL = 3 * 60 * 1000 // 3분 (지원서는 더 자주 변경될 수 있음)
  private readonly DEFAULT_PAGE_SIZE = 20
  private readonly MAX_PAGE_SIZE = 50

  constructor(db: FirebaseFirestoreTypes.Module) {
    this.db = db
    
    // 캐시 정리 스케줄러 (5분마다)
    setInterval(() => this.cleanupCache(), 5 * 60 * 1000)
  }

  /**
   * 현재 사용자 ID 가져오기
   */
  private getCurrentUserId(): string {
    const user = auth().currentUser
    if (!user) {
      throw new Error(translate("matching:errors.userNotFound"))
    }
    return user.uid
  }

  /**
   * 서버 타임스탬프 생성
   */
  private getServerTimestamp(): FirebaseFirestoreTypes.FieldValue {
    return firestore.FieldValue.serverTimestamp()
  }

  /**
   * 캐시 관리 메서드들
   */
  private getCacheKey(collection: string, query: string): string {
    return `${collection}:${query}`
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }

  private setCache<T>(key: string, data: T, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  private cleanupCache(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  private invalidateCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear()
      return
    }
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * 에러 처리 래퍼
   */
  private async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      console.error(`❌ [ApplicationService] ${context} 실패:`, {
        error: error.message,
        code: error.code,
        stack: error.stack
      })
      
      if (error.code === 'permission-denied') {
        throw new Error("Permission denied")
      } else if (error.code === 'not-found') {
        throw new Error("Application not found")
      } else if (error.code === 'unavailable') {
        throw new Error("Service unavailable")
      }
      
      throw error
    }
  }

  /**
   * 지원서 생성
   */
  async createApplication(applicationData: CreateApplication): Promise<string> {
    const userId = this.getCurrentUserId()
    
    return this.executeWithErrorHandling(async () => {
      // 중복 지원 확인 (철회된 지원서 제외)
      const existingApplications = await this.db
        .collection("applications")
        .where("postId", "==", applicationData.postId)
        .where("applicantId", "==", userId)
        .get()

      // 철회되지 않은 지원서가 있는지 확인
      const activeApplications = existingApplications.docs.filter(doc => {
        const data = doc.data()
        return data.status !== "withdrawn"
      })

      if (activeApplications.length > 0) {
        throw new Error("이미 해당 공고에 지원하셨습니다.")
      }

      // 사용자 정보 조회
      const userDoc = await this.db.collection("users").doc(userId).get()
      if (!userDoc.exists) {
        throw new Error("사용자 정보를 찾을 수 없습니다.")
      }
      
      const userData = userDoc.data()
      const docRef = this.db.collection("applications").doc()
      
      // 기본 필수 필드들
      const application: any = {
        postId: applicationData.postId,
        applicantId: userId,
        applicantName: userData?.name || userData?.displayName || "Unknown",
        applicantEmail: userData?.email || "",
        status: "pending" as ApplicationStatus,
        availableDates: applicationData.availableDates || [],
        createdAt: this.getServerTimestamp(),
        updatedAt: this.getServerTimestamp(),
      }

      // 선택적 필드들 - undefined가 아닌 경우에만 추가
      if (applicationData.message && applicationData.message.trim()) {
        application.message = applicationData.message.trim()
      }
      if (applicationData.portfolio && applicationData.portfolio.trim()) {
        application.portfolio = applicationData.portfolio.trim()
      }
      if (applicationData.phoneNumber && applicationData.phoneNumber.trim()) {
        application.phoneNumber = applicationData.phoneNumber.trim()
      }
      if (applicationData.experience && applicationData.experience.trim()) {
        application.experience = applicationData.experience.trim()
      }
      if (applicationData.rolePreference && applicationData.rolePreference.trim()) {
        application.rolePreference = applicationData.rolePreference.trim()
      }

      await docRef.set(application)
      
      // 공고 정보 조회 (운영자 알림용)
      const postDoc = await this.db.collection("posts").doc(applicationData.postId).get()
      if (postDoc.exists) {
        const postData = postDoc.data()
        
        // 운영자에게 새 지원자 알림 발송
        try {
          await notificationService.notifyApplicationReceived({
            organizerId: postData?.authorId,
            postId: applicationData.postId,
            postTitle: postData?.title || "공고",
            applicantId: userId,
            applicantName: application.applicantName
          })
        } catch (notificationError) {
          console.error('❌ [ApplicationService] 알림 발송 실패:', notificationError)
          // 알림 발송 실패는 지원서 생성을 방해하지 않음
        }
      }
      
      // 캐시 무효화
      this.invalidateCache('applications')
      
      console.log(`📝 [ApplicationService] 지원서 생성: ${docRef.id} for post ${applicationData.postId}`)
      return docRef.id
    }, '지원서 생성')
  }

  /**
   * 게시글별 지원서 목록 조회 (페이지네이션 지원)
   * 인덱스 활용: postId + status + createdAt (desc)
   */
  async getApplicationsByPost(
    postId: string,
    options: ApplicationQueryOptions = {}
  ): Promise<PaginatedResult<Application>> {
    const {
      limit = this.DEFAULT_PAGE_SIZE,
      startAfter,
      orderDirection = 'desc',
      status
    } = options

    const finalLimit = Math.min(limit, this.MAX_PAGE_SIZE)
    const cacheKey = this.getCacheKey('applications', 
      `post_${postId}_${status || 'all'}_${finalLimit}_${startAfter?.id || 'start'}`
    )

    if (!startAfter) {
      const cached = this.getFromCache<PaginatedResult<Application>>(cacheKey)
      if (cached) {
        console.log('📋 [ApplicationService] 캐시에서 지원서 목록 조회')
        return cached
      }
    }

    return this.executeWithErrorHandling(async () => {
      let query = this.db
        .collection("applications")
        .where("postId", "==", postId)

      if (status) {
        query = query.where("status", "==", status)
      }

      query = query
        .orderBy("createdAt", orderDirection)
        .limit(finalLimit + 1)

      if (startAfter) {
        query = query.startAfter(startAfter)
      }

      const snapshot = await query.get()
      const docs = snapshot.docs
      const hasMore = docs.length > finalLimit
      
      const actualDocs = hasMore ? docs.slice(0, finalLimit) : docs
      const lastDoc = actualDocs.length > 0 ? actualDocs[actualDocs.length - 1] : null

      const applications = actualDocs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Application))

      const result: PaginatedResult<Application> = {
        data: applications,
        lastDoc,
        hasMore
      }

      if (!startAfter) {
        this.setCache(cacheKey, result)
      }

      console.log(`✅ [ApplicationService] 게시글별 지원서 조회 완료 - ${applications.length}개`)
      return result
    }, '게시글별 지원서 조회')
  }

  /**
   * 지원자별 지원서 목록 조회 (페이지네이션 지원)
   * 인덱스 활용: applicantId + createdAt (desc)
   */
  async getApplicationsByApplicant(
    applicantId?: string,
    options: ApplicationQueryOptions = {}
  ): Promise<PaginatedResult<Application>> {
    const userId = applicantId || this.getCurrentUserId()
    const {
      limit = this.DEFAULT_PAGE_SIZE,
      startAfter,
      orderDirection = 'desc',
      status
    } = options

    const finalLimit = Math.min(limit, this.MAX_PAGE_SIZE)
    const cacheKey = this.getCacheKey('applications', 
      `applicant_${userId}_${status || 'all'}_${finalLimit}_${startAfter?.id || 'start'}`
    )

    if (!startAfter) {
      const cached = this.getFromCache<PaginatedResult<Application>>(cacheKey)
      if (cached) {
        return cached
      }
    }

    return this.executeWithErrorHandling(async () => {
      let query = this.db
        .collection("applications")
        .where("applicantId", "==", userId)

      if (status) {
        query = query.where("status", "==", status)
      }

      query = query
        .orderBy("createdAt", orderDirection)
        .limit(finalLimit + 1)

      if (startAfter) {
        query = query.startAfter(startAfter)
      }

      const snapshot = await query.get()
      const docs = snapshot.docs
      const hasMore = docs.length > finalLimit
      
      const actualDocs = hasMore ? docs.slice(0, finalLimit) : docs
      const lastDoc = actualDocs.length > 0 ? actualDocs[actualDocs.length - 1] : null

      const applications = actualDocs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Application))

      const result: PaginatedResult<Application> = {
        data: applications,
        lastDoc,
        hasMore
      }

      if (!startAfter) {
        this.setCache(cacheKey, result)
      }

      return result
    }, '지원자별 지원서 조회')
  }

  /**
   * 지원서 조회 (단일)
   */
  async getApplication(applicationId: string): Promise<Application | null> {
    const cacheKey = this.getCacheKey('application', applicationId)
    const cached = this.getFromCache<Application>(cacheKey)
    if (cached) {
      return cached
    }

    return this.executeWithErrorHandling(async () => {
      const doc = await this.db.collection("applications").doc(applicationId).get()

      if (!doc.exists) {
        return null
      }

      const application = {
        id: doc.id,
        ...doc.data(),
      } as Application

      this.setCache(cacheKey, application)
      return application
    }, '지원서 단일 조회')
  }

  /**
   * 지원서 상태 업데이트 (운영자용)
   */
  async updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus
  ): Promise<void> {
    const userId = this.getCurrentUserId()
    
    return this.executeWithErrorHandling(async () => {
      // 권한 확인 - 게시글 작성자만 가능
      const application = await this.getApplication(applicationId)
      if (!application) {
        throw new Error("지원서를 찾을 수 없습니다.")
      }

      const postDoc = await this.db.collection("posts").doc(application.postId).get()
      if (!postDoc.exists) {
        throw new Error("해당 게시글을 찾을 수 없습니다.")
      }

      const postData = postDoc.data()
      if (postData?.authorId !== userId) {
        throw new Error("본인이 작성한 게시글의 지원서만 관리할 수 있습니다.")
      }

      await this.db.collection("applications").doc(applicationId).update({
        status,
        updatedAt: this.getServerTimestamp(),
      })
      
      // 지원자에게 결과 알림 발송
      try {
        if (status === 'accepted') {
          await notificationService.notifyApplicationAccepted({
            applicantId: application.applicantId,
            postId: application.postId,
            postTitle: postData?.title || "공고",
            organizerId: userId,
            organizerName: postData?.authorName || "운영자"
          })
        } else if (status === 'rejected') {
          await notificationService.notifyApplicationRejected({
            applicantId: application.applicantId,
            postId: application.postId,
            postTitle: postData?.title || "공고",
            organizerId: userId,
            organizerName: postData?.authorName || "운영자"
          })
        }
      } catch (notificationError) {
        console.error('❌ [ApplicationService] 상태 변경 알림 발송 실패:', notificationError)
        // 알림 발송 실패는 상태 업데이트를 방해하지 않음
      }
      
      // 캐시 무효화
      this.invalidateCache(applicationId)
      this.invalidateCache('applications')

      console.log(`✅ [ApplicationService] 지원서 상태 업데이트: ${applicationId} -> ${status}`)
    }, '지원서 상태 업데이트')
  }

  /**
   * 지원서 수정 (지원자용)
   */
  async updateApplication(
    applicationId: string,
    updateData: UpdateApplication
  ): Promise<void> {
    const userId = this.getCurrentUserId()
    
    return this.executeWithErrorHandling(async () => {
      // 권한 확인 - 지원자 본인만 가능
      const application = await this.getApplication(applicationId)
      if (!application) {
        throw new Error("지원서를 찾을 수 없습니다.")
      }

      if (application.applicantId !== userId) {
        throw new Error("본인의 지원서만 수정할 수 있습니다.")
      }

      if (application.status !== 'pending') {
        throw new Error("검토 중인 지원서만 수정할 수 있습니다.")
      }

      await this.db.collection("applications").doc(applicationId).update({
        ...updateData,
        updatedAt: this.getServerTimestamp(),
      })
      
      // 캐시 무효화
      this.invalidateCache(applicationId)
      this.invalidateCache('applications')
    }, '지원서 수정')
  }

  /**
   * 지원서 철회 (지원자용)
   */
  async withdrawApplication(applicationId: string): Promise<void> {
    const userId = this.getCurrentUserId()
    
    return this.executeWithErrorHandling(async () => {
      const application = await this.getApplication(applicationId)
      if (!application) {
        throw new Error("지원서를 찾을 수 없습니다.")
      }

      if (application.applicantId !== userId) {
        throw new Error("본인의 지원서만 철회할 수 있습니다.")
      }

      if (application.status === 'withdrawn') {
        throw new Error("이미 철회된 지원서입니다.")
      }

      // 상태를 withdrawn으로 직접 업데이트 (알림 발송 로직 별도 처리)
      await this.db.collection("applications").doc(applicationId).update({
        status: 'withdrawn',
        updatedAt: this.getServerTimestamp(),
      })
      
      // 운영자에게 지원 취소 알림 발송
      try {
        const postDoc = await this.db.collection("posts").doc(application.postId).get()
        if (postDoc.exists) {
          const postData = postDoc.data()
          
          await notificationService.notifyApplicationCancelled({
            organizerId: postData?.authorId,
            postId: application.postId,
            postTitle: postData?.title || "공고",
            applicantId: userId,
            applicantName: application.applicantName
          })
        }
      } catch (notificationError) {
        console.error('❌ [ApplicationService] 지원 취소 알림 발송 실패:', notificationError)
        // 알림 발송 실패는 취소를 방해하지 않음
      }
      
      // 캐시 무효화
      this.invalidateCache(applicationId)
      this.invalidateCache('applications')
    }, '지원서 철회')
  }

  /**
   * 특정 게시글에 대한 지원 여부 확인 (철회된 지원서 제외)
   */
  async hasAppliedToPost(postId: string, applicantId?: string): Promise<boolean> {
    const userId = applicantId || this.getCurrentUserId()
    
    return this.executeWithErrorHandling(async () => {
      // 먼저 기본 쿼리로 모든 지원서를 가져온 후 클라이언트에서 필터링
      const snapshot = await this.db
        .collection("applications")
        .where("postId", "==", postId)
        .where("applicantId", "==", userId)
        .get()
      
      // 철회되지 않은 지원서가 있는지 확인
      const activeApplications = snapshot.docs.filter(doc => {
        const data = doc.data()
        return data.status !== "withdrawn"
      })
      
      return activeApplications.length > 0
    }, '지원 여부 확인')
  }

  /**
   * 지원서 통계 조회
   */
  async getApplicationStats(postId?: string): Promise<{
    total: number
    pending: number
    accepted: number
    rejected: number
    withdrawn: number
  }> {
    const cacheKey = this.getCacheKey('stats', postId || 'global')
    const cached = this.getFromCache<any>(cacheKey)
    if (cached) {
      return cached
    }

    return this.executeWithErrorHandling(async () => {
      let query: any = this.db.collection("applications")
      
      if (postId) {
        query = query.where("postId", "==", postId)
      }
      
      const snapshot = await query.get()
      
      const stats = {
        total: snapshot.size,
        pending: 0,
        accepted: 0,
        rejected: 0,
        withdrawn: 0
      }
      
      snapshot.docs.forEach(doc => {
        const data = doc.data()
        const status = data.status as ApplicationStatus
        stats[status] = (stats[status] || 0) + 1
      })
      
      this.setCache(cacheKey, stats, this.CACHE_TTL * 2)
      return stats
    }, '지원서 통계 조회')
  }

  /**
   * 지원서 실시간 리스너 (게시글별)
   */
  subscribeToApplicationsByPost(
    postId: string,
    callback: (applications: Application[]) => void,
    options: { status?: ApplicationStatus; limit?: number } = {}
  ): () => void {
    const { status, limit = this.DEFAULT_PAGE_SIZE } = options
    const finalLimit = Math.min(limit, this.MAX_PAGE_SIZE)
    
    console.log(`🔔 [ApplicationService] 게시글별 지원서 구독 시작: ${postId}`)
    
    let query = this.db
      .collection("applications")
      .where("postId", "==", postId)
    
    if (status) {
      query = query.where("status", "==", status)
    }
    
    return query
      .orderBy("createdAt", "desc")
      .onSnapshot(
        (snapshot) => {
          let applications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          } as Application))
          
          // 클라이언트에서 limit 적용 (인덱스 문제 해결을 위한 임시 조치)
          if (applications.length > finalLimit) {
            applications = applications.slice(0, finalLimit)
          }
          
          // 실시간 업데이트시 캐시 무효화
          this.invalidateCache(`post_${postId}`)
          
          console.log(`✅ [ApplicationService] 게시글별 지원서 ${applications.length}개 반환`)
          callback(applications)
        },
        (error) => {
          console.error("❌ [ApplicationService] 게시글별 지원서 구독 오류:", error)
          callback([])
        }
      )
  }

  /**
   * 지원서 실시간 리스너 (지원자별)
   */
  subscribeToApplicationsByApplicant(
    applicantId: string,
    callback: (applications: Application[]) => void,
    options: { status?: ApplicationStatus; limit?: number } = {}
  ): () => void {
    const { status, limit = this.DEFAULT_PAGE_SIZE } = options
    const finalLimit = Math.min(limit, this.MAX_PAGE_SIZE)
    
    let query = this.db
      .collection("applications")
      .where("applicantId", "==", applicantId)
    
    if (status) {
      query = query.where("status", "==", status)
    }
    
    return query
      .orderBy("createdAt", "desc")
      .limit(finalLimit)
      .onSnapshot(
        (snapshot) => {
          const applications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          } as Application))
          
          // 실시간 업데이트시 캐시 무효화
          this.invalidateCache(`applicant_${applicantId}`)
          
          callback(applications)
        },
        (error) => {
          console.error("❌ [ApplicationService] 지원자별 지원서 구독 오류:", error)
          callback([])
        }
      )
  }
}