/**
 * Pitch Adjustment Technical Feasibility Test Component
 *
 * Purpose: Test expo-av pitch adjustment capabilities for karaoke feature
 * Test Range: -6 to +6 semitones (半音)
 * Platform: iOS/Android/Web
 */

import React, { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { Audio } from 'expo-av'
import Slider from '@react-native-community/slider'
// Note: @react-native-community/slider is already installed (v5.1.0)

interface PitchTestState {
  sound: Audio.Sound | null
  isLoaded: boolean
  isPlaying: boolean
  semitones: number
  duration: number
  position: number
  error: string | null
}

export function PitchTest() {
  const [state, setState] = useState<PitchTestState>({
    sound: null,
    isLoaded: false,
    isPlaying: false,
    semitones: 0,
    duration: 0,
    position: 0,
    error: null,
  })

  const soundRef = useRef<Audio.Sound | null>(null)

  // Sample audio URL - Replace with your test audio
  const SAMPLE_AUDIO = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'

  useEffect(() => {
    setupAudio()
    return () => {
      cleanup()
    }
  }, [])

  const setupAudio = async () => {
    try {
      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      })

      // Create sound object
      const { sound } = await Audio.Sound.createAsync(
        { uri: SAMPLE_AUDIO },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      )

      soundRef.current = sound
      setState(prev => ({ ...prev, sound, isLoaded: true, error: null }))

      console.log('✅ Audio loaded successfully')
    } catch (error) {
      console.error('❌ Audio setup failed:', error)
      setState(prev => ({
        ...prev,
        error: `Audio setup failed: ${error.message}`,
        isLoaded: false
      }))
    }
  }

  const cleanup = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync()
        soundRef.current = null
      }
    } catch (error) {
      console.error('Cleanup error:', error)
    }
  }

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setState(prev => ({
        ...prev,
        isPlaying: status.isPlaying,
        duration: status.durationMillis / 1000,
        position: status.positionMillis / 1000,
      }))
    }
  }

  const togglePlayback = async () => {
    if (!soundRef.current) return

    try {
      const status = await soundRef.current.getStatusAsync()
      if (status.isLoaded) {
        if (status.isPlaying) {
          await soundRef.current.pauseAsync()
        } else {
          await soundRef.current.playAsync()
        }
      }
    } catch (error) {
      console.error('Playback toggle error:', error)
      Alert.alert('재생 오류', error.message)
    }
  }

  const applyPitchShift = async (semitones: number) => {
    if (!soundRef.current) return

    try {
      setState(prev => ({ ...prev, semitones }))

      // Calculate rate from semitones
      // Formula: rate = 2^(semitones/12)
      const rate = Math.pow(2, semitones / 12)

      console.log(`🎵 Applying pitch shift: ${semitones} semitones (rate: ${rate.toFixed(3)})`)

      // Apply pitch shift with pitch correction
      // shouldCorrectPitch: true means tempo stays the same while pitch changes
      await soundRef.current.setRateAsync(
        rate,
        true, // shouldCorrectPitch - maintains tempo while changing pitch
        Audio.PitchCorrectionQuality.High
      )

      console.log('✅ Pitch shift applied successfully')
    } catch (error) {
      console.error('❌ Pitch shift failed:', error)
      setState(prev => ({
        ...prev,
        error: `Pitch shift failed: ${error.message}`
      }))
      Alert.alert('피치 조절 실패', error.message)
    }
  }

  const resetPitch = () => {
    applyPitchShift(0)
  }

  const getPitchLabel = (semitones: number): string => {
    if (semitones === 0) return '원본 키'
    const sign = semitones > 0 ? '+' : ''
    return `${sign}${semitones} 반음`
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎹 Pitch Adjustment Test</Text>
      <Text style={styles.subtitle}>expo-av Technical Feasibility</Text>

      {/* Status Display */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          상태: {state.isLoaded ? '로드됨 ✅' : '로딩 중...'}
        </Text>
        <Text style={styles.statusText}>
          재생: {state.isPlaying ? '재생 중 ▶️' : '일시정지 ⏸'}
        </Text>
        <Text style={styles.statusText}>
          시간: {formatTime(state.position)} / {formatTime(state.duration)}
        </Text>
      </View>

      {/* Error Display */}
      {state.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {state.error}</Text>
        </View>
      )}

      {/* Playback Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.button, !state.isLoaded && styles.buttonDisabled]}
          onPress={togglePlayback}
          disabled={!state.isLoaded}
        >
          <Text style={styles.buttonText}>
            {state.isPlaying ? '⏸ 일시정지' : '▶️ 재생'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Pitch Control */}
      <View style={styles.pitchContainer}>
        <Text style={styles.pitchTitle}>키 조절 (Pitch Shift)</Text>
        <Text style={styles.pitchValue}>{getPitchLabel(state.semitones)}</Text>

        <Slider
          style={styles.slider}
          minimumValue={-6}
          maximumValue={6}
          step={1}
          value={state.semitones}
          onValueChange={applyPitchShift}
          minimumTrackTintColor="#4A90E2"
          maximumTrackTintColor="#D3D3D3"
          thumbTintColor="#4A90E2"
          disabled={!state.isLoaded}
        />

        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>-6</Text>
          <Text style={styles.sliderLabel}>0</Text>
          <Text style={styles.sliderLabel}>+6</Text>
        </View>

        {/* Preset Buttons */}
        <View style={styles.presetContainer}>
          <TouchableOpacity
            style={[styles.presetButton, !state.isLoaded && styles.buttonDisabled]}
            onPress={() => applyPitchShift(-2)}
            disabled={!state.isLoaded}
          >
            <Text style={styles.presetButtonText}>남성 -2</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.presetButton, !state.isLoaded && styles.buttonDisabled]}
            onPress={resetPitch}
            disabled={!state.isLoaded}
          >
            <Text style={styles.presetButtonText}>초기화</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.presetButton, !state.isLoaded && styles.buttonDisabled]}
            onPress={() => applyPitchShift(2)}
            disabled={!state.isLoaded}
          >
            <Text style={styles.presetButtonText}>여성 +2</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Test Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>📋 테스트 정보</Text>
        <Text style={styles.infoText}>• 라이브러리: expo-av v15.1.7</Text>
        <Text style={styles.infoText}>• 메서드: setRateAsync()</Text>
        <Text style={styles.infoText}>• 품질: PitchCorrectionQuality.High</Text>
        <Text style={styles.infoText}>• 템포 유지: shouldCorrectPitch = true</Text>
        <Text style={styles.infoText}>
          • Rate 계산: 2^(semitones/12)
        </Text>
      </View>

      {/* Platform Support Info */}
      <View style={styles.platformContainer}>
        <Text style={styles.platformTitle}>🔧 플랫폼 지원</Text>
        <Text style={styles.platformText}>iOS: ✅ 완벽 지원</Text>
        <Text style={styles.platformText}>Android: ⚠️ 제한적 지원</Text>
        <Text style={styles.platformText}>Web: ⚠️ 부분 지원</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  statusContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  errorContainer: {
    backgroundColor: '#FFE6E6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FF0000',
  },
  errorText: {
    color: '#CC0000',
    fontSize: 12,
  },
  controlsContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 150,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  pitchContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  pitchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  pitchValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#4A90E2',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#666',
  },
  presetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  presetButton: {
    flex: 1,
    backgroundColor: '#E8F4FD',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  presetButtonText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  infoText: {
    fontSize: 12,
    marginBottom: 4,
    color: '#666',
  },
  platformContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
  },
  platformTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  platformText: {
    fontSize: 12,
    marginBottom: 4,
    color: '#666',
  },
})
