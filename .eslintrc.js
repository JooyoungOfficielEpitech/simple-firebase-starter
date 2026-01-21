module.exports = {
  root: true,
  extends: ["expo", "prettier"],
  plugins: ["prettier", "react-native", "reactotron"],
  rules: {
    "prettier/prettier": "warn",
    "react-native/no-unused-styles": "warn",
    "react-native/no-inline-styles": "off",
    "react-native/no-color-literals": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-require-imports": "off",
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },
  ignorePatterns: [
    "node_modules/",
    "dist/",
    ".expo/",
    "android/",
    "ios/",
    "functions/",
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
};
