/**
 * Toast Component
 * 토스트 알림 컴포넌트 - 일시적인 메시지 표시에 사용
 */

import { FC, useEffect, useCallback, createContext, useContext, useState, ReactNode } from "react";
import { Pressable, TextStyle, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from "react-native-reanimated";

import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

import { Icon, IconTypes } from "./Icon";
import { Text } from "./Text";

// ==========================================
// Types
// ==========================================

export type ToastType = "info" | "success" | "warning" | "error";
export type ToastPosition = "top" | "bottom";

export interface ToastConfig {
  /** Toast message */
  message: string;
  /** Toast type/severity */
  type?: ToastType;
  /** Duration in ms (0 for persistent) */
  duration?: number;
  /** Position on screen */
  position?: ToastPosition;
  /** Custom icon */
  icon?: IconTypes;
  /** Action button text */
  actionText?: string;
  /** Action button callback */
  onAction?: () => void;
  /** Callback when toast is dismissed */
  onDismiss?: () => void;
}

export interface ToastProps extends ToastConfig {
  /** Unique identifier */
  id: string;
  /** Whether toast is visible */
  visible: boolean;
  /** Callback to hide toast */
  onHide: (id: string) => void;
}

// ==========================================
// Toast Item Component
// ==========================================

export const ToastItem: FC<ToastProps> = ({
  id,
  message,
  type = "info",
  duration = 3000,
  position = "bottom",
  icon,
  actionText,
  onAction,
  onDismiss,
  visible,
  onHide,
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme();

  const translateY = useSharedValue(position === "top" ? -100 : 100);
  const opacity = useSharedValue(0);

  const handleHide = useCallback(() => {
    onHide(id);
    onDismiss?.();
  }, [id, onHide, onDismiss]);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.back(1.2)),
      });
      opacity.value = withTiming(1, { duration: 200 });

      if (duration > 0) {
        translateY.value = withDelay(
          duration,
          withTiming(position === "top" ? -100 : 100, { duration: 300 }, () => {
            runOnJS(handleHide)();
          }),
        );
        opacity.value = withDelay(duration, withTiming(0, { duration: 300 }));
      }
    }
  }, [visible, duration, position, translateY, opacity, handleHide]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  // Get type-specific styles
  const getTypeConfig = () => {
    switch (type) {
      case "success":
        return {
          bg: colors.palette.secondary500,
          icon: "check" as IconTypes,
        };
      case "warning":
        return {
          bg: colors.palette.accent500,
          icon: "bell" as IconTypes,
        };
      case "error":
        return {
          bg: colors.error,
          icon: "x" as IconTypes,
        };
      default:
        return {
          bg: colors.palette.neutral700,
          icon: "bell" as IconTypes,
        };
    }
  };

  const typeConfig = getTypeConfig();
  const displayIcon = icon || typeConfig.icon;

  return (
    <Animated.View
      style={[
        themed($toast),
        { backgroundColor: typeConfig.bg },
        position === "top" && { top: 60 },
        position === "bottom" && { bottom: 60 },
        animatedStyle,
      ]}
    >
      <View style={themed($icon)}>
        <Icon
          icon={displayIcon}
          size={20}
          color={colors.palette.neutral100}
        />
      </View>

      <Text style={themed($message)} numberOfLines={2}>
        {message}
      </Text>

      {actionText && (
        <Pressable onPress={onAction} style={themed($actionButton)}>
          <Text style={themed($actionText)}>{actionText}</Text>
        </Pressable>
      )}

      <Pressable onPress={handleHide} hitSlop={8}>
        <Icon icon="x" size={18} color={colors.palette.neutral300} />
      </Pressable>
    </Animated.View>
  );
};

// ==========================================
// Toast Context & Provider
// ==========================================

interface ToastContextValue {
  show: (config: ToastConfig) => string;
  hide: (id: string) => void;
  hideAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

interface ToastState extends ToastConfig {
  id: string;
  visible: boolean;
}

export const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const show = useCallback((config: ToastConfig): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { ...config, id, visible: true }]);
    return id;
  }, []);

  const hide = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const hideAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ show, hide, hideAll }}>
      {children}
      <ToastContainer toasts={toasts} onHide={hide} />
    </ToastContext.Provider>
  );
};

// ==========================================
// Toast Container
// ==========================================

interface ToastContainerProps {
  toasts: ToastState[];
  onHide: (id: string) => void;
}

const ToastContainer: FC<ToastContainerProps> = ({ toasts, onHide }) => {
  const { themed } = useAppTheme();

  const topToasts = toasts.filter((t) => t.position === "top");
  const bottomToasts = toasts.filter((t) => t.position !== "top");

  return (
    <>
      {topToasts.length > 0 && (
        <View style={[themed($container), { top: 0 }]} pointerEvents="box-none">
          {topToasts.map((toast) => (
            <ToastItem key={toast.id} {...toast} onHide={onHide} />
          ))}
        </View>
      )}
      {bottomToasts.length > 0 && (
        <View style={[themed($container), { bottom: 0 }]} pointerEvents="box-none">
          {bottomToasts.map((toast) => (
            <ToastItem key={toast.id} {...toast} onHide={onHide} />
          ))}
        </View>
      )}
    </>
  );
};

// ==========================================
// Styles
// ==========================================

const $container: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  left: 0,
  right: 0,
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "box-none",
});

const $toast: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "absolute",
  left: spacing.md,
  right: spacing.md,
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  borderRadius: 12,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 6,
});

const $icon: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginRight: spacing.sm,
});

const $message: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  flex: 1,
  color: colors.palette.neutral100,
  fontFamily: typography.primary.medium,
  fontSize: 14,
});

const $actionButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginHorizontal: spacing.sm,
  paddingVertical: spacing.xxs,
  paddingHorizontal: spacing.sm,
});

const $actionText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontFamily: typography.primary.bold,
  fontSize: 14,
  textDecorationLine: "underline",
});
