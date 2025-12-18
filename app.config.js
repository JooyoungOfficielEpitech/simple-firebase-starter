/**
 * @param {Object} context - Expo config context
 * @param {Object} context.config - ExpoConfig coming from the static config app.json if it exists
 *
 * You can read more about Expo's Configuration Resolution Rules here:
 * https://docs.expo.dev/workflow/configuration/#configuration-resolution-rules
 */
module.exports = ({ config }) => {
  const existingPlugins = config.plugins ?? []

  return {
    ...config,
    name: "Orphy",
    slug: "orphy",
    version: "1.1.0",
    icon: "./assets/icons/orphy_icon.png",
    scheme: "com.mmecoco.starter",
    ios: {
      ...config.ios,
      bundleIdentifier: "com.mmecoco.starter",
      buildNumber: "1",
      googleServicesFile: "./GoogleService-Info.plist",
      // Background audio playback support
      infoPlist: {
        UIBackgroundModes: ["audio"],
      },
      // This privacyManifests is to get you started.
      // See Expo's guide on apple privacy manifests here:
      // https://docs.expo.dev/guides/apple-privacy/
      // You may need to add more privacy manifests depending on your app's usage of APIs.
      // More details and a list of "required reason" APIs can be found in the Apple Developer Documentation.
      // https://developer.apple.com/documentation/bundleresources/privacy-manifest-files
      privacyManifests: {
        NSPrivacyAccessedAPITypes: [
          {
            NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryUserDefaults",
            NSPrivacyAccessedAPITypeReasons: ["CA92.1"], // CA92.1 = "Access info from same app, per documentation"
          },
        ],
      },
    },
    android: {
      ...config.android,
      package: "com.mmecoco.starter",
      versionCode: 2,
      googleServicesFile: "./google-services.json",
    },
    plugins: [
      ...existingPlugins,
      ["@react-native-firebase/app"],
      [
        "expo-build-properties",
        {
          ios: {
            useModularHeaders: true,
            useFrameworks: "static",
          },
        },
      ],
      "./plugins/withPitchShifter.js",
    ],
  }
}
