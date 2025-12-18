import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import Slider from '@react-native-community/slider'
import { OrphiText, orphiTokens } from '@/design-system'
import { useTheme } from '@/core/context/ThemeContext'
import type { ABLoopState } from '@/core/types/audio.types'

interface PlaybackProgressBarProps {
  position: number
  duration: number
  onSeek: (position: number) => void
  abLoop?: ABLoopState
  disabled?: boolean
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const PlaybackProgressBar: React.FC<PlaybackProgressBarProps> = ({
  position,
  duration,
  onSeek,
  abLoop,
  disabled = false,
}) => {
  const { currentTheme } = useTheme()
  const [draggingPosition, setDraggingPosition] = useState<number | null>(null)

  const displayPosition = draggingPosition !== null ? draggingPosition : position

  return (
    <View style={styles.container}>
      {/* 시간 표시 */}
      <View style={styles.timeContainer}>
        <OrphiText variant="caption" color="gray600">
          {formatTime(displayPosition)}
        </OrphiText>
        <OrphiText variant="caption" color="gray600">
          {formatTime(duration)}
        </OrphiText>
      </View>

      {/* 프로그레스 바 */}
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration || 1}
          value={displayPosition}
          onValueChange={(value) => setDraggingPosition(value)}
          onSlidingComplete={(value) => {
            setDraggingPosition(null)
            onSeek(value)
          }}
          minimumTrackTintColor={currentTheme.colors.primary600}
          maximumTrackTintColor={orphiTokens.colors.gray400}
          thumbTintColor={currentTheme.colors.primary600}
          disabled={disabled || !duration}
        />

        {/* A-B 루프 마커 */}
        {abLoop && (abLoop.a !== null || abLoop.b !== null) && (
          <View style={styles.markersContainer}>
            {abLoop.a !== null && (
              <View
                style={[
                  styles.marker,
                  {
                    backgroundColor: currentTheme.colors.primary600,
                    left: `${(abLoop.a / duration) * 100}%`,
                  },
                ]}
              >
                <OrphiText variant="caption" color="white" style={styles.markerText}>
                  A
                </OrphiText>
              </View>
            )}
            {abLoop.b !== null && (
              <View
                style={[
                  styles.marker,
                  {
                    backgroundColor: currentTheme.colors.primary400,
                    left: `${(abLoop.b / duration) * 100}%`,
                  },
                ]}
              >
                <OrphiText variant="caption" color="white" style={styles.markerText}>
                  B
                </OrphiText>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: orphiTokens.spacing.base,
    paddingVertical: orphiTokens.spacing.md,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: orphiTokens.spacing.sm,
  },
  sliderContainer: {
    position: 'relative',
    height: 40,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  markersContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    pointerEvents: 'none',
  },
  marker: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -10 }],
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
})
