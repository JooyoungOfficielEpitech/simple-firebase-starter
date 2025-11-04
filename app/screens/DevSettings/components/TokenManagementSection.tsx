import React, { FC } from 'react'
import { SettingSection } from './SettingSection'
import { SettingButton } from './SettingButton'

interface TokenManagementSectionProps {
  isLoading: boolean
  tokenCount: number
  onLoadTokens: () => void
  onCleanupOld: () => void
  onCleanupDuplicate: () => void
  onDeactivateAll: () => void
  colors: any
  spacing: any
}

export const TokenManagementSection: FC<TokenManagementSectionProps> = ({
  isLoading,
  tokenCount,
  onLoadTokens,
  onCleanupOld,
  onCleanupDuplicate,
  onDeactivateAll,
  colors,
  spacing,
}) => {
  return (
    <SettingSection title="토큰 관리" colors={colors} spacing={spacing}>
      <SettingButton
        onPress={onLoadTokens}
        label={`📱 모든 기기 토큰 조회 (${tokenCount})`}
        backgroundColor={colors.palette.primary500}
        disabled={isLoading}
        loading={isLoading}
        spacing={spacing}
      />
      <SettingButton
        onPress={onCleanupOld}
        label="🧹 오래된 토큰 정리"
        backgroundColor={colors.palette.secondary500}
        disabled={isLoading}
        loading={isLoading}
        spacing={spacing}
      />
      <SettingButton
        onPress={onCleanupDuplicate}
        label="🔄 중복 토큰 정리 (추천)"
        backgroundColor="#FF9800"
        disabled={isLoading}
        loading={isLoading}
        spacing={spacing}
      />
      <SettingButton
        onPress={onDeactivateAll}
        label="🚫 모든 토큰 비활성화"
        backgroundColor="#F44336"
        disabled={isLoading}
        loading={isLoading}
        spacing={spacing}
      />
    </SettingSection>
  )
}
