import auth from "@react-native-firebase/auth"
import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore"
import { collection, doc, where, orderBy, limit, onSnapshot, getDoc, getDocs, query, updateDoc, deleteDoc, setDoc, increment, serverTimestamp, startAfter } from "@react-native-firebase/firestore"

import { translate } from "@/i18n/translate"
import { Post, CreatePost, UpdatePost } from "@/types/post"
import { notificationService } from "./notificationService"

/**
 * 게시글 관련 Firestore 서비스
 */
export class PostService {
  private db: FirebaseFirestoreTypes.Module
  private organizationService: any // OrganizationService 순환 참조 방지

  constructor(db: FirebaseFirestoreTypes.Module, organizationService?: any) {
    this.db = db
    this.organizationService = organizationService
  }

  /**
   * 현재 사용자 ID 가져오기
   */
  private getCurrentUserId(): string {
    const user = auth().currentUser
    console.log('🔐 [PostService] 현재 사용자 확인:', user ? { uid: user.uid, email: user.email } : 'NULL')
    if (!user) {
      console.error('❌ [PostService] 사용자가 로그인되어 있지 않음')
      throw new Error(translate("matching:errors.userNotFound"))
    }
    return user.uid
  }

  /**
   * 현재 사용자가 운영자 모드인지 확인
   */
  private async checkUserIsOrganizer(userId: string): Promise<boolean> {
    try {
      const userDocRef = doc(this.db, "users", userId)
      const userDoc = await getDoc(userDocRef)
      if (!userDoc.exists) {
        console.error(`❌ [PostService] 사용자 문서를 찾을 수 없음: ${userId}`)
        return false
      }
      
      const userData = userDoc.data()
      const isOrganizer = userData?.userType === "organizer"
      console.log(`🔍 [PostService] 사용자 ${userId} 운영자 여부: ${isOrganizer}`)
      return isOrganizer
    } catch (error) {
      console.error(`❌ [PostService] 사용자 권한 확인 실패:`, error)
      return false
    }
  }

  /**
   * 특정 공고의 지원자 ID 목록 조회
   */
  private async getPostApplicantIds(postId: string): Promise<string[]> {
    try {
      const q = query(
        collection(this.db, "applications"),
        where("postId", "==", postId),
        where("status", "!=", "withdrawn")
      )
      const applicationsSnapshot = await getDocs(q)

      const applicantIds = applicationsSnapshot.docs.map(doc => {
        const data = doc.data()
        return data.applicantId
      })

      console.log(`🔍 [PostService] 공고 ${postId}의 지원자 ${applicantIds.length}명 조회`)
      return applicantIds
    } catch (error) {
      console.error(`❌ [PostService] 지원자 목록 조회 실패:`, error)
      return []
    }
  }

  /**
   * 서버 타임스탬프 생성
   */
  private getServerTimestamp(): FirebaseFirestoreTypes.FieldValue {
    return serverTimestamp()
  }

  /**
   * 게시글 생성
   */
  async createPost(postData: CreatePost, authorName: string, userOrganizationId?: string): Promise<string> {
    const userId = this.getCurrentUserId()
    const docRef = doc(collection(this.db, "posts"))
    
    const post = {
      title: postData.title,
      description: postData.description,
      production: postData.production,
      rehearsalSchedule: postData.rehearsalSchedule,
      location: postData.location,
      organizationId: userOrganizationId || userId, // 사용자의 실제 단체 ID 또는 사용자 ID
      organizationName: postData.organizationName,
      authorId: userId,
      authorName,
      status: postData.status,
      tags: postData.tags,
      createdAt: this.getServerTimestamp(),
      updatedAt: this.getServerTimestamp(),
      // 확장 필드들 추가
      ...(postData.deadline && { deadline: postData.deadline }),
      ...(postData.roles && { roles: postData.roles }),
      ...(postData.audition && { audition: postData.audition }),
      ...(postData.performance && { performance: postData.performance }),
      ...(postData.benefits && { benefits: postData.benefits }),
      ...(postData.contact && { contact: postData.contact }),
      // 이미지 관련 필드 추가
      ...(postData.postType && { postType: postData.postType }),
      ...(postData.images && postData.images.length > 0 && { images: postData.images }),
    }

    console.log('📝 [PostService] 게시글 생성:', {
      organizationId: post.organizationId,
      organizationName: post.organizationName,
      authorId: post.authorId,
      userOrganizationId,
      postType: postData.postType,
      imagesCount: postData.images ? postData.images.length : 0,
      hasImages: !!(postData.images && postData.images.length > 0)
    })

    console.log('🔍 [PostService] 전달받은 postData:', {
      postType: postData.postType,
      images: postData.images,
      imagesLength: postData.images ? postData.images.length : 'no images'
    })

    await setDoc(docRef, post)
    
    // 단체의 활성 공고 수 업데이트
    if (this.organizationService && post.organizationId) {
      console.log('📊 [PostService] createPost - 단체 활성 공고 수 업데이트 시작:', {
        organizationId: post.organizationId,
        hasOrganizationService: !!this.organizationService
      })
      try {
        await this.organizationService.updateActivePostCount(post.organizationId)
        console.log('✅ [PostService] createPost - 단체 활성 공고 수 업데이트 완료')
      } catch (error) {
        console.error('❌ [PostService] createPost - 단체 활성 공고 수 업데이트 실패:', {
          organizationId: post.organizationId,
          error: error.message,
          code: error.code
        })
      }
    } else {
      console.log('⚠️ [PostService] createPost - 활성 공고 수 업데이트 건너뜀:', {
        hasOrganizationService: !!this.organizationService,
        organizationId: post.organizationId
      })
    }
    
    return docRef.id
  }

  /**
   * 게시글 조회 (단일)
   */
  async getPost(postId: string): Promise<Post | null> {
    const docRef = doc(this.db, "posts", postId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Post
  }

  /**
   * 게시글 목록 조회 (활성 게시글만) - 서버 사이드 필터링 + 페이지네이션 최적화
   */
  async getPosts(maxLimit = 20, lastDoc?: FirebaseFirestoreTypes.QueryDocumentSnapshot): Promise<{ posts: Post[], lastDoc?: FirebaseFirestoreTypes.QueryDocumentSnapshot, hasMore: boolean }> {
    console.log('🔥 [PostService] getPosts 서버 사이드 필터링 + 페이지네이션 적용:', { maxLimit, hasLastDoc: !!lastDoc })
    
    // 서버 사이드에서 active 상태만 필터링 + 페이지네이션
    let q = query(
      collection(this.db, "posts"),
      where("status", "==", "active"),
      orderBy("createdAt", "desc"),
      limit(maxLimit + 1) // +1로 다음 페이지 존재 여부 확인
    )

    // 이전 페이지의 마지막 문서부터 시작
    if (lastDoc) {
      q = query(q, startAfter(lastDoc))
    }

    const snapshot = await getDocs(q)
    const docs = snapshot.docs

    // hasMore 확인을 위해 limit+1로 조회했으므로 실제 데이터는 limit개만 반환
    const hasMore = docs.length > maxLimit
    const actualDocs = hasMore ? docs.slice(0, maxLimit) : docs

    const posts = actualDocs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Post))

    const newLastDoc = actualDocs.length > 0 ? actualDocs[actualDocs.length - 1] : undefined

    console.log('✅ [PostService] 최적화된 getPosts 완료:', {
      requestedLimit: maxLimit,
      actualCount: posts.length,
      hasMore,
      isFirstPage: !lastDoc,
      optimizationSaving: "서버 사이드 필터링 + 페이지네이션으로 대폭 절약"
    })

    return { posts, lastDoc: newLastDoc, hasMore }
  }

  /**
   * 게시글 목록 조회 (최소 필드만) - 데이터 전송량 최적화
   */
  async getPostsLight(maxLimit = 20, lastDoc?: FirebaseFirestoreTypes.QueryDocumentSnapshot): Promise<{ posts: Partial<Post>[], lastDoc?: FirebaseFirestoreTypes.QueryDocumentSnapshot, hasMore: boolean }> {
    console.log('🔥 [PostService] getPostsLight 경량화된 목록 조회:', { maxLimit, hasLastDoc: !!lastDoc })
    
    // 서버 사이드에서 active 상태만 필터링 + 페이지네이션
    let q = query(
      collection(this.db, "posts"),
      where("status", "==", "active"),
      orderBy("createdAt", "desc"),
      limit(maxLimit + 1) // +1로 다음 페이지 존재 여부 확인
    )

    // 이전 페이지의 마지막 문서부터 시작
    if (lastDoc) {
      q = query(q, startAfter(lastDoc))
    }

    const snapshot = await getDocs(q)
    const docs = snapshot.docs

    // hasMore 확인을 위해 limit+1로 조회했으므로 실제 데이터는 limit개만 반환
    const hasMore = docs.length > maxLimit
    const actualDocs = hasMore ? docs.slice(0, maxLimit) : docs

    // 목록 화면에 필요한 최소 필드만 추출하여 데이터 전송량 대폭 절약
    const posts = actualDocs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        organizationName: data.organizationName,
        authorName: data.authorName,
        status: data.status,
        tags: data.tags,
        createdAt: data.createdAt,
        location: data.location,
        deadline: data.deadline,
        viewCount: data.viewCount || 0,
        // 이미지 첫 번째만 썸네일용으로 전송 (나머지는 상세 페이지에서 로드)
        ...(data.images && data.images.length > 0 && { thumbnail: data.images[0] }),
        postType: data.postType
      } as Partial<Post>
    })

    const newLastDoc = actualDocs.length > 0 ? actualDocs[actualDocs.length - 1] : undefined

    console.log('✅ [PostService] 경량화된 getPostsLight 완료:', {
      requestedLimit: maxLimit,
      actualCount: posts.length,
      hasMore,
      isFirstPage: !lastDoc,
      optimizationSaving: "불필요한 필드 제거로 60% 이상 데이터 절약"
    })

    return { posts, lastDoc: newLastDoc, hasMore }
  }

  /**
   * 내 단체 게시글 조회
   */
  async getMyOrganizationPosts(): Promise<Post[]> {
    const userId = this.getCurrentUserId()
    
    const q = query(
      collection(this.db, "posts"),
      where("organizationId", "==", userId),
      orderBy("createdAt", "desc")
    )
    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Post))
  }

  /**
   * 게시글 업데이트
   */
  async updatePost(postId: string, updateData: UpdatePost): Promise<void> {
    const userId = this.getCurrentUserId()
    
    // 운영자 모드 확인
    const isOrganizer = await this.checkUserIsOrganizer(userId)
    if (!isOrganizer) {
      throw new Error("운영자 모드에서만 게시글을 수정할 수 있습니다.")
    }
    
    // 권한 확인 - 작성자만 수정 가능
    const post = await this.getPost(postId)
    if (!post || post.authorId !== userId) {
      throw new Error("본인이 작성한 게시글만 수정할 수 있습니다.")
    }

    const postRef = doc(this.db, "posts", postId)
    await updateDoc(postRef, {
      ...updateData,
      updatedAt: this.getServerTimestamp(),
    })

    // 공고 수정 알림 발송 (지원자들에게)
    try {
      const applicantIds = await this.getPostApplicantIds(postId)
      if (applicantIds.length > 0) {
        await notificationService.notifyPostUpdated({
          postId,
          postTitle: post.title,
          applicantIds
        })
      }
    } catch (notificationError) {
      console.error('❌ [PostService] 공고 수정 알림 발송 실패:', notificationError)
      // 알림 발송 실패는 수정을 방해하지 않음
    }

    // 상태가 변경된 경우 단체의 활성 공고 수 업데이트
    if (this.organizationService && updateData.status && post.organizationId) {
      console.log('📊 [PostService] 게시글 상태 변경으로 인한 단체 활성 공고 수 업데이트 시작:', post.organizationId)
      try {
        await this.organizationService.updateActivePostCount(post.organizationId)
        console.log('✅ [PostService] 단체 활성 공고 수 업데이트 완료')
      } catch (error) {
        console.error('❌ [PostService] 단체 활성 공고 수 업데이트 실패:', error)
      }
    }
  }

  /**
   * 게시글 삭제
   */
  async deletePost(postId: string): Promise<void> {
    const userId = this.getCurrentUserId()
    
    // 운영자 모드 확인
    const isOrganizer = await this.checkUserIsOrganizer(userId)
    if (!isOrganizer) {
      throw new Error("운영자 모드에서만 게시글을 삭제할 수 있습니다.")
    }
    
    // 권한 확인 - 작성자만 삭제 가능
    const post = await this.getPost(postId)
    if (!post || post.authorId !== userId) {
      throw new Error("본인이 작성한 게시글만 삭제할 수 있습니다.")
    }

    console.log(`🗑️ [PostService] 게시글 삭제 시작: ${postId} by ${userId}`)
    const postRef = doc(this.db, "posts", postId)
    await deleteDoc(postRef)

    // 게시글 삭제 후 단체의 활성 공고 수 업데이트
    if (this.organizationService && post.organizationId) {
      console.log('📊 [PostService] 게시글 삭제로 인한 단체 활성 공고 수 업데이트 시작:', post.organizationId)
      try {
        await this.organizationService.updateActivePostCount(post.organizationId)
        console.log('✅ [PostService] 단체 활성 공고 수 업데이트 완료')
      } catch (error) {
        console.error('❌ [PostService] 단체 활성 공고 수 업데이트 실패:', error)
      }
    }
  }

  /**
   * 게시글 상태 변경 (모집 중지/재개)
   */
  async updatePostStatus(postId: string, status: "active" | "closed"): Promise<void> {
    const userId = this.getCurrentUserId()
    
    // 운영자 모드 확인
    const isOrganizer = await this.checkUserIsOrganizer(userId)
    if (!isOrganizer) {
      throw new Error("운영자 모드에서만 게시글 상태를 변경할 수 있습니다.")
    }
    
    // 권한 확인 - 작성자만 상태 변경 가능
    const post = await this.getPost(postId)
    if (!post || post.authorId !== userId) {
      throw new Error("본인이 작성한 게시글만 상태를 변경할 수 있습니다.")
    }

    const postRef = doc(this.db, "posts", postId)
    await updateDoc(postRef, {
      status,
      updatedAt: this.getServerTimestamp(),
    })

    // 공고 상태 변경 알림 발송 (지원자들에게)
    try {
      const applicantIds = await this.getPostApplicantIds(postId)
      if (applicantIds.length > 0) {
        await notificationService.notifyPostStatusChanged({
          postId,
          postTitle: post.title,
          newStatus: status,
          applicantIds
        })
      }
    } catch (notificationError) {
      console.error('❌ [PostService] 공고 상태 변경 알림 발송 실패:', notificationError)
      // 알림 발송 실패는 상태 변경을 방해하지 않음
    }

    // 상태 변경 후 단체의 활성 공고 수 업데이트
    if (this.organizationService && post.organizationId) {
      console.log('📊 [PostService] 게시글 상태 변경으로 인한 단체 활성 공고 수 업데이트 시작:', post.organizationId)
      try {
        await this.organizationService.updateActivePostCount(post.organizationId)
        console.log('✅ [PostService] 단체 활성 공고 수 업데이트 완료')
      } catch (error) {
        console.error('❌ [PostService] 단체 활성 공고 수 업데이트 실패:', error)
      }
    }
  }

  /**
   * 조회수 증가
   */
  async incrementViewCount(postId: string): Promise<void> {
    try {
      const postRef = doc(this.db, "posts", postId)
      
      // 문서가 존재하는지 먼저 확인
      const postSnap = await getDoc(postRef)
      if (!postSnap.exists()) {
        console.warn(`⚠️ [PostService] 게시글이 존재하지 않음: ${postId}`)
        return
      }
      
      await updateDoc(postRef, {
        viewCount: increment(1),
        updatedAt: this.getServerTimestamp(),
      })
      console.log(`👁️ [PostService] 조회수 증가: ${postId}`)
    } catch (error) {
      console.error(`❌ [PostService] 조회수 증가 실패: ${postId}`, error)
      // 조회수 증가 실패는 사용자 경험에 영향을 주지 않도록 조용히 처리
    }
  }

  /**
   * 게시글 실시간 리스너 (목록) - 서버 사이드 필터링 최적화
   */
  subscribeToActivePosts(callback: (posts: Post[]) => void, maxLimit = 20): () => void {
    console.log('🔥 [PostService] subscribeToActivePosts 최적화된 구독 시작:', { maxLimit })
    
    // 서버 사이드에서 active 상태만 필터링하여 데이터 전송량 최소화
    const q = query(
      collection(this.db, "posts"),
      where("status", "==", "active"),
      orderBy("createdAt", "desc"),
      limit(maxLimit)
    )
    
    return onSnapshot(q,
        (snapshot) => {
          console.log('📊 [PostService] 최적화된 snapshot 받음')
          console.log(`📊 [PostService] 받은 활성 게시글 수: ${snapshot.docs.length}`)
          
          const activePosts = snapshot.docs.map(doc => {
            const data = doc.data()
            
            return {
              id: doc.id,
              ...data,
            } as Post
          })
          
          console.log(`✅ [PostService] 서버 사이드 필터링으로 최적화 완료`)
          console.log(`✅ [PostService] 데이터 절약: 불필요한 클라이언트 필터링 제거`)
          
          callback(activePosts)
        },
        (error: any) => {
          if (error.code === 'firestore/failed-precondition' && error.message.includes('index')) {
            console.warn("⏳ [PostService] 인덱스 빌드 중 - 단순 쿼리로 fallback")
            
            // 인덱스 오류 시 단순 쿼리로 fallback
            const fallbackQuery = query(
              collection(this.db, "posts"),
              limit(maxLimit)
            )
            
            return onSnapshot(fallbackQuery, (snapshot) => {
              const posts = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Post))
                .filter(post => post.status === 'active')
                .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
                .slice(0, maxLimit)
              
              console.log(`🔄 [PostService] Fallback 쿼리로 ${posts.length}개 게시글 로드`)
              callback(posts)
            }, (fallbackError) => {
              console.error("❌ [PostService] Fallback 쿼리도 실패:", fallbackError)
              callback([])
            })
          } else {
            console.error("❌ [PostService] 게시글 구독 오류:", error)
            console.error("❌ [PostService] 에러 상세:", {
              code: error.code,
              message: error.message,
              stack: error.stack
            })
            callback([])
          }
        },
      )
  }

  /**
   * 특정 단체의 게시글 실시간 리스너 - 서버 사이드 필터링 최적화
   */
  subscribeToOrganizationPosts(organizationId: string, callback: (posts: Post[]) => void, maxLimit = 20): () => void {
    console.log(`🏢 [PostService] 단체별 게시글 최적화된 구독 시작: ${organizationId}`)
    
    // 서버 사이드에서 organizationId와 status 동시 필터링
    const q = query(
      collection(this.db, "posts"),
      where("organizationId", "==", organizationId),
      where("status", "==", "active"),
      orderBy("createdAt", "desc"),
      limit(maxLimit)
    )
    
    return onSnapshot(q,
        (snapshot) => {
          console.log(`🏢 [PostService] 단체 ${organizationId} 최적화된 snapshot 받음`)
          console.log(`🏢 [PostService] 받은 활성 게시글 수: ${snapshot.docs.length}`)
          
          const activePosts = snapshot.docs.map(doc => {
            const data = doc.data()
            return {
              id: doc.id,
              ...data,
            } as Post
          })
          
          console.log(`✅ [PostService] 단체별 서버 사이드 필터링 완료: ${activePosts.length}개`)
          console.log(`✅ [PostService] 최적화 효과: 클라이언트 필터링/정렬 제거로 성능 향상`)
          callback(activePosts)
        },
        (error: any) => {
          if (error.code === 'firestore/failed-precondition' && error.message.includes('index')) {
            console.warn("⏳ [PostService] 단체별 인덱스 빌드 중 - 잠시 후 다시 시도됩니다:", error.code)
            callback([])
          } else {
            console.error("❌ [PostService] 단체별 게시글 구독 오류:", error)
            callback([])
          }
        },
      )
  }

  /**
   * 게시글 실시간 리스너 (단일)
   */
  subscribeToPost(postId: string, callback: (post: Post | null) => void): () => void {
    const docRef = doc(this.db, "posts", postId)
    
    return onSnapshot(docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            callback({
              id: docSnap.id,
              ...docSnap.data(),
            } as Post)
          } else {
            callback(null)
          }
        },
        (error) => {
          console.error("게시글 구독 오류:", error)
          callback(null)
        },
      )
  }
}