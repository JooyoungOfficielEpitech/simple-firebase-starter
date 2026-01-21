/**
 * Snackbar Component
 * 스낵바 컴포넌트 - 화면 하단에 일시적인 메시지 표시
 */

import { FC, useEffect, useCallback } from "react";
import { View, ViewStyle, TextStyle, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

import { Text } from "./Text";
import { Icon, IconTypes } from "./Icon";

// ==========================================
// Types
// ==========================================

export type SnackbarType = "default" | "success" | "error" | "warning" | "info";

export interface SnackbarProps {
  /** 표시 여부 */
  visible: boolean;
  /** 메시지 */
  message: string;
  /** 스낵바 타입 */
  type?: SnackbarType;
  /** 표시 시간 (ms) */
  duration?: number;
  /** 액션 버튼 텍스트 */
  actionLabel?: string;
  /** 액션 버튼 콜백 */
  onAction?: () => void;
  /** 닫기 콜백 */
  onDismiss: () => void;
  /** 아이콘 */
  icon?: IconTypes;
}

// ==========================================
// Constants
// ==========================================

const TYPE_ICONS: Record<SnackbarType, IconTypes | undefined> = {
  default: undefined,
  success: "check",
  error: "x",
  warning: "bell",
  info: "menu",
};

// ==========================================
// Component
// ==========================================

export const Snackbar: FC<SnackbarProps> = ({
  visible,
  message,
  type = "default",
  duration = 4000,
  actionLabel,
  onAction,
  onDismiss,
  icon,
}) => {
  const { themed, theme: { colors } } = useAppTheme();
  const insets = useSafeAreaInsets();

  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);

  const displayIcon = icon || TYPE_ICONS[type];

  const getTypeColors = useCallback(() => {
    switch (type) {
      case "success":
        return { bg: colors.palette.accent500, text: "#FFFFFF" };
      case "error":
        return { bg: colors.error, text: "#FFFFFF" };
      case "warning":
        return { bg: colors.palette.accent400, text: "#000000" };
      case "info":
        return { bg: colors.tint, text: "#FFFFFF" };
      default:
        return { bg: colors.palette.neutral800, text: "#FFFFFF" };
    }
  }, [type, colors]);

  const typeColors = getTypeColors();

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 250 });
      opacity.value = withTiming(1, { duration: 250 });

      // Auto dismiss
      if (duration > 0) {
        translateY.value = withDelay(
          duration,
          withTiming(100, { duration: 250 }, (finished) => {
            if (finished) {
              runOnJS(onDismiss)();
            }
          })
        );
        opacity.value = withDelay(duration, withTiming(0, { duration: 250 }));
      }
    } else {
      translateY.value = withTiming(100, { duration: 250 });
      opacity.value = withTiming(0, { duration: 250 });
    }
  }, [visible, duration, onDismiss]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        $container,
        { bottom: insets.bottom + 16 },
        animatedStyle,
      ]}
    >
      <View
        style={[
          themed($snackbar),
          { backgroundColor: typeColors.bg },
        ]}
      >
        {displayIcon && (
          <Icon
            icon={displayIcon}
            size={20}
            color={typeColors.text}
            style={$icon}
          />
        )}

        <Text
          style={[$message, { color: typeColors.text }]}
          numberOfLines={2}
        >
          {message}
        </Text>

        {actionLabel && (
          <Pressable
            onPress={() => {
              onAction?.();
              onDismiss();
            }}
            style={({ pressed }) => [
              $actionButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[$actionText, { color: typeColors.text }]}>
              {actionLabel}
            </Text>
          </Pressable>
        )}

        <Pressable
          onPress={onDismiss}
          style={({ pressed }) => [
            $closeButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Icon icon="x" size={18} color={typeColors.text} />
        </Pressable>
      </View>
    </Animated.View>
  );
};

// ==========================================
// Styles
// ==========================================

const $container: ViewStyle = {
  position: "absolute",
  left: 16,
  right: 16,
  zIndex: 9999,
};

const $snackbar: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  borderRadius: 8,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
});

const $icon: ViewStyle = {
  marginRight: 12,
};

const $message: TextStyle = {
  flex: 1,
  fontSize: 14,
  lineHeight: 20,
};

const $actionButton: ViewStyle = {
  marginLeft: 12,
  paddingVertical: 4,
  paddingHorizontal: 8,
};

const $actionText: TextStyle = {
  fontSize: 14,
  fontWeight: "600",
  textTransform: "uppercase",
};

const $closeButton: ViewStyle = {
  marginLeft: 8,
  padding: 4,
};
