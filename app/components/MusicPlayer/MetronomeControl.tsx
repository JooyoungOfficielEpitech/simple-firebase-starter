import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import Slider from '@react-native-community/slider'
import { OrphiButton, OrphiText, OrphiBadge, orphiTokens } from '@/design-system'
import { BPM_RANGE } from '@/core/types/audio.types'
import { useTheme } from '@/core/context/ThemeContext'

interface MetronomeControlProps {
  enabled: boolean
  bpm: number
  volume: number
  currentBeat: number
  totalBeats: number
  onToggle: () => void
  onBpmChange: (bpm: number) => void
  onVolumeChange: (volume: number) => void
  isReady?: boolean
}

export const MetronomeControl: React.FC<MetronomeControlProps> = ({
  enabled,
  bpm,
  volume,
  currentBeat,
  totalBeats,
  onToggle,
  onBpmChange,
  onVolumeChange,
  isReady = true,
}) => {
  const { currentTheme } = useTheme()

  const handleBpmIncrement = () => {
    if (bpm < BPM_RANGE.MAX) {
      onBpmChange(Math.min(bpm + 5, BPM_RANGE.MAX))
    }
  }

  const handleBpmDecrement = () => {
    if (bpm > BPM_RANGE.MIN) {
      onBpmChange(Math.max(bpm - 5, BPM_RANGE.MIN))
    }
  }

  // 박자 표시 (1-based)
  const beats = Array.from({ length: totalBeats }, (_, i) => i)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <OrphiText variant="h4">메트로놈</OrphiText>
        {enabled && isReady && (
          <OrphiBadge variant="success">활성화</OrphiBadge>
        )}
        {!isReady && (
          <OrphiBadge variant="warning">준비 중...</OrphiBadge>
        )}
      </View>

      {/* 박자 시각화 */}
      {enabled && (
        <View style={styles.beatIndicator}>
          {beats.map((beat) => (
            <View
              key={beat}
              style={[
                styles.beatDot,
                beat === currentBeat && [
                  styles.beatDotActive,
                  { backgroundColor: currentTheme.colors.primary600 },
                ],
              ]}
            />
          ))}
        </View>
      )}

      {/* BPM 조절 */}
      <View style={styles.bpmContainer}>
        <OrphiText variant="body" color="gray600">
          BPM
        </OrphiText>
        <View style={styles.bpmControls}>
          <TouchableOpacity
            onPress={handleBpmDecrement}
            disabled={!enabled || bpm <= BPM_RANGE.MIN}
            style={[
              styles.bpmButton,
              { backgroundColor: currentTheme.colors.primary600 },
              (!enabled || bpm <= BPM_RANGE.MIN) && styles.bpmButtonDisabled,
            ]}
          >
            <OrphiText variant="body">-</OrphiText>
          </TouchableOpacity>

          <OrphiText variant="h3" style={styles.bpmValue}>
            {bpm}
          </OrphiText>

          <TouchableOpacity
            onPress={handleBpmIncrement}
            disabled={!enabled || bpm >= BPM_RANGE.MAX}
            style={[
              styles.bpmButton,
              { backgroundColor: currentTheme.colors.primary600 },
              (!enabled || bpm >= BPM_RANGE.MAX) && styles.bpmButtonDisabled,
            ]}
          >
            <OrphiText variant="body">+</OrphiText>
          </TouchableOpacity>
        </View>
      </View>

      {/* BPM 슬라이더 */}
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={BPM_RANGE.MIN}
          maximumValue={BPM_RANGE.MAX}
          value={bpm}
          onSlidingComplete={onBpmChange}
          step={1}
          minimumTrackTintColor={currentTheme.colors.primary600}
          maximumTrackTintColor={orphiTokens.colors.gray400}
          thumbTintColor={currentTheme.colors.primary600}
          disabled={!enabled}
        />
      </View>

      {/* 볼륨 조절 */}
      {enabled && (
        <View style={styles.volumeContainer}>
          <OrphiText variant="caption" color="gray600">
            볼륨: {Math.round(volume * 100)}%
          </OrphiText>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={volume}
            onSlidingComplete={onVolumeChange}
            step={0.1}
            minimumTrackTintColor={currentTheme.colors.primary600}
            maximumTrackTintColor={orphiTokens.colors.gray400}
            thumbTintColor={currentTheme.colors.primary600}
          />
        </View>
      )}

      {/* 토글 버튼 */}
      <OrphiButton
        variant={enabled ? 'secondary' : 'primary'}
        onPress={onToggle}
        disabled={!isReady}
      >
        {enabled ? '메트로놈 끄기' : '메트로놈 켜기'}
      </OrphiButton>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: orphiTokens.spacing.md,
  },
  beatIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: orphiTokens.spacing.sm,
    marginBottom: orphiTokens.spacing.md,
  },
  beatDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: orphiTokens.colors.gray400,
  },
  beatDotActive: {
    transform: [{ scale: 1.3 }],
  },
  bpmContainer: {
    marginBottom: orphiTokens.spacing.sm,
  },
  bpmControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: orphiTokens.spacing.md,
    marginTop: orphiTokens.spacing.sm,
  },
  bpmButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bpmButtonDisabled: {
    backgroundColor: orphiTokens.colors.gray400,
    opacity: 0.5,
  },
  bpmValue: {
    minWidth: 60,
    textAlign: 'center',
  },
  sliderContainer: {
    marginBottom: orphiTokens.spacing.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  volumeContainer: {
    marginBottom: orphiTokens.spacing.md,
  },
})
