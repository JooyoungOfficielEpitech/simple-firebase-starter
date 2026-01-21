/**
 * Home Screen
 * 보일러플레이트 소개 및 주요 기능 하이라이트를 보여주는 메인 화면
 */

import { FC, useCallback } from "react";
import {
  Image,
  ImageStyle,
  Linking,
  Pressable,
  ScrollView,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Button } from "@/components/Button";
import { Icon, IconTypes } from "@/components/Icon";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { useAuth } from "@/context/AuthContext";
import { translate } from "@/i18n/translate";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

import type { AppStackParamList } from "@/navigators/AppNavigator";

const welcomeLogo = require("@assets/images/logo.png");

// ==========================================
// Types
// ==========================================

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

interface FeatureHighlight {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: IconTypes;
  color: string;
}

interface QuickStartStep {
  step: number;
  titleKey: string;
  descriptionKey: string;
  icon: IconTypes;
}

interface StatItem {
  value: string;
  labelKey: string;
  icon: IconTypes;
}

// ==========================================
// Data
// ==========================================

const FEATURE_HIGHLIGHTS: FeatureHighlight[] = [
  {
    id: "firebase",
    titleKey: "homeScreen:features.firebase.title",
    descriptionKey: "homeScreen:features.firebase.description",
    icon: "menu",
    color: "#FFCA28",
  },
  {
    id: "auth",
    titleKey: "homeScreen:features.auth.title",
    descriptionKey: "homeScreen:features.auth.description",
    icon: "lock",
    color: "#4CAF50",
  },
  {
    id: "chat",
    titleKey: "homeScreen:features.chat.title",
    descriptionKey: "homeScreen:features.chat.description",
    icon: "bell",
    color: "#2196F3",
  },
  {
    id: "offline",
    titleKey: "homeScreen:features.offline.title",
    descriptionKey: "homeScreen:features.offline.description",
    icon: "menu",
    color: "#9C27B0",
  },
];

const QUICK_START_STEPS: QuickStartStep[] = [
  {
    step: 1,
    titleKey: "homeScreen:quickStart.step1.title",
    descriptionKey: "homeScreen:quickStart.step1.description",
    icon: "menu",
  },
  {
    step: 2,
    titleKey: "homeScreen:quickStart.step2.title",
    descriptionKey: "homeScreen:quickStart.step2.description",
    icon: "settings",
  },
  {
    step: 3,
    titleKey: "homeScreen:quickStart.step3.title",
    descriptionKey: "homeScreen:quickStart.step3.description",
    icon: "check",
  },
];

const STATS: StatItem[] = [
  { value: "30+", labelKey: "homeScreen:stats.components", icon: "ladybug" },
  { value: "12", labelKey: "homeScreen:stats.features", icon: "menu" },
  { value: "8", labelKey: "homeScreen:stats.languages", icon: "menu" },
  { value: "100%", labelKey: "homeScreen:stats.typescript", icon: "check" },
];

// ==========================================
// Component
// ==========================================

export const HomeScreen: FC = function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { themed, theme } = useAppTheme();
  const { user } = useAuth();

  const handleGitHubPress = useCallback(() => {
    Linking.openURL("https://github.com/anthropics/claude-code");
  }, []);

  const handleDocsPress = useCallback(() => {
    Linking.openURL("https://github.com/anthropics/claude-code#readme");
  }, []);

  const renderFeatureCard = useCallback(
    (item: FeatureHighlight) => (
      <View key={item.id} style={themed($featureCard)}>
        <View style={[$iconCircle, { backgroundColor: item.color + "20" }]}>
          <Icon icon={item.icon} size={24} color={item.color} />
        </View>
        <Text preset="bold" style={themed($featureTitle)}>
          {translate(item.titleKey as Parameters<typeof translate>[0])}
        </Text>
        <Text preset="formHelper" style={themed($featureDescription)}>
          {translate(item.descriptionKey as Parameters<typeof translate>[0])}
        </Text>
      </View>
    ),
    [themed],
  );

  const renderQuickStartStep = useCallback(
    (item: QuickStartStep, index: number) => (
      <View key={item.step} style={themed($quickStartStep)}>
        <View style={themed($stepNumberContainer)}>
          <Text style={themed($stepNumber)}>{item.step}</Text>
        </View>
        <View style={themed($stepContent)}>
          <Text preset="bold" style={themed($stepTitle)}>
            {translate(item.titleKey as Parameters<typeof translate>[0])}
          </Text>
          <Text preset="formHelper" style={themed($stepDescription)}>
            {translate(item.descriptionKey as Parameters<typeof translate>[0])}
          </Text>
        </View>
        {index < QUICK_START_STEPS.length - 1 && (
          <View style={themed($stepConnector)} />
        )}
      </View>
    ),
    [themed],
  );

  const renderStatItem = useCallback(
    (item: StatItem, index: number) => (
      <View key={index} style={themed($statItem)}>
        <Icon icon={item.icon} size={20} color={theme.colors.tint} />
        <Text preset="heading" style={themed($statValue)}>
          {item.value}
        </Text>
        <Text preset="formHelper" style={themed($statLabel)}>
          {translate(item.labelKey as Parameters<typeof translate>[0])}
        </Text>
      </View>
    ),
    [themed, theme.colors.tint],
  );

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]}>
      <ScrollView
        contentContainerStyle={themed($scrollContent)}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={themed($heroSection)}>
          <Image
            source={welcomeLogo}
            style={themed($logo)}
            resizeMode="contain"
          />
          <Text preset="heading" style={themed($heroTitle)}>
            {translate("homeScreen:hero.title")}
          </Text>
          <Text preset="default" style={themed($heroSubtitle)}>
            {translate("homeScreen:hero.subtitle")}
          </Text>

          {/* Welcome Message */}
          {user && (
            <View style={themed($welcomeMessage)}>
              <Icon icon="heart" size={16} color={theme.colors.tint} />
              <Text style={themed($welcomeText)}>
                {translate("homeScreen:hero.welcome", {
                  name: user.displayName || user.email?.split("@")[0] || "User",
                })}
              </Text>
            </View>
          )}
        </View>

        {/* Stats Section */}
        <View style={themed($statsSection)}>
          <View style={themed($statsGrid)}>
            {STATS.map(renderStatItem)}
          </View>
        </View>

        {/* Feature Highlights */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            {translate("homeScreen:sections.features")}
          </Text>
          <View style={themed($featureGrid)}>
            {FEATURE_HIGHLIGHTS.map(renderFeatureCard)}
          </View>
        </View>

        {/* Quick Start Guide */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            {translate("homeScreen:sections.quickStart")}
          </Text>
          <View style={themed($quickStartContainer)}>
            {QUICK_START_STEPS.map(renderQuickStartStep)}
          </View>
        </View>

        {/* Tech Stack */}
        <View style={themed($section)}>
          <Text preset="subheading" style={themed($sectionTitle)}>
            {translate("homeScreen:sections.techStack")}
          </Text>
          <View style={themed($techStackContainer)}>
            <View style={themed($techRow)}>
              <TechBadge name="React Native" color="#61DAFB" themed={themed} />
              <TechBadge name="Expo SDK 53" color="#000020" themed={themed} />
              <TechBadge name="TypeScript" color="#3178C6" themed={themed} />
            </View>
            <View style={themed($techRow)}>
              <TechBadge name="Firebase" color="#FFCA28" themed={themed} />
              <TechBadge name="Firestore" color="#FF9800" themed={themed} />
              <TechBadge name="FCM" color="#EA4335" themed={themed} />
            </View>
            <View style={themed($techRow)}>
              <TechBadge name="React Navigation" color="#6B52AE" themed={themed} />
              <TechBadge name="MMKV" color="#00D4AA" themed={themed} />
              <TechBadge name="i18n" color="#26A69A" themed={themed} />
            </View>
          </View>
        </View>

        {/* CTA Buttons */}
        <View style={themed($ctaSection)}>
          <Button
            preset="filled"
            text={translate("homeScreen:cta.viewDocs")}
            onPress={handleDocsPress}
            style={themed($ctaButton)}
          />
          <Pressable
            style={({ pressed }) => [
              themed($githubButton),
              pressed && { opacity: 0.7 },
            ]}
            onPress={handleGitHubPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon icon="menu" size={20} color={theme.colors.text} />
            <Text style={themed($githubButtonText)}>
              {translate("homeScreen:cta.viewGithub")}
            </Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={themed($footer)}>
          <Text preset="formHelper" style={themed($footerText)}>
            {translate("homeScreen:footer.madeWith")}
          </Text>
          <Text preset="formHelper" style={themed($versionText)}>
            v1.0.0
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
};

// ==========================================
// Sub-components
// ==========================================

interface TechBadgeProps {
  name: string;
  color: string;
  themed: ReturnType<typeof useAppTheme>["themed"];
}

const TechBadge: FC<TechBadgeProps> = ({ name, color, themed }) => (
  <View style={[themed($techBadge), { borderColor: color + "40" }]}>
    <View style={[$techDot, { backgroundColor: color }]} />
    <Text style={themed($techBadgeText)}>{name}</Text>
  </View>
);

// ==========================================
// Styles
// ==========================================

const $scrollContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingBottom: spacing.xxl,
});

const $heroSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.xl,
  paddingBottom: spacing.lg,
});

const $logo: ThemedStyle<ImageStyle> = () => ({
  width: 80,
  height: 80,
  marginBottom: 16,
});

const $heroTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  textAlign: "center",
});

const $heroSubtitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  textAlign: "center",
  marginTop: spacing.xs,
  lineHeight: 22,
});

const $welcomeMessage: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginTop: spacing.md,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 20,
  gap: spacing.xs,
});

const $welcomeText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 14,
});

const $statsSection: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  marginHorizontal: spacing.lg,
  marginVertical: spacing.md,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 16,
  padding: spacing.md,
});

const $statsGrid: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-around",
});

const $statItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  gap: spacing.xxs,
});

const $statValue: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 20,
});

const $statLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 11,
});

const $section: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  marginTop: spacing.lg,
});

const $sectionTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  marginBottom: spacing.md,
});

const $featureGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.sm,
});

const $featureCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: "48%",
  backgroundColor: colors.palette.neutral200,
  borderRadius: 16,
  padding: spacing.md,
  minHeight: 140,
});

const $iconCircle: ViewStyle = {
  width: 44,
  height: 44,
  borderRadius: 22,
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 12,
};

const $featureTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 14,
});

const $featureDescription: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginTop: spacing.xxs,
  fontSize: 12,
  lineHeight: 16,
});

const $quickStartContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 16,
  padding: spacing.md,
});

const $quickStartStep: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  marginBottom: spacing.md,
});

const $stepNumberContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: colors.tint,
  justifyContent: "center",
  alignItems: "center",
  marginRight: 12,
});

const $stepNumber: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
  fontWeight: "700",
  fontSize: 14,
});

const $stepContent: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

const $stepTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 14,
});

const $stepDescription: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginTop: spacing.xxs,
  fontSize: 12,
  lineHeight: 18,
});

const $stepConnector: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  left: 13,
  top: 32,
  width: 2,
  height: 24,
  backgroundColor: colors.separator,
});

const $techStackContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
});

const $techRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.sm,
});

const $techBadge: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 8,
  borderWidth: 1,
  gap: spacing.xs,
});

const $techDot: ViewStyle = {
  width: 8,
  height: 8,
  borderRadius: 4,
};

const $techBadgeText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.text,
});

const $ctaSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  marginTop: spacing.xl,
  gap: spacing.sm,
});

const $ctaButton: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
});

const $githubButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.lg,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 8,
  gap: spacing.sm,
});

const $githubButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontWeight: "600",
});

const $footer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  paddingTop: spacing.xl,
  paddingBottom: spacing.md,
});

const $footerText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
});

const $versionText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginTop: spacing.xxs,
});
