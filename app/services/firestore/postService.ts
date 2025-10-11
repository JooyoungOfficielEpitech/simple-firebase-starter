import auth from "@react-native-firebase/auth"
import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore"
import { collection, doc, where, orderBy, limit, onSnapshot, getDoc, getDocs, query, updateDoc, deleteDoc, setDoc, increment, serverTimestamp } from "@react-native-firebase/firestore"

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
    }

    console.log('📝 [PostService] 게시글 생성:', {
      organizationId: post.organizationId,
      organizationName: post.organizationName,
      authorId: post.authorId,
      userOrganizationId
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
   * 게시글 목록 조회 (활성 게시글만)
   */
  async getPosts(limit = 20): Promise<Post[]> {
    // 임시로 모든 게시글을 가져온 후 클라이언트에서 필터링
    const q = query(
      collection(this.db, "posts"),
      orderBy("createdAt", "desc"),
      limit(limit * 2) // 여유분을 두고 가져옴
    )
    const snapshot = await getDocs(q)

    const allPosts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Post))

    // 클라이언트에서 active 상태만 필터링
    return allPosts
      .filter(post => post.status === "active")
      .slice(0, limit)
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
   * 게시글 실시간 리스너 (목록)
   */
  subscribeToActivePosts(callback: (posts: Post[]) => void): () => void {
    console.log('🔥 [PostService] subscribeToActivePosts 구독 시작')
    
    // Firestore 연결 상태 확인
    console.log('🔥 [PostService] Firestore DB 인스턴스:', this.db ? 'OK' : 'NULL')
    
    // 기본 쿼리 테스트
    console.log('🔥 [PostService] Firestore 기본 연결 테스트 시작')
    getDocs(collection(this.db, "posts"))
      .then((snapshot) => {
        console.log('✅ [PostService] 기본 쿼리 성공:', snapshot.size, '개 문서')
      })
      .catch((error) => {
        console.error('❌ [PostService] 기본 쿼리 실패:', error)
      })
    
    console.log('🔥 [PostService] orderBy 쿼리 시작')
    
    const q = query(
      collection(this.db, "posts"),
      orderBy("createdAt", "desc"),
      limit(40) // 여유분을 두고 가져옴
    )
    
    return onSnapshot(q,
        (snapshot) => {
          console.log('📊 [PostService] Firestore snapshot 받음')
          console.log(`📊 [PostService] 받은 문서 개수: ${snapshot.docs.length}`)
          
          const allPosts = snapshot.docs.map(doc => {
            const data = doc.data()
            console.log(`📄 [PostService] 문서 ID: ${doc.id}`)
            console.log(`📄 [PostService] 문서 데이터:`, {
              title: data.title,
              status: data.status,
              organizationId: data.organizationId,
              authorId: data.authorId,
              createdAt: data.createdAt?.toDate?.() || data.createdAt
            })
            
            return {
              id: doc.id,
              ...data,
            } as Post
          })
          
          console.log(`📊 [PostService] 전체 게시글 수: ${allPosts.length}`)
          
          // 클라이언트에서 active 상태만 필터링
          const activePosts = allPosts
            .filter(post => {
              const isActive = post.status === "active"
              console.log(`🔍 [PostService] 게시글 "${post.title}" 상태: ${post.status}, active 여부: ${isActive}`)
              return isActive
            })
            .slice(0, 20)
          
          console.log(`✅ [PostService] 필터링된 활성 게시글 수: ${activePosts.length}`)
          console.log('✅ [PostService] 활성 게시글 목록:', activePosts.map(p => ({ id: p.id, title: p.title, status: p.status })))
          
          callback(activePosts)
        },
        (error: any) => {
          console.error("❌ [PostService] 게시글 구독 오류:", error)
          console.error("❌ [PostService] 에러 상세:", {
            code: error.code,
            message: error.message,
            stack: error.stack
          })
          callback([])
        },
      )
  }

  /**
   * 특정 단체의 게시글 실시간 리스너
   */
  subscribeToOrganizationPosts(organizationId: string, callback: (posts: Post[]) => void): () => void {
    console.log(`🏢 [PostService] 단체별 게시글 구독 시작: ${organizationId}`)
    
    const q = query(
      collection(this.db, "posts"),
      where("organizationId", "==", organizationId)
    )
    
    return onSnapshot(q,
        (snapshot) => {
          console.log(`🏢 [PostService] 단체 ${organizationId} 게시글 snapshot 받음`)
          console.log(`🏢 [PostService] 받은 문서 개수: ${snapshot.docs.length}`)
          
          const allPosts = snapshot.docs.map(doc => {
            const data = doc.data()
            return {
              id: doc.id,
              ...data,
            } as Post
          })
          
          // 클라이언트에서 active 상태만 필터링하고 정렬
          const activePosts = allPosts
            .filter(post => post.status === "active")
            .sort((a, b) => {
              // createdAt 기준으로 내림차순 정렬
              const aTime = a.createdAt?.toDate?.() || new Date(0)
              const bTime = b.createdAt?.toDate?.() || new Date(0)
              return bTime.getTime() - aTime.getTime()
            })
          
          console.log(`✅ [PostService] 단체별 전체 게시글: ${allPosts.length}개, 활성: ${activePosts.length}개`)
          callback(activePosts)
        },
        (error) => {
          console.error("❌ [PostService] 단체별 게시글 구독 오류:", error)
          callback([])
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