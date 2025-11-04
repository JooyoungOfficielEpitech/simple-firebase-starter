import React, { FC } from 'react'
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native'

interface SettingButtonProps {
  onPress: () => void
  label: string
  backgroundColor?: string
  disabled?: boolean
  loading?: boolean
  spacing: any
}

export const SettingButton: FC<SettingButtonProps> = ({
  onPress,
  label,
  backgroundColor = '#007AFF',
  disabled = false,
  loading = false,
  spacing,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { 
          backgroundColor, 
          padding: spacing.md,
          marginBottom: spacing.sm,
          opacity: (disabled || loading) ? 0.5 : 1 
        }
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.buttonText}>{label}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
})
