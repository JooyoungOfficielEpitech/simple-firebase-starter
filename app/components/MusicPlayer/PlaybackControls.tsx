import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { OrphiButton, OrphiText, orphiTokens } from '@/design-system'
import { useTheme } from '@/core/context/ThemeContext'

interface PlaybackControlsProps {
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
  onSeekBackward: () => void
  onSeekForward: () => void
  disabled?: boolean
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  onPlay,
  onPause,
  onSeekBackward,
  onSeekForward,
  disabled = false,
}) => {
  const { currentTheme } = useTheme()

  return (
    <View style={styles.container}>
      {/* 10초 뒤로 */}
      <TouchableOpacity
        onPress={onSeekBackward}
        disabled={disabled}
        style={[
          styles.button,
          { backgroundColor: currentTheme.colors.primary100 },
          disabled && styles.buttonDisabled,
        ]}
      >
        <OrphiText variant="body">⏪ 10s</OrphiText>
      </TouchableOpacity>

      {/* 재생/일시정지 */}
      <OrphiButton
        variant={isPlaying ? 'secondary' : 'primary'}
        onPress={isPlaying ? onPause : onPlay}
        disabled={disabled}
        style={styles.mainButton}
      >
        {isPlaying ? '⏸ 일시정지' : '▶️ 재생'}
      </OrphiButton>

      {/* 10초 앞으로 */}
      <TouchableOpacity
        onPress={onSeekForward}
        disabled={disabled}
        style={[
          styles.button,
          { backgroundColor: currentTheme.colors.primary100 },
          disabled && styles.buttonDisabled,
        ]}
      >
        <OrphiText variant="body">10s ⏩</OrphiText>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: orphiTokens.spacing.md,
    paddingVertical: orphiTokens.spacing.lg,
    paddingHorizontal: orphiTokens.spacing.base,
  },
  button: {
    padding: orphiTokens.spacing.md,
    borderRadius: orphiTokens.borderRadius.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  mainButton: {
    minWidth: 140,
  },
})
