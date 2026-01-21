/**
 * Jest Test Setup
 * 테스트 환경 설정
 */

// Mock react-native-reanimated
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");

  // The mock for call immediately calls the callback which is the desired behavior
  Reanimated.default.call = () => {};

  return Reanimated;
});

// Mock react-native-gesture-handler
jest.mock("react-native-gesture-handler", () => ({
  State: {},
  PanGestureHandler: "PanGestureHandler",
  BaseButton: "BaseButton",
  Directions: {},
  GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => children,
  GestureDetector: ({ children }: { children: React.ReactNode }) => children,
  Gesture: {
    Pan: () => ({
      onStart: () => ({}),
      onUpdate: () => ({}),
      onEnd: () => ({}),
      enabled: () => ({}),
    }),
    Tap: () => ({
      onStart: () => ({}),
      onEnd: () => ({}),
    }),
  },
}));

// Mock MMKV with in-memory storage
jest.mock("react-native-mmkv", () => {
  const React = require("react");
  let storage: Record<string, string> = {};

  return {
    MMKV: jest.fn().mockImplementation(() => ({
      getString: jest.fn((key: string) => storage[key]),
      set: jest.fn((key: string, value: string) => {
        storage[key] = value;
      }),
      delete: jest.fn((key: string) => {
        delete storage[key];
      }),
      contains: jest.fn((key: string) => key in storage),
      getAllKeys: jest.fn(() => Object.keys(storage)),
      clearAll: jest.fn(() => {
        storage = {};
      }),
    })),
    useMMKVString: jest.fn((key: string) => {
      const [value, setValue] = React.useState(storage[key]);
      return [
        value,
        (newValue: string | undefined) => {
          if (newValue === undefined) {
            delete storage[key];
          } else {
            storage[key] = newValue;
          }
          setValue(newValue);
        },
      ];
    }),
  };
});

// Mock Firebase
jest.mock("@react-native-firebase/app", () => ({
  __esModule: true,
  default: () => ({
    initializeApp: jest.fn(),
  }),
}));

jest.mock("@react-native-firebase/auth", () => ({
  __esModule: true,
  default: () => ({
    currentUser: null,
    onAuthStateChanged: jest.fn(),
    signInWithCredential: jest.fn(),
    signOut: jest.fn(),
  }),
}));

jest.mock("@react-native-firebase/firestore", () => ({
  __esModule: true,
  default: () => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      })),
      add: jest.fn(),
      get: jest.fn(),
    })),
  }),
  FieldValue: {
    serverTimestamp: jest.fn(),
  },
}));

jest.mock("@react-native-firebase/messaging", () => ({
  __esModule: true,
  default: () => ({
    getToken: jest.fn(),
    onMessage: jest.fn(),
    requestPermission: jest.fn(),
  }),
}));

jest.mock("@react-native-firebase/storage", () => ({
  __esModule: true,
  default: () => ({
    ref: jest.fn(() => ({
      child: jest.fn(() => ({
        putFile: jest.fn(),
        getDownloadURL: jest.fn(),
      })),
    })),
  }),
}));

// Mock expo-notifications
jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
}));

// Mock expo-image-picker
jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  MediaTypeOptions: {
    Images: "Images",
    Videos: "Videos",
    All: "All",
  },
}));

// Mock @react-native-community/netinfo
jest.mock("@react-native-community/netinfo", () => ({
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
      type: "wifi",
    }),
  ),
  addEventListener: jest.fn(() => jest.fn()),
}));

// Silence specific warnings during tests
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === "string" &&
    (args[0].includes("Warning: ReactDOM.render") ||
      args[0].includes("Warning: An update to") ||
      args[0].includes("act(...)"))
  ) {
    return;
  }
  originalError.call(console, ...args);
};

// Global test utilities
(global as unknown as { fetch: jest.Mock }).fetch = jest.fn();
