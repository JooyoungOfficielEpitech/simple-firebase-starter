import React, { FC, ReactNode } from 'react'
import { View, Text } from 'react-native'

interface SettingSectionProps {
  title: string
  children: ReactNode
  colors: any
  spacing: any
}

export const SettingSection: FC<SettingSectionProps> = ({
  title,
  children,
  colors,
  spacing,
}) => {
  return (
    <View style={{
      backgroundColor: colors.palette.neutral100,
      padding: spacing.md,
      borderRadius: 12,
      marginBottom: spacing.lg,
    }}>
      <Text style={{
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.sm,
      }}>
        {title}
      </Text>
      {children}
    </View>
  )
}
