import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"
import { CompositeScreenProps } from "@react-navigation/native"

import { BulletinBoardScreen } from "@/screens/BulletinBoardScreen"
import { CreatePostScreen } from "@/screens/CreatePostScreen"
import { PostDetailScreen } from "@/screens/PostDetailScreen"
import { useAppTheme } from "@/theme/context"

import { MainTabParamList, MainTabScreenProps } from "./MainNavigator"

export type BulletinBoardStackParamList = {
  BulletinBoardMain: undefined
  PostDetail: { postId: string }
  CreatePost: { postId?: string; isEdit?: boolean }
}

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
 * BulletinBoardMain (게시글 목록) → PostDetail (게시글 상세) → CreatePost (게시글 작성/수정)
 */
export function BulletinBoardStackNavigator() {
  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
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
        name="PostDetail"
        component={PostDetailScreen}
        options={{
          headerShown: false, // 게시글 상세 화면은 커스텀 헤더 사용
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