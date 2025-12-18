import React, { useState, useEffect, useRef } from 'react'
import { View, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { OrphiHeader, OrphiText, orphiTokens } from '@/design-system'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import TrackPlayer, { Capability, useProgress } from 'react-native-track-player'
import { useMetronome } from '@/core/hooks/useMetronome'
import { usePitchShifterProgress } from '@/core/hooks/usePitchShifterProgress'
import { usePitchShifterState } from '@/core/hooks/usePitchShifterState'
import PitchShifterService from '@/core/services/pitchShifterService'
import { useTheme } from '@/core/context/ThemeContext'
import type { ABLoopState } from '@/core/types/audio.types'
import type { Song } from '@/core/types/song'
import type { PracticeStackParamList } from '@/core/navigators/types'
import {
  SongInfo,
  PlaybackProgressBar,
  PlaybackControls,
  ABLoopControl,
  PitchControl,
  MetronomeControl,
} from '@/components/MusicPlayer'

type KaraokeRouteProp = RouteProp<PracticeStackParamList, 'KaraokeScreen'>
type PlayerType = 'pitchshifter' | 'trackplayer'

export const KaraokeScreen: React.FC = () => {
  const navigation = useNavigation()
  const route = useRoute<KaraokeRouteProp>()
  const { song } = route.params
  const { currentTheme } = useTheme()

  // Player type
  const [playerType, setPlayerType] = useState<PlayerType>('trackplayer')

  // PitchShifter progress & state
  const pitchShifterProgress = usePitchShifterProgress()
  const pitchShifterState = usePitchShifterState()

  // TrackPlayer progress
  const trackPlayerProgress = useProgress()

  // Unified progress & state
  const position = playerType === 'pitchshifter' ? pitchShifterProgress.position : trackPlayerProgress.position
  const duration = playerType === 'pitchshifter' ? pitchShifterProgress.duration : trackPlayerProgress.duration

  // TrackPlayer 재생 상태
  const [trackPlayerIsPlaying, setTrackPlayerIsPlaying] = useState(false)

  // Unified isPlaying
  const isPlaying = playerType === 'pitchshifter' ? pitchShifterState.isPlaying : trackPlayerIsPlaying

  // Pitch 상태
  const [pitchSemitones, setPitchSemitones] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState('플레이어 초기화 중...')

  // 메트로놈 상태
  const [metronomeEnabled, setMetronomeEnabled] = useState(false)
  const [bpm, setBpm] = useState(song.estimatedBPM || 120)
  const [metronomeVolume, setMetronomeVolume] = useState(0.7)

  // A-B 루프 상태
  const [abLoop, setAbLoop] = useState<ABLoopState>({
    a: null,
    b: null,
    enabled: false,
  })

  const loopCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // useMetronome 통합
  const {
    currentBeat,
    totalBeats,
    isReady: metronomeReady,
    resetBeat,
  } = useMetronome({
    bpm,
    enabled: metronomeEnabled,
    volume: metronomeVolume,
    timeSignature: { beats: 4, noteValue: 4 },
  })

  // Player 초기화
  useEffect(() => {
    setupPlayer()

    return () => {
      cleanup()
    }
  }, [])

  const cleanup = async () => {
    if (playerType === 'pitchshifter') {
      PitchShifterService.stop()
    } else {
      await TrackPlayer.reset()
    }

    if (loopCheckIntervalRef.current) {
      clearInterval(loopCheckIntervalRef.current)
    }
  }

  const setupPlayer = async () => {
    try {
      setIsLoading(true)
      setLoadingMessage('플레이어 초기화 중...')

      console.log('🎵 [KaraokeScreen] Song data:', JSON.stringify(song, null, 2))

      if (!song.mrUrl) {
        console.error('❌ [KaraokeScreen] No mrUrl found in song')
        Alert.alert('오류', '음악 파일 URL이 없습니다. mrUrl을 설정해주세요.')
        setIsLoading(false)
        return
      }

      // PitchShifter 사용 가능 여부 확인
      if (PitchShifterService.isAvailable()) {
        console.log('✅ [KaraokeScreen] PitchShifter available - using PitchShifter mode')
        setLoadingMessage('고급 오디오 엔진 로드 중...')
        await setupPitchShifter()
      } else {
        console.log('⚠️ [KaraokeScreen] PitchShifter not available - using TrackPlayer fallback')
        setLoadingMessage('오디오 플레이어 로드 중...')
        await setupTrackPlayer()
      }

      setLoadingMessage('준비 완료!')
      // 잠시 "준비 완료" 메시지 보여주기
      await new Promise(resolve => setTimeout(resolve, 500))
      setIsLoading(false)
    } catch (error: any) {
      console.error('❌ [KaraokeScreen] 초기화 실패:', error)
      Alert.alert('오류', '오디오 플레이어 초기화에 실패했습니다.')
      setIsLoading(false)
    }
  }

  const setupPitchShifter = async () => {
    try {
      console.log('🎵 [KaraokeScreen] Loading audio file with PitchShifter:', song.mrUrl)
      setLoadingMessage('오디오 파일 다운로드 중...')

      // 오디오 파일 로드
      const audioInfo = await PitchShifterService.loadAudioFile(song.mrUrl!)

      console.log('✅ [KaraokeScreen] PitchShifter loaded successfully:', audioInfo)
      setPlayerType('pitchshifter')
    } catch (error: any) {
      console.error('❌ [KaraokeScreen] PitchShifter 로드 실패:', error)
      console.log('⚠️ [KaraokeScreen] Falling back to TrackPlayer')

      // PitchShifter 실패시 TrackPlayer로 폴백
      setLoadingMessage('대체 플레이어로 전환 중...')
      await setupTrackPlayer()
    }
  }

  const setupTrackPlayer = async () => {
    try {
      console.log('🎵 [KaraokeScreen] Setting up TrackPlayer')
      setLoadingMessage('플레이어 초기화 중...')

      // TrackPlayer 초기화
      try {
        await TrackPlayer.setupPlayer()
      } catch (error: any) {
        if (error?.code !== 'player_already_initialized') {
          throw error
        }
      }

      setLoadingMessage('플레이어 설정 중...')

      // 옵션 설정
      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SeekTo,
          Capability.Stop,
        ],
        compactCapabilities: [Capability.Play, Capability.Pause, Capability.SeekTo],
        progressUpdateEventInterval: 0.1,
      } as any)

      // 기존 트랙 제거
      await TrackPlayer.reset()

      setLoadingMessage('오디오 파일 로드 중...')

      // 트랙 추가
      await TrackPlayer.add({
        id: song.id,
        url: song.mrUrl!,
        title: song.title,
        artist: song.musical,
        duration: song.audioDuration,
      })

      console.log('✅ [KaraokeScreen] TrackPlayer setup complete')
      setPlayerType('trackplayer')
    } catch (error) {
      console.error('❌ [KaraokeScreen] TrackPlayer setup failed:', error)
      throw error
    }
  }

  // Pitch 변경 (PitchShifter 모드만)
  const handlePitchChange = async (semitones: number) => {
    setPitchSemitones(semitones)
    if (playerType === 'pitchshifter') {
      PitchShifterService.setPitch(semitones)
    }
  }

  // Pitch 리셋
  const handlePitchReset = async () => {
    await handlePitchChange(0)
  }

  // 재생/일시정지
  const handlePlay = async () => {
    try {
      if (playerType === 'pitchshifter') {
        await PitchShifterService.play()
      } else {
        await TrackPlayer.play()
        setTrackPlayerIsPlaying(true)
      }
    } catch (error) {
      console.error('❌ Play error:', error)
      Alert.alert('오류', '재생에 실패했습니다.')
    }
  }

  const handlePause = async () => {
    try {
      if (playerType === 'pitchshifter') {
        PitchShifterService.pause()
      } else {
        await TrackPlayer.pause()
        setTrackPlayerIsPlaying(false)
      }
    } catch (error) {
      console.error('❌ Pause error:', error)
    }
  }

  // Seek
  const handleSeek = async (pos: number) => {
    try {
      if (playerType === 'pitchshifter') {
        await PitchShifterService.seek(pos)
      } else {
        await TrackPlayer.seekTo(pos)
      }
    } catch (error) {
      console.error('❌ Seek error:', error)
    }
  }

  const handleSeekBackward = () => {
    handleSeek(Math.max(0, position - 10))
  }

  const handleSeekForward = () => {
    handleSeek(Math.min(duration, position + 10))
  }

  // A-B 루프 핸들러
  const handleSetA = () => {
    setAbLoop((prev) => ({ ...prev, a: position, enabled: true }))
  }

  const handleSetB = () => {
    setAbLoop((prev) => ({ ...prev, b: position, enabled: true }))
  }

  const handleClearLoop = () => {
    setAbLoop({ a: null, b: null, enabled: false })
    if (playerType === 'pitchshifter') {
      PitchShifterService.setABLoop(false, 0, 0)
    }
  }

  // A-B 루프 적용
  useEffect(() => {
    if (playerType === 'pitchshifter') {
      // PitchShifter: 네이티브 A-B 루프 사용
      if (abLoop.a !== null && abLoop.b !== null && abLoop.enabled) {
        PitchShifterService.setABLoop(true, abLoop.a, abLoop.b)
      } else {
        PitchShifterService.setABLoop(false, 0, 0)
      }
    } else {
      // TrackPlayer: JS로 A-B 루프 구현
      if (loopCheckIntervalRef.current) {
        clearInterval(loopCheckIntervalRef.current)
        loopCheckIntervalRef.current = null
      }

      if (abLoop.a !== null && abLoop.b !== null && abLoop.enabled && trackPlayerIsPlaying) {
        loopCheckIntervalRef.current = setInterval(async () => {
          const currentPos = await TrackPlayer.getPosition()
          if (currentPos >= abLoop.b!) {
            await TrackPlayer.seekTo(abLoop.a!)
            resetBeat()
          }
        }, 100)
      }
    }

    return () => {
      if (loopCheckIntervalRef.current) {
        clearInterval(loopCheckIntervalRef.current)
        loopCheckIntervalRef.current = null
      }
    }
  }, [playerType, abLoop.a, abLoop.b, abLoop.enabled, trackPlayerIsPlaying, resetBeat])

  // 메트로놈 토글
  const handleMetronomeToggle = () => {
    setMetronomeEnabled(!metronomeEnabled)
  }

  const handleBpmChange = (newBpm: number) => {
    setBpm(Math.max(40, Math.min(240, newBpm)))
  }

  return (
    <View style={styles.container}>
      <OrphiHeader
        title="노래방"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <SongInfo song={song} />

        <PlaybackProgressBar
          position={position}
          duration={duration}
          onSeek={handleSeek}
          abLoop={abLoop}
          onSetA={handleSetA}
          onSetB={handleSetB}
        />

        <PlaybackControls
          isPlaying={isPlaying}
          onPlay={handlePlay}
          onPause={handlePause}
          onSeekBackward={handleSeekBackward}
          onSeekForward={handleSeekForward}
          disabled={!duration}
        />

        <ABLoopControl
          abLoop={abLoop}
          onClear={handleClearLoop}
        />

        {playerType === 'pitchshifter' && (
          <PitchControl
            semitones={pitchSemitones}
            onPitchChange={handlePitchChange}
            onReset={handlePitchReset}
          />
        )}

        <MetronomeControl
          enabled={metronomeEnabled}
          bpm={bpm}
          volume={metronomeVolume}
          currentBeat={currentBeat}
          totalBeats={totalBeats}
          onToggle={handleMetronomeToggle}
          onBpmChange={handleBpmChange}
          onVolumeChange={setMetronomeVolume}
          isReady={metronomeReady}
        />
      </ScrollView>

      {/* 로딩 오버레이 */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={currentTheme.colors.primary600} />
            <OrphiText variant="h4" style={styles.loadingText}>
              {loadingMessage}
            </OrphiText>
            {loadingMessage !== '준비 완료!' && (
              <OrphiText variant="body" style={styles.loadingSubtext}>
                잠시만 기다려주세요
              </OrphiText>
            )}
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: orphiTokens.colors.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: orphiTokens.spacing['2xl'],
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: orphiTokens.colors.white,
    borderRadius: orphiTokens.borderRadius.lg,
    padding: orphiTokens.spacing.xl,
    alignItems: 'center',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingText: {
    marginTop: orphiTokens.spacing.md,
    color: orphiTokens.colors.gray900,
  },
  loadingSubtext: {
    marginTop: orphiTokens.spacing.xs,
    color: orphiTokens.colors.gray600,
  },
})
