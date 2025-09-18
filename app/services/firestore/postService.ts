import auth from "@react-native-firebase/auth"
import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore"

import { translate } from "@/i18n/translate"
import { Post, CreatePost, UpdatePost } from "@/types/post"

/**
 * 게시글 관련 Firestore 서비스
 */
export class PostService {
  private db: FirebaseFirestoreTypes.Module

  constructor(db: FirebaseFirestoreTypes.Module) {
    this.db = db
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
   * 서버 타임스탬프 생성
   */
  private getServerTimestamp(): FirebaseFirestoreTypes.FieldValue {
    return firestore.FieldValue.serverTimestamp()
  }

  /**
   * 게시글 생성
   */
  async createPost(postData: CreatePost, authorName: string): Promise<string> {
    const userId = this.getCurrentUserId()
    const docRef = this.db.collection("posts").doc()
    
    const post = {
      title: postData.title,
      description: postData.description,
      production: postData.production,
      rehearsalSchedule: postData.rehearsalSchedule,
      location: postData.location,
      organizationId: userId, // 작성자의 단체 ID
      organizationName: postData.organizationName,
      authorId: userId,
      authorName,
      status: postData.status,
      tags: postData.tags,
      createdAt: this.getServerTimestamp(),
      updatedAt: this.getServerTimestamp(),
    }

    await docRef.set(post)
    return docRef.id
  }

  /**
   * 게시글 조회 (단일)
   */
  async getPost(postId: string): Promise<Post | null> {
    const doc = await this.db.collection("posts").doc(postId).get()

    if (!doc.exists) {
      return null
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as Post
  }

  /**
   * 게시글 목록 조회 (활성 게시글만)
   */
  async getPosts(limit = 20): Promise<Post[]> {
    // 임시로 모든 게시글을 가져온 후 클라이언트에서 필터링
    const snapshot = await this.db
      .collection("posts")
      .orderBy("createdAt", "desc")
      .limit(limit * 2) // 여유분을 두고 가져옴
      .get()

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
    
    const snapshot = await this.db
      .collection("posts")
      .where("organizationId", "==", userId)
      .orderBy("createdAt", "desc")
      .get()

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
    
    // 권한 확인 - 작성자만 수정 가능
    const post = await this.getPost(postId)
    if (!post || post.authorId !== userId) {
      throw new Error("수정 권한이 없습니다.")
    }

    await this.db.collection("posts").doc(postId).update({
      ...updateData,
      updatedAt: this.getServerTimestamp(),
    })
  }

  /**
   * 게시글 삭제
   */
  async deletePost(postId: string): Promise<void> {
    const userId = this.getCurrentUserId()
    
    // 권한 확인 - 작성자만 삭제 가능
    const post = await this.getPost(postId)
    if (!post || post.authorId !== userId) {
      throw new Error("삭제 권한이 없습니다.")
    }

    await this.db.collection("posts").doc(postId).delete()
  }

  /**
   * 게시글 상태 변경 (모집 중지/재개)
   */
  async updatePostStatus(postId: string, status: "active" | "closed"): Promise<void> {
    const userId = this.getCurrentUserId()
    
    // 권한 확인 - 작성자만 상태 변경 가능
    const post = await this.getPost(postId)
    if (!post || post.authorId !== userId) {
      throw new Error("상태 변경 권한이 없습니다.")
    }

    await this.db.collection("posts").doc(postId).update({
      status,
      updatedAt: this.getServerTimestamp(),
    })
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
    this.db.collection("posts").get()
      .then((snapshot) => {
        console.log('✅ [PostService] 기본 쿼리 성공:', snapshot.size, '개 문서')
      })
      .catch((error) => {
        console.error('❌ [PostService] 기본 쿼리 실패:', error)
      })
    
    console.log('🔥 [PostService] orderBy 쿼리 시작')
    
    return this.db
      .collection("posts")
      .orderBy("createdAt", "desc")
      .limit(40) // 여유분을 두고 가져옴
      .onSnapshot(
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
        (error) => {
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
   * 게시글 실시간 리스너 (단일)
   */
  subscribeToPost(postId: string, callback: (post: Post | null) => void): () => void {
    return this.db
      .collection("posts")
      .doc(postId)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            callback({
              id: doc.id,
              ...doc.data(),
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