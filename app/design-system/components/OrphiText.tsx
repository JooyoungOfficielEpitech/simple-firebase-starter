import React from 'react'
import { Text, TextStyle } from 'react-native'
import { orphiTokens } from '../tokens/orphi.tokens'

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption'
type TextColor = keyof typeof orphiTokens.colors

export interface OrphiTextProps {
  variant?: TextVariant
  color?: TextColor
  children: React.ReactNode
  style?: TextStyle
}

const variantStyles: Record<TextVariant, TextStyle> = {
  h1: {
    fontSize: orphiTokens.typography.sizes['2xl'],
    fontWeight: orphiTokens.typography.weights.bold,
    color: orphiTokens.colors.gray900,
  },
  h2: {
    fontSize: orphiTokens.typography.sizes.xl,
    fontWeight: orphiTokens.typography.weights.bold,
    color: orphiTokens.colors.gray900,
  },
  h3: {
    fontSize: orphiTokens.typography.sizes.lg,
    fontWeight: orphiTokens.typography.weights.semibold,
    color: orphiTokens.colors.gray900,
  },
  h4: {
    fontSize: orphiTokens.typography.sizes.base,
    fontWeight: orphiTokens.typography.weights.semibold,
    color: orphiTokens.colors.gray900,
  },
  body: {
    fontSize: orphiTokens.typography.sizes.base,
    fontWeight: orphiTokens.typography.weights.regular,
    color: orphiTokens.colors.gray700,
  },
  caption: {
    fontSize: orphiTokens.typography.sizes.sm,
    fontWeight: orphiTokens.typography.weights.regular,
    color: orphiTokens.colors.gray500,
  },
}

export const OrphiText: React.FC<OrphiTextProps> = ({
  variant = 'body',
  color,
  children,
  style,
}) => {
  const baseStyle = variantStyles[variant]
  const colorStyle = color ? { color: orphiTokens.colors[color] } : {}

  return <Text style={[baseStyle, colorStyle, style]}>{children}</Text>
}
