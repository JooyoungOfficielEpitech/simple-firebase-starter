import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  accessibilityLabel?: string;
  style?: ViewStyle;
  testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon = 'add-circle',
  accessibilityLabel = '게시글 작성하기',
  style,
  testID,
}) => {
  const pressed = useSharedValue(0);
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    pressed.value = withTiming(1, { duration: 100 });
    scale.value = withSpring(1.1, {
      damping: 10,
      stiffness: 200,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePressOut = () => {
    pressed.value = withTiming(0, { duration: 100 });
    scale.value = withSpring(1, {
      damping: 10,
      stiffness: 200,
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(pressed.value, [0, 1], [1, 0.9]);

    return {
      transform: [{ scale: scale.value }],
      opacity,
    };
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.fab, animatedStyle, style]}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <Ionicons name={icon} size={32} color="#FFFFFF" />
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 9999,
    backgroundColor: '#F29A2E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
    zIndex: 30,
  },
});
