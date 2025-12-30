// import auth from "@react-native-firebase/auth"
import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore"

import { translate } from "../../i18n/translate"
import {
  UserProfile,
  CreateUserProfile,
  UpdateUserProfile,
  MIN_PROFILE_PHOTOS,
} from "../../types/user"

/**
 * 사용자 관련 Firestore 서비스
 * NOTE: Auth 기능은 현재 비활성화됨
 */
export class UserService {
  private db: FirebaseFirestoreTypes.Module

  constructor(db: FirebaseFirestoreTypes.Module) {
    this.db = db
  }

  /**
   * 현재 사용자 ID 가져오기
   * TODO: Auth 기능 활성화 시 구현 필요
   */
  private getCurrentUserId(): string {
    // const user = auth().currentUser
    // if (!user) {
    //   throw new Error(translate("matching:errors.userNotFound"))
    // }
    // return user.uid
    throw new Error("Auth not implemented")
  }

  /**
   * 서버 타임스탬프 생성
   */
  private getServerTimestamp(): FirebaseFirestoreTypes.FieldValue {
    return firestore.FieldValue.serverTimestamp()
  }

  /**
   * 사용자 프로필 생성
   * TODO: Auth 기능 활성화 시 구현 필요
   */
  async createUserProfile(profileData: CreateUserProfile): Promise<void> {
    throw new Error("Auth not implemented")
    // const userId = this.getCurrentUserId()
    // const user = auth().currentUser

    // if (!user?.email) {
    //   throw new Error(translate("matching:errors.userNotFound"))
    // }

    // const now = new Date() as unknown as FirebaseFirestoreTypes.Timestamp
    // const profile: UserProfile = {
    //   uid: userId,
    //   email: user.email,
    //   name: profileData.name,
    //   gender: profileData.gender,
    //   birthday: profileData.birthday,
    //   heightCm: profileData.heightCm,
    //   media: [],
    //   requiredProfileComplete: false,
    //   createdAt: now,
    //   updatedAt: now,
    // }

    // await this.db.collection("users").doc(userId).set(profile)
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
   * TODO: Auth 기능 활성화 시 구현 필요
   */
  async updateUserProfile(updateData: UpdateUserProfile): Promise<void> {
    throw new Error("Auth not implemented")
    // const userId = this.getCurrentUserId()

    // const currentProfile = await this.getUserProfile(userId)
    // const user = auth().currentUser
    // if (!user) {
    //   throw new Error(translate("matching:errors.userNotFound"))
    // }

    // // If profile doesn't exist yet (first-time completion), upsert a new document
    // const baseProfile: Partial<UserProfile> = currentProfile ?? {
    //   uid: userId,
    //   email: user.email ?? "",
    //   name: user.displayName || user.email?.split("@")[0] || "User",
    //   media: [],
    //   requiredProfileComplete: false,
    //   createdAt: new Date() as unknown as FirebaseFirestoreTypes.Timestamp,
    //   updatedAt: new Date() as unknown as FirebaseFirestoreTypes.Timestamp,
    // }

    // const updatedProfile = { ...baseProfile, ...updateData }

    // const minPhotosDone = Array.isArray(updatedProfile.media)
    //   ? updatedProfile.media.length >= MIN_PROFILE_PHOTOS
    //   : false
    // const requiredProfileComplete = Boolean(
    //   updatedProfile.gender &&
    //     updatedProfile.birthday &&
    //     typeof updatedProfile.heightCm === "number" &&
    //     minPhotosDone,
    // )

    // const commonPayload: UpdateUserProfile & {
    //   updatedAt: FirebaseFirestoreTypes.FieldValue
    //   requiredProfileComplete: boolean
    // } = {
    //   ...updateData,
    //   requiredProfileComplete,
    //   updatedAt: this.getServerTimestamp(),
    // }

    // const docRef = this.db.collection("users").doc(userId)

    // if (!currentProfile) {
    //   // Create the full document with allowed fields only
    //   const now = new Date() as unknown as FirebaseFirestoreTypes.Timestamp
    //   const newDoc: UserProfile = {
    //     uid: userId,
    //     email: user.email ?? "",
    //     name: (updatedProfile.name as string) ?? baseProfile.name!,
    //     gender: updatedProfile.gender as UserProfile["gender"],
    //     birthday: updatedProfile.birthday as UserProfile["birthday"],
    //     heightCm: updatedProfile.heightCm as UserProfile["heightCm"],
    //     media: Array.isArray(updatedProfile.media) ? (updatedProfile.media as string[]) : [],
    //     requiredProfileComplete,
    //     createdAt: now,
    //     updatedAt: now,
    //   }
    //   await docRef.set(newDoc)
    //   return
    // }

    // await docRef.update(commonPayload)
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
