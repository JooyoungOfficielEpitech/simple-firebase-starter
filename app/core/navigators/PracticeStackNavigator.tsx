import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"
import { CompositeScreenProps } from "@react-navigation/native"

import { MusicPlayerScreen } from "@/screens/MusicPlayerScreen"
import { KaraokeScreen } from "@/screens/KaraokeScreen"

import type { MainTabParamList, PracticeStackParamList } from "./types"
import type { MainTabScreenProps } from "./MainNavigator"

// Re-export PracticeStackParamList from types for use in screens
export type { PracticeStackParamList } from "./types"


/**
 * Helper for automatically generating navigation prop types for each route.
 */
export type PracticeStackScreenProps<T extends keyof PracticeStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<PracticeStackParamList, T>,
  MainTabScreenProps<keyof MainTabParamList>
>

const Stack = createNativeStackNavigator<PracticeStackParamList>()

/**
 * 연습실 탭 내부의 Stack Navigator
 * PracticeMain (음악 목록) → KaraokeScreen (노래방 연습)
 */
export function PracticeStackNavigator() {
  return (
    <Stack.Navigator
      id={undefined}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f9fafb',
        },
        headerTintColor: '#111827',
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Stack.Screen
        name="PracticeMain"
        component={MusicPlayerScreen}
        options={{
          headerShown: false, // 음악 목록 화면은 헤더 숨김
        }}
      />

      <Stack.Screen
        name="KaraokeScreen"
        component={KaraokeScreen}
        options={{
          headerShown: false, // 노래방 연습 화면은 커스텀 헤더 사용
        }}
      />
    </Stack.Navigator>
  )
}
