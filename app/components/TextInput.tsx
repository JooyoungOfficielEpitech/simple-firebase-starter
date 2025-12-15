import React, { useState } from 'react'
import { View, TextInput as RNTextInput, Text, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native'
import { Eye, EyeOff } from 'lucide-react-native'
import { orphiTokens } from '@/design-system'

export interface OrphiTextInputProps extends TextInputProps {
  label?: string
  error?: string
  rightIcon?: React.ReactNode
}

export const OrphiTextInput: React.FC<OrphiTextInputProps> = ({
  label,
  error,
  secureTextEntry,
  rightIcon,
  style,
  ...props
}) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry)

  const toggleSecure = () => {
    setIsSecure(!isSecure)
  }

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={[styles.inputContainer, error && styles.inputError]}>
        <RNTextInput
          style={[styles.input, style]}
          secureTextEntry={isSecure}
          placeholderTextColor={orphiTokens.colors.gray400}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity onPress={toggleSecure} style={styles.iconButton}>
            {isSecure ? (
              <EyeOff size={20} color={orphiTokens.colors.gray500} strokeWidth={2} />
            ) : (
              <Eye size={20} color={orphiTokens.colors.gray500} strokeWidth={2} />
            )}
          </TouchableOpacity>
        )}

        {rightIcon && !secureTextEntry && <View style={styles.iconButton}>{rightIcon}</View>}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: orphiTokens.spacing.base,
  },
  label: {
    fontSize: orphiTokens.typography.sizes.sm,
    fontWeight: orphiTokens.typography.weights.medium,
    color: orphiTokens.colors.gray700,
    marginBottom: orphiTokens.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: orphiTokens.colors.white,
    borderRadius: orphiTokens.borderRadius.sm,
    borderWidth: 1,
    borderColor: orphiTokens.colors.gray200,
    paddingHorizontal: orphiTokens.spacing.base,
  },
  inputError: {
    borderColor: orphiTokens.colors.red500,
  },
  input: {
    flex: 1,
    fontSize: orphiTokens.typography.sizes.base,
    color: orphiTokens.colors.gray900,
    paddingVertical: orphiTokens.spacing.md,
  },
  iconButton: {
    padding: orphiTokens.spacing.xs,
  },
  errorText: {
    fontSize: orphiTokens.typography.sizes.xs,
    color: orphiTokens.colors.red500,
    marginTop: orphiTokens.spacing.xs,
  },
})
