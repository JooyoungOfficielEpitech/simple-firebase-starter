import React from 'react'
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native'
import { Clock } from 'lucide-react-native'
import { orphiTokens } from '../tokens'
import { useTheme } from '@/core/context/ThemeContext'

export interface OrphiBadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
  icon?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
}

export const OrphiBadge: React.FC<OrphiBadgeProps> = ({
  children,
  variant = 'success',
  size = 'sm',
  icon = false,
  style,
  textStyle,
}) => {
  const { currentTheme } = useTheme()

  const badgeStyles = [
    styles.badge,
    variant === 'success' && { backgroundColor: currentTheme.colors.primary100 },
    variant !== 'success' && styles[variant],
    styles[size],
    style,
  ]

  const textStyles = [
    styles.text,
    styles[`${size}Text`],
    variant === 'success' && { color: currentTheme.colors.primary600 },
    variant !== 'success' && styles[`${variant}Text`],
    textStyle,
  ]

  return (
    <View style={badgeStyles}>
      {icon && (
        <Clock
          size={size === 'sm' ? 12 : size === 'md' ? 14 : 16}
          color={variant === 'success' ? currentTheme.colors.primary600 : orphiTokens.colors.gray600}
          strokeWidth={2}
          style={styles.icon}
        />
      )}
      <Text style={textStyles}>{children}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: orphiTokens.borderRadius.full,
    alignSelf: 'flex-start',
  },

  // Sizes
  sm: {
    paddingVertical: 4,
    paddingHorizontal: orphiTokens.spacing.sm,
  },
  md: {
    paddingVertical: 6,
    paddingHorizontal: orphiTokens.spacing.md,
  },
  lg: {
    paddingVertical: orphiTokens.spacing.sm,
    paddingHorizontal: orphiTokens.spacing.base,
  },

  // Variants (success는 동적으로 처리됨)
  warning: {
    backgroundColor: orphiTokens.colors.yellow50,
  },
  danger: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  info: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  neutral: {
    backgroundColor: orphiTokens.colors.gray200,
  },

  // Icon
  icon: {
    marginRight: 4,
  },

  // Text styles
  text: {
    fontWeight: orphiTokens.typography.weights.medium,
  },
  smText: {
    fontSize: orphiTokens.typography.sizes.xs,
  },
  mdText: {
    fontSize: orphiTokens.typography.sizes.sm,
  },
  lgText: {
    fontSize: orphiTokens.typography.sizes.base,
  },
  // successText는 동적으로 처리됨
  warningText: {
    color: orphiTokens.colors.orange800,
  },
  dangerText: {
    color: orphiTokens.colors.red500,
  },
  infoText: {
    color: '#2563eb',
  },
  neutralText: {
    color: orphiTokens.colors.gray700,
  },
})
