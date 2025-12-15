import { BottomTabScreenProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { CompositeScreenProps } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Home, Music, User, Settings } from "lucide-react-native"

import { SettingsScreen } from "@/screens/SettingsScreen"
import { ProfileScreen } from "@/screens/ProfileScreen"
import { orphiTokens } from "@/design-system/tokens/orphi.tokens"
import { useTheme } from "@/core/context/ThemeContext"

import { BulletinBoardStackNavigator } from "./BulletinBoardStackNavigator"
import { PracticeStackNavigator } from "./PracticeStackNavigator"
import type { AppStackParamList, MainTabParamList } from "./types"
import { NAVIGATION_ACCESSIBILITY_LABELS } from "./types"

// Re-export for other files that depend on it
export type { MainTabParamList } from "./types"


/**
 * Helper for automatically generating navigation prop types for each route.
 */
export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<AppStackParamList>
>

const Tab = createBottomTabNavigator<MainTabParamList>()

/**
 * Orphi Main Navigator with 4 tabs
 * 홈 (공고) | 연습실 | 프로필 | 설정
 *
 * @returns {JSX.Element} The rendered Orphi Main Navigator
 */
export function MainNavigator() {
  const { bottom } = useSafeAreaInsets()
  const { currentTheme } = useTheme()

  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: [
          {
            backgroundColor: orphiTokens.colors.white95,
            borderTopWidth: 1,
            borderTopColor: orphiTokens.colors.gray200,
            paddingHorizontal: orphiTokens.spacing["2xl"],
            paddingVertical: orphiTokens.spacing.base,
            paddingBottom: bottom + orphiTokens.spacing.base,
            borderTopLeftRadius: orphiTokens.borderRadius.lg,
            borderTopRightRadius: orphiTokens.borderRadius.lg,
            height: bottom + 70,
            ...orphiTokens.shadows.xl,
          },
        ],
        tabBarActiveTintColor: currentTheme.colors.primary600,
        tabBarInactiveTintColor: orphiTokens.colors.gray500,
        tabBarLabelStyle: {
          fontSize: orphiTokens.typography.sizes.xs,
          fontWeight: orphiTokens.typography.weights.medium,
        },
        tabBarItemStyle: {
          paddingTop: orphiTokens.spacing.xs,
        },
        tabBarIconStyle: {
          marginTop: orphiTokens.spacing.xs,
        },
      }}
    >
      {/* 홈 (공고 게시판) */}
      <Tab.Screen
        name="BulletinBoard"
        component={BulletinBoardStackNavigator}
        options={{
          tabBarLabel: "홈",
          tabBarIcon: ({ focused, color }) => (
            <Home size={24} color={color} strokeWidth={2} />
          ),
          tabBarAccessibilityLabel: NAVIGATION_ACCESSIBILITY_LABELS.BulletinBoard?.label || "홈 탭",
          tabBarButtonTestID: "home-tab",
        }}
      />

      {/* 연습실 (음악 플레이어) */}
      <Tab.Screen
        name="Practice"
        component={PracticeStackNavigator}
        options={{
          tabBarLabel: "연습실",
          tabBarIcon: ({ focused, color }) => (
            <Music size={24} color={color} strokeWidth={2} />
          ),
          tabBarAccessibilityLabel: NAVIGATION_ACCESSIBILITY_LABELS.Practice?.label || "연습실 탭",
          tabBarButtonTestID: "practice-tab",
        }}
      />

      {/* 프로필 */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "프로필",
          tabBarIcon: ({ focused, color }) => (
            <User size={24} color={color} strokeWidth={2} />
          ),
          tabBarAccessibilityLabel: NAVIGATION_ACCESSIBILITY_LABELS.Profile?.label || "프로필 탭",
          tabBarButtonTestID: "profile-tab",
        }}
      />

      {/* 설정 */}
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: "설정",
          tabBarIcon: ({ focused, color }) => (
            <Settings size={24} color={color} strokeWidth={2} />
          ),
          tabBarAccessibilityLabel: NAVIGATION_ACCESSIBILITY_LABELS.Settings?.label || "설정 탭",
          tabBarButtonTestID: "settings-tab",
        }}
      />
    </Tab.Navigator>
  )
}

