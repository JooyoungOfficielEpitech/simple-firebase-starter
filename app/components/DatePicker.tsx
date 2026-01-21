/**
 * DatePicker Component
 * 날짜 선택 컴포넌트
 */

import { FC, useState, useCallback } from "react";
import {
  View,
  ViewStyle,
  TextStyle,
  Pressable,
  Modal,
  Platform,
} from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

import { Text } from "./Text";
import { Icon } from "./Icon";
import { Button } from "./Button";

// ==========================================
// Types
// ==========================================

export interface DatePickerProps {
  /** 선택된 날짜 */
  value?: Date;
  /** 날짜 변경 콜백 */
  onChange: (date: Date) => void;
  /** 최소 날짜 */
  minimumDate?: Date;
  /** 최대 날짜 */
  maximumDate?: Date;
  /** 플레이스홀더 */
  placeholder?: string;
  /** 날짜 포맷 함수 */
  formatDate?: (date: Date) => string;
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
// Component
// ==========================================

const defaultFormatDate = (date: Date): string => {
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const DatePicker: FC<DatePickerProps> = ({
  value,
  onChange,
  minimumDate,
  maximumDate,
  placeholder = "날짜를 선택하세요",
  formatDate = defaultFormatDate,
  disabled = false,
  label,
  error,
  style,
}) => {
  const { themed, theme: { colors } } = useAppTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value || new Date());

  const handlePress = useCallback(() => {
    if (!disabled) {
      setTempDate(value || new Date());
      setShowPicker(true);
    }
  }, [disabled, value]);

  const handleChange = useCallback((event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
      if (event.type === "set" && selectedDate) {
        onChange(selectedDate);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  }, [onChange]);

  const handleConfirm = useCallback(() => {
    onChange(tempDate);
    setShowPicker(false);
  }, [tempDate, onChange]);

  const handleCancel = useCallback(() => {
    setShowPicker(false);
  }, []);

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
        onPress={handlePress}
        disabled={disabled}
      >
        <Text
          style={[
            themed($inputText),
            !value && themed($placeholder),
          ]}
        >
          {value ? formatDate(value) : placeholder}
        </Text>
        <Icon icon="caretRight" size={16} color={colors.textDim} />
      </Pressable>

      {error && (
        <Text size="xs" style={themed($error)}>
          {error}
        </Text>
      )}

      {Platform.OS === "ios" ? (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={handleCancel}
        >
          <View style={$modalOverlay}>
            <View style={[themed($modalContent)]}>
              <View style={themed($modalHeader)}>
                <Button preset="default" onPress={handleCancel}>
                  취소
                </Button>
                <Text preset="bold">날짜 선택</Text>
                <Button preset="default" onPress={handleConfirm}>
                  확인
                </Button>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                locale="ko-KR"
              />
            </View>
          </View>
        </Modal>
      ) : (
        showPicker && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="default"
            onChange={handleChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        )
      )}
    </View>
  );
};

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

const $inputText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 16,
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
  justifyContent: "flex-end",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
};

const $modalContent: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  paddingBottom: 34,
});

const $modalHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  padding: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: "rgba(0,0,0,0.1)",
});
