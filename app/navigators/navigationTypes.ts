/**
 * ColoredSheep Navigation Types
 *
 * Centralized navigation type definitions for type-safe navigation throughout the app.
 * Follow React Navigation TypeScript best practices.
 *
 * @see https://reactnavigation.org/docs/typescript/
 */

import { NavigationProp, RouteProp } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"

// ============================================================================
// Main Stack Parameter List
// ============================================================================

export type MainStackParamList = {
  // Legacy screens
  Welcome: undefined

  // ColoredSheep screens
  Home: undefined
  PostList: undefined
  PostDetail: {
    id: string
  }
  CreatePost: undefined
}

// ============================================================================
// Navigation Props for Screens
// ============================================================================

/**
 * Type-safe navigation prop for any screen in MainStack
 *
 * Usage in screen:
 * ```tsx
 * type Props = {
 *   navigation: MainStackNavigation
 * }
 * ```
 */
export type MainStackNavigation = NativeStackNavigationProp<MainStackParamList>

/**
 * Navigation props for specific screens
 */
export type HomeScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, "Home">
export type PostListScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  "PostList"
>
export type PostDetailScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  "PostDetail"
>
export type CreatePostScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  "CreatePost"
>

// ============================================================================
// Route Props for Screens
// ============================================================================

/**
 * Route props for accessing screen parameters
 *
 * Usage in screen:
 * ```tsx
 * type Props = {
 *   route: PostDetailScreenRouteProp
 * }
 *
 * const { id } = route.params
 * ```
 */
export type HomeScreenRouteProp = RouteProp<MainStackParamList, "Home">
export type PostListScreenRouteProp = RouteProp<MainStackParamList, "PostList">
export type PostDetailScreenRouteProp = RouteProp<MainStackParamList, "PostDetail">
export type CreatePostScreenRouteProp = RouteProp<MainStackParamList, "CreatePost">

// ============================================================================
// Combined Props Types (for screen components)
// ============================================================================

/**
 * Complete props type including navigation and route
 *
 * Usage:
 * ```tsx
 * type Props = PostDetailScreenProps
 *
 * export const PostDetailScreen: React.FC<Props> = ({ navigation, route }) => {
 *   const { id } = route.params
 *   // ...
 * }
 * ```
 */
export type HomeScreenProps = {
  navigation: HomeScreenNavigationProp
  route: HomeScreenRouteProp
}

export type PostListScreenProps = {
  navigation: PostListScreenNavigationProp
  route: PostListScreenRouteProp
}

export type PostDetailScreenProps = {
  navigation: PostDetailScreenNavigationProp
  route: PostDetailScreenRouteProp
}

export type CreatePostScreenProps = {
  navigation: CreatePostScreenNavigationProp
  route: CreatePostScreenRouteProp
}

// ============================================================================
// Navigation Helper Types
// ============================================================================

/**
 * Generic navigation prop type for hooks
 *
 * Usage with useNavigation:
 * ```tsx
 * import { useNavigation } from '@react-navigation/native'
 *
 * const navigation = useNavigation<MainStackNavigation>()
 * navigation.navigate('PostDetail', { id: '123' })
 * ```
 */
export type UseMainNavigation = () => NavigationProp<MainStackParamList>

/**
 * Type guard for checking if we can navigate to a specific screen
 */
export const isValidRoute = (route: string): route is keyof MainStackParamList => {
  const validRoutes: (keyof MainStackParamList)[] = [
    "Welcome",
    "Home",
    "PostList",
    "PostDetail",
    "CreatePost",
  ]
  return validRoutes.includes(route as keyof MainStackParamList)
}
