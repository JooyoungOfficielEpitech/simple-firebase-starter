import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useAppTheme } from '@/theme/context'
import { useAlert } from '@/hooks/useAlert'
import { storage } from '@/utils/storage'
import { AlertModal } from '@/components/AlertModal'

export const ThemeDebugger = () => {
  const { theme, themeContext, wickedCharacterTheme, setWickedCharacterTheme } = useAppTheme()
  const { alertState, alert, hideAlert } = useAlert()

  const showThemeInfo = () => {
    const storageKeys = storage.getAllKeys()
    const themeScheme = storage.getString('ignite.themeScheme')
    const wickedScheme = storage.getString('ignite.wickedCharacterScheme')
    
    alert('Theme Debug Info', 
      `Current Theme: ${themeContext}\nWicked Character: ${wickedCharacterTheme}\nBackground Color: ${theme.colors.background}\nStorage Theme: ${themeScheme || 'undefined'}\nStorage Wicked: ${wickedScheme || 'undefined'}\nAll Keys: ${storageKeys.join(', ')}`)
  }

  const switchToGlinda = () => {
    setWickedCharacterTheme('glinda')
    alert('Switched to Glinda Theme')
  }

  const switchToElphaba = () => {
    setWickedCharacterTheme('elphaba')
    alert('Switched to Elphaba Theme')
  }

  const clearStorage = () => {
    storage.delete('ignite.themeScheme')
    storage.delete('ignite.wickedCharacterScheme')
    alert('Storage Cleared', 'App restart required')
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
      
      {/* Alert Modal */}
      <AlertModal
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        onDismiss={hideAlert}
        dismissable={alertState.dismissable}
      />
    </View>
  )
}