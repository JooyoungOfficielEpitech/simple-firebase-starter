import auth from "@react-native-firebase/auth"
import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore"

import { translate } from "@/i18n/translate"
import { Organization, CreateOrganization, UpdateOrganization } from "@/types/organization"
import {
  withRetry,
  getUserFriendlyMessage,
  logFirebaseError,
} from "@/services/error/firebaseErrorHandler"

/**
 * 단체 관련 Firestore 서비스
 */
export class OrganizationService {
  private db: FirebaseFirestoreTypes.Module
  private organizationCache: Map<string, { data: Organization; timestamp: number }> = new Map()
  private organizationListCache: Map<string, { data: Organization[]; timestamp: number }> = new Map()
  private organizationNameCache: Map<string, { data: Organization | null; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5분
  private readonly LIST_CACHE_TTL = 3 * 60 * 1000 // 3분 (목록은 조금 더 짧게)

  // 성능 메트릭
  private cacheHits = 0
  private cacheMisses = 0
  private dbReads = 0

  constructor(db: FirebaseFirestoreTypes.Module) {
    this.db = db
  }

  /**
   * 캐시에서 단체 조회
   */
  private getCachedOrganization(organizationId: string): Organization | null {
    const cached = this.organizationCache.get(organizationId)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.cacheHits++
      return cached.data
    }
    this.cacheMisses++
    return null
  }

  /**
   * 캐시에 단체 저장
   */
  private setCachedOrganization(organizationId: string, data: Organization): void {
    this.organizationCache.set(organizationId, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * 캐시에서 목록 조회
   */
  private getCachedOrganizationList(cacheKey: string): Organization[] | null {
    const cached = this.organizationListCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.LIST_CACHE_TTL) {
      console.log(`💾 [OrganizationService] 캐시에서 목록 조회: ${cacheKey}`)
      return cached.data
    }
    return null
  }

  /**
   * 캐시에 목록 저장
   */
  private setCachedOrganizationList(cacheKey: string, data: Organization[]): void {
    this.organizationListCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * 이름 캐시에서 조회
   */
  private getCachedOrganizationByName(name: string): Organization | null | undefined {
    const cached = this.organizationNameCache.get(name.toLowerCase())
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`💾 [OrganizationService] 이름 캐시에서 조회: ${name}`)
      return cached.data
    }
    return undefined
  }

  /**
   * 이름 캐시에 저장
   */
  private setCachedOrganizationByName(name: string, data: Organization | null): void {
    this.organizationNameCache.set(name.toLowerCase(), {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * 캐시 무효화
   */
  private invalidateCache(organizationId?: string): void {
    if (organizationId) {
      this.organizationCache.delete(organizationId)
      console.log(`🗑️ [OrganizationService] 단체 캐시 무효화: ${organizationId}`)
    } else {
      this.organizationCache.clear()
      this.organizationListCache.clear()
      this.organizationNameCache.clear()
      console.log(`🗑️ [OrganizationService] 모든 캐시 무효화`)
    }
  }

  /**
   * 목록 캐시 무효화
   */
  private invalidateListCache(): void {
    this.organizationListCache.clear()
    console.log(`🗑️ [OrganizationService] 목록 캐시 무효화`)
  }

  /**
   * 이름 캐시 무효화
   */
  private invalidateNameCache(name?: string): void {
    if (name) {
      this.organizationNameCache.delete(name.toLowerCase())
      console.log(`🗑️ [OrganizationService] 이름 캐시 무효화: ${name}`)
    } else {
      this.organizationNameCache.clear()
      console.log(`🗑️ [OrganizationService] 모든 이름 캐시 무효화`)
    }
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
   * 사용자 친화적 에러 메시지 생성
   */
  private getUserFriendlyErrorMessage(error: any, operation: string): string {
    const errorCode = error?.code || 'unknown'

    const errorMessages: Record<string, string> = {
      'firestore/permission-denied': '해당 작업을 수행할 권한이 없습니다.',
      'firestore/not-found': '요청하신 단체를 찾을 수 없습니다.',
      'firestore/already-exists': '이미 존재하는 단체입니다.',
      'firestore/unavailable': '서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.',
      'firestore/deadline-exceeded': '요청 시간이 초과되었습니다. 다시 시도해주세요.',
      'firestore/cancelled': '작업이 취소되었습니다.',
      'firestore/unauthenticated': '로그인이 필요합니다.',
      'firestore/resource-exhausted': '일시적으로 서비스 이용이 제한되었습니다. 잠시 후 다시 시도해주세요.',
      'auth/user-not-found': '사용자 정보를 찾을 수 없습니다.',
      'auth/invalid-credential': '인증 정보가 올바르지 않습니다.',
    }

    return errorMessages[errorCode] || `${operation} 중 오류가 발생했습니다. 다시 시도해주세요.`
  }

  /**
   * 에러 처리 및 로깅
   */
  private handleOrganizationError(error: any, operation: string): void {
    const errorCode = error?.code || 'unknown'
    const friendlyMessage = this.getUserFriendlyErrorMessage(error, operation)

    // 특정 에러는 경고로, 나머지는 에러로 처리
    if (errorCode === 'firestore/not-found') {
      console.warn(`⚠️ [OrganizationService] ${operation}:`, friendlyMessage)
    } else {
      console.error(`❌ [OrganizationService] ${operation}:`, {
        code: errorCode,
        message: error?.message || 'Unknown error',
        friendlyMessage
      })
    }
  }

  /**
   * 단체명 중복 검증
   */
  async checkOrganizationNameExists(name: string, excludeOwnerId?: string): Promise<boolean> {
    const normalizedName = name.trim().toLowerCase()
    
    let query = this.db
      .collection("organizations")
      .where("name", ">=", normalizedName)
      .where("name", "<=", normalizedName + '\uf8ff')
    
    const snapshot = await query.get()
    
    if (excludeOwnerId) {
      // 특정 소유자를 제외하고 검색
      return snapshot.docs.some(doc => {
        const data = doc.data()
        return data.name.toLowerCase() === normalizedName && data.ownerId !== excludeOwnerId
      })
    }
    
    return snapshot.docs.some(doc => doc.data().name.toLowerCase() === normalizedName)
  }

  /**
   * 단체명으로 단체 조회 - 캐싱 적용 + 필드 최적화
   */
  async getOrganizationByName(name: string): Promise<Organization | null> {
    const normalizedName = name.trim().toLowerCase()

    // 캐시 확인
    const cached = this.getCachedOrganizationByName(normalizedName)
    if (cached !== undefined) {
      console.log(`💾 [OrganizationService] 캐시 히트 (이름): ${normalizedName}`)
      return cached
    }

    console.log(`🔍 [OrganizationService] DB 조회 (이름): ${normalizedName}`)
    this.dbReads++
    const snapshot = await this.db
      .collection("organizations")
      .where("name", ">=", normalizedName)
      .where("name", "<=", normalizedName + '\uf8ff')
      .get()

    const matchingDoc = snapshot.docs.find(doc =>
      doc.data().name.toLowerCase() === normalizedName
    )

    if (!matchingDoc) {
      // null도 캐싱 (불필요한 조회 방지)
      this.setCachedOrganizationByName(normalizedName, null)
      return null
    }

    const organization = {
      id: matchingDoc.id,
      ...matchingDoc.data(),
    } as Organization

    // 캐시 저장 (이름 + ID 모두)
    this.setCachedOrganizationByName(normalizedName, organization)
    this.setCachedOrganization(organization.id, organization)

    return organization
  }

  /**
   * 단체명 유효성 검증 (중복 체크 포함)
   */
  async validateUniqueOrganizationName(name: string, excludeOwnerId?: string): Promise<void> {
    if (!name || !name.trim()) {
      throw new Error("단체명을 입력해주세요.")
    }

    const trimmedName = name.trim()
    if (trimmedName.length < 2) {
      throw new Error("단체명은 최소 2글자 이상이어야 합니다.")
    }

    if (trimmedName.length > 50) {
      throw new Error("단체명은 50글자를 초과할 수 없습니다.")
    }

    const exists = await this.checkOrganizationNameExists(trimmedName, excludeOwnerId)
    if (exists) {
      throw new Error("이미 사용 중인 단체명입니다. 다른 이름을 선택해주세요.")
    }
  }

  /**
   * 사용자의 이전 단체 정보 조회
   */
  async getUserPreviousOrganization(userId: string): Promise<Organization | null> {
    const userProfile = await this.db.collection("users").doc(userId).get()
    
    if (!userProfile.exists) {
      return null
    }

    const userData = userProfile.data()
    if (!userData?.previousOrganizationName) {
      return null
    }

    return await this.getOrganizationByName(userData.previousOrganizationName)
  }

  /**
   * 단체 생성 - 자동 재시도 및 향상된 에러 처리
   */
  async createOrganization(orgData: CreateOrganization, ownerName: string): Promise<string> {
    const userId = this.getCurrentUserId()

    try {
      // 단체명 중복 검증
      await this.validateUniqueOrganizationName(orgData.name)

      const docRef = this.db.collection('organizations').doc()

      const organization = {
        name: orgData.name,
        description: orgData.description,
        contactEmail: orgData.contactEmail,
        contactPhone: orgData.contactPhone || '',
        website: orgData.website || '',
        location: orgData.location,
        establishedDate: orgData.establishedDate || '',
        tags: orgData.tags || [],
        // 소셜 미디어 링크
        instagramUrl: orgData.instagramUrl || '',
        youtubeUrl: orgData.youtubeUrl || '',
        facebookUrl: orgData.facebookUrl || '',
        twitterUrl: orgData.twitterUrl || '',
        // 추가 상세 정보
        foundingStory: orgData.foundingStory || '',
        vision: orgData.vision || '',
        specialties: orgData.specialties || [],
        pastWorks: orgData.pastWorks || [],
        facilities: orgData.facilities || '',
        recruitmentInfo: orgData.recruitmentInfo || '',
        // 기존 필드
        logoUrl: null,
        isVerified: false,
        ownerId: userId,
        ownerName,
        memberCount: 1,
        activePostCount: 0,
        createdAt: this.getServerTimestamp(),
        updatedAt: this.getServerTimestamp(),
      }

      // 단체 생성 (자동 재시도)
      await withRetry(
        async () => {
          await docRef.set(organization)
        },
        '단체 생성',
        { maxRetries: 3 }
      )

      // 캐시 무효화 (새 단체 생성)
      this.invalidateListCache()

      console.log('✅ [OrganizationService] 단체 생성 성공:', docRef.id)
      return docRef.id
    } catch (error) {
      const userMessage = getUserFriendlyMessage(error)
      logFirebaseError('단체 생성 실패', error, { userId, organizationName: orgData.name })
      throw new Error(userMessage)
    }
  }

  /**
   * 단체 조회 (단일) - 캐싱 적용 + 성능 로깅
   */
  async getOrganization(organizationId: string): Promise<Organization | null> {
    // 캐시 확인
    const cached = this.getCachedOrganization(organizationId)
    if (cached) {
      console.log(`💾 [OrganizationService] 캐시 히트 (ID): ${organizationId}`)
      return cached
    }

    console.log(`🔍 [OrganizationService] DB 조회 (ID): ${organizationId}`)
    this.dbReads++
    const doc = await this.db.collection("organizations").doc(organizationId).get()

    if (!doc.exists) {
      return null
    }

    const organization = {
      id: doc.id,
      ...doc.data(),
    } as Organization

    // 캐시 저장
    this.setCachedOrganization(organizationId, organization)

    return organization
  }

  /**
   * 모든 단체 목록 조회 - 캐싱 적용
   */
  async getOrganizations(limit = 20): Promise<Organization[]> {
    const cacheKey = `organizations_list_${limit}`

    // 캐시 확인
    const cached = this.getCachedOrganizationList(cacheKey)
    if (cached) {
      return cached
    }

    const snapshot = await this.db
      .collection("organizations")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get()

    const organizations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Organization))

    // 캐시 저장
    this.setCachedOrganizationList(cacheKey, organizations)

    return organizations
  }

  /**
   * 내가 소유한 단체 조회 - 캐싱 적용
   */
  async getMyOrganizations(): Promise<Organization[]> {
    const userId = this.getCurrentUserId()
    const cacheKey = `my_organizations_${userId}`

    // 캐시 확인
    const cached = this.getCachedOrganizationList(cacheKey)
    if (cached) {
      return cached
    }

    const snapshot = await this.db
      .collection("organizations")
      .where("ownerId", "==", userId)
      .orderBy("createdAt", "desc")
      .get()

    const organizations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Organization))

    // 캐시 저장
    this.setCachedOrganizationList(cacheKey, organizations)

    return organizations
  }

  /**
   * 단체 업데이트
   */
  async updateOrganization(organizationId: string, updateData: UpdateOrganization): Promise<void> {
    const userId = this.getCurrentUserId()

    // 권한 확인 - 소유자만 수정 가능
    const organization = await this.getOrganization(organizationId)
    if (!organization || organization.ownerId !== userId) {
      throw new Error("수정 권한이 없습니다.")
    }

    await this.db.collection("organizations").doc(organizationId).update({
      ...updateData,
      updatedAt: this.getServerTimestamp(),
    })

    // 캐시 무효화 (단일 + 목록 + 이름)
    this.invalidateCache(organizationId)
    this.invalidateListCache()
    if (organization.name) {
      this.invalidateNameCache(organization.name)
    }
  }

  /**
   * 단체 삭제
   */
  async deleteOrganization(organizationId: string): Promise<void> {
    const userId = this.getCurrentUserId()

    // 권한 확인 - 소유자만 삭제 가능
    const organization = await this.getOrganization(organizationId)
    if (!organization || organization.ownerId !== userId) {
      throw new Error("삭제 권한이 없습니다.")
    }

    await this.db.collection("organizations").doc(organizationId).delete()

    // 캐시 무효화 (단일 + 목록 + 이름)
    this.invalidateCache(organizationId)
    this.invalidateListCache()
    if (organization.name) {
      this.invalidateNameCache(organization.name)
    }
  }

  /**
   * 단체별 게시글 수 업데이트
   */
  async updateActivePostCount(organizationId: string): Promise<void> {
    console.log(`🔍 [OrganizationService] updateActivePostCount 시작: ${organizationId}`)
    
    try {
      // 먼저 단체가 존재하는지 확인
      console.log(`🔍 [OrganizationService] 단체 문서 존재 확인: ${organizationId}`)
      const orgDoc = await this.db.collection("organizations").doc(organizationId).get()
      
      if (!orgDoc.exists) {
        console.warn(`⚠️ [OrganizationService] 단체 ${organizationId}가 존재하지 않음. 활성 공고 수 업데이트 건너뜀`)
        return
      }

      console.log(`✅ [OrganizationService] 단체 ${organizationId} 존재 확인됨`)

      const postsSnapshot = await this.db
        .collection("posts")
        .where("organizationId", "==", organizationId)
        .get()

      const activePosts = postsSnapshot.docs.filter(doc => {
        const data = doc.data()
        return data.status === "active"
      })

      console.log(`📊 [OrganizationService] 단체 ${organizationId} 활성 공고 수: ${activePosts.length}`)
      
      await this.db.collection("organizations").doc(organizationId).update({
        activePostCount: activePosts.length,
        updatedAt: this.getServerTimestamp(),
      })
      
      console.log(`✅ [OrganizationService] 단체 ${organizationId} 활성 공고 수 업데이트 완료`)
    } catch (error) {
      this.handleOrganizationError(error, `단체 ${organizationId} 활성 공고 수 업데이트`)
      // 에러가 발생해도 게시글 저장은 이미 완료되었으므로 throw하지 않음
    }
  }

  /**
   * 모든 단체의 활성 공고 수 업데이트 - 배치 처리
   */
  async updateAllActivePostCounts(): Promise<void> {
    try {
      const organizationsSnapshot = await this.db.collection("organizations").get()

      // 배치 처리: 5개씩 동시 처리
      const batchSize = 5
      const orgDocs = organizationsSnapshot.docs

      for (let i = 0; i < orgDocs.length; i += batchSize) {
        const batch = orgDocs.slice(i, i + batchSize)
        await Promise.all(batch.map(orgDoc => this.updateActivePostCount(orgDoc.id)))
      }

      // 캐시 전체 무효화
      this.invalidateCache()
    } catch (error) {
      console.error('❌ [OrganizationService] 모든 단체 활성 공고 수 업데이트 실패:', error)
    }
  }

  /**
   * 단체 목록 실시간 리스너
   */
  subscribeToOrganizations(callback: (organizations: Organization[]) => void): () => void {
    return this.db
      .collection("organizations")
      .orderBy("createdAt", "desc")
      .onSnapshot(
        (snapshot) => {
          const organizations = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          } as Organization))
          
          callback(organizations)
        },
        (error) => {
          console.error("단체 목록 구독 오류:", error)
          callback([])
        },
      )
  }

  /**
   * 단체 실시간 리스너 (단일)
   */
  subscribeToOrganization(organizationId: string, callback: (organization: Organization | null) => void): () => void {
    return this.db
      .collection("organizations")
      .doc(organizationId)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            callback({
              id: doc.id,
              ...doc.data(),
            } as Organization)
          } else {
            callback(null)
          }
        },
        (error) => {
          console.error("단체 구독 오류:", error)
          callback(null)
        },
      )
  }

  /**
   * 성능 메트릭 조회
   */
  getPerformanceMetrics(): { cacheHits: number; cacheMisses: number; dbReads: number; hitRate: string } {
    const total = this.cacheHits + this.cacheMisses
    const hitRate = total > 0 ? ((this.cacheHits / total) * 100).toFixed(2) : '0.00'
    return {
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      dbReads: this.dbReads,
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
    console.log('🔄 [OrganizationService] 성능 메트릭 초기화')
  }
}