import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore"

// 게시글 상태
export type PostStatus = "active" | "closed"

// 모집 역할 정보
export interface Role {
  name: string              // 역할명 (햄릿, 오필리어)
  gender: 'male' | 'female' | 'any'  // 성별 조건
  ageRange: string          // 나이 조건 (25-35세)
  requirements: string      // 역할별 요구사항
  count: number             // 모집 인원
}

// 오디션 정보
export interface AuditionInfo {
  date: string              // 오디션 일정
  location: string          // 오디션 장소
  requirements: string[]    // 준비사항 ['자기소개', '자유곡 1분']
  resultDate: string        // 결과 발표일
  method: string            // 오디션 방식 (대면/화상/서류)
}

// 공연 정보
export interface PerformanceInfo {
  dates: string[]           // 공연 일정
  venue: string             // 공연 장소
  ticketPrice: string       // 티켓 가격
  targetAudience: string    // 관객 대상
  genre: string             // 장르
}

// 혜택 정보
export interface Benefits {
  fee: string               // 출연료/활동비
  transportation: boolean   // 교통비 지원
  costume: boolean          // 의상 제공
  portfolio: boolean        // 포트폴리오 제공
  photography: boolean      // 프로필 촬영
  meals: boolean            // 식사 제공
  other: string[]           // 기타 혜택
}

// 연락처 정보
export interface ContactInfo {
  email: string             // 담당자 이메일
  phone?: string            // 전화번호
  applicationMethod: string // 지원 방법
  requiredDocuments: string[] // 제출 서류
}

// 게시글 인터페이스
export interface Post {
  id: string
  title: string
  description: string
  production: string        // 작품명 (지킬앤 하이드)
  rehearsalSchedule: string // 연습 일정 (매주 일요일)
  location: string          // 장소 (건대입구역 앞)
  organizationId: string    // 단체 ID
  organizationName: string  // 단체명
  authorId: string          // 작성자 ID
  authorName: string        // 작성자명
  status: PostStatus        // 모집 상태
  tags: string[]            // 태그 ['뮤지컬', '남성역할', '여성역할']
  
  // 새로운 필드들
  roles?: Role[]            // 모집 역할들
  audition?: AuditionInfo   // 오디션 정보
  performance?: PerformanceInfo // 공연 정보
  benefits?: Benefits       // 혜택 정보
  contact?: ContactInfo     // 연락처 정보
  deadline?: string         // 마감일
  totalApplicants?: number  // 총 지원자 수
  viewCount?: number        // 조회수
  
  createdAt: FirebaseFirestoreTypes.Timestamp
  updatedAt: FirebaseFirestoreTypes.Timestamp
}

// 게시글 생성 페이로드
export type CreatePost = {
  title: string
  description: string
  production: string
  rehearsalSchedule: string
  location: string
  organizationName: string
  status: PostStatus
  tags: string[]
  
  // 새로운 필드들 (선택적)
  roles?: Role[]
  audition?: AuditionInfo
  performance?: PerformanceInfo
  benefits?: Benefits
  contact?: ContactInfo
  deadline?: string
  totalApplicants?: number
  viewCount?: number
}

// 게시글 업데이트 페이로드
export type UpdatePost = Partial<
  Pick<
    Post,
    "title" | "description" | "production" | "rehearsalSchedule" | "location" | "organizationName" | "status" | "tags" |
    "roles" | "audition" | "performance" | "benefits" | "contact" | "deadline" | "totalApplicants" | "viewCount"
  >
>