/**
 * Notification Showcase Screen
 * FCM 푸시 알림 시스템 데모 화면
 */

import { FC, useCallback, useState } from "react";
import { Pressable, ScrollView, TextStyle, View, ViewStyle } from "react-native";

import { CodeBlock } from "@/components/CodeBlock";
import { Icon } from "@/components/Icon";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

// ==========================================
// Constants
// ==========================================

const NOTIFICATION_TYPES = [
  {
    id: "push",
    name: "Push Notifications",
    description: "Remote notifications via FCM",
    icon: "bell",
  },
  {
    id: "local",
    name: "Local Notifications",
    description: "Scheduled local alerts",
    icon: "bell",
  },
  {
    id: "data",
    name: "Data Messages",
    description: "Silent background updates",
    icon: "menu",
  },
];

// ==========================================
// Code Examples
// ==========================================

const PERMISSION_CODE = `import messaging from "@react-native-firebase/messaging";

const requestPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log("Notification permission granted");
  }
};`;

const TOKEN_CODE = `import messaging from "@react-native-firebase/messaging";

const getFCMToken = async () => {
  // Get the device token
  const token = await messaging().getToken();
  console.log("FCM Token:", token);

  // Save token to your server
  await saveTokenToServer(token);

  // Listen for token refresh
  messaging().onTokenRefresh((newToken) => {
    saveTokenToServer(newToken);
  });
};`;

const LISTENER_CODE = `import messaging from "@react-native-firebase/messaging";

// Foreground messages
messaging().onMessage(async (remoteMessage) => {
  console.log("Foreground message:", remoteMessage);
  // Show local notification or update UI
});

// Background messages
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("Background message:", remoteMessage);
  // Process data silently
});`;

const SEND_NOTIFICATION_CODE = `// Server-side: Send notification via Firebase Admin SDK
const message = {
  notification: {
    title: "New Message",
    body: "You have a new message from John",
  },
  data: {
    type: "chat",
    chatId: "123",
  },
  token: deviceToken,
};

await admin.messaging().send(message);`;

// ==========================================
// Component
// ==========================================

export const NotificationShowcaseScreen: FC = function NotificationShowcaseScreen() {
  const { themed, theme } = useAppTheme();
  const [permissionStatus, setPermissionStatus] = useState<"granted" | "denied" | "pending">("pending");

  const simulatePermissionRequest = useCallback(() => {
    // Simulate permission request
    setPermissionStatus("granted");
  }, []);

  const renderNotificationType = useCallback(
    (type: (typeof NOTIFICATION_TYPES)[0]) => (
      <View key={type.id} style={themed($typeCard)}>
        <Icon
          icon={type.icon as "bell" | "menu"}
          size={24}
          color={theme.colors.tint}
        />
        <View style={themed($typeContent)}>
          <Text style={themed($typeName)}>{type.name}</Text>
          <Text style={themed($typeDesc)}>{type.description}</Text>
        </View>
      </View>
    ),
    [themed, theme.colors.tint],
  );

  const renderFeature = useCallback(
    (title: string, description: string) => (
      <View style={themed($featureRow)} key={title}>
        <Icon
          icon="check"
          size={16}
          color={theme.colors.palette.secondary500}
        />
        <View style={themed($featureContent)}>
          <Text style={themed($featureTitle)}>{title}</Text>
          <Text style={themed($featureDesc)}>{description}</Text>
        </View>
      </View>
    ),
    [themed, theme.colors.palette.secondary500],
  );

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <ScrollView contentContainerStyle={themed($content)}>
        {/* Header */}
        <View style={themed($header)}>
          <Text preset="heading">Push Notifications</Text>
          <Text preset="default" style={themed($subtitle)}>
            Firebase Cloud Messaging (FCM) integration
          </Text>
        </View>

        {/* Permission Status */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Permission Status
          </Text>
          <View style={themed($permissionCard)}>
            <View style={themed($permissionStatus)}>
              <View
                style={[
                  themed($statusDot),
                  {
                    backgroundColor:
                      permissionStatus === "granted"
                        ? theme.colors.palette.secondary500
                        : permissionStatus === "denied"
                          ? theme.colors.palette.angry500
                          : theme.colors.palette.accent500,
                  },
                ]}
              />
              <Text style={themed($statusText)}>
                {permissionStatus === "granted"
                  ? "Notifications Enabled"
                  : permissionStatus === "denied"
                    ? "Notifications Disabled"
                    : "Permission Not Requested"}
              </Text>
            </View>
            {permissionStatus === "pending" && (
              <Pressable
                style={({ pressed }) => [
                  themed($requestButton),
                  pressed && { opacity: 0.7 },
                ]}
                onPress={simulatePermissionRequest}
              >
                <Text style={themed($requestButtonText)}>Request Permission</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Notification Types */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Notification Types
          </Text>
          <View style={themed($typesContainer)}>
            {NOTIFICATION_TYPES.map(renderNotificationType)}
          </View>
        </View>

        {/* Sample Notification Preview */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Notification Preview
          </Text>
          <View style={themed($notificationPreview)}>
            <View style={themed($notificationHeader)}>
              <View style={themed($appIcon)}>
                <Icon icon="bell" size={16} color={theme.colors.palette.neutral100} />
              </View>
              <Text style={themed($appName)}>Fast Matching</Text>
              <Text style={themed($notificationTime)}>now</Text>
            </View>
            <Text style={themed($notificationTitle)}>New Match!</Text>
            <Text style={themed($notificationBody)}>
              Someone liked your profile. Check it out!
            </Text>
          </View>
        </View>

        {/* Features */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Features
          </Text>
          <View style={themed($featuresCard)}>
            {renderFeature("Rich Notifications", "Images, actions, and custom layouts")}
            {renderFeature("Topic Subscriptions", "Subscribe to specific channels")}
            {renderFeature("Conditional Delivery", "Target specific user segments")}
            {renderFeature("Analytics Integration", "Track notification engagement")}
            {renderFeature("Silent Push", "Background data sync")}
            {renderFeature("Badge Count", "App icon badge management")}
          </View>
        </View>

        {/* Code Examples */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            Implementation
          </Text>
          <CodeBlock
            title="Request Permission"
            code={PERMISSION_CODE}
            language="tsx"
          />
          <CodeBlock
            title="Get FCM Token"
            code={TOKEN_CODE}
            language="tsx"
          />
          <CodeBlock
            title="Listen for Messages"
            code={LISTENER_CODE}
            language="tsx"
          />
          <CodeBlock
            title="Send Notification (Server)"
            code={SEND_NOTIFICATION_CODE}
            language="tsx"
          />
        </View>
      </ScrollView>
    </Screen>
  );
};

// ==========================================
// Styles
// ==========================================

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.xxl,
});

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.lg,
});

const $subtitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginTop: spacing.xs,
});

const $section: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  marginTop: spacing.lg,
});

const $sectionTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  marginBottom: spacing.md,
});

const $permissionCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
});

const $permissionStatus: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
});

const $statusDot: ThemedStyle<ViewStyle> = () => ({
  width: 12,
  height: 12,
  borderRadius: 6,
});

const $statusText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
});

const $requestButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  marginTop: spacing.md,
  backgroundColor: colors.tint,
  borderRadius: 8,
  padding: spacing.sm,
  alignItems: "center",
});

const $requestButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.palette.neutral100,
});

const $typesContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
});

const $typeCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
  gap: spacing.md,
});

const $typeContent: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

const $typeName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
});

const $typeDesc: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
});

const $notificationPreview: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
});

const $notificationHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
  marginBottom: spacing.xs,
});

const $appIcon: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 20,
  height: 20,
  borderRadius: 4,
  backgroundColor: colors.tint,
  justifyContent: "center",
  alignItems: "center",
});

const $appName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  fontWeight: "500",
  color: colors.textDim,
  flex: 1,
});

const $notificationTime: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 11,
  color: colors.textDim,
});

const $notificationTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 15,
  fontWeight: "600",
  color: colors.text,
});

const $notificationBody: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.textDim,
});

const $featuresCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
  padding: spacing.md,
  gap: spacing.sm,
});

const $featureRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  gap: spacing.sm,
});

const $featureContent: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

const $featureTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
});

const $featureDesc: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
});

export default NotificationShowcaseScreen;
