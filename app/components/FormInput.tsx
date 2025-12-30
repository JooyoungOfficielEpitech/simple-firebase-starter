import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

interface FormInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  multiline?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
  disabled?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  containerStyle,
  multiline = false,
  maxLength,
  showCharCount = false,
  disabled = false,
  value,
  onFocus,
  onBlur,
  accessibilityLabel,
  accessibilityHint,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const borderColorAnim = useSharedValue(0);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    borderColorAnim.value = withTiming(1, { duration: 200 });
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    borderColorAnim.value = withTiming(0, { duration: 200 });
    onBlur?.(e);
  };

  const animatedStyle = useAnimatedStyle(() => {
    let borderColor = '#F5B740'; // default

    if (error) {
      borderColor = '#EF4444'; // error
    } else if (borderColorAnim.value > 0) {
      borderColor = '#F29A2E'; // focused
    }

    return {
      borderColor,
    };
  });

  const getBackgroundColor = () => {
    if (disabled) {
      return '#F3F4F6';
    }
    return '#FFFFFF';
  };

  const getTextColor = () => {
    if (disabled) {
      return '#9CA3AF';
    }
    return '#111111';
  };

  const characterCount = value?.toString().length || 0;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label} accessible={false}>
          {label}
        </Text>
      )}
      <Animated.View style={[styles.inputWrapper, animatedStyle]}>
        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
            {
              backgroundColor: getBackgroundColor(),
              color: getTextColor(),
            },
          ]}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          multiline={multiline}
          maxLength={maxLength}
          placeholderTextColor="#9CA3AF"
          textAlignVertical={multiline ? 'top' : 'center'}
          accessible={true}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint || '입력 필드'}
          accessibilityState={{ disabled }}
          {...textInputProps}
        />
      </Animated.View>
      <View style={styles.footer}>
        {error && (
          <Text style={styles.errorText} accessibilityRole="alert">
            {error}
          </Text>
        )}
        {showCharCount && maxLength && (
          <Text
            style={[
              styles.charCount,
              characterCount > maxLength && styles.charCountError,
            ]}
            accessible={true}
            accessibilityLabel={`${characterCount}자 / ${maxLength}자`}
          >
            {characterCount} / {maxLength}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    color: '#111111',
    marginBottom: 8,
  },
  inputWrapper: {
    borderWidth: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  input: {
    width: '100%',
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    lineHeight: 24,
  },
  multilineInput: {
    minHeight: 120,
    maxHeight: 240,
    paddingTop: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#EF4444',
    flex: 1,
  },
  charCount: {
    fontSize: 12,
    lineHeight: 16,
    color: '#222222',
    opacity: 0.6,
  },
  charCountError: {
    color: '#EF4444',
    opacity: 1,
  },
});
