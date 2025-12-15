import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore"

// 알림 타입
export type NotificationType = 
  | "application_received"     // 운영자: 새 지원자 등록
  | "application_accepted"     // 지원자: 지원 수락
  | "application_rejected"     // 지원자: 지원 거절
  | "application_cancelled"    // 운영자: 지원자가 지원 취소
  | "post_status_changed"      // 지원자: 지원한 공고 상태 변경 (마감, 수정 등)
  | "post_updated"             // 지원자: 지원한 공고 수정

// 알림 인터페이스
export interface Notification {
  id: string
  userId: string              // 알림을 받을 사용자 ID
  type: NotificationType      // 알림 타입
  title: string               // 알림 제목
  message: string             // 알림 내용
  
  // 관련 데이터
  postId?: string             // 관련 공고 ID
  postTitle?: string          // 관련 공고 제목
  applicantId?: string        // 지원자 ID (운영자 알림용)
  applicantName?: string      // 지원자 이름 (운영자 알림용)
  organizerId?: string        // 운영자 ID (지원자 알림용)
  organizerName?: string      // 운영자 이름 (지원자 알림용)
  
  // 상태
  isRead: boolean             // 읽음 여부
  readAt?: FirebaseFirestoreTypes.Timestamp  // 읽은 시간
  
  // 메타데이터
  createdAt: FirebaseFirestoreTypes.Timestamp
  updatedAt: FirebaseFirestoreTypes.Timestamp
}

// 알림 생성 페이로드
export type CreateNotification = {
  userId: string
  type: NotificationType
  title: string
  message: string
  postId?: string
  postTitle?: string
  applicantId?: string
  applicantName?: string
  organizerId?: string
  organizerName?: string
  isRead?: boolean
  createdAt: FirebaseFirestoreTypes.FieldValue
  updatedAt: FirebaseFirestoreTypes.FieldValue
}

// 알림 업데이트 페이로드
export type UpdateNotification = Partial<
  Pick<
    Notification,
    "isRead" | "readAt"
  >
> & {
  updatedAt: FirebaseFirestoreTypes.FieldValue
}

// 알림 템플릿 함수들
export const NotificationTemplates = {
  // 운영자용: 새 지원자 등록
  applicationReceived: (postTitle: string, applicantName: string): Pick<CreateNotification, 'title' | 'message'> => ({
    title: "새로운 지원자",
    message: `${postTitle} 공고에 ${applicantName}님이 지원했습니다.`
  }),

  // 지원자용: 지원 수락
  applicationAccepted: (postTitle: string, organizerName: string): Pick<CreateNotification, 'title' | 'message'> => ({
    title: "지원 수락",
    message: `${postTitle} 공고에 대한 지원이 수락되었습니다. (${organizerName})`
  }),

  // 지원자용: 지원 거절
  applicationRejected: (postTitle: string, organizerName: string): Pick<CreateNotification, 'title' | 'message'> => ({
    title: "지원 결과",
    message: `${postTitle} 공고에 대한 지원이 거절되었습니다. (${organizerName})`
  }),

  // 운영자용: 지원 취소
  applicationCancelled: (postTitle: string, applicantName: string): Pick<CreateNotification, 'title' | 'message'> => ({
    title: "지원 취소",
    message: `${applicantName}님이 ${postTitle} 공고 지원을 취소했습니다.`
  }),

  // 지원자용: 공고 상태 변경
  postStatusChanged: (postTitle: string, newStatus: string): Pick<CreateNotification, 'title' | 'message'> => ({
    title: "공고 상태 변경",
    message: `지원한 ${postTitle} 공고가 ${newStatus === 'closed' ? '마감' : '활성'}되었습니다.`
  }),

  // 지원자용: 공고 수정
  postUpdated: (postTitle: string): Pick<CreateNotification, 'title' | 'message'> => ({
    title: "공고 수정",
    message: `지원한 ${postTitle} 공고 내용이 수정되었습니다.`
  })
}