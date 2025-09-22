import "@testing-library/jest-native/extend-expect"
import { jest } from "@jest/globals"

// Mock React Native Firebase
jest.mock("@react-native-firebase/app", () => ({
  initializeApp: jest.fn(),
  app: jest.fn(() => ({
    delete: jest.fn(() => Promise.resolve()),
  })),
}))

jest.mock("@react-native-firebase/auth", () => ({
  __esModule: true,
  default: () => ({
    onAuthStateChanged: jest.fn(() => () => {}),
    signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: {} })),
    createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: {} })),
    signOut: jest.fn(() => Promise.resolve()),
    currentUser: null,
  }),
}))

jest.mock("@react-native-firebase/firestore", () => ({
  __esModule: true,
  default: () => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({}) })),
        set: jest.fn(() => Promise.resolve()),
        update: jest.fn(() => Promise.resolve()),
        delete: jest.fn(() => Promise.resolve()),
        onSnapshot: jest.fn(() => () => {}),
      })),
      add: jest.fn(() => Promise.resolve({ id: "test-id" })),
      where: jest.fn(() => ({
        orderBy: jest.fn(() => ({
          limit: jest.fn(() => ({
            get: jest.fn(() => Promise.resolve({ docs: [] })),
            onSnapshot: jest.fn(() => () => {}),
          })),
          get: jest.fn(() => Promise.resolve({ docs: [] })),
          onSnapshot: jest.fn(() => () => {}),
        })),
        get: jest.fn(() => Promise.resolve({ docs: [] })),
        onSnapshot: jest.fn(() => () => {}),
      })),
      orderBy: jest.fn(() => ({
        limit: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve({ docs: [] })),
          onSnapshot: jest.fn(() => () => {}),
        })),
        get: jest.fn(() => Promise.resolve({ docs: [] })),
        onSnapshot: jest.fn(() => () => {}),
      })),
      get: jest.fn(() => Promise.resolve({ docs: [] })),
      onSnapshot: jest.fn(() => () => {}),
    })),
    batch: jest.fn(() => ({
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      commit: jest.fn(() => Promise.resolve()),
    })),
    runTransaction: jest.fn((callback) => callback({
      get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({}) })),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
  }),
  FieldValue: {
    serverTimestamp: jest.fn(() => "server-timestamp"),
    increment: jest.fn((value) => ({ increment: value })),
    arrayUnion: jest.fn((...values) => ({ arrayUnion: values })),
    arrayRemove: jest.fn((...values) => ({ arrayRemove: values })),
  },
  Timestamp: {
    now: jest.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
    fromDate: jest.fn((date) => ({ seconds: date.getTime() / 1000, nanoseconds: 0 })),
  },
}))

// Mock React Navigation
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
}))

// Mock React Native MMKV
jest.mock("react-native-mmkv", () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    getNumber: jest.fn(),
    getBoolean: jest.fn(),
    contains: jest.fn(),
    delete: jest.fn(),
    getAllKeys: jest.fn(() => []),
    clearAll: jest.fn(),
  })),
}))

// Mock Expo modules
jest.mock("expo-localization", () => ({
  getLocales: jest.fn(() => [{ languageCode: "en", regionCode: "US" }]),
}))

jest.mock("expo-system-ui", () => ({
  setBackgroundColorAsync: jest.fn(),
}))

// Global test utilities
global.console = {
  ...console,
  // Uncomment to suppress specific console methods during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
}

// Mock timers for consistent testing
beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
  jest.clearAllMocks()
})