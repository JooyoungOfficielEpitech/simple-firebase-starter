import { type FC, useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Button } from "../components/Button";
import { NotificationPermissionPrompt } from "../components/NotificationPermissionPrompt";
import { Screen } from "../components/Screen";
import { Text } from "../components/Text";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import type { AppStackParamList } from "../navigators/AppNavigator";
import type { MainTabScreenProps } from "../navigators/MainNavigator";
import { useAppTheme } from "../theme/context";
import { type ThemedStyle } from "../theme/types";

type AppNavigation = NativeStackNavigationProp<AppStackParamList>;

interface SettingsScreenProps extends MainTabScreenProps<"Settings"> {}

export const SettingsScreen: FC<SettingsScreenProps> =
  function SettingsScreen() {
    const navigation = useNavigation<AppNavigation>();
    const { themed, theme } = useAppTheme();
    const { logout } = useAuth();
    const {
      permissionStatus,
      isPermissionLoading,
      requestPermissions,
      notificationError,
      clearNotificationError,
    } = useNotification();

    const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

    const handleLogout = async () => {
      try {
        await logout();
      } catch (error) {
        console.warn("Logout failed:", error);
      }
    };

    /**
     * Handle notification permission request
     */
    const handleRequestPermission = useCallback(async () => {
      setShowPermissionPrompt(false);
      try {
        await requestPermissions();
      } catch (error) {
        console.warn("Permission request failed:", error);
      }
    }, [requestPermissions]);

    /**
     * Show permission prompt when user wants to enable notifications
     */
    const handleEnableNotifications = useCallback(() => {
      clearNotificationError();
      setShowPermissionPrompt(true);
    }, [clearNotificationError]);

    /**
     * Dismiss permission prompt
     */
    const handleDismissPrompt = useCallback(() => {
      setShowPermissionPrompt(false);
    }, []);

    /**
     * Get human-readable permission status text
     */
    const getPermissionStatusText = (): string => {
      switch (permissionStatus) {
        case "granted":
          return "허용됨";
        case "denied":
          return "거부됨";
        case "undetermined":
          return "미설정";
        default:
          return "알 수 없음";
      }
    };

    /**
     * Get permission status color
     */
    const getPermissionStatusColor = (): string => {
      switch (permissionStatus) {
        case "granted":
          return theme.colors.palette.primary500;
        case "denied":
          return theme.colors.error;
        default:
          return theme.colors.textDim;
      }
    };

    return (
      <Screen
        preset="scroll"
        contentContainerStyle={themed($screenContent)}
        safeAreaEdges={["top"]}
      >
        {/* Header */}
        <View style={themed($header)}>
          <Text style={themed($title)} preset="heading">
            설정
          </Text>
        </View>

        {/* Notification Settings Section */}
        <View style={themed($section)}>
          <Text style={themed($sectionTitle)}>알림 설정</Text>

          {/* Permission Status Row */}
          <View style={themed($settingRow)}>
            <View style={themed($settingInfo)}>
              <Text style={themed($settingLabel)}>푸시 알림</Text>
              {isPermissionLoading ? (
                <ActivityIndicator size="small" color={theme.colors.textDim} />
              ) : (
                <Text
                  style={[
                    themed($settingValue),
                    { color: getPermissionStatusColor() },
                  ]}
                >
                  {getPermissionStatusText()}
                </Text>
              )}
            </View>

            {/* Show enable button only when permission is not granted */}
            {permissionStatus !== "granted" && !isPermissionLoading && (
              <Pressable
                style={({ pressed }) => [
                  themed($permissionButton),
                  pressed && themed($permissionButtonPressed),
                ]}
                onPress={handleEnableNotifications}
                accessibilityRole="button"
                accessibilityLabel="알림 권한 요청하기"
              >
                <Text style={themed($permissionButtonText)}>
                  {permissionStatus === "denied"
                    ? "설정에서 변경"
                    : "알림 허용"}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Error Message */}
          {notificationError && (
            <View style={themed($errorContainer)}>
              <Text style={themed($errorText)}>{notificationError}</Text>
            </View>
          )}

          {/* Permission Denied Helper Text */}
          {permissionStatus === "denied" && (
            <Text style={themed($helperText)}>
              알림 권한이 거부되었습니다. 기기 설정에서 알림 권한을
              변경해주세요.
            </Text>
          )}
        </View>

        {/* Premium Section */}
        <View style={themed($section)}>
          <Text style={themed($sectionTitle)}>프리미엄</Text>

          <Pressable
            style={({ pressed }) => [
              themed($menuItem),
              pressed && themed($menuItemPressed),
            ]}
            onPress={() => navigation.navigate("Subscription")}
            accessibilityRole="button"
            accessibilityLabel="프리미엄 구독"
          >
            <View style={themed($menuItemContent)}>
              <Text style={themed($menuItemText)}>프리미엄 구독</Text>
              <Text style={themed($menuItemDescription)}>
                무제한 매칭 및 프리미엄 기능
              </Text>
            </View>
            <Text style={themed($menuItemArrow)}>›</Text>
          </Pressable>
        </View>

        {/* Demo Section */}
        <View style={themed($section)}>
          <Text style={themed($sectionTitle)}>개발자 도구</Text>

          <Pressable
            style={({ pressed }) => [
              themed($menuItem),
              pressed && themed($menuItemPressed),
            ]}
            onPress={() => navigation.navigate("ImageUploadDemo")}
            accessibilityRole="button"
            accessibilityLabel="이미지 업로드 데모"
          >
            <View style={themed($menuItemContent)}>
              <Text style={themed($menuItemText)}>이미지 업로드 데모</Text>
              <Text style={themed($menuItemDescription)}>
                이미지 선택 및 업로드 테스트
              </Text>
            </View>
            <Text style={themed($menuItemArrow)}>›</Text>
          </Pressable>

          <View style={themed($menuDivider)} />

          <Pressable
            style={({ pressed }) => [
              themed($menuItem),
              pressed && themed($menuItemPressed),
            ]}
            onPress={() => navigation.navigate("PaymentDemo")}
            accessibilityRole="button"
            accessibilityLabel="결제 데모"
          >
            <View style={themed($menuItemContent)}>
              <Text style={themed($menuItemText)}>결제 데모</Text>
              <Text style={themed($menuItemDescription)}>
                결제 UI 컴포넌트 테스트
              </Text>
            </View>
            <Text style={themed($menuItemArrow)}>›</Text>
          </Pressable>
        </View>

        {/* Account Section */}
        <View style={themed($section)}>
          <Text style={themed($sectionTitle)}>계정</Text>

          <Button
            text="로그아웃"
            preset="filled"
            onPress={handleLogout}
            style={themed($logoutButton)}
          />
        </View>

        {/* Permission Prompt Modal */}
        <NotificationPermissionPrompt
          visible={showPermissionPrompt}
          onAllow={handleRequestPermission}
          onDismiss={handleDismissPrompt}
        />
      </Screen>
    );
  };

const $screenContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexGrow: 1,
  paddingBottom: spacing.xl,
});

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
});

const $title: ThemedStyle<TextStyle> = () => ({
  fontSize: 28,
});

const $section: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.md,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  backgroundColor: colors.palette.neutral100,
  borderTopWidth: 1,
  borderBottomWidth: 1,
  borderColor: colors.separator,
});

const $sectionTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 13,
  fontWeight: "600",
  color: colors.textDim,
  textTransform: "uppercase",
  marginBottom: spacing.md,
  letterSpacing: 0.5,
});

const $settingRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: spacing.xs,
});

const $settingInfo: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

const $settingLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  color: colors.text,
  marginBottom: 2,
});

const $settingValue: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.textDim,
});

const $permissionButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.primary500,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
  borderRadius: 8,
});

const $permissionButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.primary600,
});

const $permissionButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.palette.neutral100,
});

const $errorContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.errorBackground,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 6,
  marginTop: spacing.sm,
});

const $errorText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.error,
});

const $helperText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 14,
  color: colors.textDim,
  marginTop: spacing.sm,
  lineHeight: 20,
});

const $logoutButton: ThemedStyle<ViewStyle> = () => ({
  marginTop: 8,
});

const $menuItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: spacing.md,
  minHeight: 56,
  marginHorizontal: -spacing.xs,
  paddingHorizontal: spacing.xs,
  borderRadius: 8,
});

const $menuItemPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  opacity: 0.8,
  backgroundColor: colors.palette.neutral300,
});

const $menuItemContent: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

const $menuItemText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  color: colors.text,
  marginBottom: 2,
});

const $menuItemDescription: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  color: colors.textDim,
});

const $menuItemArrow: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 20,
  color: colors.textDim,
  marginLeft: 8,
});

const $menuDivider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 1,
  backgroundColor: colors.separator,
});
