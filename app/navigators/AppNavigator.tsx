/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, signin, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import { ComponentProps, useMemo, FC } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"
import { View, Modal, ViewStyle, TextStyle } from "react-native"

import Config from "@/config"
import { useAuth } from "@/context/AuthContext"
import { Text } from "@/components/Text"
import { Button } from "@/components/Button"
import { ErrorBoundary } from "@/screens/ErrorScreen/ErrorBoundary"
import { ForgotPasswordScreen } from "@/screens/ForgotPasswordScreen"
import { ProfileScreen } from "@/screens/ProfileScreen"
import { EditProfileScreen } from "@/screens/EditProfileScreen"
import { NotificationCenterScreen } from "@/screens/NotificationCenterScreen"
import { PostDetailScreen } from "@/screens/PostDetailScreen"
import { ApplicationManagementScreen } from "@/screens/ApplicationManagementScreen"
import { CreateOrganizationScreen } from "@/screens/CreateOrganizationScreen"
import { SignInScreen } from "@/screens/SignInScreen"
import { SignUpScreen } from "@/screens/SignUpScreen"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { MainNavigator } from "./MainNavigator"
import { navigationRef, useBackButtonHandler } from "./navigationUtilities"

/**
 * This type allows TypeScript to know what routes are defined in this navigator
 * as well as what properties (if any) they might take when navigating to them.
 *
 * For more information, see this documentation:
 *   https://reactnavigation.org/docs/params/
 *   https://reactnavigation.org/docs/typescript#type-checking-the-navigator
 *   https://reactnavigation.org/docs/typescript/#organizing-types
 */
export type AppStackParamList = {
  Main: undefined
  Welcome: undefined
  SignIn: undefined
  SignUp: undefined
  ForgotPassword: undefined
  Profile: undefined
  EditProfile: undefined
  NotificationCenter: undefined
  PostDetail: { postId: string }
  ApplicationManagement: { postId: string; postTitle: string }
  CreateOrganization: { organizationId?: string; isEdit?: boolean; isOrganizerConversion?: boolean }
}

/**
 * This is a list of all the route names that will exit the app if the back button
 * is pressed while in that screen. Only affects Android.
 */
const exitRoutes = Config.exitRoutes

export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>

/**
 * 프로필 완성 안내 모달 컴포넌트
 */
const ProfileCompletionModal: FC = () => {
  const { themed } = useAppTheme()
  const { shouldShowProfilePrompt, dismissProfilePrompt, profileCheckLoading } = useAuth()

  const handleNavigateToProfile = () => {
    dismissProfilePrompt()
    try {
      // EditProfile 화면으로 이동
      navigationRef.navigate("EditProfile" as never)
      console.log("📱 [AppNavigator] EditProfile로 이동")
    } catch (error) {
      console.error("❌ [AppNavigator] 네비게이션 오류:", error)
    }
  }

  const handleDismiss = () => {
    dismissProfilePrompt()
    console.log("⏭️ [AppNavigator] 프로필 완성 안내 닫기")
  }

  // 프로필 체크가 진행 중이거나 완료되지 않았으면 모달 표시하지 않음
  const shouldShowModal = shouldShowProfilePrompt && !profileCheckLoading
  
  return (
    <Modal
      visible={shouldShowModal}
      animationType="fade"
      transparent={true}
      onRequestClose={handleDismiss}
    >
      <View style={themed($modalOverlay)}>
        <View style={themed($modalContainer)}>
          <Text preset="heading" style={themed($modalTitle)}>
            🎭 프로필 완성하고 시작하세요!
          </Text>
          
          <Text preset="default" style={themed($modalDescription)}>
            앱을 최대한 활용하기 위해
            {"\n"}기본 프로필을 완성해주세요
            {"\n\n"}
            ✨ 성별, 생년월일, 키 정보만 입력하면
            {"\n"}더 나은 서비스를 이용하실 수 있어요!
          </Text>
          
          <View style={themed($modalButtons)}>
            <Button
              text="프로필 완성하기"
              onPress={handleNavigateToProfile}
              style={themed($primaryButton)}
            />
            
            <Button
              text="나중에 하기"
              onPress={handleDismiss}
              preset="default"
              style={themed($secondaryButton)}
              textStyle={themed($secondaryButtonText)}
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<AppStackParamList>()

const AppStack = () => {
  const {
    theme: { colors },
  } = useAppTheme()
  const { isAuthenticated } = useAuth()

  // 초기 라우트를 useMemo로 최적화
  const initialRouteName = useMemo((): keyof AppStackParamList => {
    return isAuthenticated ? "Main" : "SignIn"
  }, [isAuthenticated])

  return (
    <Stack.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false,
        navigationBarColor: colors.background,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
      initialRouteName={initialRouteName}
    >
      {!isAuthenticated ? (
        // 미인증 사용자 화면들
        <>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      ) : (
        // 인증된 사용자
        <>
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen}
          />
          <Stack.Screen 
            name="EditProfile" 
            component={EditProfileScreen}
          />
          <Stack.Screen 
            name="NotificationCenter" 
            component={NotificationCenterScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="PostDetail" 
            component={PostDetailScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="ApplicationManagement" 
            component={ApplicationManagementScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="CreateOrganization" 
            component={CreateOrganizationScreen}
            options={{
              headerShown: false,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  )
}

export interface NavigationProps
  extends Partial<ComponentProps<typeof NavigationContainer<AppStackParamList>>> {}

export const AppNavigator = (props: NavigationProps) => {
  const { navigationTheme } = useAppTheme()

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme} {...props}>
      <ErrorBoundary catchErrors={Config.catchErrors}>
        <AppStack />
        <ProfileCompletionModal />
      </ErrorBoundary>
    </NavigationContainer>
  )
}

// 모달 스타일 정의
const $modalOverlay: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
})

const $modalContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: spacing.lg,
  padding: spacing.xl,
  maxWidth: 400,
  width: "100%",
  borderWidth: 1,
  borderColor: colors.border,
  shadowColor: colors.palette.neutral800,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
})

const $modalTitle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  textAlign: "center",
  marginBottom: spacing.md,
})

const $modalDescription: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  textAlign: "center",
  marginBottom: spacing.xl,
  lineHeight: 24,
  color: colors.textDim,
})

const $modalButtons: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
})

const $primaryButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
})

const $secondaryButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  borderWidth: 1,
  borderColor: colors.border,
})

const $secondaryButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
})
