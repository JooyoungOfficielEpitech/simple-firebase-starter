import React from 'react'
import { View, TextInput, StyleSheet, ViewStyle } from 'react-native'
import { Search } from 'lucide-react-native'
import { orphiTokens } from '@/design-system'

export interface SearchBarProps {
  placeholder?: string
  value?: string
  onChangeText?: (text: string) => void
  style?: ViewStyle
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = '검색',
  value,
  onChangeText,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Search size={20} color={orphiTokens.colors.gray500} strokeWidth={2} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={orphiTokens.colors.gray400}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: orphiTokens.colors.white,
    borderRadius: orphiTokens.borderRadius.sm,
    paddingHorizontal: orphiTokens.spacing.base,
    paddingVertical: orphiTokens.spacing.md,
    gap: orphiTokens.spacing.sm,
    borderWidth: 1,
    borderColor: orphiTokens.colors.gray200,
  },
  input: {
    flex: 1,
    fontSize: orphiTokens.typography.sizes.base,
    color: orphiTokens.colors.gray900,
    padding: 0,
  },
})
