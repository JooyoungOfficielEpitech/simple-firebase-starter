import auth from "@react-native-firebase/auth"
import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore"
import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp, deleteField, query, where, getDocs } from "@react-native-firebase/firestore"

import { translate } from "@/core/i18n/translate"
import {
  UserProfile,
  CreateUserProfile,
  UpdateUserProfile,
} from "@/core/types/user"

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
    return serverTimestamp()
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
    if (profileData.phoneNumber) {
      profile.phoneNumber = profileData.phoneNumber
    }
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

    const userRef = doc(this.db, "users", userId)
    await setDoc(userRef, profile)
  }

  /**
   * 사용자 프로필 조회
   */
  async getUserProfile(userId?: string): Promise<UserProfile | null> {
    const targetUserId = userId || this.getCurrentUserId()

    const userRef = doc(this.db, "users", targetUserId)
    const docSnap = await getDoc(userRef)

    if (!docSnap.exists()) {
      return null
    }

    const profile = docSnap.data() as UserProfile
    
    // 디버깅: 프로필 데이터 로그
    console.log("🔍 [UserService] 프로필 조회 결과:", {
      uid: profile.uid,
      name: profile.name,
      phoneNumber: profile.phoneNumber,
      gender: profile.gender,
      birthday: profile.birthday,
      heightCm: profile.heightCm,
      requiredProfileComplete: profile.requiredProfileComplete
    })

    // requiredProfileComplete가 undefined이거나 잘못된 경우 재계산
    const calculatedComplete = Boolean(
      profile.phoneNumber &&
      profile.gender &&
      profile.birthday &&
      typeof profile.heightCm === "number"
    )
    
    console.log("🧮 [UserService] 재계산된 requiredProfileComplete:", calculatedComplete)

    // 계산된 값과 저장된 값이 다른 경우 업데이트
    if (profile.requiredProfileComplete !== calculatedComplete) {
      console.log("🔄 [UserService] requiredProfileComplete 불일치, 업데이트 중...")
      try {
        const userRef = doc(this.db, "users", targetUserId)
        await updateDoc(userRef, {
          requiredProfileComplete: calculatedComplete,
          updatedAt: this.getServerTimestamp()
        })
        profile.requiredProfileComplete = calculatedComplete
        console.log("✅ [UserService] requiredProfileComplete 업데이트 완료")
      } catch (error) {
        console.error("❌ [UserService] requiredProfileComplete 업데이트 실패:", error)
      }
    }

    return profile
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
      updatedProfile.phoneNumber &&
      updatedProfile.gender &&
        updatedProfile.birthday &&
        typeof updatedProfile.heightCm === "number"
    )

    console.log("🧮 [UserService] 업데이트 시 requiredProfileComplete 계산:", {
      phoneNumber: updatedProfile.phoneNumber,
      gender: updatedProfile.gender,
      birthday: updatedProfile.birthday,
      heightCm: updatedProfile.heightCm,
      heightCmType: typeof updatedProfile.heightCm,
      result: requiredProfileComplete
    })

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

    const docRef = doc(this.db, "users", userId)

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
      if (updatedProfile.phoneNumber !== undefined) {
        newDoc.phoneNumber = updatedProfile.phoneNumber
      }
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

      await setDoc(docRef, newDoc)
      return
    }

    await updateDoc(docRef, commonPayload)
  }

  /**
   * 운영자를 일반 사용자로 전환 (조직 필드 삭제)
   */
  async revertToGeneralUser(): Promise<void> {
    const userId = this.getCurrentUserId()
    const docRef = doc(this.db, "users", userId)

    // 현재 단체 정보를 이전 단체 정보로 저장
    const currentProfile = await this.getUserProfile(userId)
    
    const updateData: any = {
      userType: "general",
      organizationId: deleteField(),
      organizationName: deleteField(),
      updatedAt: this.getServerTimestamp(),
    }

    // 현재 단체명을 이전 단체명으로 저장
    if (currentProfile?.organizationName) {
      updateData.previousOrganizationName = currentProfile.organizationName
      updateData.hasBeenOrganizer = true
    }

    await updateDoc(docRef, updateData)
  }

  /**
   * 사용자가 특정 단체의 소유자인지 확인
   */
  async isUserOwnerOfOrganization(userId: string, organizationName: string): Promise<boolean> {
    try {
      // Organizations 컬렉션에서 해당 단체 조회
      const q = query(
        collection(this.db, "organizations"),
        where("name", "==", organizationName),
        where("ownerId", "==", userId)
      )
      const organizationsSnapshot = await getDocs(q)

      return !organizationsSnapshot.empty
    } catch (error) {
      console.error("단체 소유자 확인 오류:", error)
      return false
    }
  }

  /**
   * 사용자가 이미 단체를 소유하고 있는지 확인
   */
  async hasOwnedOrganization(): Promise<boolean> {
    const userId = this.getCurrentUserId()
    
    try {
      const organizationsSnapshot = await this.db
        .collection("organizations")
        .where("ownerId", "==", userId)
        .get()
      
      return !organizationsSnapshot.empty
    } catch (error) {
      console.error("단체 소유 확인 오류:", error)
      return false
    }
  }

  /**
   * 운영자 전환과 동시에 단체 생성 (1회 제한)
   */
  async convertToOrganizerWithOrganization(orgData: {
    name: string
    description: string
    contactEmail: string
    contactPhone?: string
    website?: string
    location: string
    establishedDate?: string
    tags?: string[]
    // 소셜 미디어 링크
    instagramUrl?: string
    youtubeUrl?: string
    facebookUrl?: string
    twitterUrl?: string
    // 추가 상세 정보
    foundingStory?: string
    vision?: string
    specialties?: string[]
    pastWorks?: string[]
    facilities?: string
    recruitmentInfo?: string
  }): Promise<{ success: boolean; organizationId?: string; error?: string }> {
    const userId = this.getCurrentUserId()
    const user = auth().currentUser
    
    if (!user) {
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." }
    }

    try {
      // 1. 이미 단체를 소유하고 있는지 확인
      const hasOrganization = await this.hasOwnedOrganization()
      if (hasOrganization) {
        return { success: false, error: "이미 단체를 소유하고 있습니다. 계정당 하나의 단체만 소유할 수 있습니다." }
      }

      // 2. 현재 사용자 프로필 확인
      const userProfile = await this.getUserProfile(userId)
      if (!userProfile) {
        return { success: false, error: "사용자 프로필을 찾을 수 없습니다." }
      }

      // 3. 단체명 중복 검증
      const organizationService = await import("./organizationService")
      const orgServiceInstance = new organizationService.OrganizationService(this.db)
      await orgServiceInstance.validateUniqueOrganizationName(orgData.name)

      // 4. 트랜잭션으로 사용자 프로필 업데이트와 단체 생성을 동시에 처리
      const organizationId = await this.db.runTransaction(async (transaction) => {
        // 단체 문서 생성
        const orgRef = this.db.collection("organizations").doc()
        const organization = {
          name: orgData.name,
          description: orgData.description,
          contactEmail: orgData.contactEmail,
          contactPhone: orgData.contactPhone || "",
          website: orgData.website || "",
          location: orgData.location,
          establishedDate: orgData.establishedDate || "",
          tags: orgData.tags || [],
          // 소셜 미디어 링크
          instagramUrl: orgData.instagramUrl || "",
          youtubeUrl: orgData.youtubeUrl || "",
          facebookUrl: orgData.facebookUrl || "",
          twitterUrl: orgData.twitterUrl || "",
          // 추가 상세 정보
          foundingStory: orgData.foundingStory || "",
          vision: orgData.vision || "",
          specialties: orgData.specialties || [],
          pastWorks: orgData.pastWorks || [],
          facilities: orgData.facilities || "",
          recruitmentInfo: orgData.recruitmentInfo || "",
          // 기존 필드
          logoUrl: null,
          isVerified: false,
          ownerId: userId,
          ownerName: userProfile.name,
          memberCount: 1,
          activePostCount: 0,
          createdAt: this.getServerTimestamp(),
          updatedAt: this.getServerTimestamp(),
        }

        // 사용자 프로필 업데이트
        const userRef = this.db.collection("users").doc(userId)
        const userUpdate = {
          userType: "organizer" as const,
          organizationId: orgRef.id,
          organizationName: orgData.name,
          hasBeenOrganizer: true,
          updatedAt: this.getServerTimestamp(),
        }

        transaction.set(orgRef, organization)
        transaction.update(userRef, userUpdate)

        return orgRef.id
      })

      return { 
        success: true, 
        organizationId 
      }

    } catch (error) {
      console.error("운영자 전환 및 단체 생성 오류:", error)
      return { 
        success: false, 
        error: error.message || "운영자 전환에 실패했습니다." 
      }
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
   * 사용자 재인증 (계정 삭제 전 필수)
   */
  async reauthenticateUser(password: string): Promise<void> {
    const user = auth().currentUser
    if (!user || !user.email) {
      throw new Error(translate("matching:errors.userNotFound"))
    }

    try {
      const credential = auth.EmailAuthProvider.credential(user.email, password)
      await user.reauthenticateWithCredential(credential)
      console.log("✅ [UserService] 사용자 재인증 성공")
    } catch (error) {
      console.error("❌ [UserService] 재인증 실패:", error)
      if (error.code === 'auth/wrong-password') {
        throw new Error("비밀번호가 올바르지 않습니다.")
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error("너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.")
      } else {
        throw new Error("재인증에 실패했습니다. 다시 시도해주세요.")
      }
    }
  }

  /**
   * 완전한 계정 삭제 - 모든 사용자 데이터 삭제 (Firebase Auth 제외)
   */
  async deleteUserAccount(): Promise<void> {
    const userId = this.getCurrentUserId()

    try {
      // 트랜잭션으로 안전하게 Firestore 데이터 삭제
      await this.db.runTransaction(async (transaction) => {
        // 1. 사용자가 작성한 게시글 삭제
        const postsQuery = query(
          collection(this.db, "posts"),
          where("authorId", "==", userId)
        )
        const postsSnapshot = await getDocs(postsQuery)
        
        // 각 게시글과 관련 지원서들 삭제
        for (const postDoc of postsSnapshot.docs) {
          const postId = postDoc.id
          
          // 해당 게시글의 지원서들 삭제
          const applicationsQuery = query(
            collection(this.db, "applications"),
            where("postId", "==", postId)
          )
          const applicationsSnapshot = await getDocs(applicationsQuery)
          
          for (const appDoc of applicationsSnapshot.docs) {
            transaction.delete(doc(this.db, "applications", appDoc.id))
          }
          
          // 게시글 삭제
          transaction.delete(doc(this.db, "posts", postId))
        }

        // 2. 사용자가 제출한 지원서 삭제
        const userApplicationsQuery = query(
          collection(this.db, "applications"),
          where("applicantId", "==", userId)
        )
        const userApplicationsSnapshot = await getDocs(userApplicationsQuery)
        
        for (const appDoc of userApplicationsSnapshot.docs) {
          transaction.delete(doc(this.db, "applications", appDoc.id))
        }

        // 3. 사용자 관련 알림 삭제
        const notificationsQuery = query(
          collection(this.db, "notifications"),
          where("userId", "==", userId)
        )
        const notificationsSnapshot = await getDocs(notificationsQuery)
        
        for (const notificationDoc of notificationsSnapshot.docs) {
          transaction.delete(doc(this.db, "notifications", notificationDoc.id))
        }

        // 4. 단체 소유자인 경우 단체 삭제
        const organizationsQuery = query(
          collection(this.db, "organizations"),
          where("ownerId", "==", userId)
        )
        const organizationsSnapshot = await getDocs(organizationsQuery)
        
        for (const orgDoc of organizationsSnapshot.docs) {
          transaction.delete(doc(this.db, "organizations", orgDoc.id))
        }

        // 5. 사용자 프로필 완전 삭제
        transaction.delete(doc(this.db, "users", userId))
      })

      console.log("✅ [UserService] 모든 사용자 데이터 삭제 완료:", userId)
      
    } catch (error) {
      console.error("❌ [UserService] 데이터 삭제 실패:", error)
      throw new Error("사용자 데이터 삭제 중 오류가 발생했습니다.")
    }
  }

  /**
   * @deprecated 완전한 삭제를 위해 deleteUserAccount() 사용
   * 사용자 프로필 삭제 (소프트 삭제)
   */
  async deleteUserProfile(): Promise<void> {
    const userId = this.getCurrentUserId()

    const userRef = doc(this.db, "users", userId)
    await updateDoc(userRef, {
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
    const userRef = doc(this.db, "users", targetUserId)
    await updateDoc(userRef, {
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
    const userRef = doc(this.db, "users", targetUserId)
    await updateDoc(userRef, {
      isBlocked: false,
      status: "available",
      isOnline: true,
      updatedAt: this.getServerTimestamp(),
    })
  }
}
