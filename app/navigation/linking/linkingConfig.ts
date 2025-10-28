/**
 * React Navigation Linking 설정
 * 딥링크 및 유니버설 링크 처리
 */
import { LinkingOptions } from "@react-navigation/native"
import * as Linking from "expo-linking"
import type { AppStackParamList } from "../types"

/**
 * 앱 URL 스키마 및 프리픽스 설정
 */
const prefix = Linking.createURL("/")

/**
 * Deep Link 설정
 *
 * 지원하는 URL 패턴:
 * - app://post/:postId - 게시글 상세
 * - app://profile/:userId - 프로필 페이지
 * - app://notification/:notificationId - 알림 상세
 * - app://organization/:organizationId - 조직 상세
 * - app://create-post - 게시글 작성
 * - app://settings - 설정
 */
export const linkingConfig: LinkingOptions<AppStackParamList> = {
  prefixes: [prefix, "app://", "https://yourdomain.com"],
  config: {
    screens: {
      // 메인 화면
      Main: {
        path: "main",
        screens: {
          Home: "home",
          BulletinBoard: "bulletin-board",
          Settings: "settings",
          Profile: "profile",
        },
      },

      // 게시글 상세
      PostDetail: {
        path: "post/:postId",
        parse: {
          postId: (postId: string) => postId,
        },
      },

      // 프로필 관련
      Profile: "profile",
      EditProfile: "edit-profile",

      // 게시글 관리
      ApplicationManagement: {
        path: "application/:postId",
        parse: {
          postId: (postId: string) => postId,
        },
      },

      // 조직 생성/수정
      CreateOrganization: {
        path: "organization/:organizationId?",
        parse: {
          organizationId: (organizationId: string) => organizationId || undefined,
        },
      },

      // 알림 센터
      NotificationCenter: "notifications",

      // 인증 화면
      Welcome: "welcome",
      SignIn: "signin",
      SignUp: "signup",
      ForgotPassword: "forgot-password",

      // 개발 전용
      DevSettings: "dev-settings",
      PushDebug: "push-debug",
      MusicPlayer: "music-player",
      Debug: "debug",
    },
  },
  async getInitialURL() {
    // 앱이 종료 상태에서 딥링크로 열린 경우
    const url = await Linking.getInitialURL()
    if (url != null) {
      console.log("🔗 [Linking] 초기 URL:", url)
      return url
    }

    // 푸시 알림으로 앱이 열린 경우는 별도 처리
    return null
  },
  subscribe(listener) {
    // URL 변경 리스너
    const onReceiveURL = ({ url }: { url: string }) => {
      console.log("🔗 [Linking] URL 수신:", url)
      listener(url)
    }

    // 딥링크 이벤트 리스너 등록
    const subscription = Linking.addEventListener("url", onReceiveURL)

    return () => {
      // 클린업
      subscription.remove()
    }
  },
}

/**
 * 딥링크 URL 생성 헬퍼
 */
export const createDeepLink = {
  /**
   * 게시글 상세 URL
   */
  post: (postId: string) => `app://post/${postId}`,

  /**
   * 프로필 URL
   */
  profile: (userId: string) => `app://profile/${userId}`,

  /**
   * 알림 URL
   */
  notification: (notificationId: string) => `app://notification/${notificationId}`,

  /**
   * 조직 URL
   */
  organization: (organizationId: string) => `app://organization/${organizationId}`,

  /**
   * 게시글 작성 URL
   */
  createPost: () => `app://create-post`,

  /**
   * 설정 URL
   */
  settings: () => `app://settings`,

  /**
   * 알림 센터 URL
   */
  notificationCenter: () => `app://notifications`,
}

/**
 * 외부에서 딥링크 열기
 */
export const openDeepLink = async (url: string) => {
  try {
    const canOpen = await Linking.canOpenURL(url)
    if (canOpen) {
      await Linking.openURL(url)
      console.log("🔗 [Linking] 딥링크 열기 성공:", url)
      return true
    } else {
      console.warn("🔗 [Linking] 딥링크 열기 실패 - 지원하지 않는 URL:", url)
      return false
    }
  } catch (error) {
    console.error("🔗 [Linking] 딥링크 열기 에러:", error)
    return false
  }
}
