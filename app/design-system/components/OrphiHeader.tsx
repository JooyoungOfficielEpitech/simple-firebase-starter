import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Bell, ChevronLeft } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { orphiTokens } from '../tokens'
import { useTheme } from '@/core/context/ThemeContext'

export interface OrphiHeaderProps {
  title: string
  subtitle?: string
  showBell?: boolean
  bellBadgeCount?: number
  onBellPress?: () => void
  showBack?: boolean
  onBackPress?: () => void
  style?: ViewStyle
}

export const OrphiHeader: React.FC<OrphiHeaderProps> = ({
  title,
  subtitle,
  showBell = false,
  bellBadgeCount = 0,
  onBellPress,
  showBack = false,
  onBackPress,
  style,
}) => {
  const { currentTheme } = useTheme()
  const { top } = useSafeAreaInsets()

  return (
    <LinearGradient
      colors={currentTheme.colors.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingTop: top + orphiTokens.spacing.md }, style]}
    >
      <View style={styles.content}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            activeOpacity={0.7}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <ChevronLeft size={28} color={orphiTokens.colors.white} strokeWidth={2.5} />
          </TouchableOpacity>
        )}

        <View style={styles.textContainer} pointerEvents="box-none">
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {showBell && (
          <TouchableOpacity
            style={styles.bellButton}
            onPress={onBellPress}
            activeOpacity={0.7}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Bell size={22} color={orphiTokens.colors.white} strokeWidth={2} />
            {bellBadgeCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {bellBadgeCount > 9 ? '9+' : bellBadgeCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: orphiTokens.spacing.xl,
    paddingBottom: orphiTokens.spacing.base,
    ...orphiTokens.borderRadius.header,
    ...orphiTokens.shadows.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: orphiTokens.typography.sizes.xl,
    fontWeight: orphiTokens.typography.weights.bold,
    color: orphiTokens.colors.white,
    marginBottom: orphiTokens.spacing.xs,
  },
  subtitle: {
    fontSize: orphiTokens.typography.sizes.sm,
    color: orphiTokens.colors.white,
    opacity: 0.9,
  },
  backButton: {
    padding: orphiTokens.spacing.md,
    marginRight: orphiTokens.spacing.md,
    marginLeft: -orphiTokens.spacing.md,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  bellButton: {
    padding: orphiTokens.spacing.md,
    position: 'relative',
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: orphiTokens.colors.red500,
    borderRadius: orphiTokens.borderRadius.full,
    minWidth: 18,
    height: 18,
    borderWidth: 2,
    borderColor: orphiTokens.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: orphiTokens.typography.weights.bold,
    color: orphiTokens.colors.white,
  },
})
