/**
 * BottomSheet Component
 * 바텀 시트 컴포넌트 - 하단에서 올라오는 모달
 */

import { FC, ReactNode, useEffect, useCallback } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

// ==========================================
// Types
// ==========================================

export interface BottomSheetProps {
  /** Whether the bottom sheet is visible */
  visible: boolean;
  /** Callback when sheet is dismissed */
  onDismiss: () => void;
  /** Sheet content */
  children: ReactNode;
  /** Height of the sheet (number or percentage string) */
  height?: number | string;
  /** Enable drag to dismiss */
  draggable?: boolean;
  /** Show drag handle indicator */
  showHandle?: boolean;
  /** Close on backdrop press */
  dismissOnBackdrop?: boolean;
  /** Custom snap points (percentages 0-1) */
  snapPoints?: number[];
  /** Container style override */
  style?: ViewStyle;
}

// ==========================================
// Constants
// ==========================================

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 50;
const SPRING_CONFIG = {
  damping: 50,
  stiffness: 300,
  mass: 0.5,
};

// ==========================================
// Component
// ==========================================

export const BottomSheet: FC<BottomSheetProps> = ({
  visible,
  onDismiss,
  children,
  height = "50%",
  draggable = true,
  showHandle = true,
  dismissOnBackdrop = true,
  snapPoints,
  style,
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme();

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const context = useSharedValue({ y: 0 });
  const backdropOpacity = useSharedValue(0);

  // Calculate sheet height
  const sheetHeight =
    typeof height === "string"
      ? (parseFloat(height) / 100) * SCREEN_HEIGHT
      : height;

  const openPosition = -sheetHeight;

  const handleDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(openPosition, SPRING_CONFIG);
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withSpring(SCREEN_HEIGHT, SPRING_CONFIG);
      backdropOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible, openPosition, translateY, backdropOpacity]);

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      if (!draggable) return;
      translateY.value = Math.max(
        event.translationY + context.value.y,
        MAX_TRANSLATE_Y,
      );
    })
    .onEnd((event) => {
      if (!draggable) return;

      // Calculate velocity-based threshold
      const shouldDismiss =
        translateY.value > openPosition / 2 || event.velocityY > 500;

      if (shouldDismiss) {
        translateY.value = withSpring(SCREEN_HEIGHT, SPRING_CONFIG, () => {
          runOnJS(handleDismiss)();
        });
        backdropOpacity.value = withTiming(0, { duration: 300 });
      } else if (snapPoints && snapPoints.length > 0) {
        // Find closest snap point
        const currentPercent = Math.abs(translateY.value) / SCREEN_HEIGHT;
        const closest = snapPoints.reduce((prev, curr) =>
          Math.abs(curr - currentPercent) < Math.abs(prev - currentPercent)
            ? curr
            : prev,
        );
        translateY.value = withSpring(-closest * SCREEN_HEIGHT, SPRING_CONFIG);
      } else {
        translateY.value = withSpring(openPosition, SPRING_CONFIG);
      }
    });

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value * 0.5,
  }));

  const handleIndicatorAnimatedStyle = useAnimatedStyle(() => ({
    width: interpolate(
      translateY.value,
      [openPosition, SCREEN_HEIGHT],
      [40, 60],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      <GestureHandlerRootView style={themed($gestureContainer)}>
        {/* Backdrop */}
        <Animated.View style={[themed($backdrop), backdropAnimatedStyle]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={dismissOnBackdrop ? handleDismiss : undefined}
          />
        </Animated.View>

        {/* Sheet */}
        <GestureDetector gesture={gesture}>
          <Animated.View
            style={[
              themed($sheet),
              { height: sheetHeight + 100, top: SCREEN_HEIGHT },
              sheetAnimatedStyle,
              style,
            ]}
          >
            {/* Handle */}
            {showHandle && (
              <View style={themed($handleContainer)}>
                <Animated.View
                  style={[themed($handle), handleIndicatorAnimatedStyle]}
                />
              </View>
            )}

            {/* Content */}
            <View style={themed($content)}>{children}</View>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
};

// ==========================================
// BottomSheet Header Component
// ==========================================

export interface BottomSheetHeaderProps {
  /** Header title */
  title?: string;
  /** Left action component */
  leftAction?: ReactNode;
  /** Right action component */
  rightAction?: ReactNode;
  /** Show border */
  showBorder?: boolean;
  /** Container style override */
  style?: ViewStyle;
  children?: ReactNode;
}

export const BottomSheetHeader: FC<BottomSheetHeaderProps> = ({
  title,
  leftAction,
  rightAction,
  showBorder = true,
  style,
  children,
}) => {
  const { themed } = useAppTheme();

  return (
    <View style={[themed($header), showBorder && themed($headerBorder), style]}>
      {leftAction && <View style={themed($headerAction)}>{leftAction}</View>}
      {title && (
        <View style={themed($headerTitleContainer)}>
          <Animated.Text style={themed($headerTitle)}>{title}</Animated.Text>
        </View>
      )}
      {children}
      {rightAction && <View style={themed($headerAction)}>{rightAction}</View>}
    </View>
  );
};

// ==========================================
// Styles
// ==========================================

const $gestureContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
});

const $backdrop: ThemedStyle<ViewStyle> = () => ({
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "black",
});

const $sheet: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  left: 0,
  right: 0,
  backgroundColor: colors.background,
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: -5 },
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 10,
});

const $handleContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  paddingVertical: spacing.sm,
});

const $handle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 4,
  borderRadius: 2,
  backgroundColor: colors.palette.neutral400,
});

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  paddingHorizontal: spacing.md,
});

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  minHeight: 48,
});

const $headerBorder: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
});

const $headerAction: ThemedStyle<ViewStyle> = () => ({
  minWidth: 44,
  alignItems: "center",
  justifyContent: "center",
});

const $headerTitleContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  alignItems: "center",
});

const $headerTitle: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 17,
  fontFamily: typography.primary.semiBold,
  color: colors.text,
});
