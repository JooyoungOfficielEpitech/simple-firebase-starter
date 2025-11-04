import React, { FC } from 'react'
import { SettingSection } from './SettingSection'
import { InfoRow } from './InfoRow'
import { SettingButton } from './SettingButton'

interface PushStatusSectionProps {
  isPushNotificationEnabled: boolean
  fcmToken: string | null
  isLoading: boolean
  onRequestPermission: () => void
  colors: any
  spacing: any
}

export const PushStatusSection: FC<PushStatusSectionProps> = ({
  isPushNotificationEnabled,
  fcmToken,
  isLoading,
  onRequestPermission,
  colors,
  spacing,
}) => {
  return (
    <SettingSection title="푸시 알림 상태" colors={colors} spacing={spacing}>
      <InfoRow
        label="권한 상태:"
        value={isPushNotificationEnabled ? '✅ 허용됨' : '❌ 거부됨'}
        valueColor={isPushNotificationEnabled ? '#4CAF50' : '#F44336'}
        colors={colors}
        spacing={spacing}
      />
      <InfoRow
        label="FCM 토큰:"
        value={fcmToken ? '✅ 생성됨' : '❌ 없음'}
        valueColor={fcmToken ? '#4CAF50' : '#F44336'}
        colors={colors}
        spacing={spacing}
      />
      {!isPushNotificationEnabled && (
        <SettingButton
          onPress={onRequestPermission}
          label={isLoading ? '요청 중...' : '푸시 알림 권한 요청'}
          backgroundColor={colors.palette.primary500}
          disabled={isLoading}
          loading={isLoading}
          spacing={spacing}
        />
      )}
    </SettingSection>
  )
}
