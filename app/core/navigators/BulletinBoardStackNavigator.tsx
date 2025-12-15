import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"
import { CompositeScreenProps } from "@react-navigation/native"

import { BulletinBoardScreen } from "@/screens/BulletinBoardScreen"
import { CreatePostScreen } from "@/screens/CreatePostScreen"

import type { MainTabParamList, BulletinBoardStackParamList } from "./types"
import type { MainTabScreenProps } from "./MainNavigator"

// Re-export BulletinBoardStackParamList from types for use in screens
export type { BulletinBoardStackParamList } from "./types"


/**
 * Helper for automatically generating navigation prop types for each route.
 */
export type BulletinBoardStackScreenProps<T extends keyof BulletinBoardStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<BulletinBoardStackParamList, T>,
  MainTabScreenProps<keyof MainTabParamList>
>

const Stack = createNativeStackNavigator<BulletinBoardStackParamList>()

/**
 * 게시판 탭 내부의 Stack Navigator
 * BulletinBoardMain (게시글 목록) → CreatePost (게시글 작성/수정)
 * PostDetail, CreateOrganization, ApplicationManagement는 AppNavigator에서 처리
 */
export function BulletinBoardStackNavigator() {
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
        name="BulletinBoardMain"
        component={BulletinBoardScreen}
        options={{
          headerShown: false, // 게시판 메인 화면은 헤더 숨김
        }}
      />
      
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{
          headerShown: false, // 게시글 작성 화면은 커스텀 헤더 사용
        }}
      />
    </Stack.Navigator>
  )
}