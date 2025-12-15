import React from 'react'
import { Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { orphiTokens } from '../tokens'
import { useTheme } from '@/core/context/ThemeContext'

export interface OrphiButtonProps {
  children: React.ReactNode
  onPress?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'text'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  disabled?: boolean
  loading?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  gradient?: boolean
}

export const OrphiButton: React.FC<OrphiButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  style,
  textStyle,
  gradient = false,
}) => {
  const { currentTheme } = useTheme()

  const buttonStyles = [
    styles.button,
    styles[size],
    fullWidth && styles.fullWidth,
    !gradient && variant === 'primary' && { backgroundColor: currentTheme.colors.primary600 },
    !gradient && variant !== 'primary' && styles[variant],
    disabled && styles.disabled,
    style,
  ]

  const textStyles = [
    styles.buttonText,
    styles[`${size}Text`],
    styles[`${variant}Text`],
    disabled && styles.disabledText,
    textStyle,
  ]

  const content = (
    <>
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? orphiTokens.colors.white : currentTheme.colors.primary600}
        />
      ) : (
        <Text style={textStyles}>{children}</Text>
      )}
    </>
  )

  if (gradient && variant === 'primary' && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.95}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={[styles.button, styles[size], fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={currentTheme.colors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.95}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={buttonStyles}
    >
      {content}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: orphiTokens.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Sizes
  sm: {
    paddingVertical: orphiTokens.spacing.sm,
    paddingHorizontal: orphiTokens.spacing.base,
    minHeight: 36,
  },
  md: {
    paddingVertical: orphiTokens.spacing.md,
    paddingHorizontal: orphiTokens.spacing.lg,
    minHeight: 44,
  },
  lg: {
    paddingVertical: orphiTokens.spacing.base,
    paddingHorizontal: orphiTokens.spacing.xl,
    minHeight: 52,
  },

  // Variants
  primary: {
    backgroundColor: orphiTokens.colors.green600,
    ...orphiTokens.shadows.md,
  },
  secondary: {
    backgroundColor: orphiTokens.colors.gray200,
  },
  danger: {
    backgroundColor: orphiTokens.colors.red500,
    ...orphiTokens.shadows.sm,
  },
  text: {
    backgroundColor: 'transparent',
  },

  // States
  disabled: {
    opacity: 0.5,
  },

  // Layout
  fullWidth: {
    width: '100%',
  },

  // Text styles
  buttonText: {
    fontWeight: orphiTokens.typography.weights.semibold,
  },
  smText: {
    fontSize: orphiTokens.typography.sizes.sm,
  },
  mdText: {
    fontSize: orphiTokens.typography.sizes.base,
  },
  lgText: {
    fontSize: orphiTokens.typography.sizes.lg,
  },
  primaryText: {
    color: orphiTokens.colors.white,
  },
  secondaryText: {
    color: orphiTokens.colors.gray700,
  },
  dangerText: {
    color: orphiTokens.colors.white,
  },
  textText: {
    color: orphiTokens.colors.green600,
  },
  disabledText: {
    opacity: 0.7,
  },
})
