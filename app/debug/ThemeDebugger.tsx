import React from 'react'
import { View, Text, TouchableOpacity, Alert } from 'react-native'
import { useAppTheme } from '@/theme/context'
import { storage } from '@/utils/storage'

export const ThemeDebugger = () => {
  const { theme, themeContext, wickedCharacterTheme, setWickedCharacterTheme } = useAppTheme()

  const showThemeInfo = () => {
    const storageKeys = storage.getAllKeys()
    const themeScheme = storage.getString('ignite.themeScheme')
    const wickedScheme = storage.getString('ignite.wickedCharacterScheme')
    
    Alert.alert('Theme Debug Info', 
      `Current Theme: ${themeContext}
Wicked Character: ${wickedCharacterTheme}
Background Color: ${theme.colors.background}
Storage Theme: ${themeScheme || 'undefined'}
Storage Wicked: ${wickedScheme || 'undefined'}
All Keys: ${storageKeys.join(', ')}`)
  }

  const switchToGlinda = () => {
    setWickedCharacterTheme('glinda')
    Alert.alert('Switched to Glinda Theme')
  }

  const switchToElphaba = () => {
    setWickedCharacterTheme('elphaba')
    Alert.alert('Switched to Elphaba Theme')
  }

  const clearStorage = () => {
    storage.delete('ignite.themeScheme')
    storage.delete('ignite.wickedCharacterScheme')
    Alert.alert('Storage Cleared', 'App restart required')
  }

  return (
    <View style={{ 
      position: 'absolute', 
      top: 100, 
      right: 20, 
      zIndex: 1000,
      backgroundColor: 'rgba(0,0,0,0.8)',
      padding: 10,
      borderRadius: 8
    }}>
      <TouchableOpacity onPress={showThemeInfo} style={{ marginBottom: 5 }}>
        <Text style={{ color: 'white', fontSize: 12 }}>🎨 Theme Info</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={switchToElphaba} style={{ marginBottom: 5 }}>
        <Text style={{ color: 'white', fontSize: 12 }}>🟢 Elphaba</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={switchToGlinda} style={{ marginBottom: 5 }}>
        <Text style={{ color: 'white', fontSize: 12 }}>🩷 Glinda</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={clearStorage}>
        <Text style={{ color: 'white', fontSize: 12 }}>🗑️ Clear</Text>
      </TouchableOpacity>
    </View>
  )
}