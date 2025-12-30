import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface PrimaryButtonProps {
  onPress: () => void;
  children: string;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  onPress,
  children,
  disabled = false,
  loading = false,
  style,
  testID,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const pressed = useSharedValue(0);

  const handlePressIn = () => {
    if (!disabled && !loading) {
      pressed.value = withTiming(1, { duration: 100 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    pressed.value = withTiming(0, { duration: 100 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressed.value, [0, 1], [1, 0.96]);

    return {
      transform: [{ scale }],
    };
  });

  const getBackgroundColor = () => {
    if (disabled || loading) {
      return 'rgba(242, 154, 46, 0.35)';
    }
    return '#F29A2E';
  };

  const getTextColor = () => {
    if (disabled || loading) {
      return '#999999';
    }
    return '#111111';
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        animatedStyle,
        style,
      ]}
      testID={testID}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || children}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#111111" />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>
          {children}
        </Text>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    minWidth: 120,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    textAlign: 'center',
  },
});
