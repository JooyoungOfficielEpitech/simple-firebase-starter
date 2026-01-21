/**
 * ConfirmDialog Component
 * 확인 다이얼로그 컴포넌트 - 사용자 확인이 필요한 액션용
 */

import { FC } from "react";
import { View, ViewStyle, TextStyle, Modal, Pressable } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";

import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

import { Text } from "./Text";
import { Button } from "./Button";
import { Icon, IconTypes } from "./Icon";

// ==========================================
// Types
// ==========================================

export type ConfirmDialogType = "default" | "danger" | "warning" | "info";

export interface ConfirmDialogProps {
  /** 표시 여부 */
  visible: boolean;
  /** 제목 */
  title: string;
  /** 메시지 */
  message: string;
  /** 다이얼로그 타입 */
  type?: ConfirmDialogType;
  /** 확인 버튼 텍스트 */
  confirmLabel?: string;
  /** 취소 버튼 텍스트 */
  cancelLabel?: string;
  /** 확인 콜백 */
  onConfirm: () => void;
  /** 취소 콜백 */
  onCancel: () => void;
  /** 아이콘 */
  icon?: IconTypes;
  /** 확인 버튼 로딩 상태 */
  loading?: boolean;
  /** 취소 버튼 숨김 */
  hideCancelButton?: boolean;
}

// ==========================================
// Constants
// ==========================================

const TYPE_ICONS: Record<ConfirmDialogType, IconTypes> = {
  default: "check",
  danger: "x",
  warning: "bell",
  info: "menu",
};

// ==========================================
// Component
// ==========================================

export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  type = "default",
  confirmLabel = "확인",
  cancelLabel = "취소",
  onConfirm,
  onCancel,
  icon,
  loading = false,
  hideCancelButton = false,
}) => {
  const { themed, theme: { colors } } = useAppTheme();

  const displayIcon = icon || TYPE_ICONS[type];

  const getIconColor = () => {
    switch (type) {
      case "danger":
        return colors.error;
      case "warning":
        return colors.palette.accent400;
      case "info":
        return colors.tint;
      default:
        return colors.tint;
    }
  };

  const getConfirmPreset = (): "default" | "reversed" | "filled" => {
    switch (type) {
      case "danger":
        return "filled";
      default:
        return "reversed";
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        style={$overlay}
      >
        <Pressable style={$overlayPressable} onPress={onCancel}>
          <Animated.View
            entering={SlideInDown.duration(300).springify()}
            exiting={SlideOutDown.duration(200)}
            style={themed($dialog)}
          >
            <Pressable>
              {/* Icon */}
              <View style={themed($iconContainer)}>
                <View
                  style={[
                    $iconCircle,
                    { backgroundColor: `${getIconColor()}20` },
                  ]}
                >
                  <Icon icon={displayIcon} size={32} color={getIconColor()} />
                </View>
              </View>

              {/* Content */}
              <View style={themed($content)}>
                <Text preset="subheading" style={themed($title)}>
                  {title}
                </Text>
                <Text style={themed($message)}>{message}</Text>
              </View>

              {/* Actions */}
              <View style={themed($actions)}>
                {!hideCancelButton && (
                  <Button
                    preset="default"
                    onPress={onCancel}
                    style={$actionButton}
                    disabled={loading}
                  >
                    {cancelLabel}
                  </Button>
                )}
                <Button
                  preset={getConfirmPreset()}
                  onPress={onConfirm}
                  style={[
                    $actionButton,
                    type === "danger" && { backgroundColor: colors.error },
                  ]}
                  disabled={loading}
                >
                  {loading ? "처리 중..." : confirmLabel}
                </Button>
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Modal>
  );
};

// ==========================================
// Styles
// ==========================================

const $overlay: ViewStyle = {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
};

const $overlayPressable: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: 24,
};

const $dialog: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  borderRadius: 20,
  width: "100%",
  maxWidth: 340,
  overflow: "hidden",
});

const $iconContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  paddingTop: spacing.lg,
});

const $iconCircle: ViewStyle = {
  width: 64,
  height: 64,
  borderRadius: 32,
  justifyContent: "center",
  alignItems: "center",
};

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.lg,
  alignItems: "center",
});

const $title: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  textAlign: "center",
  marginBottom: spacing.sm,
});

const $message: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  textAlign: "center",
  lineHeight: 22,
});

const $actions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  padding: spacing.md,
  gap: spacing.sm,
});

const $actionButton: ViewStyle = {
  flex: 1,
};
