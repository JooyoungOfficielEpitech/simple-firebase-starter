import React from 'react'
import { View, StyleSheet } from 'react-native'
import { OrphiButton, OrphiText, OrphiBadge, orphiTokens } from '@/design-system'
import type { ABLoopState } from '@/core/types/audio.types'

interface ABLoopControlProps {
  abLoop: ABLoopState
  onClear: () => void
}

export const ABLoopControl: React.FC<ABLoopControlProps> = ({
  abLoop,
  onClear,
}) => {
  const hasLoop = abLoop.a !== null && abLoop.b !== null

  if (!hasLoop) {
    return null
  }

  return (
    <View style={styles.container}>
      {/* Loop 상태 표시 */}
      <View style={styles.statusContainer}>
        <OrphiBadge variant="success">반복 중</OrphiBadge>
        <OrphiText variant="caption" color="gray600" style={styles.loopInfo}>
          A: {abLoop.a?.toFixed(1)}s / B: {abLoop.b?.toFixed(1)}s
        </OrphiText>
      </View>

      {/* 초기화 버튼 */}
      <OrphiButton
        variant="text"
        size="sm"
        onPress={onClear}
      >
        초기화
      </OrphiButton>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: orphiTokens.spacing.sm,
    paddingHorizontal: orphiTokens.spacing.base,
    backgroundColor: orphiTokens.colors.gray50,
    borderRadius: orphiTokens.borderRadius.sm,
    marginHorizontal: orphiTokens.spacing.base,
    marginVertical: orphiTokens.spacing.sm,
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
})
