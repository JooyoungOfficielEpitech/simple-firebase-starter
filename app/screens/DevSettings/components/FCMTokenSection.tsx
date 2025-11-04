import React, { FC } from 'react'
import { View, Text } from 'react-native'
import { SettingSection } from './SettingSection'
import { SettingButton } from './SettingButton'

interface FCMTokenSectionProps {
  fcmToken: string
  onCopy: () => void
  onSendTest: () => void
  onNavigatePushDebug: () => void
  onNavigateMusicPlayer: () => void
  onNavigateDebug: () => void
  colors: any
  spacing: any
}

export const FCMTokenSection: FC<FCMTokenSectionProps> = ({
  fcmToken,
  onCopy,
  onSendTest,
  onNavigatePushDebug,
  onNavigateMusicPlayer,
  onNavigateDebug,
  colors,
  spacing,
}) => {
  return (
    <SettingSection title="FCM 토큰" colors={colors} spacing={spacing}>
      <View style={{
        backgroundColor: colors.background,
        padding: spacing.sm,
        borderRadius: 8,
        marginBottom: spacing.md,
      }}>
        <Text style={{ 
          fontSize: 12, 
          color: colors.textDim,
          fontFamily: 'monospace'
        }}>
          {fcmToken}
        </Text>
      </View>

      <SettingButton
        onPress={onCopy}
        label="📋 토큰 복사/공유"
        backgroundColor={colors.palette.primary500}
        spacing={spacing}
      />
      <SettingButton
        onPress={onSendTest}
        label="🔔 테스트 알림 보내기"
        backgroundColor={colors.palette.secondary500}
        spacing={spacing}
      />
      <SettingButton
        onPress={onNavigatePushDebug}
        label="🐛 푸시 알림 디버깅 화면"
        backgroundColor="#FF6B35"
        spacing={spacing}
      />
      <SettingButton
        onPress={onNavigateMusicPlayer}
        label="🎵 음악 플레이어 테스트"
        backgroundColor="#007AFF"
        spacing={spacing}
      />
      <SettingButton
        onPress={onNavigateDebug}
        label="🐛 종합 디버그 정보"
        backgroundColor="#34C759"
        spacing={spacing}
      />
    </SettingSection>
  )
}
