import React, { FC } from 'react'
import { View, Text } from 'react-native'

interface InfoRowProps {
  label: string
  value: string
  valueColor?: string
  colors: any
  spacing: any
}

export const InfoRow: FC<InfoRowProps> = ({
  label,
  value,
  valueColor,
  colors,
  spacing,
}) => {
  return (
    <View style={{ marginBottom: spacing.sm }}>
      <Text style={{ color: colors.textDim }}>{label}</Text>
      <Text style={{ 
        color: valueColor || colors.text,
        fontWeight: '600'
      }}>
        {value}
      </Text>
    </View>
  )
}
