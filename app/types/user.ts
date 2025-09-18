import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore"

// Gender type
export type UserGender = "male" | "female"

// User type
export type UserType = "general" | "organizer"

// Firestore user document shape (only allowed fields)
export interface UserProfile {
  uid: string
  email: string
  name: string
  gender?: UserGender
  /** YYYY-MM-DD */
  birthday?: string
  heightCm?: number
  media: string[]
  requiredProfileComplete: boolean
  userType: UserType          // 사용자 유형
  organizationId?: string     // 소속 단체 (운영자만)
  organizationName?: string   // 단체명 (운영자만)
  createdAt: FirebaseFirestoreTypes.Timestamp
  updatedAt: FirebaseFirestoreTypes.Timestamp
}

// Payload for creating the initial user document
export type CreateUserProfile = {
  name: string
  gender?: UserGender
  birthday?: string
  heightCm?: number
  userType?: UserType
  organizationName?: string
}

// Payload for updating allowed fields only
export type UpdateUserProfile = Partial<
  Pick<
    UserProfile,
    "name" | "gender" | "birthday" | "heightCm" | "media" | "requiredProfileComplete" | "userType" | "organizationId" | "organizationName"
  >
>

// Minimum number of photos required to mark profile complete
export const MIN_PROFILE_PHOTOS = 3
