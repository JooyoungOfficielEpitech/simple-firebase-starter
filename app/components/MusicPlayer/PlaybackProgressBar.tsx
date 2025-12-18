import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native'
import Slider from '@react-native-community/slider'
import { OrphiText, orphiTokens } from '@/design-system'
import { useTheme } from '@/core/context/ThemeContext'
import type { ABLoopState } from '@/core/types/audio.types'

interface PlaybackProgressBarProps {
  position: number
  duration: number
  onSeek: (position: number) => void
  abLoop?: ABLoopState
  onSetA?: () => void
  onSetB?: () => void
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
  onSetA,
  onSetB,
  disabled = false,
}) => {
  const { currentTheme } = useTheme()
  const [draggingPosition, setDraggingPosition] = useState<number | null>(null)

  const displayPosition = draggingPosition !== null ? draggingPosition : position

  return (
    <View style={styles.container}>
      {/* 시간 표시 및 A/B 버튼 */}
      <View style={styles.topRow}>
        <View style={styles.timeContainer}>
          <OrphiText variant="caption" color="gray600">
            {formatTime(displayPosition)}
          </OrphiText>
          <OrphiText variant="caption" color="gray600">
            {formatTime(duration)}
          </OrphiText>
        </View>

        {/* A/B 버튼 */}
        {onSetA && onSetB && (
          <View style={styles.abButtons}>
            <TouchableOpacity
              style={[
                styles.abButton,
                abLoop?.a !== null && { backgroundColor: currentTheme.colors.primary100 },
              ]}
              onPress={onSetA}
            >
              <Text
                style={[
                  styles.abButtonText,
                  abLoop?.a !== null && { color: currentTheme.colors.primary600 },
                ]}
              >
                A
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.abButton,
                abLoop?.b !== null && { backgroundColor: currentTheme.colors.primary100 },
              ]}
              onPress={onSetB}
              disabled={abLoop?.a === null}
            >
              <Text
                style={[
                  styles.abButtonText,
                  abLoop?.b !== null && { color: currentTheme.colors.primary600 },
                  abLoop?.a === null && { opacity: 0.3 },
                ]}
              >
                B
              </Text>
            </TouchableOpacity>
          </View>
        )}
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

        {/* A-B 루프 마커 (슬라이더 위) */}
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: orphiTokens.spacing.sm,
  },
  timeContainer: {
    flexDirection: 'row',
    gap: orphiTokens.spacing.md,
  },
  abButtons: {
    flexDirection: 'row',
    gap: orphiTokens.spacing.xs,
  },
  abButton: {
    width: 32,
    height: 32,
    borderRadius: orphiTokens.borderRadius.sm,
    backgroundColor: orphiTokens.colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  abButtonText: {
    fontSize: 14,
    fontWeight: orphiTokens.typography.weights.bold,
    color: orphiTokens.colors.gray600,
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
    zIndex: 10,
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
    marginLeft: -10,
  },
  markerText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
})
