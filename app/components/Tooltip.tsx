/**
 * Tooltip Component
 * 툴팁 컴포넌트 - 요소에 마우스를 올리거나 터치할 때 추가 정보 표시
 */

import { FC, useState, useRef, useCallback } from "react";
import {
  View,
  ViewStyle,
  TextStyle,
  Pressable,
  Modal,
  Dimensions,
  LayoutChangeEvent,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

import { Text } from "./Text";

// ==========================================
// Types
// ==========================================

export type TooltipPosition = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  /** 툴팁 내용 */
  content: string | React.ReactNode;
  /** 트리거 요소 */
  children: React.ReactNode;
  /** 툴팁 위치 */
  position?: TooltipPosition;
  /** 배경색 */
  backgroundColor?: string;
  /** 텍스트 색상 */
  textColor?: string;
  /** 비활성화 */
  disabled?: boolean;
  /** 최대 너비 */
  maxWidth?: number;
  /** 컨테이너 스타일 */
  style?: ViewStyle;
}

// ==========================================
// Component
// ==========================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const Tooltip: FC<TooltipProps> = ({
  content,
  children,
  position = "top",
  backgroundColor,
  textColor,
  disabled = false,
  maxWidth = 200,
  style,
}) => {
  const { themed, theme: { colors } } = useAppTheme();
  const [visible, setVisible] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const triggerRef = useRef<View>(null);

  const bgColor = backgroundColor || colors.palette.neutral800;
  const txtColor = textColor || colors.palette.neutral100;

  const measureTrigger = useCallback(() => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setTriggerLayout({ x, y, width, height });
    });
  }, []);

  const showTooltip = useCallback(() => {
    if (disabled) return;
    measureTrigger();
    setVisible(true);
  }, [disabled, measureTrigger]);

  const hideTooltip = useCallback(() => {
    setVisible(false);
  }, []);

  const getTooltipPosition = (): ViewStyle => {
    const { x, y, width, height } = triggerLayout;
    const tooltipOffset = 8;

    switch (position) {
      case "top":
        return {
          bottom: SCREEN_HEIGHT - y + tooltipOffset,
          left: x + width / 2,
          transform: [{ translateX: -maxWidth / 2 }],
        };
      case "bottom":
        return {
          top: y + height + tooltipOffset,
          left: x + width / 2,
          transform: [{ translateX: -maxWidth / 2 }],
        };
      case "left":
        return {
          top: y + height / 2,
          right: SCREEN_WIDTH - x + tooltipOffset,
          transform: [{ translateY: -20 }],
        };
      case "right":
        return {
          top: y + height / 2,
          left: x + width + tooltipOffset,
          transform: [{ translateY: -20 }],
        };
      default:
        return {};
    }
  };

  return (
    <>
      <Pressable
        ref={triggerRef}
        onPressIn={showTooltip}
        onPressOut={hideTooltip}
        onLongPress={showTooltip}
        style={style}
      >
        {children}
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={hideTooltip}
      >
        <Pressable style={$overlay} onPress={hideTooltip}>
          <Animated.View
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(150)}
            style={[
              $tooltip,
              { backgroundColor: bgColor, maxWidth },
              getTooltipPosition(),
            ]}
          >
            {typeof content === "string" ? (
              <Text size="xs" style={{ color: txtColor }}>
                {content}
              </Text>
            ) : (
              content
            )}
            <View
              style={[
                $arrow,
                { borderBottomColor: bgColor },
                position === "bottom" && $arrowTop,
                position === "left" && $arrowRight,
                position === "right" && $arrowLeft,
              ]}
            />
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
};

// ==========================================
// Styles
// ==========================================

const $overlay: ViewStyle = {
  flex: 1,
};

const $tooltip: ViewStyle = {
  position: "absolute",
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 8,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
};

const $arrow: ViewStyle = {
  position: "absolute",
  width: 0,
  height: 0,
  borderLeftWidth: 6,
  borderRightWidth: 6,
  borderBottomWidth: 6,
  borderLeftColor: "transparent",
  borderRightColor: "transparent",
  bottom: -6,
  left: "50%",
  marginLeft: -6,
  transform: [{ rotate: "180deg" }],
};

const $arrowTop: ViewStyle = {
  top: -6,
  bottom: undefined,
  transform: [{ rotate: "0deg" }],
};

const $arrowRight: ViewStyle = {
  right: -10,
  left: undefined,
  top: "50%",
  bottom: undefined,
  marginTop: -6,
  transform: [{ rotate: "90deg" }],
};

const $arrowLeft: ViewStyle = {
  left: -10,
  right: undefined,
  top: "50%",
  bottom: undefined,
  marginTop: -6,
  transform: [{ rotate: "-90deg" }],
};
