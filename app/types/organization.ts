export interface Organization {
  id: string
  name: string
  description: string
  contactEmail: string
  contactPhone?: string
  website?: string
  location: string
  establishedDate?: string
  tags: string[]
  logoUrl?: string
  // 소셜 미디어 링크
  instagramUrl?: string
  youtubeUrl?: string
  facebookUrl?: string
  twitterUrl?: string
  // 추가 상세 정보
  foundingStory?: string           // 창립 스토리
  vision?: string                  // 비전/목표
  specialties?: string[]          // 전문 분야 (뮤지컬, 연극, 드라마 등)
  pastWorks?: string[]            // 대표 작품들
  facilities?: string             // 보유 시설 정보
  recruitmentInfo?: string        // 모집 안내
  // 기존 필드
  isVerified: boolean
  ownerId: string
  ownerName: string
  memberCount: number
  activePostCount: number
  createdAt: any
  updatedAt: any
}

export interface CreateOrganization {
  name: string
  description: string
  contactEmail: string
  contactPhone?: string
  website?: string
  location: string
  establishedDate?: string
  tags: string[]
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
}

export interface UpdateOrganization {
  name?: string
  description?: string
  contactEmail?: string
  contactPhone?: string
  website?: string
  location?: string
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
}