module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/app/__tests__/setupTests.ts"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
  ],
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "!app/**/*.stories.tsx",
    "!app/**/__tests__/**",
    "!app/**/index.ts",
    "!app/i18n/**",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/app/$1",
    "^@assets/(.*)$": "<rootDir>/assets/$1",
  },
  testMatch: [
    "**/__tests__/**/*.test.ts?(x)",
    "**/?(*.)+(spec|test).ts?(x)",
  ],
}
