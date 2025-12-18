import React, { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Bell, Lock, Info, ChevronRight } from 'lucide-react-native'
import { OrphiHeader, OrphiCard, orphiTokens } from '@/design-system'
import { ThemeSelector } from '@/components'
import { useTheme } from '@/core/context/ThemeContext'
import type { AppStackParamList } from '@/core/navigators/types'

type NavigationProp = NativeStackNavigationProp<AppStackParamList>

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>()
  const { currentTheme } = useTheme()
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  const handleNotificationPress = () => {
    navigation.navigate('NotificationCenter')
  }

  const SettingRow = ({
    icon,
    label,
    onPress,
  }: {
    icon: React.ReactNode
    label: string
    onPress?: () => void
  }) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.settingLabel}>
        {icon}
        <Text style={styles.labelText}>{label}</Text>
      </View>
      <ChevronRight size={20} color={orphiTokens.colors.gray400} strokeWidth={2} />
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <OrphiHeader
        title="설정"
        showBell
        bellBadgeCount={unreadNotifications}
        onBellPress={handleNotificationPress}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Theme Selector */}
        <ThemeSelector />

        {/* Settings Card */}
        <OrphiCard>
          <SettingRow
            icon={<Bell size={20} color={currentTheme.colors.primary600} strokeWidth={2} />}
            label="알림 설정"
            onPress={() => {
              // 알림 설정 화면으로 이동
            }}
          />

          <View style={styles.divider} />

          <SettingRow
            icon={<Lock size={20} color={currentTheme.colors.primary600} strokeWidth={2} />}
            label="개인정보 설정"
            onPress={() => {
              // 개인정보 설정 화면으로 이동
            }}
          />

          <View style={styles.divider} />

          <SettingRow
            icon={<Info size={20} color={currentTheme.colors.primary600} strokeWidth={2} />}
            label="앱 정보"
            onPress={() => {
              // 앱 정보 화면으로 이동
            }}
          />
        </OrphiCard>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>버전 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: orphiTokens.colors.background,
  },
  scrollContent: {
    padding: orphiTokens.spacing.base,
    paddingBottom: orphiTokens.spacing.xl,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: orphiTokens.spacing.base,
  },
  settingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: orphiTokens.spacing.md,
  },
  labelText: {
    fontSize: orphiTokens.typography.sizes.base,
    color: orphiTokens.colors.gray900,
    fontWeight: orphiTokens.typography.weights.medium,
  },
  divider: {
    height: 1,
    backgroundColor: orphiTokens.colors.gray200,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: orphiTokens.spacing.xl,
  },
  versionText: {
    fontSize: orphiTokens.typography.sizes.sm,
    color: orphiTokens.colors.gray500,
  },
})
