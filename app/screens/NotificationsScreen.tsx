import { type FC, useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  type TextStyle,
  View,
  type ViewStyle,
  type ListRenderItem,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { NotificationCard } from "@/components/NotificationCard";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { translate } from "@/i18n";
import type { AppStackParamList } from "@/navigators/AppNavigator";
import type { MainTabParamList } from "@/navigators/MainNavigator";
import {
  notificationService,
  type StoredNotification,
} from "@/services/notifications";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";

type NotificationsNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<AppStackParamList>
>;

/**
 * Notifications screen that displays a list of notifications.
 * Features:
 * - Real-time notification updates from Firestore
 * - FlatList for efficient rendering
 * - Pull to refresh functionality
 * - Empty state when no notifications
 * - Read/unread notification styling
 * - Mark as read on tap
 */
export const NotificationsScreen: FC = function NotificationsScreen() {
  const { themed, theme } = useAppTheme();
  const navigation = useNavigation<NotificationsNavigationProp>();
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Subscribe to notifications from Firestore
   */
  useEffect(() => {
    setIsLoading(true);

    const unsubscribe = notificationService.subscribeToNotifications(
      (notificationList) => {
        setNotifications(notificationList);
        setIsLoading(false);
      },
      50,
    );

    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * Handle pull to refresh
   */
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const freshNotifications =
        await notificationService.getNotifications(50);
      setNotifications(freshNotifications);
    } catch (error) {
      console.error("Failed to refresh notifications:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  /**
   * Handle notification card press
   * Marks the notification as read and navigates to relevant screen
   */
  const handleNotificationPress = useCallback(
    async (notification: StoredNotification) => {
      // Mark as read if not already
      if (!notification.isRead) {
        try {
          await notificationService.markNotificationAsRead(notification.id);
          // Update local state optimistically
          setNotifications((prev) =>
            prev.map((item) =>
              item.id === notification.id ? { ...item, isRead: true } : item,
            ),
          );
        } catch (error) {
          console.error("알림 읽음 처리 실패:", error);
        }
      }

      // Handle deep linking based on notification type and data
      if (notification.data) {
        const { type } = notification;
        const data = notification.data as Record<string, string>;

        switch (type) {
          case "message":
            // Navigate to chat room
            if (data.chatId && data.partnerId) {
              navigation.navigate("Chat", {
                screen: "ChatRoom",
                params: {
                  chatId: data.chatId,
                  partnerId: data.partnerId,
                  partnerName: data.partnerName || translate("chatScreen.unknown"),
                  partnerAvatar: data.partnerAvatar,
                },
              });
            }
            break;

          case "match":
            // Navigate to home/matching screen
            navigation.navigate("Home");
            break;

          case "like":
            // Navigate to home to see who liked
            navigation.navigate("Home");
            break;

          case "system":
            // Navigate to settings for system notifications
            navigation.navigate("Settings");
            break;

          default:
            // For other types, just log the data
            console.log("알림 데이터:", notification.data);
            break;
        }
      }
    },
    [navigation],
  );

  /**
   * Render individual notification item
   */
  const renderNotificationItem: ListRenderItem<StoredNotification> =
    useCallback(
      ({ item }) => (
        <NotificationCard
          title={item.title}
          body={item.body}
          timestamp={item.createdAt}
          isRead={item.isRead}
          onPress={() => handleNotificationPress(item)}
        />
      ),
      [handleNotificationPress],
    );

  /**
   * Extract unique key for FlatList
   */
  const keyExtractor = useCallback(
    (item: StoredNotification) => item.id,
    [],
  );

  /**
   * Render empty state when no notifications
   */
  const renderEmptyState = useCallback(
    () => (
      <View style={themed($emptyContainer)}>
        <Text style={themed($emptyIcon)}>{"🔔"}</Text>
        <Text style={themed($emptyTitle)}>
          {translate("notifications.emptyTitle")}
        </Text>
        <Text style={themed($emptyDescription)}>
          {translate("notifications.emptyDescription")}
        </Text>
      </View>
    ),
    [themed],
  );

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <Screen
        preset="fixed"
        contentContainerStyle={$styles.flex1}
        safeAreaEdges={["top"]}
      >
        <View style={themed($header)}>
          <Text style={themed($headerTitle)} preset="heading">
            {translate("notifications.title")}
          </Text>
        </View>
        <View style={themed($loadingContainer)}>
          <ActivityIndicator size="large" color={theme.colors.tint} />
        </View>
      </Screen>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Screen
      preset="fixed"
      contentContainerStyle={$styles.flex1}
      safeAreaEdges={["top"]}
    >
      {/* Header */}
      <View style={themed($header)}>
        <Text style={themed($headerTitle)} preset="heading">
          {translate("notifications.title")}
        </Text>
        {notifications.length > 0 && unreadCount > 0 && (
          <Text style={themed($notificationCount)}>
            {`${unreadCount} unread`}
          </Text>
        )}
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={themed($listContent)}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.tint}
            colors={[theme.colors.tint]}
          />
        }
        showsVerticalScrollIndicator={false}
        accessibilityRole="list"
        accessibilityLabel={translate("notifications.title")}
      />
    </Screen>
  );
};

const $header: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
  backgroundColor: colors.background,
});

const $headerTitle: ThemedStyle<TextStyle> = () => ({
  fontSize: 28,
  marginBottom: 4,
});

const $notificationCount: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.textDim,
});

const $listContent: ThemedStyle<ViewStyle> = () => ({
  flexGrow: 1,
});

const $loadingContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
});

const $emptyContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: spacing.xl,
  paddingVertical: spacing.xxxl,
});

const $emptyIcon: ThemedStyle<TextStyle> = ({ spacing }) => ({
  fontSize: 64,
  marginBottom: spacing.md,
});

const $emptyTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 20,
  fontWeight: "600",
  color: colors.text,
  marginBottom: spacing.xs,
  textAlign: "center",
});

const $emptyDescription: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  color: colors.textDim,
  textAlign: "center",
  lineHeight: 24,
});
