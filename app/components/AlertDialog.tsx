/**
 * AlertDialog Component
 * 알림 다이얼로그 컴포넌트 - 확인/경고/에러 메시지 표시에 사용
 */

import { FC, ReactNode } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";

import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

import { Icon, IconTypes } from "./Icon";
import { Text } from "./Text";

// ==========================================
// Types
// ==========================================

export type AlertDialogType = "info" | "success" | "warning" | "error" | "confirm";

export interface AlertDialogAction {
  /** Button label */
  label: string;
  /** Action callback */
  onPress: () => void;
  /** Button style */
  style?: "default" | "cancel" | "destructive";
}

export interface AlertDialogProps {
  /** Whether dialog is visible */
  visible: boolean;
  /** Dialog type/severity */
  type?: AlertDialogType;
  /** Dialog title */
  title: string;
  /** Dialog message */
  message?: string;
  /** Custom content */
  children?: ReactNode;
  /** Custom icon */
  icon?: IconTypes;
  /** Hide default icon */
  hideIcon?: boolean;
  /** Action buttons */
  actions?: AlertDialogAction[];
  /** Close on backdrop press */
  dismissible?: boolean;
  /** Callback when dialog is dismissed */
  onDismiss?: () => void;
}

// ==========================================
// Component
// ==========================================

export const AlertDialog: FC<AlertDialogProps> = ({
  visible,
  type = "info",
  title,
  message,
  children,
  icon,
  hideIcon = false,
  actions = [],
  dismissible = true,
  onDismiss,
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme();

  // Get type configuration
  const getTypeConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: "check" as IconTypes,
          iconColor: colors.palette.secondary500,
          iconBg: colors.palette.secondary500 + "20",
        };
      case "warning":
        return {
          icon: "bell" as IconTypes,
          iconColor: colors.palette.accent500,
          iconBg: colors.palette.accent500 + "20",
        };
      case "error":
        return {
          icon: "x" as IconTypes,
          iconColor: colors.error,
          iconBg: colors.error + "20",
        };
      case "confirm":
        return {
          icon: "bell" as IconTypes,
          iconColor: colors.tint,
          iconBg: colors.tint + "20",
        };
      default:
        return {
          icon: "bell" as IconTypes,
          iconColor: colors.tint,
          iconBg: colors.tint + "20",
        };
    }
  };

  const typeConfig = getTypeConfig();
  const displayIcon = icon || typeConfig.icon;

  const handleBackdropPress = () => {
    if (dismissible) {
      onDismiss?.();
    }
  };

  // Default actions if none provided
  const defaultActions: AlertDialogAction[] = actions.length > 0
    ? actions
    : [{ label: "OK", onPress: () => onDismiss?.(), style: "default" }];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={themed($backdrop)}
      >
        <Pressable style={themed($backdropPressable)} onPress={handleBackdropPress} />

        <Animated.View
          entering={FadeIn.duration(200)}
          style={themed($dialog)}
        >
          {/* Icon */}
          {!hideIcon && (
            <View style={[themed($iconContainer), { backgroundColor: typeConfig.iconBg }]}>
              <Icon icon={displayIcon} size={28} color={typeConfig.iconColor} />
            </View>
          )}

          {/* Title */}
          <Text style={themed($title)}>{title}</Text>

          {/* Message */}
          {message && <Text style={themed($message)}>{message}</Text>}

          {/* Custom content */}
          {children}

          {/* Actions */}
          <View style={themed($actionsContainer)}>
            {defaultActions.map((action, index) => (
              <Pressable
                key={index}
                onPress={action.onPress}
                style={[
                  themed($actionButton),
                  index > 0 && themed($actionButtonSpacing),
                  action.style === "cancel" && themed($cancelButton),
                  action.style === "destructive" && { backgroundColor: colors.error },
                  action.style === "default" && { backgroundColor: colors.tint },
                ]}
              >
                <Text
                  style={[
                    themed($actionText),
                    action.style === "cancel" && themed($cancelText),
                    (action.style === "default" || action.style === "destructive") && {
                      color: colors.palette.neutral100,
                    },
                  ]}
                >
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ==========================================
// Confirm Dialog Preset
// ==========================================

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <AlertDialog
      visible={visible}
      type="confirm"
      title={title}
      message={message}
      dismissible={false}
      actions={[
        { label: cancelLabel, onPress: onCancel, style: "cancel" },
        { label: confirmLabel, onPress: onConfirm, style: destructive ? "destructive" : "default" },
      ]}
    />
  );
};

// ==========================================
// Styles
// ==========================================

const $backdrop: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
});

const $backdropPressable: ThemedStyle<ViewStyle> = () => ({
  ...StyleSheet.absoluteFillObject,
});

const $dialog: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: 16,
  padding: spacing.lg,
  marginHorizontal: spacing.lg,
  minWidth: 280,
  maxWidth: 340,
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.25,
  shadowRadius: 20,
  elevation: 10,
});

const $iconContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: 56,
  height: 56,
  borderRadius: 28,
  justifyContent: "center",
  alignItems: "center",
  marginBottom: spacing.md,
});

const $title: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  fontSize: 18,
  fontFamily: typography.primary.bold,
  color: colors.text,
  textAlign: "center",
  marginBottom: spacing.xs,
});

const $message: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.textDim,
  textAlign: "center",
  lineHeight: 20,
  marginBottom: spacing.md,
});

const $actionsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  marginTop: spacing.sm,
  width: "100%",
});

const $actionButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  borderRadius: 8,
  alignItems: "center",
  justifyContent: "center",
});

const $actionButtonSpacing: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginLeft: spacing.sm,
});

const $cancelButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral200,
});

const $actionText: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
});

const $cancelText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
});

