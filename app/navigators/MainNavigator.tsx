import { TextStyle, ViewStyle } from "react-native"
import { BottomTabScreenProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { CompositeScreenProps } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { TabBarIcon } from "@/components/TabBarIcon"
import { SettingsScreen } from "@/screens/SettingsScreen"
import { WelcomeScreen } from "@/screens/WelcomeScreen"
import { ProfileScreen } from "@/screens/ProfileScreen"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { BulletinBoardStackNavigator } from "./BulletinBoardStackNavigator"
import { HomeStackNavigator } from "./HomeStackNavigator"
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
 * This is the main navigator for the authenticated user with a bottom tab bar.
 * Contains Welcome and Settings screens.
 *
 * More info: https://reactnavigation.org/docs/bottom-tab-navigator/
 * @returns {JSX.Element} The rendered `MainNavigator`.
 */
export function MainNavigator() {
  const { bottom } = useSafeAreaInsets()
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: themed([$tabBar, { height: bottom + 70 }]),
        tabBarActiveTintColor: colors.secondaryAction, // BOLD: Active tabs in secondary color
        tabBarInactiveTintColor: colors.tintInactive,
        tabBarLabelStyle: themed($tabBarLabel),
        tabBarItemStyle: themed($tabBarItem),
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: NAVIGATION_ACCESSIBILITY_LABELS.Home.label.replace(" 탭", ""),
          tabBarIcon: ({ focused }) => <TabBarIcon icon="heart" focused={focused} />,
          tabBarAccessibilityLabel: NAVIGATION_ACCESSIBILITY_LABELS.Home.label,
          tabBarButtonTestID: "home-tab",
        }}
      />

      <Tab.Screen
        name="BulletinBoard"
        component={BulletinBoardStackNavigator}
        options={{
          tabBarLabel: NAVIGATION_ACCESSIBILITY_LABELS.BulletinBoard.label.replace(" 탭", ""),
          tabBarIcon: ({ focused }) => <TabBarIcon icon="menu" focused={focused} />,
          tabBarAccessibilityLabel: NAVIGATION_ACCESSIBILITY_LABELS.BulletinBoard.label,
          tabBarButtonTestID: "bulletin-board-tab",
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: NAVIGATION_ACCESSIBILITY_LABELS.Settings.label.replace(" 탭", ""),
          tabBarIcon: ({ focused }) => <TabBarIcon icon="settings" focused={focused} />,
          tabBarAccessibilityLabel: NAVIGATION_ACCESSIBILITY_LABELS.Settings.label,
          tabBarButtonTestID: "settings-tab",
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: NAVIGATION_ACCESSIBILITY_LABELS.Profile.label.replace(" 탭", ""),
          tabBarIcon: ({ focused }) => <TabBarIcon icon="user" focused={focused} />,
          tabBarAccessibilityLabel: NAVIGATION_ACCESSIBILITY_LABELS.Profile.label,
          tabBarButtonTestID: "profile-tab",
        }}
      />
    </Tab.Navigator>
  )
}

const $tabBar: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  borderTopColor: colors.transparent,
})

const $tabBarItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.md,
})

const $tabBarLabel: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.medium,
  lineHeight: 16,
  color: colors.text,
})

