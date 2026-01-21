/**
 * Accordion Component
 * 아코디언 컴포넌트 - 접고 펼칠 수 있는 콘텐츠 섹션
 */

import { FC, useState, useCallback } from "react";
import { Pressable, View, ViewStyle, TextStyle, LayoutAnimation, Platform, UIManager } from "react-native";

import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

import { Text } from "./Text";
import { Icon, IconTypes } from "./Icon";

// Android에서 LayoutAnimation 활성화
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ==========================================
// Types
// ==========================================

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: IconTypes;
}

export interface AccordionProps {
  /** 아코디언 아이템 목록 */
  items: AccordionItem[];
  /** 여러 항목 동시 열기 허용 */
  allowMultiple?: boolean;
  /** 기본 열린 항목 ID 목록 */
  defaultExpandedIds?: string[];
  /** 컨테이너 스타일 */
  style?: ViewStyle;
  /** 항목 변경 콜백 */
  onExpandedChange?: (expandedIds: string[]) => void;
}

// ==========================================
// Component
// ==========================================

export const Accordion: FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  defaultExpandedIds = [],
  style,
  onExpandedChange,
}) => {
  const { themed, theme: { colors } } = useAppTheme();
  const [expandedIds, setExpandedIds] = useState<string[]>(defaultExpandedIds);

  const toggleItem = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setExpandedIds((prev) => {
      let newIds: string[];

      if (prev.includes(id)) {
        newIds = prev.filter((i) => i !== id);
      } else if (allowMultiple) {
        newIds = [...prev, id];
      } else {
        newIds = [id];
      }

      onExpandedChange?.(newIds);
      return newIds;
    });
  }, [allowMultiple, onExpandedChange]);

  return (
    <View style={[themed($container), style]}>
      {items.map((item, index) => {
        const isExpanded = expandedIds.includes(item.id);
        const isLast = index === items.length - 1;

        return (
          <View key={item.id} style={[themed($item), !isLast && themed($itemBorder)]}>
            <Pressable
              style={({ pressed }) => [
                themed($header),
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => toggleItem(item.id)}
            >
              <View style={$headerContent}>
                {item.icon && (
                  <Icon
                    icon={item.icon}
                    size={20}
                    color={colors.text}
                    style={$headerIcon}
                  />
                )}
                <Text preset="bold" style={themed($headerText)}>
                  {item.title}
                </Text>
              </View>
              <Icon
                icon="caretRight"
                size={16}
                color={colors.textDim}
                style={{
                  transform: [{ rotate: isExpanded ? "90deg" : "0deg" }],
                }}
              />
            </Pressable>

            {isExpanded && (
              <View style={themed($content)}>
                {typeof item.content === "string" ? (
                  <Text style={themed($contentText)}>{item.content}</Text>
                ) : (
                  item.content
                )}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

// ==========================================
// Styles
// ==========================================

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  borderRadius: 12,
  overflow: "hidden",
});

const $item: ThemedStyle<ViewStyle> = () => ({});

const $itemBorder: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
});

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  padding: spacing.md,
});

const $headerContent: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
};

const $headerIcon: ViewStyle = {
  marginRight: 12,
};

const $headerText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  flex: 1,
});

const $content: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  padding: spacing.md,
  paddingTop: 0,
  backgroundColor: colors.palette.neutral100,
});

const $contentText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  lineHeight: 22,
});
