/**
 * 알림 권한 상태
 */
export type NotificationPermissionStatus =
  | "granted"
  | "denied"
  | "undetermined";

/**
 * 알림 트리거 (예약)
 */
export interface NotificationTrigger {
  /** 초 단위 지연 시간 */
  seconds?: number;
  /** 특정 날짜/시간 */
  date?: Date;
  /** 반복 여부 */
  repeats?: boolean;
}

/**
 * 로컬 알림 옵션
 */
export interface LocalNotificationOptions {
  /** 알림 ID (선택 사항, 자동 생성됨) */
  id?: string;
  /** 알림 제목 */
  title: string;
  /** 알림 내용 */
  body: string;
  /** 추가 데이터 (딥링킹 등에 사용) */
  data?: Record<string, any>;
  /** 알림 트리거 (즉시 또는 예약) */
  trigger?: NotificationTrigger;
  /** 알림 사운드 */
  sound?: string;
  /** 배지 카운트 */
  badge?: number;
}

/**
 * FCM 토큰 데이터
 */
export interface FCMTokenData {
  /** FCM 토큰 */
  token: string;
  /** 플랫폼 (iOS/Android) */
  platform: "ios" | "android";
  /** 토큰 업데이트 시간 */
  updatedAt: Date;
}

/**
 * 알림 페이로드
 */
export interface NotificationPayload {
  /** 알림 제목 */
  title: string;
  /** 알림 내용 */
  body: string;
  /** 추가 데이터 */
  data?: Record<string, any>;
}

/**
 * 알림 응답 (사용자가 탭했을 때)
 */
export interface NotificationResponse {
  /** 알림 페이로드 */
  notification: NotificationPayload;
  /** 액션 식별자 */
  actionIdentifier: string;
  /** 사용자 입력 텍스트 (있는 경우) */
  userText?: string;
}

/**
 * 알림 유형
 */
export type NotificationType =
  | "match"
  | "message"
  | "like"
  | "system"
  | "event"
  | "other";

/**
 * Firestore에 저장되는 알림 데이터
 */
export interface StoredNotification {
  /** 알림 ID */
  id: string;
  /** 사용자 ID */
  userId: string;
  /** 알림 제목 */
  title: string;
  /** 알림 내용 */
  body: string;
  /** 알림 유형 */
  type: NotificationType;
  /** 읽음 여부 */
  isRead: boolean;
  /** 추가 데이터 (딥링킹 등) */
  data?: Record<string, unknown>;
  /** 생성 시간 */
  createdAt: Date;
}
