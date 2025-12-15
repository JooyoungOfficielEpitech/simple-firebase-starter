import React from 'react'
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native'
import { orphiTokens } from '../tokens'

export interface OrphiCardProps {
  children: React.ReactNode
  onPress?: () => void
  style?: ViewStyle
  variant?: 'elevated' | 'outlined' | 'flat'
  shadow?: 'sm' | 'md' | 'lg' | 'xl'
}

export const OrphiCard: React.FC<OrphiCardProps> = ({
  children,
  onPress,
  style,
  variant = 'elevated',
  shadow = 'lg',
}) => {
  const Container = onPress ? TouchableOpacity : View

  const cardStyles = [
    styles.card,
    variant === 'elevated' && orphiTokens.shadows[shadow],
    variant === 'outlined' && styles.outlined,
    variant === 'flat' && styles.flat,
    style,
  ]

  return (
    <Container onPress={onPress} activeOpacity={0.7} style={cardStyles}>
      {children}
    </Container>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: orphiTokens.colors.white,
    borderRadius: orphiTokens.borderRadius.md,
    padding: orphiTokens.spacing.lg,
  },
  outlined: {
    borderWidth: 1,
    borderColor: orphiTokens.colors.gray200,
  },
  flat: {
    backgroundColor: orphiTokens.colors.gray50,
  },
})
