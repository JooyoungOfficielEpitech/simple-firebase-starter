import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore"

// Platform type
export type CourtPlatform = "daum" | "naver" | "other"

// Extracted court rental information
export interface ExtractedCourtInfo {
  /** Event date in YYYY-MM-DD format */
  event_date: string | null
  /** Event time in HH:MM format */
  event_time: string | null
  /** Event end time in HH:MM format */
  event_time_end: string | null
  /** Court location name */
  location: string | null
  /** Rental price in KRW (as string) */
  price: string | null
  /** Contact phone number */
  contact: string | null
}

// Firestore court rental document shape
export interface CourtRental {
  /** Unique document ID */
  id: string
  /** Platform where the post was found */
  platform: CourtPlatform
  /** Original post title */
  title: string
  /** Post author name */
  author: string
  /** Date when the post was published (format from platform) */
  posted_at: string
  /** URL to the original post */
  url: string
  /** Full post content */
  content: string
  /** Timestamp when the post was crawled */
  crawled_at: string
  /** Extracted structured information */
  extracted_info: ExtractedCourtInfo
  /** Whether this rental is still available */
  is_available: boolean
  /** Firestore creation timestamp */
  createdAt: FirebaseFirestoreTypes.Timestamp
  /** Firestore update timestamp */
  updatedAt: FirebaseFirestoreTypes.Timestamp
}

// Payload for creating a new court rental document
export type CreateCourtRental = Omit<
  CourtRental,
  "id" | "is_available" | "createdAt" | "updatedAt"
>

// Payload for updating court rental fields
export type UpdateCourtRental = Partial<
  Pick<CourtRental, "is_available" | "extracted_info">
>

// Search/Filter parameters
export interface CourtSearchParams {
  /** Filter by platform */
  platform?: CourtPlatform
  /** Filter by date range - start date (YYYY-MM-DD) */
  start_date?: string
  /** Filter by date range - end date (YYYY-MM-DD) */
  end_date?: string
  /** Filter by location (partial match) */
  location?: string
  /** Filter by max price */
  max_price?: number
  /** Filter by availability */
  is_available?: boolean
  /** Limit number of results */
  limit?: number
}
