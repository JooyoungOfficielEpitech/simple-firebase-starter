/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, signin, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import { ComponentProps, useMemo } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"

import { ErrorBoundary } from "react-error-boundary"
import Config from "@/core/config"
import { useAuth } from "@/core/context/AppContextProvider"
import { ProfileScreen } from "@/screens/ProfileScreen"
import { EditProfileScreen } from "@/screens/EditProfileScreen"
import { NotificationCenterScreen } from "@/screens/NotificationCenterScreen"
import { PostDetailScreen } from "@/screens/PostDetailScreen"
import { ApplicationManagementScreen } from "@/screens/ApplicationManagementScreen"
import { CreateOrganizationScreen } from "@/screens/CreateOrganizationScreen"
import { MusicPlayerScreen } from "@/screens/MusicPlayerScreen"
import { LoginScreen } from "@/screens/LoginScreen"
import { ThemeCurtain } from "@/components"

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
        navigationBarColor: '#f9fafb',
        contentStyle: {
          backgroundColor: '#f9fafb',
        },
      }}
      initialRouteName={initialRouteName}
    >
      {!isAuthenticated ? (
        // 미인증 사용자 화면들
        <>
          <Stack.Screen name="SignIn" component={LoginScreen} />
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
          <Stack.Screen
            name="MusicPlayer"
            component={MusicPlayerScreen}
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
  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  return (
    <NavigationContainer ref={navigationRef} {...props}>
      <ErrorBoundary fallback={<></>}>
        <AppStack />
        <ThemeCurtain />
      </ErrorBoundary>
    </NavigationContainer>
  )
}

