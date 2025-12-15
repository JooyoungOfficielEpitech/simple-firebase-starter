/* eslint-disable import/first */
/**
 * Welcome to the main entry point of the app. In this file, we'll
 * be kicking off our app.
 *
 * Most of this file is boilerplate and you shouldn't need to modify
 * it very often. But take some time to look through and understand
 * what is going on here.
 *
 * The app navigation resides in ./app/navigators, so head over there
 * if you're interested in adding screens and navigators.
 */
// Reactotron disabled for now
// if (__DEV__) {
//   require("./core/devtools/ReactotronConfig.ts")
// }

// Gesture handler - optional, can be enabled later
// import "./core/utils/gestureHandler"

import { useEffect, useState } from "react"
import * as Linking from "expo-linking"
import * as SplashScreen from "expo-splash-screen"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"

import { AppContextProvider } from "./core/context/AppContextProvider"
import { initI18n } from "./core/i18n"
import { AppNavigator } from "./core/navigators/AppNavigator"
import { useNavigationPersistence } from "./core/navigators/navigationUtilities"
import * as storage from "./core/utils/storage"

// Splash screen이 자동으로 숨겨지는 것을 방지
SplashScreen.preventAutoHideAsync()

export const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE"

// Web linking configuration
const prefix = Linking.createURL("/")
const config = {
  screens: {
    SignIn: "signin",
    SignUp: "signup",
    Welcome: "welcome",
    Demo: {
      screens: {
        DemoShowroom: {
          path: "showroom/:queryIndex?/:itemIndex?",
        },
        DemoDebug: "debug",
        DemoPodcastList: "podcast",
        DemoCommunity: "community",
      },
    },
  },
}

/**
 * This is the root component of our app.
 * @param {AppProps} props - The props for the `App` component.
 * @returns {JSX.Element} The rendered `App` component.
 */
export function App() {
  const {
    initialNavigationState,
    onNavigationStateChange,
    isRestored: isNavigationStateRestored,
  } = useNavigationPersistence(storage, NAVIGATION_PERSISTENCE_KEY)

  const [isI18nInitialized, setIsI18nInitialized] = useState(false)

  useEffect(() => {
    initI18n()
      .then(() => setIsI18nInitialized(true))
      .catch((error) => {
        console.error('❌ [App] 초기화 실패:', error)
      })
  }, [])

  // 모든 초기화가 완료되면 splash screen을 숨김
  useEffect(() => {
    if (isNavigationStateRestored && isI18nInitialized) {
      SplashScreen.hideAsync().catch(() => {
        // 에러가 발생해도 앱은 계속 실행
      })
    }
  }, [isNavigationStateRestored, isI18nInitialized])

  // Before we show the app, we have to wait for our state to be ready.
  if (!isNavigationStateRestored || !isI18nInitialized) {
    return null
  }

  const linking = {
    prefixes: [prefix],
    config,
  }

  // otherwise, we're ready to render the app
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AppContextProvider>
        <AppNavigator
          linking={linking}
          initialState={initialNavigationState}
          onStateChange={onNavigationStateChange}
        />
      </AppContextProvider>
    </SafeAreaProvider>
  )
}
