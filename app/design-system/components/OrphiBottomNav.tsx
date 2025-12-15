import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { Home, Music, User, Settings } from 'lucide-react-native'
import { orphiTokens } from '../tokens'
import { useTheme } from '@/core/context/ThemeContext'

export interface OrphiBottomNavProps {
  activeRoute: string
  onNavigate: (route: string) => void
}

export interface TabItem {
  name: string
  icon: typeof Home
  route: string
}

const tabs: TabItem[] = [
  { name: '홈', icon: Home, route: 'Home' },
  { name: '연습실', icon: Music, route: 'Practice' },
  { name: '프로필', icon: User, route: 'Profile' },
  { name: '설정', icon: Settings, route: 'Settings' },
]

export const OrphiBottomNav: React.FC<OrphiBottomNavProps> = ({
  activeRoute,
  onNavigate,
}) => {
  const { currentTheme } = useTheme()

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {tabs.map((tab) => {
          const isActive = activeRoute === tab.route
          const Icon = tab.icon

          return (
            <TouchableOpacity
              key={tab.route}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => onNavigate(tab.route)}
              activeOpacity={0.8}
            >
              <Icon
                size={24}
                color={isActive ? currentTheme.colors.primary600 : orphiTokens.colors.gray500}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.tabText,
                  isActive && { color: currentTheme.colors.primary600 },
                ]}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: orphiTokens.colors.white95,
    borderTopWidth: 1,
    borderTopColor: orphiTokens.colors.gray200,
    paddingHorizontal: orphiTokens.spacing['2xl'],
    paddingVertical: orphiTokens.spacing.base,
    paddingBottom: Platform.OS === 'ios' ? orphiTokens.spacing.xl : orphiTokens.spacing.base,
    ...orphiTokens.borderRadius.bottomSheet,
    ...orphiTokens.shadows.xl,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: orphiTokens.spacing.xs,
    paddingVertical: orphiTokens.spacing.xs,
    opacity: 0.6,
  },
  tabActive: {
    opacity: 1,
  },
  tabText: {
    fontSize: orphiTokens.typography.sizes.xs,
    fontWeight: orphiTokens.typography.weights.medium,
    color: orphiTokens.colors.gray500,
  },
  tabTextActive: {
    fontWeight: orphiTokens.typography.weights.semibold,
  },
})
