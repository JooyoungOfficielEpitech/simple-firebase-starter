/**
 * Select Component
 * 드롭다운 선택 컴포넌트
 */

import { FC, useState, useCallback } from "react";
import {
  View,
  ViewStyle,
  TextStyle,
  Pressable,
  Modal,
  FlatList,
  ListRenderItemInfo,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

import { Text } from "./Text";
import { Icon } from "./Icon";

// ==========================================
// Types
// ==========================================

export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface SelectProps<T = string> {
  /** 옵션 목록 */
  options: SelectOption<T>[];
  /** 선택된 값 */
  value?: T;
  /** 값 변경 콜백 */
  onChange: (value: T) => void;
  /** 플레이스홀더 */
  placeholder?: string;
  /** 비활성화 */
  disabled?: boolean;
  /** 라벨 */
  label?: string;
  /** 에러 메시지 */
  error?: string;
  /** 검색 가능 여부 */
  searchable?: boolean;
  /** 컨테이너 스타일 */
  style?: ViewStyle;
}

// ==========================================
// Component
// ==========================================

export function Select<T = string>({
  options,
  value,
  onChange,
  placeholder = "선택하세요",
  disabled = false,
  label,
  error,
  style,
}: SelectProps<T>): ReturnType<FC> {
  const { themed, theme: { colors } } = useAppTheme();
  const [showModal, setShowModal] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleOpen = useCallback(() => {
    if (!disabled) {
      setShowModal(true);
    }
  }, [disabled]);

  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleSelect = useCallback((option: SelectOption<T>) => {
    if (!option.disabled) {
      onChange(option.value);
      setShowModal(false);
    }
  }, [onChange]);

  const renderOption = useCallback(({ item }: ListRenderItemInfo<SelectOption<T>>) => {
    const isSelected = item.value === value;

    return (
      <Pressable
        style={({ pressed }) => [
          themed($option),
          isSelected && themed($optionSelected),
          item.disabled && themed($optionDisabled),
          pressed && !item.disabled && { opacity: 0.7 },
        ]}
        onPress={() => handleSelect(item)}
        disabled={item.disabled}
      >
        {item.icon && <View style={$optionIcon}>{item.icon}</View>}
        <Text
          style={[
            themed($optionText),
            isSelected && themed($optionTextSelected),
            item.disabled && themed($optionTextDisabled),
          ]}
        >
          {item.label}
        </Text>
        {isSelected && (
          <Icon icon="check" size={20} color={colors.tint} />
        )}
      </Pressable>
    );
  }, [themed, value, handleSelect, colors.tint]);

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
        {selectedOption?.icon && (
          <View style={$selectedIcon}>{selectedOption.icon}</View>
        )}
        <Text
          style={[
            themed($inputText),
            !selectedOption && themed($placeholder),
          ]}
          numberOfLines={1}
        >
          {selectedOption?.label || placeholder}
        </Text>
        <Icon
          icon="caretRight"
          size={16}
          color={colors.textDim}
          style={{ transform: [{ rotate: showModal ? "90deg" : "0deg" }] }}
        />
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
              <Text preset="subheading">{label || "선택"}</Text>
              <Pressable onPress={handleClose}>
                <Icon icon="x" size={24} color={colors.text} />
              </Pressable>
            </View>

            <FlatList
              data={options}
              renderItem={renderOption}
              keyExtractor={(item) => String(item.value)}
              showsVerticalScrollIndicator={false}
              style={$optionList}
            />
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
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

const $selectedIcon: ViewStyle = {
  marginRight: 8,
};

const $inputText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 16,
  flex: 1,
});

const $placeholder: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
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

const $optionList: ViewStyle = {
  flexGrow: 0,
};

const $option: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  padding: spacing.md,
});

const $optionSelected: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral200,
});

const $optionDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.5,
});

const $optionIcon: ViewStyle = {
  marginRight: 12,
};

const $optionText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 16,
  flex: 1,
});

const $optionTextSelected: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
  fontWeight: "600",
});

const $optionTextDisabled: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
});
