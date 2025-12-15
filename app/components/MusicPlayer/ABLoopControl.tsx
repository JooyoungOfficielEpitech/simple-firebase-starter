import React from 'react'
import { View, StyleSheet } from 'react-native'
import { OrphiButton, OrphiText, OrphiBadge, orphiTokens } from '@/design-system'
import type { ABLoopState } from '@/core/types/audio.types'

interface ABLoopControlProps {
  abLoop: ABLoopState
  onSetA: () => void
  onSetB: () => void
  onToggle: () => void
  onClear: () => void
}

export const ABLoopControl: React.FC<ABLoopControlProps> = ({
  abLoop,
  onSetA,
  onSetB,
  onToggle,
  onClear,
}) => {
  const hasLoop = abLoop.a !== null && abLoop.b !== null

  return (
    <View style={styles.container}>
      <OrphiText variant="h4" style={styles.title}>
        A-B 구간 반복
      </OrphiText>

      {/* Loop 상태 표시 */}
      {hasLoop && (
        <View style={styles.statusContainer}>
          <OrphiBadge variant={abLoop.enabled ? 'success' : 'neutral'}>
            {abLoop.enabled ? '반복 중' : '반복 꺼짐'}
          </OrphiBadge>
          <OrphiText variant="caption" color="gray600" style={styles.loopInfo}>
            A: {abLoop.a?.toFixed(1)}s / B: {abLoop.b?.toFixed(1)}s
          </OrphiText>
        </View>
      )}

      {/* 컨트롤 버튼들 */}
      <View style={styles.buttonGroup}>
        <OrphiButton
          variant="text"
          size="sm"
          onPress={onSetA}
          style={styles.button}
        >
          {abLoop.a !== null ? 'A 재설정' : 'A 지점 설정'}
        </OrphiButton>

        <OrphiButton
          variant="text"
          size="sm"
          onPress={onSetB}
          style={styles.button}
          disabled={abLoop.a === null}
        >
          {abLoop.b !== null ? 'B 재설정' : 'B 지점 설정'}
        </OrphiButton>
      </View>

      {hasLoop && (
        <View style={styles.buttonGroup}>
          <OrphiButton
            variant={abLoop.enabled ? 'secondary' : 'primary'}
            size="sm"
            onPress={onToggle}
            style={styles.button}
          >
            {abLoop.enabled ? '반복 끄기' : '반복 켜기'}
          </OrphiButton>

          <OrphiButton
            variant="text"
            size="sm"
            onPress={onClear}
            style={styles.button}
          >
            초기화
          </OrphiButton>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: orphiTokens.spacing.md,
    paddingHorizontal: orphiTokens.spacing.base,
    backgroundColor: orphiTokens.colors.gray50,
    borderRadius: orphiTokens.borderRadius.md,
    marginHorizontal: orphiTokens.spacing.base,
    marginVertical: orphiTokens.spacing.sm,
  },
  title: {
    marginBottom: orphiTokens.spacing.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: orphiTokens.spacing.sm,
    marginBottom: orphiTokens.spacing.sm,
  },
  loopInfo: {
    flex: 1,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: orphiTokens.spacing.sm,
    marginTop: orphiTokens.spacing.sm,
  },
  button: {
    flex: 1,
  },
})
