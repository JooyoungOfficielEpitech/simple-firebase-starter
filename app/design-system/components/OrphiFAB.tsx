import React from 'react'
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Plus } from 'lucide-react-native'
import { orphiTokens } from '../tokens'
import { useTheme } from '@/core/context/ThemeContext'

export interface OrphiFABProps {
  onPress: () => void
  icon?: React.ReactNode
  size?: number
  position?: 'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft'
  offset?: { right?: number; left?: number; top?: number; bottom?: number }
  style?: ViewStyle
}

export const OrphiFAB: React.FC<OrphiFABProps> = ({
  onPress,
  icon,
  size = 64,
  position = 'bottomRight',
  offset = {},
  style,
}) => {
  const { currentTheme } = useTheme()

  const defaultOffset = {
    bottomRight: { right: 24, bottom: 96 },
    bottomLeft: { left: 24, bottom: 96 },
    topRight: { right: 24, top: 96 },
    topLeft: { left: 24, top: 96 },
  }

  const positionStyle = {
    ...defaultOffset[position],
    ...offset,
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[
        styles.fab,
        { width: size, height: size, borderRadius: size / 4 },
        positionStyle,
        style,
      ]}
    >
      <LinearGradient
        colors={currentTheme.colors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { borderRadius: size / 4 }]}
      >
        {icon || <Plus size={size / 2} color={orphiTokens.colors.white} strokeWidth={2.5} />}
      </LinearGradient>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    ...orphiTokens.shadows.xl,
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
