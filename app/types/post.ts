import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore"

// 게시글 상태
export type PostStatus = "active" | "closed"

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
}

// 게시글 업데이트 페이로드
export type UpdatePost = Partial<
  Pick<
    Post,
    "title" | "description" | "production" | "rehearsalSchedule" | "location" | "organizationName" | "status" | "tags"
  >
>