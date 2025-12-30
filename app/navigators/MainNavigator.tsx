import { TouchableOpacity, ViewStyle } from "react-native"
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"
import { CompositeScreenProps } from "@react-navigation/native"

import { Icon } from "@/components/Icon"
import { WelcomeScreen } from "@/screens/WelcomeScreen"
import { useAppTheme } from "@/theme/context"

import { AppStackParamList, AppStackScreenProps } from "./AppNavigator"

// ColoredSheep screens
import HomeScreen from "@/screens/HomeScreen"
import { CreatePostScreen } from "@/screens/CreatePostScreen"
import CourtListScreen from "@/screens/CourtListScreen"
import CourtDetailScreen from "@/screens/CourtDetailScreen"

/**
 * Main Stack Navigation Parameter List
 * Defines all routes and their parameters for the ColoredSheep app
 */
export type MainStackParamList = {
  // Legacy screens
  Welcome: undefined

  // ColoredSheep screens
  Home: undefined
  CreatePost: undefined

  // Court Rental screens
  CourtList: undefined
  CourtDetail: { rentalId: string }
}

/**
 * Helper for automatically generating navigation prop types for each route.
 *
 * More info: https://reactnavigation.org/docs/typescript/#organizing-types
 */
export type MainStackScreenProps<T extends keyof MainStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<MainStackParamList, T>,
  AppStackScreenProps<keyof AppStackParamList>
>

const Stack = createNativeStackNavigator<MainStackParamList>()

/**
 * This is the main navigator for the ColoredSheep community app.
 * Uses native stack navigator for better performance and native feel.
 *
 * Screen Flow:
 * - Home → PostList → PostDetail
 * - PostList → CreatePost (modal)
 *
 * More info: https://reactnavigation.org/docs/native-stack-navigator/
 * @returns {JSX.Element} The rendered `MainNavigator`.
 */
export function MainNavigator() {
  const {
    theme: { colors },
  } = useAppTheme()

  // ColoredSheep brand colors from design spec
  const YELLOW_PRIMARY = "#F5B740"
  const TEXT_PRIMARY = "#111111"

  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: TEXT_PRIMARY,
        headerTitleStyle: {
          fontSize: 24,
          fontWeight: "700",
        },
        gestureEnabled: true,
        animation: "slide_from_right",
      }}
    >
      {/* Legacy Welcome Screen - can be removed once Home is ready */}
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{
          headerShown: false,
        }}
      />

      {/* ColoredSheep Screens */}

      {/* Home Screen - Initial landing page */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "🐑 양도합니다",
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      {/* Create Post Screen - Modal presentation (reserved for future use) */}
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{
          title: "✍️ 글 쓰기",
          presentation: "fullScreenModal",
          headerShown: true,
          headerStyle: {
            backgroundColor: YELLOW_PRIMARY,
          },
          headerTitleStyle: {
            fontSize: 24,
            fontWeight: "700",
            color: TEXT_PRIMARY,
          },
          gestureEnabled: true,
          gestureDirection: "vertical",
          animation: "slide_from_bottom",
        }}
      />

      {/* Court Rental Screens */}

      {/* Court List Screen - Main court rental feed */}
      <Stack.Screen
        name="CourtList"
        component={CourtListScreen}
        options={{
          title: "🏀 농구장 대관 정보",
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: "horizontal",
        }}
      />

      {/* Court Detail Screen - Individual court rental view */}
      <Stack.Screen
        name="CourtDetail"
        component={CourtDetailScreen}
        options={{
          title: "대관 정보",
          headerShown: false,
          presentation: "card",
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  )
}

// Home button touchable area - 44x44 minimum per Apple HIG
const $homeButton: ViewStyle = {
  width: 44,
  height: 44,
  justifyContent: "center",
  alignItems: "center",
  marginLeft: 8,
}
