/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, signin, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import { ComponentProps } from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import Config from "@/config";
import { useAuth } from "@/context/AuthContext";
import { ErrorBoundary } from "@/screens/ErrorScreen/ErrorBoundary";
import { ForgotPasswordScreen } from "@/screens/ForgotPasswordScreen";
import { ImageUploadDemoScreen } from "@/screens/ImageUploadDemoScreen";
import { PaymentDemoScreen } from "@/screens/PaymentDemoScreen";
import { SignInScreen } from "@/screens/SignInScreen";
import { SignUpScreen } from "@/screens/SignUpScreen";
import { SubscriptionScreen } from "@/screens/SubscriptionScreen";
import { AuthShowcaseScreen } from "@/screens/features/AuthShowcaseScreen";
import { ChatShowcaseScreen } from "@/screens/features/ChatShowcaseScreen";
import { ErrorHandlingShowcaseScreen } from "@/screens/features/ErrorHandlingShowcaseScreen";
import { I18nShowcaseScreen } from "@/screens/features/I18nShowcaseScreen";
import { NetworkShowcaseScreen } from "@/screens/features/NetworkShowcaseScreen";
import { NotificationShowcaseScreen } from "@/screens/features/NotificationShowcaseScreen";
import { OfflineShowcaseScreen } from "@/screens/features/OfflineShowcaseScreen";
import { ThemeShowcaseScreen } from "@/screens/features/ThemeShowcaseScreen";
import { ButtonShowcaseScreen } from "@/screens/components/ButtonShowcaseScreen";
import { CardShowcaseScreen } from "@/screens/components/CardShowcaseScreen";
import { FeedbackShowcaseScreen } from "@/screens/components/FeedbackShowcaseScreen";
import { FormShowcaseScreen } from "@/screens/components/FormShowcaseScreen";
import { LayoutShowcaseScreen } from "@/screens/components/LayoutShowcaseScreen";
import { TextShowcaseScreen } from "@/screens/components/TextShowcaseScreen";
import { ToggleShowcaseScreen } from "@/screens/components/ToggleShowcaseScreen";
import { useAppTheme } from "@/theme/context";

import { MainNavigator } from "./MainNavigator";
import { navigationRef, useBackButtonHandler } from "./navigationUtilities";

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
  Main: undefined;
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  // Demo screens
  ImageUploadDemo: undefined;
  PaymentDemo: undefined;
  Subscription: undefined;
  // Showcase screens
  ThemeShowcase: undefined;
  I18nShowcase: undefined;
  AuthShowcase: undefined;
  NotificationShowcase: undefined;
  OfflineShowcase: undefined;
  ChatShowcase: undefined;
  ErrorHandlingShowcase: undefined;
  NetworkShowcase: undefined;
  // Component Showcase screens
  ButtonShowcase: undefined;
  TextShowcase: undefined;
  CardShowcase: undefined;
  ToggleShowcase: undefined;
  FormShowcase: undefined;
  LayoutShowcase: undefined;
  FeedbackShowcase: undefined;
};

/**
 * This is a list of all the route names that will exit the app if the back button
 * is pressed while in that screen. Only affects Android.
 */
const exitRoutes = Config.exitRoutes;

export type AppStackScreenProps<T extends keyof AppStackParamList> =
  NativeStackScreenProps<AppStackParamList, T>;

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<AppStackParamList>();

const AppStack = () => {
  const {
    theme: { colors },
  } = useAppTheme();
  const { isAuthenticated } = useAuth();

  // 초기 라우트 결정 로직
  const getInitialRouteName = (): keyof AppStackParamList => {
    if (!isAuthenticated) {
      return "SignIn";
    }

    return "Main";
  };

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
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
        </>
      ) : (
        // 인증된 사용자
        <>
          <Stack.Screen name="Main" component={MainNavigator} />
          {/* Demo & Feature Screens */}
          <Stack.Screen
            name="ImageUploadDemo"
            component={ImageUploadDemoScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PaymentDemo"
            component={PaymentDemoScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Subscription"
            component={SubscriptionScreen}
            options={{ headerShown: false }}
          />
          {/* Showcase Screens */}
          <Stack.Screen
            name="ThemeShowcase"
            component={ThemeShowcaseScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="I18nShowcase"
            component={I18nShowcaseScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AuthShowcase"
            component={AuthShowcaseScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="NotificationShowcase"
            component={NotificationShowcaseScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="OfflineShowcase"
            component={OfflineShowcaseScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ChatShowcase"
            component={ChatShowcaseScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ErrorHandlingShowcase"
            component={ErrorHandlingShowcaseScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="NetworkShowcase"
            component={NetworkShowcaseScreen}
            options={{ headerShown: false }}
          />
          {/* Component Showcase Screens */}
          <Stack.Screen
            name="ButtonShowcase"
            component={ButtonShowcaseScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="TextShowcase"
            component={TextShowcaseScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CardShowcase"
            component={CardShowcaseScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ToggleShowcase"
            component={ToggleShowcaseScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="FormShowcase"
            component={FormShowcaseScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="LayoutShowcase"
            component={LayoutShowcaseScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="FeedbackShowcase"
            component={FeedbackShowcaseScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export interface NavigationProps
  extends Partial<
    ComponentProps<typeof NavigationContainer<AppStackParamList>>
  > {}

export const AppNavigator = (props: NavigationProps) => {
  const { navigationTheme } = useAppTheme();

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName));

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme} {...props}>
      <ErrorBoundary catchErrors={Config.catchErrors}>
        <AppStack />
      </ErrorBoundary>
    </NavigationContainer>
  );
};
