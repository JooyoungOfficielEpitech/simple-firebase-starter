import { ExpoConfig, ConfigContext } from "@expo/config";

/**
 * Use ts-node here so we can use TypeScript for our Config Plugins
 * and not have to compile them to JavaScript
 */
require("ts-node/register");

/**
 * @param config ExpoConfig coming from the static config app.json if it exists
 *
 * You can read more about Expo's Configuration Resolution Rules here:
 * https://docs.expo.dev/workflow/configuration/#configuration-resolution-rules
 */
module.exports = ({ config }: ConfigContext): Partial<ExpoConfig> => {
  const existingPlugins = config.plugins ?? [];

  return {
    ...config,
    scheme: "com.mmecoco.starter",
    ios: {
      ...config.ios,
      bundleIdentifier: "com.mmecoco.starter",
      googleServicesFile: "./GoogleService-Info.plist",
      // This privacyManifests is to get you started.
      // See Expo's guide on apple privacy manifests here:
      // https://docs.expo.dev/guides/apple-privacy/
      // You may need to add more privacy manifests depending on your app's usage of APIs.
      // More details and a list of "required reason" APIs can be found in the Apple Developer Documentation.
      // https://developer.apple.com/documentation/bundleresources/privacy-manifest-files
      privacyManifests: {
        NSPrivacyAccessedAPITypes: [
          {
            NSPrivacyAccessedAPIType:
              "NSPrivacyAccessedAPICategoryUserDefaults",
            NSPrivacyAccessedAPITypeReasons: ["CA92.1"], // CA92.1 = "Access info from same app, per documentation"
          },
        ],
      },
      infoPlist: {
        UIBackgroundModes: ["remote-notification"],
        NSCameraUsageDescription:
          "프로필 사진 촬영을 위해 카메라 접근 권한이 필요합니다.",
        NSPhotoLibraryUsageDescription:
          "프로필 사진 선택을 위해 사진 라이브러리 접근 권한이 필요합니다.",
      },
    },
    android: {
      ...config.android,
      package: "com.mmecoco.starter",
      googleServicesFile: "./google-services.json",
    },
    plugins: [
      ...existingPlugins,
      ["@react-native-firebase/app"],
      [
        "@react-native-firebase/messaging",
        {
          // iOS APNs settings will be configured in Apple Developer Portal
          // Android FCM settings are configured via google-services.json
        },
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/images/notification-icon.png",
          color: "#ffffff",
          sounds: ["./assets/sounds/notification.wav"],
          mode: "production",
        },
      ],
      [
        "expo-build-properties",
        {
          ios: {
            useModularHeaders: true,
            useFrameworks: "static",
          },
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission:
            "프로필 사진 선택을 위해 사진 라이브러리 접근 권한이 필요합니다.",
          cameraPermission:
            "프로필 사진 촬영을 위해 카메라 접근 권한이 필요합니다.",
        },
      ],
    ],
  };
};
