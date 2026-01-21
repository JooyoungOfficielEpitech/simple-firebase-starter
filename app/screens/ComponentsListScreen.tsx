/**
 * Components List Screen
 * 모든 컴포넌트를 카테고리별로 보여주는 화면
 */

import { FC, useCallback } from "react";
import { Pressable, SectionList, TextStyle, View, ViewStyle } from "react-native";
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

interface ComponentItem {
  id: string;
  name: string;
  description: string;
  icon: IconTypes;
  screen?: keyof AppStackParamList;
}

interface ComponentSection {
  key: string;
  title: string;
  data: ComponentItem[];
}

// ==========================================
// Component Data
// ==========================================

const COMPONENT_SECTIONS: ComponentSection[] = [
  {
    key: "ui-components",
    title: "UI Components",
    data: [
      {
        id: "button",
        name: "Button",
        description: "다양한 스타일의 버튼 컴포넌트",
        icon: "check",
        screen: "ButtonShowcase",
      },
      {
        id: "card",
        name: "Card",
        description: "콘텐츠 그룹을 위한 카드 컴포넌트",
        icon: "menu",
        screen: "CardShowcase",
      },
      {
        id: "text",
        name: "Text",
        description: "타이포그래피 및 텍스트 스타일",
        icon: "menu",
        screen: "TextShowcase",
      },
      {
        id: "icon",
        name: "Icon",
        description: "아이콘 시스템",
        icon: "heart",
      },
    ],
  },
  {
    key: "form-components",
    title: "Form Components",
    data: [
      {
        id: "textfield",
        name: "TextField",
        description: "텍스트 입력 필드",
        icon: "menu",
        screen: "FormShowcase",
      },
      {
        id: "toggle",
        name: "Toggle",
        description: "스위치, 체크박스, 라디오 버튼",
        icon: "check",
        screen: "ToggleShowcase",
      },
      {
        id: "formtextfield",
        name: "FormTextField",
        description: "react-hook-form 통합 입력 필드",
        icon: "menu",
        screen: "FormShowcase",
      },
    ],
  },
  {
    key: "layout-components",
    title: "Layout Components",
    data: [
      {
        id: "screen",
        name: "Screen",
        description: "화면 기본 레이아웃 컴포넌트",
        icon: "menu",
        screen: "LayoutShowcase",
      },
      {
        id: "header-component",
        name: "Header",
        description: "화면 헤더 컴포넌트",
        icon: "back",
        screen: "LayoutShowcase",
      },
      {
        id: "listview",
        name: "ListView",
        description: "최적화된 리스트 컴포넌트",
        icon: "menu",
      },
      {
        id: "listitem",
        name: "ListItem",
        description: "리스트 아이템 컴포넌트",
        icon: "menu",
      },
    ],
  },
  {
    key: "feedback-components",
    title: "Feedback Components",
    data: [
      {
        id: "loadingoverlay",
        name: "LoadingOverlay",
        description: "로딩 오버레이 컴포넌트",
        icon: "menu",
        screen: "FeedbackShowcase",
      },
      {
        id: "emptystate",
        name: "EmptyState",
        description: "빈 상태 표시 컴포넌트",
        icon: "menu",
        screen: "FeedbackShowcase",
      },
      {
        id: "notificationbadge",
        name: "NotificationBadge",
        description: "알림 배지 컴포넌트",
        icon: "bell",
      },
    ],
  },
  {
    key: "media-components",
    title: "Media Components",
    data: [
      {
        id: "autoimage",
        name: "AutoImage",
        description: "자동 크기 조절 이미지",
        icon: "menu",
      },
      {
        id: "imagegallery",
        name: "ImageGallery",
        description: "이미지 갤러리 컴포넌트",
        icon: "menu",
      },
      {
        id: "imagepicker",
        name: "ImagePickerButton",
        description: "이미지 선택 버튼",
        icon: "menu",
      },
    ],
  },
  {
    key: "chat-components",
    title: "Chat Components",
    data: [
      {
        id: "messagebubble",
        name: "MessageBubble",
        description: "채팅 메시지 말풍선",
        icon: "bell",
      },
      {
        id: "messageinput",
        name: "MessageInput",
        description: "메시지 입력창",
        icon: "menu",
      },
      {
        id: "typingindicator",
        name: "TypingIndicator",
        description: "타이핑 표시기",
        icon: "menu",
      },
    ],
  },
  {
    key: "network-components",
    title: "Network Components",
    data: [
      {
        id: "offlinebanner",
        name: "OfflineBanner",
        description: "오프라인 상태 배너",
        icon: "menu",
      },
      {
        id: "syncindicator",
        name: "SyncIndicator",
        description: "동기화 상태 표시기",
        icon: "menu",
      },
      {
        id: "networkstatus",
        name: "NetworkStatusIcon",
        description: "네트워크 상태 아이콘",
        icon: "menu",
      },
    ],
  },
  {
    key: "payment-components",
    title: "Payment Components",
    data: [
      {
        id: "pricingcard",
        name: "PricingCard",
        description: "가격 플랜 카드",
        icon: "menu",
      },
      {
        id: "paymentmodal",
        name: "PaymentSuccessModal",
        description: "결제 성공 모달",
        icon: "check",
      },
    ],
  },
];

// ==========================================
// Component
// ==========================================

export const ComponentsListScreen: FC = function ComponentsListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {
    themed,
    theme: { colors },
  } = useAppTheme();

  const handlePress = useCallback(
    (item: ComponentItem) => {
      if (item.screen) {
        navigation.navigate(item.screen as keyof AppStackParamList);
      } else {
        // TODO: Navigate to component showcase screen
        console.log("Component pressed:", item.name);
      }
    },
    [navigation],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: ComponentSection }) => (
      <View style={themed($sectionHeader)}>
        <Text preset="formLabel" style={themed($sectionTitle)}>
          {section.title}
        </Text>
        <Text preset="formHelper" style={themed($sectionCount)}>
          {section.data.length} components
        </Text>
      </View>
    ),
    [themed],
  );

  const renderItem = useCallback(
    ({ item }: { item: ComponentItem }) => (
      <Pressable
        style={({ pressed }) => [
          themed($itemContainer),
          pressed && { opacity: 0.7 },
        ]}
        onPress={() => handlePress(item)}
      >
        <View style={themed($iconContainer)}>
          <Icon icon={item.icon} size={24} color={colors.tint} />
        </View>
        <View style={themed($textContainer)}>
          <Text preset="bold" style={themed($itemName)}>
            {item.name}
          </Text>
          <Text preset="formHelper" style={themed($itemDescription)}>
            {item.description}
          </Text>
        </View>
        <Icon icon="caretRight" size={20} color={colors.textDim} />
      </Pressable>
    ),
    [themed, colors, handlePress],
  );

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]}>
      <View style={themed($header)}>
        <Text preset="heading" style={themed($title)}>
          Components
        </Text>
        <Text preset="default" style={themed($subtitle)}>
          {COMPONENT_SECTIONS.reduce((sum, s) => sum + s.data.length, 0)}개의
          재사용 가능한 컴포넌트
        </Text>
      </View>

      <SectionList
        sections={COMPONENT_SECTIONS}
        keyExtractor={(item) => item.id}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={themed($listContent)}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
};

// ==========================================
// Styles
// ==========================================

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

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xl,
});

const $sectionHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: spacing.md,
  marginTop: spacing.sm,
});

const $sectionTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
});

const $sectionCount: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
});

const $itemContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  padding: spacing.md,
  marginBottom: spacing.sm,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 12,
});

const $iconContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: 44,
  height: 44,
  borderRadius: 10,
  backgroundColor: colors.palette.neutral100,
  justifyContent: "center",
  alignItems: "center",
  marginRight: spacing.md,
});

const $textContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

const $itemName: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
});

const $itemDescription: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginTop: spacing.xxs,
});
