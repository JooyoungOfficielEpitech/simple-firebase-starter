import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

export type SheepVariant = 'white' | 'black';
export type SheepSize = 'large' | 'medium';

interface SheepCharacterProps {
  variant?: SheepVariant;
  size?: SheepSize;
  animate?: boolean;
  accessibilityLabel?: string;
}

const SIZES = {
  large: {
    container: 140,
    body: { width: 100, height: 85 },
    head: 68,
    horns: { width: 28, height: 36.4 },
    eyes: 8,
    blush: { width: 16, height: 11.2 },
    legs: { width: 15, height: 30 },
  },
  medium: {
    container: 60,
    body: { width: 40, height: 34 },
    head: 28,
    horns: { width: 12, height: 15.6 },
    eyes: 4,
    blush: { width: 8, height: 5.6 },
    legs: { width: 6, height: 12 },
  },
};

const COLORS = {
  white: {
    body: '#FFF8F0',
    border: '#111111',
  },
  black: {
    body: '#2F2F32',
    border: '#111111',
  },
  shared: {
    horns: '#C49159',
    eyes: '#111111',
    blush: '#FFCBC0',
  },
};

export const SheepCharacter: React.FC<SheepCharacterProps> = ({
  variant = 'white',
  size = 'medium',
  animate = false,
  accessibilityLabel,
}) => {
  const bounceAnim = useSharedValue(0);
  const dimensions = SIZES[size];
  const colors = COLORS[variant];

  useEffect(() => {
    if (animate) {
      bounceAnim.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [animate, bounceAnim]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounceAnim.value }],
  }));

  const hornLeftStyle = {
    width: dimensions.horns.width,
    height: dimensions.horns.height,
    left: size === 'large' ? 43 : 17,
    top: size === 'large' ? 0 : 0,
  };

  const hornRightStyle = {
    width: dimensions.horns.width,
    height: dimensions.horns.height,
    right: size === 'large' ? 43 : 17,
    top: size === 'large' ? 0 : 0,
  };

  const eyeLeftStyle = {
    width: dimensions.eyes,
    height: dimensions.eyes,
    left: size === 'large' ? 58 : 24,
    top: size === 'large' ? 41 : 17,
  };

  const eyeRightStyle = {
    width: dimensions.eyes,
    height: dimensions.eyes,
    right: size === 'large' ? 58 : 24,
    top: size === 'large' ? 41 : 17,
  };

  const blushLeftStyle = {
    width: dimensions.blush.width,
    height: dimensions.blush.height,
    left: size === 'large' ? 43 : 17,
    top: size === 'large' ? 51 : 21,
  };

  const blushRightStyle = {
    width: dimensions.blush.width,
    height: dimensions.blush.height,
    right: size === 'large' ? 43 : 17,
    top: size === 'large' ? 51 : 21,
  };

  const legLeftStyle = {
    width: dimensions.legs.width,
    height: dimensions.legs.height,
    left: size === 'large' ? 42 : 17,
    bottom: size === 'large' ? 0 : 0,
  };

  const legRightStyle = {
    width: dimensions.legs.width,
    height: dimensions.legs.height,
    right: size === 'large' ? 43 : 17,
    bottom: size === 'large' ? 0 : 0,
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { width: dimensions.container, height: dimensions.container },
        animate && animatedStyle,
      ]}
      accessible={true}
      accessibilityLabel={accessibilityLabel || `${variant === 'white' ? '화이트' : '블랙'}양 캐릭터`}
      accessibilityRole="image"
    >
      {/* Body */}
      <View
        style={[
          styles.body,
          {
            width: dimensions.body.width,
            height: dimensions.body.height,
            backgroundColor: colors.body,
            borderColor: colors.border,
            bottom: size === 'large' ? 20 : 8,
          },
        ]}
      />

      {/* Head */}
      <View
        style={[
          styles.head,
          {
            width: dimensions.head,
            height: dimensions.head,
            backgroundColor: colors.body,
            borderColor: colors.border,
            top: size === 'large' ? 14 : 6,
          },
        ]}
      />

      {/* Horns */}
      <View
        style={[
          styles.horn,
          hornLeftStyle,
          { backgroundColor: COLORS.shared.horns },
        ]}
      />
      <View
        style={[
          styles.horn,
          hornRightStyle,
          { backgroundColor: COLORS.shared.horns },
        ]}
      />

      {/* Eyes */}
      <View
        style={[
          styles.eye,
          eyeLeftStyle,
          { backgroundColor: COLORS.shared.eyes },
        ]}
      />
      <View
        style={[
          styles.eye,
          eyeRightStyle,
          { backgroundColor: COLORS.shared.eyes },
        ]}
      />

      {/* Blush */}
      <View
        style={[
          styles.blush,
          blushLeftStyle,
          { backgroundColor: COLORS.shared.blush },
        ]}
      />
      <View
        style={[
          styles.blush,
          blushRightStyle,
          { backgroundColor: COLORS.shared.blush },
        ]}
      />

      {/* Legs */}
      <View
        style={[
          styles.leg,
          legLeftStyle,
          { backgroundColor: colors.body },
        ]}
      />
      <View
        style={[
          styles.leg,
          legRightStyle,
          { backgroundColor: colors.body },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 3,
  },
  head: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horn: {
    position: 'absolute',
    borderRadius: 9999,
  },
  eye: {
    position: 'absolute',
    borderRadius: 9999,
  },
  blush: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.6,
  },
  leg: {
    position: 'absolute',
    borderRadius: 9999,
  },
});
