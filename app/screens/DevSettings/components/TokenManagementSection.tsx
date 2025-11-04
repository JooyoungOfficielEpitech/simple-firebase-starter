import React, { FC } from 'react'
import { View, Text } from 'react-native'
import { SettingSection } from './SettingSection'
import { SettingButton } from './SettingButton'

interface TokenManagementSectionProps {
  isLoading: boolean
  tokenCount: number
  tokenStats?: {
    total: number
    active: number
    inactive: number
    duplicates: number
  }
  onCheckDatabase: () => void
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
  tokenStats,
  onCheckDatabase,
  onLoadTokens,
  onCleanupOld,
  onCleanupDuplicate,
  onDeactivateAll,
  colors,
  spacing,
}) => {
  return (
    <SettingSection title="토큰 관리" colors={colors} spacing={spacing}>
      {/* DB 상태 표시 */}
      {tokenStats && tokenStats.total > 0 && (
        <View style={{
          padding: spacing.md,
          backgroundColor: tokenStats.duplicates > 0 ? '#FFF3E0' : '#E8F5E9',
          borderRadius: 8,
          marginBottom: spacing.sm
        }}>
          <Text style={{ color: colors.text, fontSize: 14, marginBottom: 4 }}>
            📊 DB 상태: 총 {tokenStats.total}개
          </Text>
          <Text style={{ color: colors.text, fontSize: 12 }}>
            ✅ 활성: {tokenStats.active}개 | ⏸️ 비활성: {tokenStats.inactive}개
          </Text>
          {tokenStats.duplicates > 0 && (
            <Text style={{ color: '#F57C00', fontSize: 12, fontWeight: 'bold', marginTop: 4 }}>
              ⚠️ 중복: {tokenStats.duplicates}개 발견!
            </Text>
          )}
        </View>
      )}

      <SettingButton
        onPress={onCheckDatabase}
        label="🔍 DB 상태 확인 (중복 체크)"
        backgroundColor="#2196F3"
        disabled={isLoading}
        loading={isLoading}
        spacing={spacing}
      />
      <SettingButton
        onPress={onLoadTokens}
        label={`📱 활성 토큰 조회 (${tokenCount})`}
        backgroundColor={colors.palette.primary500}
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
        onPress={onCleanupOld}
        label="🧹 오래된 토큰 정리"
        backgroundColor={colors.palette.secondary500}
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
