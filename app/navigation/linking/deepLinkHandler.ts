/**
 * 딥링크 핸들러
 * URL 파싱 및 내비게이션 처리
 */
import { NavigationContainerRef } from "@react-navigation/native"
import type { AppStackParamList } from "../types"
import { useAuthStore } from "@/stores"

/**
 * 딥링크 타입 정의
 */
export enum DeepLinkType {
  POST = "post",
  PROFILE = "profile",
  NOTIFICATION = "notification",
  ORGANIZATION = "organization",
  CREATE_POST = "create-post",
  SETTINGS = "settings",
  NOTIFICATION_CENTER = "notifications",
  UNKNOWN = "unknown",
}

/**
 * 파싱된 딥링크 데이터
 */
export interface ParsedDeepLink {
  type: DeepLinkType
  params?: Record<string, string>
  requiresAuth: boolean
}

/**
 * URL에서 딥링크 타입 및 파라미터 추출
 */
export const parseDeepLink = (url: string): ParsedDeepLink | null => {
  try {
    // URL 정규화
    const normalizedUrl = url.replace(/^(app:\/\/|https:\/\/[^/]+\/)/, "")
    console.log("🔍 [DeepLink] URL 파싱:", normalizedUrl)

    // 게시글 상세: post/:postId
    const postMatch = normalizedUrl.match(/^post\/([^/]+)$/)
    if (postMatch) {
      return {
        type: DeepLinkType.POST,
        params: { postId: postMatch[1] },
        requiresAuth: false,
      }
    }

    // 프로필: profile/:userId
    const profileMatch = normalizedUrl.match(/^profile\/([^/]+)$/)
    if (profileMatch) {
      return {
        type: DeepLinkType.PROFILE,
        params: { userId: profileMatch[1] },
        requiresAuth: false,
      }
    }

    // 알림: notification/:notificationId
    const notificationMatch = normalizedUrl.match(/^notification\/([^/]+)$/)
    if (notificationMatch) {
      return {
        type: DeepLinkType.NOTIFICATION,
        params: { notificationId: notificationMatch[1] },
        requiresAuth: true,
      }
    }

    // 조직: organization/:organizationId
    const organizationMatch = normalizedUrl.match(/^organization\/([^/]+)$/)
    if (organizationMatch) {
      return {
        type: DeepLinkType.ORGANIZATION,
        params: { organizationId: organizationMatch[1] },
        requiresAuth: false,
      }
    }

    // 게시글 작성
    if (normalizedUrl === "create-post" || normalizedUrl === "BulletinBoard/CreatePost") {
      return {
        type: DeepLinkType.CREATE_POST,
        requiresAuth: true,
      }
    }

    // 설정
    if (normalizedUrl === "settings") {
      return {
        type: DeepLinkType.SETTINGS,
        requiresAuth: true,
      }
    }

    // 알림 센터
    if (normalizedUrl === "notifications") {
      return {
        type: DeepLinkType.NOTIFICATION_CENTER,
        requiresAuth: true,
      }
    }

    // 알 수 없는 URL
    console.warn("🔍 [DeepLink] 알 수 없는 URL 패턴:", normalizedUrl)
    return {
      type: DeepLinkType.UNKNOWN,
      requiresAuth: false,
    }
  } catch (error) {
    console.error("🔍 [DeepLink] URL 파싱 에러:", error)
    return null
  }
}

/**
 * 딥링크 처리 및 내비게이션
 */
export const handleDeepLink = async (
  url: string,
  navigation: NavigationContainerRef<AppStackParamList> | null,
): Promise<boolean> => {
  if (!navigation) {
    console.warn("🔍 [DeepLink] Navigation ref가 없습니다")
    return false
  }

  const parsedLink = parseDeepLink(url)
  if (!parsedLink) {
    console.warn("🔍 [DeepLink] 파싱 실패:", url)
    return false
  }

  // 인증 필요 여부 확인
  if (parsedLink.requiresAuth) {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      console.warn("🔍 [DeepLink] 인증이 필요한 링크:", parsedLink.type)
      // 로그인 페이지로 리다이렉트 (로그인 후 원래 URL로 복귀)
      navigation.navigate("SignIn")
      return false
    }
  }

  try {
    switch (parsedLink.type) {
      case DeepLinkType.POST:
        if (parsedLink.params?.postId) {
          console.log("🔍 [DeepLink] 게시글 상세로 이동:", parsedLink.params.postId)
          navigation.navigate("PostDetail", { postId: parsedLink.params.postId })
          return true
        }
        break

      case DeepLinkType.PROFILE:
        if (parsedLink.params?.userId) {
          console.log("🔍 [DeepLink] 프로필로 이동:", parsedLink.params.userId)
          navigation.navigate("Profile")
          return true
        }
        break

      case DeepLinkType.NOTIFICATION:
        if (parsedLink.params?.notificationId) {
          console.log("🔍 [DeepLink] 알림으로 이동:", parsedLink.params.notificationId)
          navigation.navigate("NotificationCenter")
          return true
        }
        break

      case DeepLinkType.ORGANIZATION:
        if (parsedLink.params?.organizationId) {
          console.log("🔍 [DeepLink] 조직으로 이동:", parsedLink.params.organizationId)
          navigation.navigate("CreateOrganization", {
            organizationId: parsedLink.params.organizationId,
          })
          return true
        }
        break

      case DeepLinkType.CREATE_POST:
        console.log("🔍 [DeepLink] 게시글 작성으로 이동")
        // @ts-ignore - BulletinBoard 탭의 CreatePost 화면으로 이동
        navigation.navigate("Main", { screen: "BulletinBoard", params: { screen: "CreatePost" } })
        return true

      case DeepLinkType.SETTINGS:
        console.log("🔍 [DeepLink] 설정으로 이동")
        // @ts-ignore - Main 탭의 Settings 화면으로 이동
        navigation.navigate("Main", { screen: "Settings" })
        return true

      case DeepLinkType.NOTIFICATION_CENTER:
        console.log("🔍 [DeepLink] 알림 센터로 이동")
        navigation.navigate("NotificationCenter")
        return true

      default:
        console.warn("🔍 [DeepLink] 처리할 수 없는 링크 타입:", parsedLink.type)
        return false
    }
  } catch (error) {
    console.error("🔍 [DeepLink] 내비게이션 에러:", error)
    return false
  }

  return false
}

/**
 * 딥링크 유효성 검증
 */
export const validateDeepLink = (url: string): boolean => {
  const parsedLink = parseDeepLink(url)
  return parsedLink !== null && parsedLink.type !== DeepLinkType.UNKNOWN
}
