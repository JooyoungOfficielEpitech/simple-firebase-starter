/**
 * Jest Setup File
 * 모든 테스트 전에 실행되는 설정
 */

import "@testing-library/jest-native/extend-expect"

// React Native 모킹
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper")

// AsyncStorage 모킹
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
)

// Firebase 모킹
jest.mock("@react-native-firebase/app", () => ({
  default: jest.fn(),
}))

jest.mock("@react-native-firebase/auth", () => ({
  default: jest.fn(() => ({
    currentUser: null,
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
  })),
}))

jest.mock("@react-native-firebase/firestore", () => ({
  default: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      })),
      where: jest.fn(() => ({
        get: jest.fn(),
      })),
      orderBy: jest.fn(() => ({
        limit: jest.fn(() => ({
          get: jest.fn(),
        })),
      })),
    })),
  })),
}))

// React Navigation 모킹
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}))

// Console 경고 무시 (테스트 환경)
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
}
