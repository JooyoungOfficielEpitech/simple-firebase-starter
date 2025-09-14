import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore"

// Gender type
export type UserGender = "male" | "female"

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
  createdAt: FirebaseFirestoreTypes.Timestamp
  updatedAt: FirebaseFirestoreTypes.Timestamp
}

// Payload for creating the initial user document
export type CreateUserProfile = {
  name: string
  gender?: UserGender
  birthday?: string
  heightCm?: number
}

// Payload for updating allowed fields only
export type UpdateUserProfile = Partial<
  Pick<
    UserProfile,
    "name" | "gender" | "birthday" | "heightCm" | "media" | "requiredProfileComplete"
  >
>

// Minimum number of photos required to mark profile complete
export const MIN_PROFILE_PHOTOS = 3
