/**
 * TimePicker Component
 * 시간 선택 컴포넌트
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

export interface TimePickerProps {
  /** 선택된 시간 */
  value?: Date;
  /** 시간 변경 콜백 */
  onChange: (date: Date) => void;
  /** 24시간 형식 */
  is24Hour?: boolean;
  /** 분 간격 */
  minuteInterval?: 1 | 5 | 10 | 15 | 30;
  /** 플레이스홀더 */
  placeholder?: string;
  /** 시간 포맷 함수 */
  formatTime?: (date: Date) => string;
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

const defaultFormatTime = (date: Date, is24Hour: boolean = false): string => {
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: !is24Hour,
  });
};

export const TimePicker: FC<TimePickerProps> = ({
  value,
  onChange,
  is24Hour = false,
  minuteInterval = 1,
  placeholder = "시간을 선택하세요",
  formatTime,
  disabled = false,
  label,
  error,
  style,
}) => {
  const { themed, theme: { colors } } = useAppTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [tempTime, setTempTime] = useState<Date>(value || new Date());

  const format = formatTime || ((date: Date) => defaultFormatTime(date, is24Hour));

  const handlePress = useCallback(() => {
    if (!disabled) {
      setTempTime(value || new Date());
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
        setTempTime(selectedDate);
      }
    }
  }, [onChange]);

  const handleConfirm = useCallback(() => {
    onChange(tempTime);
    setShowPicker(false);
  }, [tempTime, onChange]);

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
        <View style={$inputContent}>
          <Icon icon="bell" size={20} color={colors.textDim} style={$icon} />
          <Text
            style={[
              themed($inputText),
              !value && themed($placeholder),
            ]}
          >
            {value ? format(value) : placeholder}
          </Text>
        </View>
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
                <Text preset="bold">시간 선택</Text>
                <Button preset="default" onPress={handleConfirm}>
                  확인
                </Button>
              </View>
              <DateTimePicker
                value={tempTime}
                mode="time"
                display="spinner"
                onChange={handleChange}
                is24Hour={is24Hour}
                minuteInterval={minuteInterval}
                locale="ko-KR"
              />
            </View>
          </View>
        </Modal>
      ) : (
        showPicker && (
          <DateTimePicker
            value={tempTime}
            mode="time"
            display="default"
            onChange={handleChange}
            is24Hour={is24Hour}
            minuteInterval={minuteInterval}
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

const $inputContent: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
};

const $icon: ViewStyle = {
  marginRight: 8,
};

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
