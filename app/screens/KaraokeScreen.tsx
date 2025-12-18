import React, { useState, useEffect, useRef } from 'react'
import { View, ScrollView, StyleSheet, Alert } from 'react-native'
import { OrphiHeader, orphiTokens } from '@/design-system'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import TrackPlayer, { Capability, useProgress } from 'react-native-track-player'
import { useDualPlayer } from '@/core/hooks/useDualPlayer'
import { useMetronome } from '@/core/hooks/useMetronome'
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

export const KaraokeScreen: React.FC = () => {
  const navigation = useNavigation()
  const route = useRoute<KaraokeRouteProp>()
  const { song } = route.params

  // TrackPlayer progress
  const { position: trackPlayerPosition, duration: trackPlayerDuration } = useProgress()

  // 재생 상태
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)

  // Pitch 상태
  const [pitchEnabled, setPitchEnabled] = useState(false)
  const [pitchSemitones, setPitchSemitones] = useState(0)

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

  // useDualPlayer 통합
  const {
    playerType,
    isTransitioning,
    switchToExpoAV,
    switchToTrackPlayer,
    updatePitch,
    getPosition: dualPlayerGetPosition,
    seekTo: dualPlayerSeek,
    play: dualPlayerPlay,
    pause: dualPlayerPause,
    cleanup,
  } = useDualPlayer({
    audioUrl: song.mrUrl,
    onPlaybackUpdate: (status) => {
      if (status.isLoaded) {
        setPosition(status.positionMillis / 1000)
        setDuration(status.durationMillis ? status.durationMillis / 1000 : 0)
        setIsPlaying(status.isPlaying)
      }
    },
  })

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

  // TrackPlayer position/duration 업데이트
  useEffect(() => {
    if (playerType === 'trackplayer') {
      setPosition(trackPlayerPosition)
      setDuration(trackPlayerDuration)
    }
  }, [playerType, trackPlayerPosition, trackPlayerDuration])

  // TrackPlayer 초기화
  useEffect(() => {
    setupPlayer()

    return () => {
      cleanup()
      TrackPlayer.reset()
      if (loopCheckIntervalRef.current) {
        clearInterval(loopCheckIntervalRef.current)
      }
    }
  }, [])

  const setupPlayer = async () => {
    try {
      // TrackPlayer 초기화 (이미 초기화되어 있으면 스킵)
      try {
        await TrackPlayer.setupPlayer()
      } catch (error: any) {
        // 이미 초기화된 경우 무시
        if (error?.code !== 'player_already_initialized') {
          throw error
        }
      }

      // 옵션 설정
      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SeekTo,
          Capability.Stop,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
        ],
        compactCapabilities: [Capability.Play, Capability.Pause, Capability.SeekTo],
        progressUpdateEventInterval: 0.1,
        android: {
          appKilledPlaybackBehavior: 'ContinuePlayback' as any,
        },
      } as any)

      // 기존 트랙 제거
      await TrackPlayer.reset()

      // 트랙 추가
      if (song.mrUrl) {
        await TrackPlayer.add({
          id: song.id,
          url: song.mrUrl,
          title: song.title,
          artist: song.musical,
          duration: song.audioDuration,
        })
        const trackDuration = await TrackPlayer.getDuration()
        setDuration(trackDuration)
      } else {
        Alert.alert('오류', '음악 파일이 없습니다.')
      }
    } catch (error) {
      console.error('❌ TrackPlayer 초기화 실패:', error)
      Alert.alert('오류', 'TrackPlayer 초기화에 실패했습니다.')
    }
  }

  // Pitch 토글
  const handlePitchToggle = async (enabled: boolean) => {
    setPitchEnabled(enabled)
    if (enabled) {
      await switchToExpoAV(pitchSemitones)
    } else {
      await switchToTrackPlayer()
    }
  }

  // Pitch 변경
  const handlePitchChange = async (semitones: number) => {
    setPitchSemitones(semitones)
    if (pitchEnabled) {
      await updatePitch(semitones)
    }
  }

  // Pitch 리셋
  const handlePitchReset = async () => {
    await handlePitchChange(0)
  }

  // 재생/일시정지
  const handlePlay = async () => {
    await dualPlayerPlay()
    setIsPlaying(true)
  }

  const handlePause = async () => {
    await dualPlayerPause()
    setIsPlaying(false)
  }

  // Seek
  const handleSeek = async (pos: number) => {
    await dualPlayerSeek(pos)
    setPosition(pos)
  }

  const handleSeekBackward = () => {
    handleSeek(Math.max(0, position - 10))
  }

  const handleSeekForward = () => {
    handleSeek(Math.min(duration, position + 10))
  }

  // A-B 루프 핸들러
  const handleSetA = () => {
    setAbLoop((prev) => ({ ...prev, a: position }))
  }

  const handleSetB = () => {
    setAbLoop((prev) => ({ ...prev, b: position }))
  }

  const handleLoopToggle = () => {
    setAbLoop((prev) => ({ ...prev, enabled: !prev.enabled }))
  }

  const handleClearLoop = () => {
    setAbLoop({ a: null, b: null, enabled: false })
  }

  // A-B 루프 로직
  useEffect(() => {
    if (!abLoop.enabled || abLoop.a === null || abLoop.b === null) {
      if (loopCheckIntervalRef.current) {
        clearInterval(loopCheckIntervalRef.current)
        loopCheckIntervalRef.current = null
      }
      return
    }

    loopCheckIntervalRef.current = setInterval(async () => {
      const currentPos = await dualPlayerGetPosition()
      if (currentPos >= abLoop.b!) {
        await dualPlayerSeek(abLoop.a!)
        resetBeat()
      }
    }, 100)

    return () => {
      if (loopCheckIntervalRef.current) {
        clearInterval(loopCheckIntervalRef.current)
      }
    }
  }, [abLoop, resetBeat, dualPlayerGetPosition, dualPlayerSeek])

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
          onSetA={handleSetA}
          onSetB={handleSetB}
          onToggle={handleLoopToggle}
          onClear={handleClearLoop}
        />

        <PitchControl
          enabled={pitchEnabled}
          semitones={pitchSemitones}
          onToggle={handlePitchToggle}
          onPitchChange={handlePitchChange}
          onReset={handlePitchReset}
          isTransitioning={isTransitioning}
        />

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
})
