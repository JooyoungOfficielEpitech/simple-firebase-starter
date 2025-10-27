/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, signin, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import { ComponentProps, useMemo } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"

import Config from "@/config"
import { useAuth } from "@/context/AppContextProvider"
import { ErrorBoundary } from "@/screens/ErrorScreen/ErrorBoundary"
import { ForgotPasswordScreen } from "@/screens/ForgotPasswordScreen"
import { ProfileScreen } from "@/screens/ProfileScreen"
import { EditProfileScreen } from "@/screens/EditProfileScreen"
import { NotificationCenterScreen } from "@/screens/NotificationCenterScreen"
import { PostDetailScreen } from "@/screens/PostDetailScreen"
import { ApplicationManagementScreen } from "@/screens/ApplicationManagementScreen"
import { CreateOrganizationScreen } from "@/screens/CreateOrganizationScreen"
import { DevSettingsScreen } from "@/screens/DevSettingsScreen"
import { PushDebugScreen } from "@/screens/PushDebugScreen"
import { MusicPlayerScreen } from "@/screens/MusicPlayerScreen"
import { DebugScreen } from "@/screens/DebugScreen"
import { SignInScreen } from "@/screens/SignInScreen"
import { SignUpScreen } from "@/screens/SignUpScreen"
import { ProfileCompletionModal } from "@/components/ProfileCompletionModal"
import { NotificationBanner } from "@/components/NotificationBanner"
import { DevFloatingButton } from "@/components"
import { useAppTheme } from "@/theme/context"

import { MainNavigator } from "./MainNavigator"
import { navigationRef, useBackButtonHandler } from "./navigationUtilities"
import type { AppStackParamList } from "./types"

// Re-export for other files that depend on it
export type { AppStackParamList } from "./types"

/**
 * This is a list of all the route names that will exit the app if the back button
 * is pressed while in that screen. Only affects Android.
 */
const exitRoutes = Config.exitRoutes

export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>


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
          {/* 개발 전용 화면들 - 개발 환경에서만 표시 */}
          {__DEV__ && (
            <>
              <Stack.Screen 
                name="DevSettings" 
                component={DevSettingsScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen 
                name="PushDebug" 
                component={PushDebugScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen 
                name="MusicPlayer" 
                component={MusicPlayerScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen 
                name="Debug" 
                component={DebugScreen}
                options={{
                  headerShown: false,
                }}
              />
            </>
          )}
        </>
      )}
    </Stack.Navigator>
  )
}

export interface NavigationProps
  extends Partial<ComponentProps<typeof NavigationContainer<AppStackParamList>>> {}

export const AppNavigator = (props: NavigationProps) => {
  const { navigationTheme } = useAppTheme()
  const { isAuthenticated } = useAuth()

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  const handleNotificationPress = (notification: any) => {
    console.log("🔔 [AppNavigator] 알림 탭됨:", notification)
    // 여기서 알림 데이터에 따라 특정 화면으로 네비게이션할 수 있습니다
    // 예: navigationRef.current?.navigate('PostDetail', { postId: notification.data?.postId })
  }

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme} {...props}>
      <ErrorBoundary catchErrors={Config.catchErrors}>
        <AppStack />
        <ProfileCompletionModal />
        {/* 로그인된 사용자에게만 푸시 알림 배너 표시 */}
        {isAuthenticated && (
          <NotificationBanner onNotificationPress={handleNotificationPress} />
        )}
        {/* 개발자 설정 플로팅 버튼 (개발 환경에서만 표시) */}
        {__DEV__ && <DevFloatingButton />}
      </ErrorBoundary>
    </NavigationContainer>
  )
}

