/**
 * Slider Component
 * 슬라이더 컴포넌트 - 범위 값 선택에 사용
 */

import { FC, useCallback } from "react";
import { View, ViewStyle, TextStyle, LayoutChangeEvent } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

import { Text } from "./Text";

// ==========================================
// Types
// ==========================================

export type SliderSize = "sm" | "md" | "lg";

export interface SliderProps {
  /** Current value */
  value?: number;
  /** Default value (uncontrolled) */
  defaultValue?: number;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Callback when value changes */
  onChange?: (value: number) => void;
  /** Callback when sliding ends */
  onChangeEnd?: (value: number) => void;
  /** Size variant */
  size?: SliderSize;
  /** Show value label */
  showValue?: boolean;
  /** Show min/max labels */
  showLabels?: boolean;
  /** Custom track color */
  trackColor?: string;
  /** Custom active track color */
  activeTrackColor?: string;
  /** Custom thumb color */
  thumbColor?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Container style override */
  style?: ViewStyle;
}

// ==========================================
// Component
// ==========================================

export const Slider: FC<SliderProps> = ({
  value: controlledValue,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  onChangeEnd,
  size = "md",
  showValue = false,
  showLabels = false,
  trackColor,
  activeTrackColor,
  thumbColor,
  disabled = false,
  style,
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme();

  const trackWidth = useSharedValue(0);
  const internalValue = useSharedValue(controlledValue ?? defaultValue);
  const translateX = useSharedValue(0);
  const context = useSharedValue({ x: 0 });

  // Get size configuration
  const getSizeConfig = () => {
    switch (size) {
      case "sm":
        return { trackHeight: 4, thumbSize: 16 };
      case "lg":
        return { trackHeight: 8, thumbSize: 28 };
      default:
        return { trackHeight: 6, thumbSize: 22 };
    }
  };

  const sizeConfig = getSizeConfig();

  // Convert value to position
  const valueToPosition = useCallback(
    (val: number) => {
      const normalizedValue = (val - min) / (max - min);
      return normalizedValue * trackWidth.value;
    },
    [min, max, trackWidth],
  );

  // Convert position to value
  const positionToValue = useCallback(
    (pos: number) => {
      const normalizedPos = pos / trackWidth.value;
      const rawValue = normalizedPos * (max - min) + min;
      // Apply step
      const steppedValue = Math.round(rawValue / step) * step;
      return Math.max(min, Math.min(max, steppedValue));
    },
    [min, max, step, trackWidth],
  );

  const handleValueChange = useCallback(
    (val: number) => {
      onChange?.(val);
    },
    [onChange],
  );

  const handleValueChangeEnd = useCallback(
    (val: number) => {
      onChangeEnd?.(val);
    },
    [onChangeEnd],
  );

  const gesture = Gesture.Pan()
    .enabled(!disabled)
    .onStart(() => {
      context.value = { x: translateX.value };
    })
    .onUpdate((event) => {
      const newX = Math.max(
        0,
        Math.min(trackWidth.value, event.translationX + context.value.x),
      );
      translateX.value = newX;
      const newValue = positionToValue(newX);
      internalValue.value = newValue;
      runOnJS(handleValueChange)(newValue);
    })
    .onEnd(() => {
      const finalValue = positionToValue(translateX.value);
      runOnJS(handleValueChangeEnd)(finalValue);
    });

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    trackWidth.value = width - sizeConfig.thumbSize;
    translateX.value = valueToPosition(controlledValue ?? defaultValue);
  };

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const activeTrackAnimatedStyle = useAnimatedStyle(() => ({
    width: translateX.value + sizeConfig.thumbSize / 2,
  }));

  const displayValue =
    controlledValue !== undefined
      ? controlledValue
      : Math.round(internalValue.value);

  return (
    <View style={[themed($container), style]}>
      {/* Value label */}
      {showValue && (
        <View style={themed($valueContainer)}>
          <Text style={themed($valueText)}>{displayValue}</Text>
        </View>
      )}

      {/* Slider */}
      <GestureHandlerRootView style={themed($sliderContainer)}>
        <View
          style={[
            themed($track),
            {
              height: sizeConfig.trackHeight,
              borderRadius: sizeConfig.trackHeight / 2,
              backgroundColor: trackColor || colors.palette.neutral300,
            },
          ]}
          onLayout={handleLayout}
        >
          {/* Active track */}
          <Animated.View
            style={[
              themed($activeTrack),
              {
                height: sizeConfig.trackHeight,
                borderRadius: sizeConfig.trackHeight / 2,
                backgroundColor: activeTrackColor || colors.tint,
              },
              activeTrackAnimatedStyle,
            ]}
          />

          {/* Thumb */}
          <GestureDetector gesture={gesture}>
            <Animated.View
              style={[
                themed($thumb),
                {
                  width: sizeConfig.thumbSize,
                  height: sizeConfig.thumbSize,
                  borderRadius: sizeConfig.thumbSize / 2,
                  backgroundColor: thumbColor || colors.palette.neutral100,
                  top: -(sizeConfig.thumbSize - sizeConfig.trackHeight) / 2,
                },
                disabled && { opacity: 0.5 },
                thumbAnimatedStyle,
              ]}
            />
          </GestureDetector>
        </View>
      </GestureHandlerRootView>

      {/* Min/Max labels */}
      {showLabels && (
        <View style={themed($labelsContainer)}>
          <Text style={themed($labelText)}>{min}</Text>
          <Text style={themed($labelText)}>{max}</Text>
        </View>
      )}
    </View>
  );
};

// ==========================================
// Styles
// ==========================================

const $container: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
});

const $valueContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  marginBottom: spacing.xs,
});

const $valueText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.semiBold,
  color: colors.text,
});

const $sliderContainer: ThemedStyle<ViewStyle> = () => ({
  justifyContent: "center",
});

const $track: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  position: "relative",
});

const $activeTrack: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  left: 0,
  top: 0,
});

const $thumb: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 4,
  borderWidth: 2,
  borderColor: colors.tint,
});

const $labelsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: spacing.xs,
});

const $labelText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.normal,
  color: colors.textDim,
});
