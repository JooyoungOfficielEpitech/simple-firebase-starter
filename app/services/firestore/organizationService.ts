import auth from "@react-native-firebase/auth"
import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore"

import { translate } from "@/i18n/translate"
import { Organization, CreateOrganization, UpdateOrganization } from "@/types/organization"

/**
 * 단체 관련 Firestore 서비스
 */
export class OrganizationService {
  private db: FirebaseFirestoreTypes.Module

  constructor(db: FirebaseFirestoreTypes.Module) {
    this.db = db
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
   * 단체 생성
   */
  async createOrganization(orgData: CreateOrganization, ownerName: string): Promise<string> {
    const userId = this.getCurrentUserId()
    const docRef = this.db.collection("organizations").doc()
    
    const organization = {
      name: orgData.name,
      description: orgData.description,
      contactEmail: orgData.contactEmail,
      contactPhone: orgData.contactPhone,
      website: orgData.website,
      location: orgData.location,
      establishedDate: orgData.establishedDate,
      tags: orgData.tags || [],
      logoUrl: null,
      isVerified: false,
      ownerId: userId,
      ownerName,
      memberCount: 1,
      activePostCount: 0,
      createdAt: this.getServerTimestamp(),
      updatedAt: this.getServerTimestamp(),
    }

    await docRef.set(organization)
    return docRef.id
  }

  /**
   * 단체 조회 (단일)
   */
  async getOrganization(organizationId: string): Promise<Organization | null> {
    const doc = await this.db.collection("organizations").doc(organizationId).get()

    if (!doc.exists) {
      return null
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as Organization
  }

  /**
   * 모든 단체 목록 조회
   */
  async getOrganizations(limit = 20): Promise<Organization[]> {
    const snapshot = await this.db
      .collection("organizations")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get()

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Organization))
  }

  /**
   * 내가 소유한 단체 조회
   */
  async getMyOrganizations(): Promise<Organization[]> {
    const userId = this.getCurrentUserId()
    
    const snapshot = await this.db
      .collection("organizations")
      .where("ownerId", "==", userId)
      .orderBy("createdAt", "desc")
      .get()

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Organization))
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
  }

  /**
   * 단체별 게시글 수 업데이트
   */
  async updateActivePostCount(organizationId: string): Promise<void> {
    try {
      const postsSnapshot = await this.db
        .collection("posts")
        .where("organizationId", "==", organizationId)
        .get()

      const activePosts = postsSnapshot.docs.filter(doc => {
        const data = doc.data()
        return data.status === "active"
      })

      await this.db.collection("organizations").doc(organizationId).update({
        activePostCount: activePosts.length,
        updatedAt: this.getServerTimestamp(),
      })
    } catch (error) {
      console.error(`❌ [OrganizationService] 단체 ${organizationId} 활성 공고 수 업데이트 실패:`, error)
    }
  }

  /**
   * 모든 단체의 활성 공고 수 업데이트
   */
  async updateAllActivePostCounts(): Promise<void> {
    try {
      const organizationsSnapshot = await this.db.collection("organizations").get()
      
      for (const orgDoc of organizationsSnapshot.docs) {
        await this.updateActivePostCount(orgDoc.id)
      }
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
}