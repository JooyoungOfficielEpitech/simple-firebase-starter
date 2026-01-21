/**
 * Features List Screen
 * 모든 기능 데모를 보여주는 화면
 */

import { FC, useCallback } from "react";
import { Pressable, ScrollView, TextStyle, View, ViewStyle } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Icon, IconTypes } from "@/components/Icon";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

import type { AppStackParamList } from "@/navigators/AppNavigator";

// ==========================================
// Types
// ==========================================

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

interface FeatureItem {
  id: string;
  name: string;
  description: string;
  icon: IconTypes;
  screen?: keyof AppStackParamList;
  tags: string[];
  status: "ready" | "coming_soon" | "beta";
}

// ==========================================
// Feature Data
// ==========================================

const FEATURES: FeatureItem[] = [
  {
    id: "auth",
    name: "Authentication",
    description: "Firebase 인증 시스템 - 이메일, Google 로그인",
    icon: "lock",
    screen: "AuthShowcase",
    tags: ["Firebase", "Auth"],
    status: "ready",
  },
  {
    id: "notifications",
    name: "Push Notifications",
    description: "FCM 푸시 알림 시스템",
    icon: "bell",
    screen: "NotificationShowcase",
    tags: ["Firebase", "FCM"],
    status: "ready",
  },
  {
    id: "image-upload",
    name: "Image Upload",
    description: "Firebase Storage 이미지 업로드",
    icon: "menu",
    screen: "ImageUploadDemo",
    tags: ["Firebase", "Storage"],
    status: "ready",
  },
  {
    id: "offline",
    name: "Offline Support",
    description: "오프라인 지원 및 데이터 동기화",
    icon: "menu",
    screen: "OfflineShowcase",
    tags: ["Firestore", "MMKV"],
    status: "ready",
  },
  {
    id: "chat",
    name: "Chat System",
    description: "실시간 채팅 시스템",
    icon: "bell",
    screen: "ChatShowcase",
    tags: ["Firestore", "Realtime"],
    status: "ready",
  },
  {
    id: "payment",
    name: "Payment Demo",
    description: "결제 시스템 데모 (Stripe + IAP)",
    icon: "check",
    screen: "PaymentDemo",
    tags: ["IAP", "Stripe"],
    status: "ready",
  },
  {
    id: "subscription",
    name: "Subscription",
    description: "구독 관리 시스템",
    icon: "heart",
    screen: "Subscription",
    tags: ["IAP", "Premium"],
    status: "ready",
  },
  {
    id: "theming",
    name: "Theming",
    description: "다크 모드 및 테마 시스템",
    icon: "settings",
    screen: "ThemeShowcase",
    tags: ["Theme", "Dark Mode"],
    status: "ready",
  },
  {
    id: "i18n",
    name: "Internationalization",
    description: "8개 언어 다국어 지원",
    icon: "menu",
    screen: "I18nShowcase",
    tags: ["i18n", "8 Languages"],
    status: "ready",
  },
  {
    id: "profile",
    name: "Profile Edit",
    description: "프로필 편집 및 이미지 업로드",
    icon: "user",
    tags: ["Profile", "Storage"],
    status: "ready",
  },
  {
    id: "error-handling",
    name: "Error Handling",
    description: "에러 바운더리 및 크래시 리포팅",
    icon: "x",
    screen: "ErrorHandlingShowcase",
    tags: ["Error", "Logging"],
    status: "ready",
  },
  {
    id: "network",
    name: "Network Status",
    description: "네트워크 상태 모니터링",
    icon: "menu",
    screen: "NetworkShowcase",
    tags: ["NetInfo", "Offline"],
    status: "ready",
  },
];

// ==========================================
// Component
// ==========================================

export const FeaturesListScreen: FC = function FeaturesListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {
    themed,
    theme: { colors },
  } = useAppTheme();

  const handlePress = useCallback(
    (item: FeatureItem) => {
      if (item.screen) {
        navigation.navigate(item.screen as keyof AppStackParamList);
      } else {
        console.log("Feature pressed:", item.name);
      }
    },
    [navigation],
  );

  const getStatusColor = useCallback(
    (status: FeatureItem["status"]) => {
      switch (status) {
        case "ready":
          return colors.palette.secondary500;
        case "beta":
          return colors.palette.accent500;
        case "coming_soon":
          return colors.textDim;
        default:
          return colors.textDim;
      }
    },
    [colors],
  );

  const getStatusText = useCallback((status: FeatureItem["status"]) => {
    switch (status) {
      case "ready":
        return "Ready";
      case "beta":
        return "Beta";
      case "coming_soon":
        return "Coming Soon";
      default:
        return "";
    }
  }, []);

  const renderFeatureCard = useCallback(
    (item: FeatureItem) => (
      <Pressable
        key={item.id}
        style={({ pressed }) => [
          themed($featureCard),
          pressed && { opacity: 0.7 },
          item.status === "coming_soon" && { opacity: 0.5 },
        ]}
        onPress={() => handlePress(item)}
        disabled={item.status === "coming_soon"}
      >
        {/* Header */}
        <View style={themed($cardHeader)}>
          <View style={themed($iconWrapper)}>
            <Icon icon={item.icon} size={28} color={colors.tint} />
          </View>
          <View
            style={[
              themed($statusBadge),
              { backgroundColor: getStatusColor(item.status) + "20" },
            ]}
          >
            <Text
              style={[themed($statusText), { color: getStatusColor(item.status) }]}
            >
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        {/* Content */}
        <Text preset="subheading" style={themed($featureName)}>
          {item.name}
        </Text>
        <Text preset="formHelper" style={themed($featureDescription)}>
          {item.description}
        </Text>

        {/* Tags */}
        <View style={themed($tagContainer)}>
          {item.tags.map((tag) => (
            <View key={tag} style={themed($tag)}>
              <Text style={themed($tagText)}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Arrow */}
        {item.screen && (
          <View style={themed($arrowContainer)}>
            <Icon icon="caretRight" size={16} color={colors.textDim} />
          </View>
        )}
      </Pressable>
    ),
    [themed, colors, handlePress, getStatusColor, getStatusText],
  );

  const readyFeatures = FEATURES.filter((f) => f.status === "ready");
  const otherFeatures = FEATURES.filter((f) => f.status !== "ready");

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]}>
      <ScrollView
        contentContainerStyle={themed($scrollContent)}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={themed($header)}>
          <Text preset="heading" style={themed($title)}>
            Features
          </Text>
          <Text preset="default" style={themed($subtitle)}>
            {readyFeatures.length}개의 준비된 기능 데모
          </Text>
        </View>

        {/* Stats */}
        <View style={themed($statsContainer)}>
          <View style={themed($statItem)}>
            <Text preset="heading" style={themed($statNumber)}>
              {readyFeatures.length}
            </Text>
            <Text preset="formHelper" style={themed($statLabel)}>
              Ready
            </Text>
          </View>
          <View style={themed($statDivider)} />
          <View style={themed($statItem)}>
            <Text preset="heading" style={themed($statNumber)}>
              8
            </Text>
            <Text preset="formHelper" style={themed($statLabel)}>
              Languages
            </Text>
          </View>
          <View style={themed($statDivider)} />
          <View style={themed($statItem)}>
            <Text preset="heading" style={themed($statNumber)}>
              30+
            </Text>
            <Text preset="formHelper" style={themed($statLabel)}>
              Components
            </Text>
          </View>
        </View>

        {/* Feature Grid */}
        <View style={themed($featureGrid)}>
          {readyFeatures.map(renderFeatureCard)}
          {otherFeatures.map(renderFeatureCard)}
        </View>
      </ScrollView>
    </Screen>
  );
};

// ==========================================
// Styles
// ==========================================

const $scrollContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.xl,
});

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
});

const $title: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
});

const $subtitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginTop: spacing.xs,
});

const $statsContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  marginHorizontal: spacing.lg,
  marginVertical: spacing.md,
  paddingVertical: spacing.md,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 16,
});

const $statItem: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
  flex: 1,
});

const $statNumber: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
});

const $statLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
});

const $statDivider: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 1,
  height: 30,
  backgroundColor: colors.separator,
});

const $featureGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
});

const $featureCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 16,
  padding: spacing.md,
  marginBottom: spacing.md,
});

const $cardHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: spacing.sm,
});

const $iconWrapper: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: 48,
  height: 48,
  borderRadius: 12,
  backgroundColor: colors.palette.neutral100,
  justifyContent: "center",
  alignItems: "center",
});

const $statusBadge: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxs,
  borderRadius: 8,
});

const $statusText: ThemedStyle<TextStyle> = () => ({
  fontSize: 12,
  fontWeight: "600",
});

const $featureName: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
});

const $featureDescription: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginTop: spacing.xxs,
});

const $tagContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: spacing.sm,
  gap: spacing.xs,
});

const $tag: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxs,
  backgroundColor: colors.palette.neutral300,
  borderRadius: 6,
});

const $tagText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 11,
  color: colors.textDim,
});

const $arrowContainer: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  right: 16,
  top: "50%",
});
