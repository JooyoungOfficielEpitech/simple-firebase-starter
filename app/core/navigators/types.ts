/**
 * 네비게이션 타입 정의
 * 모든 네비게이터의 타입을 중앙 집중식으로 관리
 */

import { Song } from '@/core/types/song'

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
  CreatePost: { postId?: string; isEdit?: boolean }
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
 * 하단 탭 바 화면들 (Orphi 디자인)
 * 홈 (공고) | 연습실 | 프로필 | 설정
 */
export type MainTabParamList = {
  BulletinBoard: undefined  // 홈 (공고 게시판)
  Practice: undefined       // 연습실 (음악 플레이어)
  Profile: undefined        // 프로필
  Settings: undefined       // 설정

  // Legacy - 하위 호환성 유지
  Home?: undefined
}

/**
 * 홈 스택 네비게이션 타입
 * 홈 탭 내부 화면들
 */
export type HomeStackParamList = {
  HomeMain: undefined
  KaraokeScreen: { song: Song }
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
 * 연습실 스택 네비게이션 타입
 * 연습실 탭 내부 화면들
 */
export type PracticeStackParamList = {
  PracticeMain: undefined
  KaraokeScreen: { song: Song }
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
 * 네비게이션 접근성 라벨 정의 (Orphi 디자인)
 */
export const NAVIGATION_ACCESSIBILITY_LABELS: Partial<NavigationAccessibilityLabels> = {
  BulletinBoard: {
    label: "홈 탭",
    hint: "공고 게시판으로 이동합니다"
  },
  Practice: {
    label: "연습실 탭",
    hint: "음악 연습실로 이동합니다"
  },
  Profile: {
    label: "프로필 탭",
    hint: "프로필 화면으로 이동합니다"
  },
  Settings: {
    label: "설정 탭",
    hint: "설정 화면으로 이동합니다"
  },

  // Legacy - 하위 호환성 유지
  Home: {
    label: "홈 탭",
    hint: "홈 화면으로 이동합니다"
  }
}