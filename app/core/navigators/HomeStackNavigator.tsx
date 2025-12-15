import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"
import { CompositeScreenProps } from "@react-navigation/native"

import { KaraokeScreen } from "@/screens/KaraokeScreen"
import { MusicalKaraokeHomeScreen } from "@/screens/MusicalKaraokeHomeScreen"
import type { Song } from "@/core/types/song"

import type { MainTabParamList, HomeStackParamList } from "./types"
import type { MainTabScreenProps } from "./MainNavigator"


/**
 * Helper for automatically generating navigation prop types for each route.
 */
export type HomeStackScreenProps<T extends keyof HomeStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, T>,
  MainTabScreenProps<keyof MainTabParamList>
>

const Stack = createNativeStackNavigator<HomeStackParamList>()

/**
 * Home 탭 내부의 Stack Navigator
 * HomeMain (곡 목록) → KaraokeScreen (곡 재생)
 */
export function HomeStackNavigator() {
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
        name="HomeMain"
        component={MusicalKaraokeHomeScreen}
        options={{
          headerShown: false, // Home 화면은 헤더 숨김
        }}
      />
      
      <Stack.Screen
        name="KaraokeScreen"
        component={KaraokeScreen}
        options={{
          headerShown: false, // header 완전히 숨김 - ScreenHeader 컴포넌트 사용
        }}
      />
    </Stack.Navigator>
  )
}