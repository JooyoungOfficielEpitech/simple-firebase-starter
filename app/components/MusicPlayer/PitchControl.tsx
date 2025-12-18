import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { OrphiButton, OrphiText, orphiTokens } from '@/design-system'
import { PITCH_RANGE } from '@/core/types/audio.types'
import { useTheme } from '@/core/context/ThemeContext'

interface PitchControlProps {
  semitones: number
  onPitchChange: (semitones: number) => Promise<void>
  onReset: () => Promise<void>
}

export const PitchControl: React.FC<PitchControlProps> = ({
  semitones,
  onPitchChange,
  onReset,
}) => {
  const { currentTheme } = useTheme()

  const handleIncrement = () => {
    if (semitones < PITCH_RANGE.MAX) {
      onPitchChange(semitones + 1)
    }
  }

  const handleDecrement = () => {
    if (semitones > PITCH_RANGE.MIN) {
      onPitchChange(semitones - 1)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <OrphiText variant="h4">Pitch 조절</OrphiText>
      </View>

      {/* Pitch 값 표시 */}
      <View style={styles.valueContainer}>
        <OrphiText
          variant="h3"
          style={{ color: currentTheme.colors.primary600 }}
        >
          {semitones > 0 ? '+' : ''}{semitones} semitones
        </OrphiText>
      </View>

      {/* 조절 버튼들 */}
      <View style={styles.controlGroup}>
        <TouchableOpacity
          onPress={handleDecrement}
          disabled={semitones <= PITCH_RANGE.MIN}
          style={[
            styles.adjustButton,
            { backgroundColor: currentTheme.colors.primary600 },
            semitones <= PITCH_RANGE.MIN && styles.adjustButtonDisabled,
          ]}
        >
          <OrphiText variant="h3">-</OrphiText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleIncrement}
          disabled={semitones >= PITCH_RANGE.MAX}
          style={[
            styles.adjustButton,
            { backgroundColor: currentTheme.colors.primary600 },
            semitones >= PITCH_RANGE.MAX && styles.adjustButtonDisabled,
          ]}
        >
          <OrphiText variant="h3">+</OrphiText>
        </TouchableOpacity>
      </View>

      {/* 리셋 버튼 */}
      {semitones !== 0 && (
        <View style={styles.buttonGroup}>
          <OrphiButton
            variant="text"
            size="sm"
            onPress={onReset}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: orphiTokens.spacing.sm,
  },
  valueContainer: {
    alignItems: 'center',
    paddingVertical: orphiTokens.spacing.md,
  },
  controlGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: orphiTokens.spacing.lg,
    marginBottom: orphiTokens.spacing.md,
  },
  adjustButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustButtonDisabled: {
    backgroundColor: orphiTokens.colors.gray400,
    opacity: 0.5,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: orphiTokens.spacing.sm,
  },
  button: {
    flex: 1,
  },
})
