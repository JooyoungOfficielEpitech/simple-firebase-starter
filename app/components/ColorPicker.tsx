/**
 * ColorPicker Component
 * 색상 선택 컴포넌트
 */

import { FC, useState, useCallback } from "react";
import {
  View,
  ViewStyle,
  TextStyle,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

import { Text } from "./Text";
import { Icon } from "./Icon";
import { Button } from "./Button";

// ==========================================
// Types
// ==========================================

export interface ColorPickerProps {
  /** 선택된 색상 */
  value?: string;
  /** 색상 변경 콜백 */
  onChange: (color: string) => void;
  /** 사용 가능한 색상 목록 */
  colors?: string[];
  /** 플레이스홀더 */
  placeholder?: string;
  /** 비활성화 */
  disabled?: boolean;
  /** 라벨 */
  label?: string;
  /** 에러 메시지 */
  error?: string;
  /** 컨테이너 스타일 */
  style?: ViewStyle;
}

// ==========================================
// Default Colors
// ==========================================

const DEFAULT_COLORS = [
  // Reds
  "#EF4444", "#DC2626", "#B91C1C",
  // Oranges
  "#F97316", "#EA580C", "#C2410C",
  // Yellows
  "#EAB308", "#CA8A04", "#A16207",
  // Greens
  "#22C55E", "#16A34A", "#15803D",
  // Teals
  "#14B8A6", "#0D9488", "#0F766E",
  // Blues
  "#3B82F6", "#2563EB", "#1D4ED8",
  // Indigos
  "#6366F1", "#4F46E5", "#4338CA",
  // Purples
  "#A855F7", "#9333EA", "#7C3AED",
  // Pinks
  "#EC4899", "#DB2777", "#BE185D",
  // Grays
  "#6B7280", "#4B5563", "#374151",
  // Neutrals
  "#000000", "#FFFFFF", "#F5F5F5",
];

// ==========================================
// Component
// ==========================================

export const ColorPicker: FC<ColorPickerProps> = ({
  value,
  onChange,
  colors = DEFAULT_COLORS,
  placeholder = "색상을 선택하세요",
  disabled = false,
  label,
  error,
  style,
}) => {
  const { themed, theme } = useAppTheme();
  const [showModal, setShowModal] = useState(false);

  const handleOpen = useCallback(() => {
    if (!disabled) {
      setShowModal(true);
    }
  }, [disabled]);

  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleSelect = useCallback((color: string) => {
    onChange(color);
    setShowModal(false);
  }, [onChange]);

  return (
    <View style={[themed($container), style]}>
      {label && (
        <Text preset="formLabel" style={themed($label)}>
          {label}
        </Text>
      )}

      <Pressable
        style={({ pressed }) => [
          themed($input),
          disabled && themed($inputDisabled),
          error && themed($inputError),
          pressed && !disabled && { opacity: 0.8 },
        ]}
        onPress={handleOpen}
        disabled={disabled}
      >
        <View style={$inputContent}>
          {value ? (
            <>
              <View style={[$colorPreview, { backgroundColor: value }]} />
              <Text style={themed($inputText)}>{value.toUpperCase()}</Text>
            </>
          ) : (
            <Text style={themed($placeholder)}>{placeholder}</Text>
          )}
        </View>
        <Icon icon="caretRight" size={16} color={theme.colors.textDim} />
      </Pressable>

      {error && (
        <Text size="xs" style={themed($error)}>
          {error}
        </Text>
      )}

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Pressable style={$modalOverlay} onPress={handleClose}>
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={themed($modalContent)}
          >
            <View style={themed($modalHeader)}>
              <Text preset="subheading">{label || "색상 선택"}</Text>
              <Pressable onPress={handleClose}>
                <Icon icon="x" size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={$colorGrid}
              showsVerticalScrollIndicator={false}
            >
              {colors.map((color) => {
                const isSelected = color === value;
                return (
                  <Pressable
                    key={color}
                    style={({ pressed }) => [
                      $colorItem,
                      { backgroundColor: color },
                      isSelected && $colorItemSelected,
                      pressed && { opacity: 0.8 },
                    ]}
                    onPress={() => handleSelect(color)}
                  >
                    {isSelected && (
                      <Icon
                        icon="check"
                        size={20}
                        color={isLightColor(color) ? "#000" : "#FFF"}
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>

            {value && (
              <View style={themed($selectedPreview)}>
                <View style={[$previewSwatch, { backgroundColor: value }]} />
                <Text style={themed($previewText)}>{value.toUpperCase()}</Text>
              </View>
            )}
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
};

// Helper function to determine if a color is light
function isLightColor(color: string): boolean {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
}

// ==========================================
// Styles
// ==========================================

const $container: ThemedStyle<ViewStyle> = () => ({});

const $label: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  marginBottom: spacing.xs,
});

const $input: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: colors.palette.neutral200,
  borderRadius: 8,
  padding: spacing.md,
  borderWidth: 1,
  borderColor: "transparent",
});

const $inputDisabled: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral300,
  opacity: 0.6,
});

const $inputError: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.error,
});

const $inputContent: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
};

const $colorPreview: ViewStyle = {
  width: 24,
  height: 24,
  borderRadius: 6,
  marginRight: 12,
  borderWidth: 1,
  borderColor: "rgba(0,0,0,0.1)",
};

const $inputText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 16,
});

const $placeholder: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 16,
});

const $error: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  marginTop: spacing.xs,
});

const $modalOverlay: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  padding: 20,
};

const $modalContent: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  borderRadius: 16,
  width: "100%",
  maxHeight: "70%",
  overflow: "hidden",
});

const $modalHeader: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  padding: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
});

const $colorGrid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  padding: 16,
  justifyContent: "flex-start",
};

const $colorItem: ViewStyle = {
  width: 48,
  height: 48,
  borderRadius: 8,
  margin: 6,
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 1,
  borderColor: "rgba(0,0,0,0.1)",
};

const $colorItemSelected: ViewStyle = {
  borderWidth: 3,
  borderColor: "#000",
};

const $selectedPreview: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  padding: spacing.md,
  borderTopWidth: 1,
  borderTopColor: colors.separator,
});

const $previewSwatch: ViewStyle = {
  width: 32,
  height: 32,
  borderRadius: 8,
  marginRight: 12,
  borderWidth: 1,
  borderColor: "rgba(0,0,0,0.1)",
};

const $previewText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 16,
  fontWeight: "600",
});
