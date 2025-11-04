import React, { FC } from 'react'
import { SettingSection } from './SettingSection'
import { InfoRow } from './InfoRow'
import { SettingButton } from './SettingButton'

interface PerformanceMonitorSectionProps {
  stats: {
    appStateChanges: number
    backgroundTime: number
    freezeCount: number
    memoryUsage: number
    lastCrash: string | null
  }
  lastAppState: string
  onReset: () => void
  colors: any
  spacing: any
}

export const PerformanceMonitorSection: FC<PerformanceMonitorSectionProps> = ({
  stats,
  lastAppState,
  onReset,
  colors,
  spacing,
}) => {
  return (
    <SettingSection title="🚨 성능 모니터링 (Freeze 감지)" colors={colors} spacing={spacing}>
      <InfoRow
        label="앱 상태 변경:"
        value={`${stats.appStateChanges}회 (현재: ${lastAppState})`}
        colors={colors}
        spacing={spacing}
      />
      <InfoRow
        label="백그라운드 복귀:"
        value={`${stats.backgroundTime}회`}
        colors={colors}
        spacing={spacing}
      />
      <InfoRow
        label="UI Freeze 감지:"
        value={`${stats.freezeCount}회 ${stats.freezeCount > 0 ? '⚠️' : '✅'}`}
        valueColor={stats.freezeCount > 0 ? '#F44336' : '#4CAF50'}
        colors={colors}
        spacing={spacing}
      />
      <InfoRow
        label="메모리 사용 (추정):"
        value={`${stats.memoryUsage}KB`}
        colors={colors}
        spacing={spacing}
      />
      {stats.lastCrash && (
        <InfoRow
          label="마지막 크래시:"
          value={new Date(stats.lastCrash).toLocaleString()}
          valueColor="#F44336"
          colors={colors}
          spacing={spacing}
        />
      )}
      <SettingButton
        onPress={onReset}
        label="🔄 성능 통계 리셋"
        backgroundColor="#FF6B35"
        spacing={spacing}
      />
    </SettingSection>
  )
}
