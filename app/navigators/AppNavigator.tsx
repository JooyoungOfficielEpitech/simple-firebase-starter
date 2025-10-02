/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, signin, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import { ComponentProps } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack"

import Config from "@/config"
import { useAuth } from "@/context/AuthContext"
import { ErrorBoundary } from "@/screens/ErrorScreen/ErrorBoundary"
import { ForgotPasswordScreen } from "@/screens/ForgotPasswordScreen"
import { ProfileScreen } from "@/screens/ProfileScreen"
import { SignInScreen } from "@/screens/SignInScreen"
import { SignUpScreen } from "@/screens/SignUpScreen"
import { useAppTheme } from "@/theme/context"

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

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<AppStackParamList>()

const AppStack = () => {
  const {
    theme: { colors },
  } = useAppTheme()
  const { isAuthenticated } = useAuth()

  // 초기 라우트 결정 로직
  const getInitialRouteName = (): keyof AppStackParamList => {
    if (!isAuthenticated) {
      return "SignIn"
    }

    return "Main"
  }

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
      initialRouteName={getInitialRouteName()}
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
      </ErrorBoundary>
    </NavigationContainer>
  )
}
