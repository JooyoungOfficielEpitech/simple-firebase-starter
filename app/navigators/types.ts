/**
 * 네비게이션 타입 정의
 * 모든 네비게이터의 타입을 중앙 집중식으로 관리
 */

/**
 * 루트 앱 네비게이션 타입
 * 인증 상태에 따른 기본 화면들
 */
export type AppStackParamList = {
  // 공통 화면
  Main: undefined
  Welcome: undefined
  
  // 인증 관련 화면
  SignIn: undefined
  SignUp: undefined
  ForgotPassword: undefined
  
  // 사용자 관련 화면
  Profile: undefined
  EditProfile: undefined
  NotificationCenter: undefined
  
  // 게시판 관련 화면
  PostDetail: { postId: string }
  ApplicationManagement: { postId: string; postTitle: string }
  CreateOrganization: { organizationId?: string; isEdit?: boolean; isOrganizerConversion?: boolean }
  
  // 개발 전용 화면 (개발 환경에서만 사용)
  DevSettings: undefined
  PushDebug: undefined
  MusicPlayer: undefined
  Debug: undefined
}

/**
 * 메인 탭 네비게이션 타입
 * 하단 탭 바 화면들
 */
export type MainTabParamList = {
  Home: undefined
  BulletinBoard: undefined
  Settings: undefined
  Profile: undefined
}

/**
 * 홈 스택 네비게이션 타입
 * 홈 탭 내부 화면들
 */
export type HomeStackParamList = {
  HomeMain: undefined
  KaraokeScreen: { song: any } // Song 타입은 @/types/song에서 import 필요
}

/**
 * 게시판 스택 네비게이션 타입
 * 게시판 탭 내부 화면들
 */
export type BulletinBoardStackParamList = {
  BulletinBoardMain: undefined
  CreatePost: { postId?: string; isEdit?: boolean }
}

/**
 * 네비게이션 접근성 라벨 타입
 */
export type NavigationAccessibilityLabels = {
  [K in keyof MainTabParamList]: {
    label: string
    hint: string
  }
}

/**
 * 네비게이션 접근성 라벨 정의
 */
export const NAVIGATION_ACCESSIBILITY_LABELS: NavigationAccessibilityLabels = {
  Home: {
    label: "홈 탭",
    hint: "홈 화면으로 이동합니다"
  },
  BulletinBoard: {
    label: "게시판 탭", 
    hint: "게시판 화면으로 이동합니다"
  },
  Settings: {
    label: "설정 탭",
    hint: "설정 화면으로 이동합니다"
  },
  Profile: {
    label: "프로필 탭",
    hint: "프로필 화면으로 이동합니다"
  }
}