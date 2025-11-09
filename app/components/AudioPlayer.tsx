import React, { useEffect, useRef, useCallback, useMemo, useState } from "react"
import { View, ViewStyle, TouchableOpacity, ActivityIndicator } from "react-native"
import TrackPlayer, { usePlaybackState, useProgress, State } from 'react-native-track-player'

import { AlertModal } from "@/components/AlertModal"
import { Text } from "@/components/Text"
import { useAlert } from "@/hooks/useAlert"
import { useAppTheme } from "@/theme/context"
import { useAudioPlayerState } from "@/components/hooks/useAudioPlayerState"
import { AudioButton } from "./AudioPlayer/AudioButton"
import { AudioPlayerProgressBar } from "./AudioPlayer/AudioPlayerProgressBar"
import { SaveSectionModal } from "./AudioPlayer/SaveSectionModal"
import { MetronomeControl } from "./MusicPlayer/MetronomeControl"
import { useMetronome } from "@/hooks/useMetronome"
import { formatTime, loadSavedSections, saveSectionsToStorage, SavedSection } from "@/utils/audioHelpers"
import * as styles from "./AudioPlayer/AudioPlayer.styles"

export type { SavedSection } from "@/utils/audioHelpers"

export interface AudioPlayerProps {
  audioFile?: string
  audioUrl?: string
  songId: string  // 곡 ID (필수)
  style?: ViewStyle
  onPlaybackStatusUpdate?: (status: any) => void
  savedSections?: SavedSection[]
  onSavedSectionsChange?: (sections: SavedSection[]) => void
  onLoadSection?: (section: SavedSection) => void
  onDeleteSection?: (sectionId: string) => void
  loadSection?: SavedSection | null
}

export function AudioPlayer({
  audioFile,
  audioUrl,
  songId,
  style,
  onPlaybackStatusUpdate,
  savedSections = [],
  onSavedSectionsChange,
  onLoadSection,
  onDeleteSection,
  loadSection,
}: AudioPlayerProps) {
  // Validate props
  if (typeof audioFile !== 'string' && audioFile !== undefined) return null
  if (typeof audioUrl !== 'string' && audioUrl !== undefined) return null

  const { themed, theme } = useAppTheme()
  const { alertState, alert, hideAlert } = useAlert()
  const playbackState = usePlaybackState()
  const progress = useProgress()
  const { state, actions } = useAudioPlayerState()

  const progressBarRef = useRef<View>(null)
  const seekTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSeekTimeRef = useRef<number>(0)
  const isLoadingDurationRef = useRef<boolean>(false)
  const lastABLoopTimeRef = useRef<number>(0)
  const lastLoadedSectionIdRef = useRef<string | null>(null)
  const [localPosition, setLocalPosition] = useState<number | null>(null)
  const localPositionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isABLoopJumpRef = useRef<boolean>(false)

  // 메트로놈 상태
  const [metronomeEnabled, setMetronomeEnabled] = useState(false)
  const [metronomeBpm, setMetronomeBpm] = useState(120)
  const [metronomeVolume, setMetronomeVolume] = useState(0.7)
  const prevPositionRef = useRef(0)

  // 메트로놈 Hook 사용
  const { currentBeat, totalBeats, isReady: metronomeReady, error: metronomeError, resetBeat } = useMetronome({
    bpm: metronomeBpm,
    enabled: metronomeEnabled,
    volume: metronomeVolume,
  })

  // 메트로놈 BPM 변경 시 플레이어 속도도 함께 조절
  useEffect(() => {
    // 플레이어가 초기화되지 않았으면 속도 조절 안 함
    if (!state.isPlayerInitialized) return

    const applyPlaybackRate = async () => {
      try {
        // 큐에 트랙이 있는지 확인
        const queue = await TrackPlayer.getQueue()
        if (queue.length === 0) return

        // 원본 BPM을 120으로 가정하고 비율 계산
        const rate = metronomeBpm / 120
        await TrackPlayer.setRate(rate)
        if (__DEV__) {
          console.log(`🎵 플레이어 속도 조절: BPM ${metronomeBpm} → Rate ${rate.toFixed(2)}x`)
        }
      } catch (error) {
        if (__DEV__) {
          console.error('❌ 플레이어 속도 조절 오류:', error)
        }
      }
    }

    applyPlaybackRate()
  }, [metronomeBpm, state.isPlayerInitialized])

  // Unified seekTo function
  const safeSeekTo = useCallback(async (positionSeconds: number, reason: string = '') => {
    if (__DEV__) console.log(`🎯 safeSeekTo (${reason}): ${positionSeconds.toFixed(2)}s`)

    setLocalPosition(positionSeconds)

    if (reason === 'A-B 반복') {
      if (localPositionTimeoutRef.current) clearTimeout(localPositionTimeoutRef.current)
      isABLoopJumpRef.current = true
      localPositionTimeoutRef.current = setTimeout(() => {
        setLocalPosition(null)
        isABLoopJumpRef.current = false
      }, 1500)
    }

    actions.setIsJumping(true)

    try {
      await TrackPlayer.seekTo(positionSeconds)
      if (__DEV__) console.log(`✅ safeSeekTo success (${reason})`)
      return true
    } catch (error) {
      if (__DEV__) console.error(`❌ safeSeekTo failed (${reason}):`, error)
      return false
    } finally {
      if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current)
      
      if (reason === '진행바 클릭') {
        actions.setIsJumping(false)
      } else {
        seekTimeoutRef.current = setTimeout(() => {
          actions.setIsJumping(false)
        }, 50)
      }
    }
  }, [actions])

  // TrackPlayer initialization
  useEffect(() => {
    let retryCount = 0
    const maxRetries = 3
    let initTimeoutId: NodeJS.Timeout | null = null

    const checkServiceReady = (retries = 10): void => {
      if (typeof global.isPlayerInitialized === 'function') {
        if (__DEV__) console.log('✅ service.js ready')
        initializeTrackPlayer()
      } else if (retries > 0) {
        initTimeoutId = setTimeout(() => checkServiceReady(retries - 1), 100)
      } else {
        if (__DEV__) console.error('❌ service.js timeout')
        actions.setError('플레이어 초기화 시간 초과')
      }
    }

    const initializeTrackPlayer = async () => {
      try {
        if (global.isPlayerInitialized?.()) {
          if (__DEV__) console.log('✅ Already initialized')
          actions.setPlayerInitialized(true)
          return
        }

        await TrackPlayer.setupPlayer({ waitForBuffer: true })
        global.setPlayerInitialized?.(true)
        actions.setPlayerInitialized(true)
      } catch (error) {
        if (__DEV__) console.error('❌ Init failed:', error)
        
        if (retryCount < maxRetries) {
          retryCount++
          initTimeoutId = setTimeout(() => initializeTrackPlayer(), 1000 * retryCount)
        } else {
          actions.setError('TrackPlayer 초기화 실패')
        }
      }
    }

    checkServiceReady()

    return () => {
      if (initTimeoutId) clearTimeout(initTimeoutId)
      if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current)
      if (localPositionTimeoutRef.current) clearTimeout(localPositionTimeoutRef.current)
    }
  }, [])

  // Load saved sections
  useEffect(() => {
    const loadedSections = loadSavedSections()
    if (loadedSections.length > 0) {
      onSavedSectionsChange?.(loadedSections)
    }
  }, [])

  // Auto-load section
  useEffect(() => {
    if (loadSection && state.isPlayerInitialized && loadSection.id !== lastLoadedSectionIdRef.current) {
      lastLoadedSectionIdRef.current = loadSection.id
      actions.loadSection(loadSection)
      safeSeekTo(loadSection.pointA, '구간 로드')
      onLoadSection?.(loadSection)
    }
  }, [loadSection?.id, state.isPlayerInitialized])

  // Audio source
  const getAudioSource = useCallback(() => {
    if (audioUrl) return audioUrl
    
    if (audioFile) {
      try {
        const audioAssets = {
          "sample.mp3": require("../../assets/audio/sample.mp3"),
        }
        return audioAssets[audioFile] || null
      } catch {
        return null
      }
    }
    return null
  }, [audioFile, audioUrl])

  const audioSource = useMemo(() => getAudioSource(), [getAudioSource])

  // Load/unload audio
  const loadAudio = async () => {
    try {
      if (!audioSource) {
        actions.setError("오디오 파일을 준비 중입니다")
        return
      }

      actions.setLoading(true)
      actions.setError(null)

      try {
        await TrackPlayer.reset()
      } catch {}

      await TrackPlayer.add({
        id: 'audioplayerTrack',
        url: audioSource,
        title: audioFile || 'Audio Track',
        artist: 'AudioPlayer',
      })

      // 음량을 최대치로 설정
      await TrackPlayer.setVolume(1.0)
      if (__DEV__) console.log('🔊 TrackPlayer 음량 최대치로 설정 (1.0)')

      actions.setLoading(false)
    } catch (err) {
      actions.setError("오디오 로드 실패")
      actions.setLoading(false)
    }
  }

  const unloadAudio = async () => {
    try {
      await TrackPlayer.reset()
    } catch (error) {
      if (__DEV__) console.error('Unload error:', error)
    }
  }

  // Audio loading effect
  const audioLoadRef = useRef({ audioFile: '', audioUrl: '' })
  useEffect(() => {
    if (!state.isPlayerInitialized) return

    const currentAudio = { audioFile: audioFile || '', audioUrl: audioUrl || '' }
    if (audioLoadRef.current.audioFile === currentAudio.audioFile && 
        audioLoadRef.current.audioUrl === currentAudio.audioUrl) {
      return
    }
    audioLoadRef.current = currentAudio

    loadAudio()
    return () => { unloadAudio() }
  }, [audioFile, audioUrl, state.isPlayerInitialized])

  // Set initial A-B values
  useEffect(() => {
    const duration = progress.duration || 0
    if (duration > 0 && (state.loopState.pointA === null || state.loopState.pointB === null)) {
      actions.setLoopState({ pointA: 0, pointB: duration, isLooping: true })
    }
  }, [progress.duration, state.loopState.pointA, state.loopState.pointB, actions])

  // A-B loop logic
  useEffect(() => {
    const { pointA, pointB, isLooping } = state.loopState
    if (pointA === null || pointB === null || !isLooping) return

    const currentPos = progress.position || 0
    if (currentPos >= pointB && !state.isJumping) {
      const now = Date.now()
      const timeSinceLastLoop = now - lastABLoopTimeRef.current

      if (timeSinceLastLoop < 500) return

      lastABLoopTimeRef.current = now
      safeSeekTo(pointA, 'A-B 반복')
    }
  }, [progress.position, state.loopState, state.isJumping, safeSeekTo])

  // A-B 루프 재시작 감지 → 메트로놈 박자 리셋
  useEffect(() => {
    const { pointA, pointB, isLooping } = state.loopState
    if (!isLooping || !metronomeEnabled || pointA === null || pointB === null) {
      prevPositionRef.current = 0
      return
    }

    const currentPosition = progress.position || 0

    // 위치가 뒤로 점프했고 (B → A), A 포인트 근처라면 루프 재시작으로 판단
    if (currentPosition < prevPositionRef.current - 1 && // 1초 이상 뒤로 점프
        Math.abs(currentPosition - pointA) < 2) { // A 포인트 근처 (±2초)
      if (__DEV__) console.log(`🔄 A-B 루프 재시작 감지: ${prevPositionRef.current.toFixed(1)}s → ${currentPosition.toFixed(1)}s`)
      resetBeat()
    }

    prevPositionRef.current = currentPosition
  }, [progress.position, state.loopState, metronomeEnabled, resetBeat])

  // Local position auto-release
  useEffect(() => {
    if (localPosition !== null) {
      const progressPos = progress.position || 0
      const diff = Math.abs(progressPos - localPosition)

      if (diff < 0.5) {
        if (localPositionTimeoutRef.current) clearTimeout(localPositionTimeoutRef.current)
        setLocalPosition(null)
        isABLoopJumpRef.current = false
      } else {
        if (isABLoopJumpRef.current) return
        
        if (localPositionTimeoutRef.current) clearTimeout(localPositionTimeoutRef.current)
        localPositionTimeoutRef.current = setTimeout(() => {
          setLocalPosition(null)
        }, 1000)
      }
    }
  }, [progress.position, localPosition])

  // Progress monitoring
  useEffect(() => {
    const currentPosition = (progress.position || 0) * 1000
    const currentDuration = (progress.duration || 0) * 1000

    if (onPlaybackStatusUpdate) {
      onPlaybackStatusUpdate({
        isLoaded: true,
        positionMillis: currentPosition,
        durationMillis: currentDuration,
        isPlaying: playbackState?.state !== undefined && String(playbackState.state) === "playing"
      })
    }
  }, [progress.position, progress.duration, playbackState, onPlaybackStatusUpdate])

  // Playback controls
  const togglePlayback = async () => {
    if (!state.isPlayerInitialized) return

    try {
      const queue = await TrackPlayer.getQueue()
      if (queue.length === 0) {
        await loadAudio()
        return
      }

      const isCurrentlyPlaying = playbackState?.state !== undefined &&
                                String(playbackState.state) === "playing"
      const currentTime = progress.position || 0
      const duration = progress.duration || 0

      if (currentTime >= duration && duration > 0) {
        await safeSeekTo(0, '곡 끝')
        await TrackPlayer.play()
        return
      }

      if (isCurrentlyPlaying) {
        await TrackPlayer.pause()
      } else {
        await TrackPlayer.play()
      }
    } catch (err) {
      actions.setError("재생 오류")
    }
  }

  const seekToPosition = async (seekProgress: number) => {
    if (!state.isPlayerInitialized) return

    if (!progress.duration || progress.duration === 0) {
      if (isLoadingDurationRef.current) {
        let waitRetries = 30
        while (waitRetries > 0 && isLoadingDurationRef.current) {
          await new Promise(resolve => setTimeout(resolve, 100))
          waitRetries--
        }

        const currentProgress = await TrackPlayer.getProgress()
        if (currentProgress.duration > 0) {
          await safeSeekTo(seekProgress * currentProgress.duration, '진행바 클릭')
          return
        }
        return
      }

      isLoadingDurationRef.current = true
      try {
        const wasPlaying = playbackState?.state !== undefined && 
                          String(playbackState.state) === "playing"
        await TrackPlayer.play()

        let retries = 20
        while (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 100))
          const currentProgress = await TrackPlayer.getProgress()

          if (currentProgress.duration > 0) {
            await safeSeekTo(seekProgress * currentProgress.duration, '진행바 클릭')
            if (!wasPlaying) await TrackPlayer.pause()
            isLoadingDurationRef.current = false
            return
          }
          retries--
        }

        isLoadingDurationRef.current = false
        return
      } catch (error) {
        isLoadingDurationRef.current = false
        return
      }
    }

    await safeSeekTo(seekProgress * progress.duration, '진행바 클릭')
  }

  // Progress bar handlers
  const handleProgressBarLayout = (event: any) => {
    const { width } = event.nativeEvent.layout
    actions.setProgressBarWidth(width)
  }

  const handleProgressPressIn = (event: any) => {
    if (state.isDragging) {
      handleMarkerDrag(event)
      return
    }

    const { pageX } = event.nativeEvent
    if (progressBarRef.current) {
      progressBarRef.current.measure((_x, _y, width, _height, pageXPos, _pageYPos) => {
        const relativeX = pageX - pageXPos
        const ratio = Math.max(0, Math.min(1, relativeX / width))

        const duration = progress.duration || 0
        if (duration > 0 && state.loopState.pointA !== null && state.loopState.pointB !== null) {
          const targetPosition = ratio * duration
          if (targetPosition < state.loopState.pointA || targetPosition > state.loopState.pointB) {
            return
          }
        }

        seekToPosition(ratio)
      })
    }
  }

  const handleProgressTouch = (event: any) => {
    if (state.isDragging) {
      handleMarkerDrag(event)
      return
    }

    const now = Date.now()
    if (now - lastSeekTimeRef.current < 50) return
    lastSeekTimeRef.current = now

    const { pageX } = event.nativeEvent
    if (progressBarRef.current) {
      progressBarRef.current.measure((_x, _y, width, _height, pageXPos, _pageYPos) => {
        const relativeX = pageX - pageXPos
        const ratio = Math.max(0, Math.min(1, relativeX / width))

        const duration = progress.duration || 0
        if (duration > 0 && state.loopState.pointA !== null && state.loopState.pointB !== null) {
          const targetPosition = ratio * duration
          if (targetPosition < state.loopState.pointA || targetPosition > state.loopState.pointB) {
            return
          }
        }

        seekToPosition(ratio)
      })
    }
  }

  const handleProgressPressOut = () => {
    if (state.isDragging) {
      handleMarkerDragEnd()
    }
  }

  // Marker drag handlers
  const handleMarkerDragStart = useCallback((marker: 'A' | 'B', event: any) => {
    event.stopPropagation()
    actions.setDragging(marker)
  }, [actions])

  const handleMarkerDrag = useCallback((event: any) => {
    if (!state.isDragging) return

    const { pageX } = event.nativeEvent
    const duration = progress.duration || 0
    if (duration === 0 || state.progressBarWidth === 0) return

    if (progressBarRef.current) {
      progressBarRef.current.measure((x, y, width, height, pageXPos, pageYPos) => {
        const relativeX = pageX - pageXPos
        const ratio = Math.max(0, Math.min(1, relativeX / width))
        const newPosition = ratio * duration

        if (state.isDragging === 'A') {
          if (state.loopState.pointB !== null && newPosition >= state.loopState.pointB) return
          actions.setLoopState({ pointA: newPosition })
        } else if (state.isDragging === 'B') {
          if (state.loopState.pointA !== null && newPosition <= state.loopState.pointA) return
          actions.setLoopState({ pointB: newPosition })
        }
      })
    }
  }, [state.isDragging, state.loopState, state.progressBarWidth, progress.duration, actions])

  const handleMarkerDragEnd = useCallback(() => {
    if (state.isDragging) {
      if (state.isDragging === 'A' && state.loopState.pointA !== null && state.loopState.pointB !== null) {
        const currentPos = currentPosition
        const pointA = state.loopState.pointA
        const pointB = state.loopState.pointB

        if (currentPos < pointA || currentPos > pointB) {
          safeSeekTo(pointA, 'A 마커 드래그')
        }
      }
      actions.setDragging(null)
    }
  }, [state.isDragging, state.loopState.pointA, state.loopState.pointB, actions, safeSeekTo])

  // Section save/delete
  const saveSection = (name: string) => {
    if (state.loopState.pointA === null || state.loopState.pointB === null) {
      alert("오류", "A, B 구간을 먼저 설정해주세요.")
      return
    }

    const newSection: SavedSection = {
      id: Date.now().toString(),
      name: name,
      pointA: state.loopState.pointA,
      pointB: state.loopState.pointB,
      createdAt: new Date(),
      songId: songId,  // 곡 ID 포함
    }

    const updatedSections = [...savedSections, newSection]
    onSavedSectionsChange?.(updatedSections)
    saveSectionsToStorage(updatedSections)
    alert("저장 완료!", `"${newSection.name}" 구간이 저장되었습니다.`)
  }

  const handleDeleteSection = (sectionId: string) => {
    const updatedSections = savedSections.filter(section => section.id !== sectionId)
    onSavedSectionsChange?.(updatedSections)
    saveSectionsToStorage(updatedSections)
    onDeleteSection?.(sectionId)
  }

  const currentPosition = useMemo(() => {
    return localPosition !== null ? localPosition : (progress.position || 0)
  }, [localPosition, progress.position])

  const currentProgress = useMemo(() => {
    const duration = progress.duration || 0
    if (!duration || duration <= 0) return 0
    const progressValue = currentPosition / duration
    if (isNaN(progressValue) || !isFinite(progressValue)) return 0
    return Math.max(0, Math.min(1, progressValue))
  }, [currentPosition, progress.duration])

  // Error state
  if (state.error) {
    return (
      <View style={themed([styles.$container, style])}>
        <Text text={`❌ ${state.error}`} style={themed(styles.$errorText)} />
      </View>
    )
  }

  // Initializing state
  if (!state.isPlayerInitialized) {
    return (
      <View style={themed([styles.$container, style])}>
        <Text text="🎵 플레이어 초기화 중..." style={themed(styles.$statusText)} />
      </View>
    )
  }

  // 로딩 상태 체크: 플레이어 초기화 중이거나 메트로놈이 준비되지 않았거나 MP3가 로딩 중일 때
  const isLoading = state.isLoading || !metronomeReady || !progress.duration || progress.duration === 0

  // 로딩 중이면 스피너 표시
  if (isLoading) {
    return (
      <View style={themed([styles.$container, style, { justifyContent: 'center', alignItems: 'center' }])}>
        <ActivityIndicator size="large" color={theme.colors.palette.primary500} />
        <Text
          text="음악과 메트로놈을 준비하는 중..."
          style={themed([styles.$timeText, { marginTop: 16 }])}
        />
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={themed([styles.$container, style])}>
        {/* Time display */}
        <View style={themed(styles.$timeContainer)}>
          <Text text={formatTime(currentPosition * 1000)} style={themed(styles.$timeText)} />
          <Text text=" / " style={themed(styles.$timeSeparator)} />
          <Text text={formatTime((progress.duration || 0) * 1000)} style={themed(styles.$timeText)} />
        </View>

        {/* Progress bar */}
        <AudioPlayerProgressBar
          ref={progressBarRef}
          progress={currentProgress}
          pointA={state.loopState.pointA}
          pointB={state.loopState.pointB}
          duration={progress.duration || 0}
          isDragging={state.isDragging}
          onProgressPressIn={handleProgressPressIn}
          onProgressTouch={handleProgressTouch}
          onProgressPressOut={handleProgressPressOut}
          onLayout={handleProgressBarLayout}
          onMarkerDragStart={handleMarkerDragStart}
          onMarkerDrag={handleMarkerDrag}
          onMarkerDragEnd={handleMarkerDragEnd}
        />

        {/* Save modal */}
        <SaveSectionModal
          visible={state.showSaveModal}
          sectionName={state.sectionName}
          onChangeName={actions.setSectionName}
          onSave={() => {
            if (state.sectionName.trim()) {
              saveSection(state.sectionName.trim())
              actions.setShowSaveModal(false)
              actions.setSectionName("")
            }
          }}
          onCancel={() => {
            actions.setShowSaveModal(false)
            actions.setSectionName("")
          }}
        />

        {/* Playback controls */}
        <View style={themed(styles.$controlsContainer)}>
          <AudioButton
            icon={(() => {
              try {
                if (!playbackState || playbackState.state === undefined) return "play"
                return String(playbackState.state) === "playing" ? "pause" : "play"
              } catch {
                return "play"
              }
            })()}
            onPress={togglePlayback}
            disabled={!state.isPlayerInitialized || state.isLoading}
            size={32}
            style={themed(styles.$playButton)}
          />

          <TouchableOpacity
            style={themed(styles.$saveButtonAligned)}
            onPress={() => actions.setShowSaveModal(true)}
          >
            <Text text="구간 저장하기" style={themed(styles.$saveButtonTextOnly)} />
          </TouchableOpacity>
        </View>

        {/* 메트로놈 컨트롤 */}
        <View style={{ marginTop: 20 }}>
          <MetronomeControl
            enabled={metronomeEnabled}
            bpm={metronomeBpm}
            volume={metronomeVolume}
            currentBeat={currentBeat}
            totalBeats={totalBeats}
            isReady={metronomeReady}
            error={metronomeError}
            onToggle={() => setMetronomeEnabled(!metronomeEnabled)}
            onBpmChange={setMetronomeBpm}
            onVolumeChange={setMetronomeVolume}
          />
        </View>

        {state.isLoading && (
          <Text text="로딩 중..." style={themed(styles.$statusText)} />
        )}

        {/* 상태 정보 */}
        {metronomeEnabled && (
          <View style={{ marginTop: 15, padding: 10, backgroundColor: themed(styles.$container).backgroundColor, borderRadius: 8 }}>
            <Text text={`🎵 메트로놈 활성 (${metronomeBpm} BPM)`} style={{ fontSize: 14, color: '#007AFF', fontWeight: 'bold' }} />
          </View>
        )}

        <AlertModal
          visible={alertState.visible}
          title={alertState.title}
          message={alertState.message}
          buttons={alertState.buttons}
          onDismiss={hideAlert}
          dismissable={alertState.dismissable}
        />
      </View>
    </View>
  )
}
