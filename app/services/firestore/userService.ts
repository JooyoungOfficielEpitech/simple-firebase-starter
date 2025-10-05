import auth from "@react-native-firebase/auth"
import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore"

import { translate } from "@/i18n/translate"
import {
  UserProfile,
  CreateUserProfile,
  UpdateUserProfile,
} from "@/types/user"

/**
 * 사용자 관련 Firestore 서비스
 */
export class UserService {
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
   * 사용자 프로필 생성
   */
  async createUserProfile(profileData: CreateUserProfile): Promise<void> {
    const userId = this.getCurrentUserId()
    const user = auth().currentUser

    if (!user?.email) {
      throw new Error(translate("matching:errors.userNotFound"))
    }

    const now = new Date() as unknown as FirebaseFirestoreTypes.Timestamp
    const profile: any = {
      uid: userId,
      email: user.email,
      name: profileData.name,
      requiredProfileComplete: false,
      userType: profileData.userType || "general",
      createdAt: now,
      updatedAt: now,
    }

    // 선택적 필드들은 undefined가 아닐 때만 포함
    if (profileData.gender) {
      profile.gender = profileData.gender
    }
    if (profileData.birthday) {
      profile.birthday = profileData.birthday
    }
    if (profileData.heightCm) {
      profile.heightCm = profileData.heightCm
    }
    if (profileData.userType === "organizer") {
      profile.organizationId = userId
      if (profileData.organizationName) {
        profile.organizationName = profileData.organizationName
      }
    }

    await this.db.collection("users").doc(userId).set(profile)
  }

  /**
   * 사용자 프로필 조회
   */
  async getUserProfile(userId?: string): Promise<UserProfile | null> {
    const targetUserId = userId || this.getCurrentUserId()

    const doc = await this.db.collection("users").doc(targetUserId).get()

    if (!doc.exists) {
      return null
    }

    return doc.data() as UserProfile
  }

  /**
   * 사용자 프로필 업데이트
   */
  async updateUserProfile(updateData: UpdateUserProfile): Promise<void> {
    const userId = this.getCurrentUserId()

    const currentProfile = await this.getUserProfile(userId)
    const user = auth().currentUser
    if (!user) {
      throw new Error(translate("matching:errors.userNotFound"))
    }

    // If profile doesn't exist yet (first-time completion), upsert a new document
    const baseProfile: Partial<UserProfile> = currentProfile ?? {
      uid: userId,
      email: user.email ?? "",
      name: user.displayName || user.email?.split("@")[0] || "User",
      requiredProfileComplete: false,
      userType: "general",
      createdAt: new Date() as unknown as FirebaseFirestoreTypes.Timestamp,
      updatedAt: new Date() as unknown as FirebaseFirestoreTypes.Timestamp,
    }

    const updatedProfile = { ...baseProfile, ...updateData }

    const requiredProfileComplete = Boolean(
      updatedProfile.gender &&
        updatedProfile.birthday &&
        typeof updatedProfile.heightCm === "number"
    )

    // Filter out undefined values to avoid Firestore errors
    const filteredUpdateData = Object.entries(updateData).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = value
      }
      return acc
    }, {} as any)

    const commonPayload: any = {
      ...filteredUpdateData,
      requiredProfileComplete,
      updatedAt: this.getServerTimestamp(),
    }

    const docRef = this.db.collection("users").doc(userId)

    if (!currentProfile) {
      // Create the full document with allowed fields only
      const now = new Date() as unknown as FirebaseFirestoreTypes.Timestamp
      const newDoc: any = {
        uid: userId,
        email: user.email ?? "",
        name: (updatedProfile.name as string) ?? baseProfile.name!,
        requiredProfileComplete,
        userType: (updatedProfile.userType as UserProfile["userType"]) ?? "general",
        createdAt: now,
        updatedAt: now,
      }

      // Only add fields that are not undefined
      if (updatedProfile.gender !== undefined) {
        newDoc.gender = updatedProfile.gender
      }
      if (updatedProfile.birthday !== undefined) {
        newDoc.birthday = updatedProfile.birthday
      }
      if (updatedProfile.heightCm !== undefined) {
        newDoc.heightCm = updatedProfile.heightCm
      }
      if (updatedProfile.organizationId !== undefined) {
        newDoc.organizationId = updatedProfile.organizationId
      }
      if (updatedProfile.organizationName !== undefined) {
        newDoc.organizationName = updatedProfile.organizationName
      }
      if (updatedProfile.previousOrganizationName !== undefined) {
        newDoc.previousOrganizationName = updatedProfile.previousOrganizationName
      }
      if (updatedProfile.hasBeenOrganizer !== undefined) {
        newDoc.hasBeenOrganizer = updatedProfile.hasBeenOrganizer
      }

      await docRef.set(newDoc)
      return
    }

    await docRef.update(commonPayload)
  }

  /**
   * 운영자를 일반 사용자로 전환 (조직 필드 삭제)
   */
  async revertToGeneralUser(): Promise<void> {
    const userId = this.getCurrentUserId()
    const docRef = this.db.collection("users").doc(userId)

    // 현재 단체 정보를 이전 단체 정보로 저장
    const currentProfile = await this.getUserProfile(userId)
    
    const updateData: any = {
      userType: "general",
      organizationId: firestore.FieldValue.delete(),
      organizationName: firestore.FieldValue.delete(),
      updatedAt: this.getServerTimestamp(),
    }

    // 현재 단체명을 이전 단체명으로 저장
    if (currentProfile?.organizationName) {
      updateData.previousOrganizationName = currentProfile.organizationName
      updateData.hasBeenOrganizer = true
    }

    await docRef.update(updateData)
  }

  /**
   * 사용자가 특정 단체의 소유자인지 확인
   */
  async isUserOwnerOfOrganization(userId: string, organizationName: string): Promise<boolean> {
    try {
      // Organizations 컬렉션에서 해당 단체 조회
      const organizationsSnapshot = await this.db
        .collection("organizations")
        .where("name", "==", organizationName)
        .where("ownerId", "==", userId)
        .get()

      return !organizationsSnapshot.empty
    } catch (error) {
      console.error("단체 소유자 확인 오류:", error)
      return false
    }
  }

  /**
   * 이전 단체로 자동 운영자 전환 시도
   */
  async attemptAutoOrganizerConversion(): Promise<{ success: boolean; organizationName?: string; error?: string }> {
    const userId = this.getCurrentUserId()
    
    try {
      const userProfile = await this.getUserProfile(userId)
      
      if (!userProfile?.hasBeenOrganizer || !userProfile?.previousOrganizationName) {
        return {
          success: false,
          error: "이전 운영자 경험이 없습니다."
        }
      }

      const previousOrgName = userProfile.previousOrganizationName

      // 해당 단체가 여전히 존재하고 본인이 소유자인지 확인
      const isOwner = await this.isUserOwnerOfOrganization(userId, previousOrgName)
      
      if (!isOwner) {
        return {
          success: false,
          error: "이전 단체를 찾을 수 없거나 소유자가 아닙니다."
        }
      }

      // 자동 운영자 전환 실행
      await this.updateUserProfile({
        userType: "organizer",
        organizationId: userId,
        organizationName: previousOrgName
      })

      return {
        success: true,
        organizationName: previousOrgName
      }
    } catch (error) {
      console.error("자동 운영자 전환 오류:", error)
      return {
        success: false,
        error: "자동 전환 중 오류가 발생했습니다."
      }
    }
  }

  /**
   * 사용자 프로필 실시간 리스너
   */
  subscribeToUserProfile(
    userId: string,
    callback: (profile: UserProfile | null) => void,
  ): () => void {
    return this.db
      .collection("users")
      .doc(userId)
      .onSnapshot(
        (doc) => {
          if (doc.exists()) {
            callback(doc.data() as UserProfile)
          } else {
            callback(null)
          }
        },
        (error) => {
          console.error("프로필 구독 오류:", error)
          callback(null)
        },
      )
  }

  /**
   * 현재 사용자 프로필 실시간 리스너
   */
  subscribeToCurrentUserProfile(callback: (profile: UserProfile | null) => void): () => void {
    const userId = this.getCurrentUserId()
    return this.subscribeToUserProfile(userId, callback)
  }

  /**
   * 매칭 가능한 사용자들 조회
   */
  // Removed unused complex queries and status flags for MVP scope.

  /**
   * 사용자 프로필 삭제 (소프트 삭제)
   */
  async deleteUserProfile(): Promise<void> {
    const userId = this.getCurrentUserId()

    await this.db.collection("users").doc(userId).update({
      isDeleted: true,
      status: "offline",
      isOnline: false,
      updatedAt: this.getServerTimestamp(),
    })
  }

  /**
   * 사용자 차단
   */
  async blockUser(targetUserId: string): Promise<void> {
    await this.db.collection("users").doc(targetUserId).update({
      isBlocked: true,
      status: "offline",
      isOnline: false,
      updatedAt: this.getServerTimestamp(),
    })
  }

  /**
   * 사용자 차단 해제
   */
  async unblockUser(targetUserId: string): Promise<void> {
    await this.db.collection("users").doc(targetUserId).update({
      isBlocked: false,
      status: "available",
      isOnline: true,
      updatedAt: this.getServerTimestamp(),
    })
  }
}
