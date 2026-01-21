/**
 * Tabs Component
 * 탭 컴포넌트 - 콘텐츠 탭 전환에 사용
 */

import { FC, useState } from "react";
import {
  Pressable,
  ScrollView,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

import { Text } from "./Text";

// ==========================================
// Types
// ==========================================

export interface TabItem {
  /** Unique identifier for the tab */
  key: string;
  /** Display label */
  label: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Disabled state */
  disabled?: boolean;
  /** Badge count */
  badge?: number;
}

export type TabsVariant = "default" | "pills" | "underline" | "segmented";
export type TabsSize = "sm" | "md" | "lg";

export interface TabsProps {
  /** Array of tab items */
  tabs: TabItem[];
  /** Currently active tab key */
  activeKey?: string;
  /** Default active tab key (uncontrolled) */
  defaultActiveKey?: string;
  /** Callback when tab changes */
  onChange?: (key: string) => void;
  /** Visual variant */
  variant?: TabsVariant;
  /** Size variant */
  size?: TabsSize;
  /** Full width tabs */
  fullWidth?: boolean;
  /** Scrollable tabs (for many items) */
  scrollable?: boolean;
  /** Container style override */
  style?: ViewStyle;
}

// ==========================================
// Component
// ==========================================

export const Tabs: FC<TabsProps> = ({
  tabs,
  activeKey,
  defaultActiveKey,
  onChange,
  variant = "default",
  size = "md",
  fullWidth = false,
  scrollable = false,
  style,
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme();

  const [internalActiveKey, setInternalActiveKey] = useState(
    defaultActiveKey || tabs[0]?.key,
  );

  const currentActiveKey = activeKey ?? internalActiveKey;

  const handleTabPress = (key: string) => {
    if (activeKey === undefined) {
      setInternalActiveKey(key);
    }
    onChange?.(key);
  };

  // Get size-specific styles
  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return { paddingHorizontal: 12, paddingVertical: 6, fontSize: 12 };
      case "lg":
        return { paddingHorizontal: 24, paddingVertical: 14, fontSize: 16 };
      default:
        return { paddingHorizontal: 16, paddingVertical: 10, fontSize: 14 };
    }
  };

  const sizeStyles = getSizeStyles();

  const renderTab = (tab: TabItem, index: number) => {
    const isActive = tab.key === currentActiveKey;
    const isDisabled = tab.disabled;

    return (
      <Pressable
        key={tab.key}
        onPress={() => !isDisabled && handleTabPress(tab.key)}
        disabled={isDisabled}
        style={[
          themed($tab),
          {
            paddingHorizontal: sizeStyles.paddingHorizontal,
            paddingVertical: sizeStyles.paddingVertical,
          },
          fullWidth && { flex: 1 },
          variant === "pills" && themed($pillTab),
          variant === "segmented" && themed($segmentedTab),
          variant === "segmented" && index === 0 && { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
          variant === "segmented" && index === tabs.length - 1 && { borderTopRightRadius: 8, borderBottomRightRadius: 8 },
          isActive && variant === "pills" && { backgroundColor: colors.tint },
          isActive && variant === "segmented" && { backgroundColor: colors.tint },
          isDisabled && { opacity: 0.5 },
        ]}
      >
        {tab.icon && <View style={themed($tabIcon)}>{tab.icon}</View>}
        <Text
          style={[
            themed($tabLabel),
            { fontSize: sizeStyles.fontSize },
            isActive && variant === "underline" && { color: colors.tint },
            isActive && (variant === "pills" || variant === "segmented") && { color: colors.palette.neutral100 },
          ]}
        >
          {tab.label}
        </Text>
        {tab.badge !== undefined && tab.badge > 0 && (
          <View style={themed($badge)}>
            <Text style={themed($badgeText)}>{tab.badge > 99 ? "99+" : tab.badge}</Text>
          </View>
        )}
        {isActive && variant === "underline" && (
          <Animated.View style={[themed($underline), { backgroundColor: colors.tint }]} />
        )}
      </Pressable>
    );
  };

  const containerStyle = [
    themed($container),
    variant === "segmented" && themed($segmentedContainer),
    style,
  ];

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={containerStyle}
      >
        {tabs.map(renderTab)}
      </ScrollView>
    );
  }

  return <View style={containerStyle}>{tabs.map(renderTab)}</View>;
};

// ==========================================
// Tab Panel Component
// ==========================================

export interface TabPanelProps {
  /** Tab key this panel belongs to */
  tabKey: string;
  /** Currently active tab key */
  activeKey: string;
  /** Panel content */
  children: React.ReactNode;
  /** Container style override */
  style?: ViewStyle;
}

export const TabPanel: FC<TabPanelProps> = ({
  tabKey,
  activeKey,
  children,
  style,
}) => {
  const { themed } = useAppTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(tabKey === activeKey ? 1 : 0, { duration: 200 }),
    display: tabKey === activeKey ? "flex" : "none",
  }));

  return (
    <Animated.View style={[themed($panel), animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

// ==========================================
// Styles
// ==========================================

const $container: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
});

const $segmentedContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral200,
  borderRadius: 8,
  padding: 2,
});

const $tab: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
});

const $pillTab: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 20,
  backgroundColor: colors.palette.neutral200,
  marginHorizontal: 2,
});

const $segmentedTab: ThemedStyle<ViewStyle> = () => ({
  borderRadius: 0,
});

const $tabIcon: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginRight: spacing.xs,
});

const $tabLabel: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontFamily: typography.primary.medium,
  color: colors.text,
  textAlign: "center",
});

const $underline: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: 2,
});

const $badge: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.error,
  borderRadius: 10,
  minWidth: 18,
  height: 18,
  justifyContent: "center",
  alignItems: "center",
  marginLeft: spacing.xs,
  paddingHorizontal: 4,
});

const $badgeText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 10,
  fontFamily: typography.primary.bold,
});

const $panel: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.md,
});
