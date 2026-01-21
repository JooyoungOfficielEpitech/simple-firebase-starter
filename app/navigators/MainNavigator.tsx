import { TextStyle, ViewStyle } from "react-native";
import {
  BottomTabScreenProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/Icon";
import { translate } from "@/i18n/translate";
import { ComponentsListScreen } from "@/screens/ComponentsListScreen";
import { FeaturesListScreen } from "@/screens/FeaturesListScreen";
import { HomeScreen } from "@/screens/HomeScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

import { AppStackParamList, AppStackScreenProps } from "./AppNavigator";
import { ChatNavigator, ChatStackParamList } from "./ChatNavigator";

export type MainTabParamList = {
  Home: undefined;
  Components: undefined;
  Features: undefined;
  Chat: NavigatorScreenParams<ChatStackParamList>;
  Settings: undefined;
};

/**
 * Helper for automatically generating navigation prop types for each route.
 *
 * More info: https://reactnavigation.org/docs/typescript/#organizing-types
 */
export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    AppStackScreenProps<keyof AppStackParamList>
  >;

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * This is the main navigator for the authenticated user with a bottom tab bar.
 * Contains Welcome and Settings screens.
 *
 * More info: https://reactnavigation.org/docs/bottom-tab-navigator/
 * @returns {JSX.Element} The rendered `MainNavigator`.
 */
export function MainNavigator() {
  const { bottom } = useSafeAreaInsets();
  const {
    themed,
    theme: { colors },
  } = useAppTheme();

  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: themed([$tabBar, { height: bottom + 70 }]),
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.text,
        tabBarLabelStyle: themed($tabBarLabel),
        tabBarItemStyle: themed($tabBarItem),
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: translate("mainNavigator:homeTab"),
          tabBarIcon: ({ focused }) => (
            <Icon
              icon="heart"
              color={focused ? colors.tint : colors.tintInactive}
              size={30}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Components"
        component={ComponentsListScreen}
        options={{
          tabBarLabel: translate("mainNavigator:componentsTab"),
          tabBarIcon: ({ focused }) => (
            <Icon
              icon="ladybug"
              color={focused ? colors.tint : colors.tintInactive}
              size={30}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Features"
        component={FeaturesListScreen}
        options={{
          tabBarLabel: translate("mainNavigator:featuresTab"),
          tabBarIcon: ({ focused }) => (
            <Icon
              icon="menu"
              color={focused ? colors.tint : colors.tintInactive}
              size={30}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Chat"
        component={ChatNavigator}
        options={{
          tabBarLabel: translate("mainNavigator:chatTab"),
          tabBarIcon: ({ focused }) => (
            <Icon
              icon="bell"
              color={focused ? colors.tint : colors.tintInactive}
              size={30}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: translate("mainNavigator:settingsTab"),
          tabBarIcon: ({ focused }) => (
            <Icon
              icon="settings"
              color={focused ? colors.tint : colors.tintInactive}
              size={30}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const $tabBar: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  borderTopColor: colors.transparent,
});

const $tabBarItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.md,
});

const $tabBarLabel: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.medium,
  lineHeight: 16,
  color: colors.text,
});
