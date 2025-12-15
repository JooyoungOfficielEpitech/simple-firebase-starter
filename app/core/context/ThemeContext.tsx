import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ThemeName, Theme, themes } from '@/design-system/tokens/orphi.tokens'

interface ThemeContextType {
  currentTheme: Theme
  themeName: ThemeName
  setTheme: (themeName: ThemeName) => Promise<void>
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = '@orphi:theme'
const DEFAULT_THEME: ThemeName = 'elphaba'

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>(DEFAULT_THEME)
  const [isLoading, setIsLoading] = useState(true)

  // Load saved theme on mount
  useEffect(() => {
    loadSavedTheme()
  }, [])

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY)
      if (savedTheme && isValidThemeName(savedTheme)) {
        setThemeName(savedTheme as ThemeName)
      }
    } catch (error) {
      console.error('Failed to load theme:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const setTheme = async (newThemeName: ThemeName) => {
    try {
      setThemeName(newThemeName)
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newThemeName)
    } catch (error) {
      console.error('Failed to save theme:', error)
    }
  }

  const isValidThemeName = (name: string): boolean => {
    return ['elphaba', 'glinda', 'gwynplaine', 'johanna'].includes(name)
  }

  const currentTheme = themes[themeName]

  const value: ThemeContextType = {
    currentTheme,
    themeName,
    setTheme,
    isLoading,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
