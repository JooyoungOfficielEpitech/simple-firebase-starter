import React, { FC } from 'react'
import { Text } from 'react-native'
import { SettingSection } from './SettingSection'
import { SettingButton } from './SettingButton'

interface DebugLogsSectionProps {
  logs: string[]
  onClear: () => void
  colors: any
  spacing: any
}

export const DebugLogsSection: FC<DebugLogsSectionProps> = ({
  logs,
  onClear,
  colors,
  spacing,
}) => {
  if (logs.length === 0) return null

  return (
    <SettingSection title="🔍 실시간 디버그 로그" colors={colors} spacing={spacing}>
      {logs.map((log, index) => (
        <Text key={index} style={{ 
          fontSize: 12, 
          color: colors.textDim,
          fontFamily: 'monospace',
          marginBottom: 4
        }}>
          {log}
        </Text>
      ))}
      <SettingButton
        onPress={onClear}
        label="🗑️ 로그 지우기"
        backgroundColor={colors.palette.primary500}
        spacing={spacing}
      />
    </SettingSection>
  )
}
