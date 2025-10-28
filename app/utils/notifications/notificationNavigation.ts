/**
 * 알림 → 화면 내비게이션 매핑
 * 알림 타입별로 적절한 화면으로 이동
 */
import { NavigationContainerRef } from "@react-navigation/native"
import type { AppStackParamList } from "@/navigators/types"
import type { NotificationItem } from "@/stores/types"
import { handleDeepLink } from "@/navigation/linking/deepLinkHandler"
import { trackEvent } from "@/utils/analytics/analyticsService"

/**
 * 알림 타입 정의
 */
export enum NotificationType {
  POST_COMMENT = "post_comment", // 게시글에 댓글이 달림
  POST_LIKE = "post_like", // 게시글에 좋아요
  APPLICATION_ACCEPTED = "application_accepted", // 신청이 승인됨
  APPLICATION_REJECTED = "application_rejected", // 신청이 거부됨
  NEW_MESSAGE = "new_message", // 새 메시지
  PROFILE_VIEW = "profile_view", // 프로필 조회
  ORGANIZATION_INVITE = "organization_invite", // 조직 초대
  SYSTEM = "system", // 시스템 알림
  GENERAL = "general", // 일반 알림
}

/**
 * 알림 데이터에서 딥링크 추출
 */
const extractDeepLink = (notification: NotificationItem): string | null => {
  const { data } = notification

  // 1. 명시적 딥링크
  if (data?.deepLink) {
    return data.deepLink as string
  }

  // 2. 알림 타입별 딥링크 생성
  switch (notification.type) {
    case NotificationType.POST_COMMENT:
    case NotificationType.POST_LIKE:
      if (data?.postId) {
        return `app://post/${data.postId}`
      }
      break

    case NotificationType.APPLICATION_ACCEPTED:
    case NotificationType.APPLICATION_REJECTED:
      if (data?.postId) {
        return `app://application/${data.postId}`
      }
      break

    case NotificationType.NEW_MESSAGE:
      if (data?.userId) {
        return `app://profile/${data.userId}`
      }
      break

    case NotificationType.PROFILE_VIEW:
      if (data?.userId) {
        return `app://profile/${data.userId}`
      }
      break

    case NotificationType.ORGANIZATION_INVITE:
      if (data?.organizationId) {
        return `app://organization/${data.organizationId}`
      }
      break

    case NotificationType.SYSTEM:
    case NotificationType.GENERAL:
    default:
      return null
  }

  return null
}

/**
 * 알림 타입별 내비게이션 처리
 */
export const handleNotificationNavigation = (
  notification: NotificationItem,
  navigation: NavigationContainerRef<AppStackParamList>,
): boolean => {
  console.log("🔔 [NotificationNav] 알림 내비게이션 처리:", {
    type: notification.type,
    title: notification.title,
  })

  // 딥링크 추출
  const deepLink = extractDeepLink(notification)
  if (deepLink) {
    console.log("🔔 [NotificationNav] 딥링크로 이동:", deepLink)

    // 분석 추적
    trackEvent("notification_opened", {
      notification_type: notification.type,
      notification_id: notification.id,
      has_deep_link: true,
      deep_link: deepLink,
    })

    // 딥링크 핸들러로 위임
    return handleDeepLink(deepLink, navigation)
  }

  // 딥링크가 없는 경우 알림 센터로 이동
  console.log("🔔 [NotificationNav] 딥링크 없음 - 알림 센터로 이동")

  // 분석 추적
  trackEvent("notification_opened", {
    notification_type: notification.type,
    notification_id: notification.id,
    has_deep_link: false,
  })

  try {
    navigation.navigate("NotificationCenter")
    return true
  } catch (error) {
    console.error("🔔 [NotificationNav] 내비게이션 실패:", error)
    return false
  }
}

/**
 * 알림 배지 카운트 업데이트
 * iOS/Android 앱 아이콘 배지 설정
 */
export const updateNotificationBadge = async (count: number) => {
  try {
    // React Native의 배지 API 사용 (필요 시 추가 라이브러리 설치)
    // import { setBadgeCount } from 'react-native-notification-badge';
    // await setBadgeCount(count);

    console.log("🔔 [NotificationNav] 배지 카운트 업데이트:", count)
  } catch (error) {
    console.error("🔔 [NotificationNav] 배지 업데이트 실패:", error)
  }
}
