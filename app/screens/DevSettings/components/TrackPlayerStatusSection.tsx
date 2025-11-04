import React, { FC } from 'react'
import { SettingSection } from './SettingSection'
import { InfoRow } from './InfoRow'
import { SettingButton } from './SettingButton'

interface TrackPlayerStatusSectionProps {
  trackPlayerInfo: {
    initialized: boolean
    state: string
    queueLength: number
    currentTrack: any
  }
  playbackState: any
  onTest: () => void
  onRefresh: () => void
  colors: any
  spacing: any
}

export const TrackPlayerStatusSection: FC<TrackPlayerStatusSectionProps> = ({
  trackPlayerInfo,
  playbackState,
  onTest,
  onRefresh,
  colors,
  spacing,
}) => {
  return (
    <SettingSection title="🎵 TrackPlayer 상태" colors={colors} spacing={spacing}>
      <InfoRow
        label="초기화됨:"
        value={trackPlayerInfo.initialized ? '✅ 성공' : '❌ 실패'}
        valueColor={trackPlayerInfo.initialized ? '#4CAF50' : '#F44336'}
        colors={colors}
        spacing={spacing}
      />
      <InfoRow
        label="재생 상태:"
        value={String(playbackState) || trackPlayerInfo.state}
        colors={colors}
        spacing={spacing}
      />
      <InfoRow
        label="대기열 길이:"
        value={`${trackPlayerInfo.queueLength}개`}
        colors={colors}
        spacing={spacing}
      />
      <InfoRow
        label="현재 트랙:"
        value={trackPlayerInfo.currentTrack ? '있음' : '없음'}
        colors={colors}
        spacing={spacing}
      />
      <SettingButton
        onPress={onTest}
        label="🎵 TrackPlayer 테스트"
        backgroundColor="#007AFF"
        spacing={spacing}
      />
      <SettingButton
        onPress={onRefresh}
        label="🔄 상태 새로고침"
        backgroundColor="#34C759"
        spacing={spacing}
      />
    </SettingSection>
  )
}
