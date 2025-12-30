import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { SheepCharacter, SheepVariant } from './SheepCharacter';

interface CharacterSelectorProps {
  value: SheepVariant;
  onChange: (variant: SheepVariant) => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CharacterOption: React.FC<{
  variant: SheepVariant;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}> = ({ variant, selected, onPress, disabled }) => {
  const pressed = useSharedValue(0);
  const selectedValue = useSharedValue(selected ? 1 : 0);

  React.useEffect(() => {
    selectedValue.value = withTiming(selected ? 1 : 0, { duration: 200 });
  }, [selected, selectedValue]);

  const handlePressIn = () => {
    if (!disabled) {
      pressed.value = withTiming(1, { duration: 100 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handlePressOut = () => {
    pressed.value = withTiming(0, { duration: 100 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      pressed.value,
      [0, 1],
      [selected ? 1.05 : 1, 0.95]
    );

    return {
      transform: [{ scale }],
    };
  });

  const animatedBorderStyle = useAnimatedStyle(() => {
    const borderColor = selected ? '#F29A2E' : '#D1D5DB';
    const backgroundColor = selected ? '#FFF8F0' : '#FFFFFF';

    return {
      borderColor,
      backgroundColor,
    };
  });

  const label = variant === 'white' ? '화이트양' : '블랙양';

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.option, animatedStyle, animatedBorderStyle]}
      accessible={true}
      accessibilityRole="radio"
      accessibilityLabel={`${label} 선택`}
      accessibilityState={{ selected, disabled }}
    >
      <View style={styles.optionContent}>
        <SheepCharacter
          variant={variant}
          size="medium"
          animate={false}
        />
        <Text style={styles.optionLabel}>{label}</Text>
      </View>
    </AnimatedPressable>
  );
};

export const CharacterSelector: React.FC<CharacterSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="radiogroup"
      accessibilityLabel="양 캐릭터 선택"
    >
      <CharacterOption
        variant="white"
        selected={value === 'white'}
        onPress={() => onChange('white')}
        disabled={disabled}
      />
      <CharacterOption
        variant="black"
        selected={value === 'black'}
        onPress={() => onChange('black')}
        disabled={disabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 16,
  },
  option: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionContent: {
    alignItems: 'center',
    gap: 8,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    color: '#111111',
  },
});
