import React, { useEffect, useRef, useCallback, useMemo } from "react"
import { View, ViewStyle, TextStyle } from "react-native"
import TrackPlayer, { usePlaybackState, useProgress } from 'react-native-track-player'
import { MMKV } from "react-native-mmkv"

import { AlertModal } from "@/components/AlertModal"
import { Text } from "@/components/Text"
import { PlayerControls } from "@/components/PlayerControls"
import { TrackInfo } from "@/components/TrackInfo"
import { ProgressBar } from "@/components/ProgressBar"
import { SaveSectionModal } from "@/components/SaveSectionModal"
import { useAlert } from "@/hooks/useAlert"
import { useAppTheme } from "@/theme/context"
import { useAudioPlayerState } from "@/components/hooks/useAudioPlayerState"
import type { ThemedStyle } from "@/theme/types"

// MMKV 스토리지 인스턴스
const storage = new MMKV()
const SAVED_SECTIONS_KEY = "audio_player_saved_sections"

// A-B 구간 반복 관련 타입
export interface SavedSection {
  id: string
  name: string
  pointA: number
  pointB: number
  createdAt: Date
}

export interface AudioPlayerProps {
  audioFile?: string
  audioUrl?: string
  style?: ViewStyle
  onPlaybackStatusUpdate?: (status: any) => void
  savedSections?: SavedSection[]
  onSavedSectionsChange?: (sections: SavedSection[]) => void
  onLoadSection?: (section: SavedSection) => void
  loadSection?: SavedSection | null
}

// 로컬 스토리지 유틸리티 함수들
const loadSavedSections = (): SavedSection[] => {
  try {
    const sectionsString = storage.getString(SAVED_SECTIONS_KEY)
    if (sectionsString) {
      return JSON.parse(sectionsString)
    }
    return []
  } catch (error) {
    return []
  }
}

const saveSectionsToStorage = (sections: SavedSection[]) => {
  try {
    storage.set(SAVED_SECTIONS_KEY, JSON.stringify(sections))
  } catch (error) {
    // 저장 실패 무시
  }
}

/**
 * TrackPlayer 기반 오디오 플레이어 컴포넌트 (최적화된 버전)
 */
export function AudioPlayerOptimized({
  audioFile,
  audioUrl,
  style,
  onPlaybackStatusUpdate,
  savedSections = [],
  onSavedSectionsChange,
  onLoadSection,
  loadSection,
}: AudioPlayerProps) {
  // Validate props
  if (typeof audioFile !== 'string' && audioFile !== undefined) {
    return null
  }
  if (typeof audioUrl !== 'string' && audioUrl !== undefined) {
    return null
  }

  const { themed } = useAppTheme()
  const { alertState, alert, hideAlert } = useAlert()
  const playbackState = usePlaybackState()
  const progress = useProgress()
  const { state, actions } = useAudioPlayerState()
  
  const isInitialLoad = useRef(true)
  const userSetB = useRef(false)

  // TrackPlayer용 오디오 소스 결정
  const getAudioSource = useCallback(() => {
    if (audioUrl) {
      return audioUrl
    }
    
    if (audioFile) {
      try {
        const audioAssets = {
          "sample.mp3": require("../../assets/audio/sample.mp3"),
        }
        
        if (audioAssets[audioFile]) {
          return audioAssets[audioFile]
        } else {
          return null
        }
      } catch (error) {
        return null
      }
    }
    
    return null
  }, [audioFile, audioUrl])

  const audioSource = useMemo(() => {
    return getAudioSource()
  }, [getAudioSource])

  // TrackPlayer 초기화
  useEffect(() => {
    const initializeTrackPlayer = async () => {
      try {
        if (typeof global.isPlayerInitialized === 'function' && global.isPlayerInitialized()) {
          actions.setPlayerInitialized(true)
          return
        }

        await TrackPlayer.setupPlayer({
          waitForBuffer: true,
        })

        if (typeof global.setPlayerInitialized === 'function') {
          global.setPlayerInitialized(true)
        }
        
        actions.setPlayerInitialized(true)
      } catch (error) {
        actions.setError('TrackPlayer 초기화에 실패했습니다.')
        actions.setPlayerInitialized(false)
      }
    }

    setTimeout(() => {
      initializeTrackPlayer()
    }, 1000)
  }, [actions])

  // 로컬 스토리지에서 저장된 구간 로드
  useEffect(() => {
    const loadedSections = loadSavedSections()
    if (loadedSections.length > 0) {
      onSavedSectionsChange?.(loadedSections)
    }
  }, [onSavedSectionsChange])

  // 오디오 로드
  const loadAudio = useCallback(async () => {
    try {
      if (!audioSource) {
        actions.setError("오디오 파일을 준비 중입니다")
        return
      }

      actions.setLoading(true)
      actions.setError(null)

      try {
        await TrackPlayer.reset()
      } catch (resetError) {
        // 빈 큐일 때는 무시
      }

      const trackToAdd = {
        id: 'audioplayerTrack',
        url: audioSource,
        title: audioFile || 'Audio Track',
        artist: 'AudioPlayer',
      }

      if (trackToAdd) {
        await TrackPlayer.add(trackToAdd)
      }

      actions.setLoading(false)
    } catch (err) {
      actions.setError("오디오 파일을 로드할 수 없습니다")
      actions.setLoading(false)
    }
  }, [audioSource, audioFile, actions])

  // 오디오 언로드
  const unloadAudio = useCallback(async () => {
    try {
      await TrackPlayer.reset()
    } catch (error) {
      // 언로드 실패는 무시
    }
  }, [])

  // 오디오 로드/언로드 관리
  const audioLoadRef = useRef({ audioFile: '', audioUrl: '' })
  useEffect(() => {
    if (!state.isPlayerInitialized) {
      return
    }

    const currentAudio = { audioFile: audioFile || '', audioUrl: audioUrl || '' }
    
    if (audioLoadRef.current.audioFile === currentAudio.audioFile && 
        audioLoadRef.current.audioUrl === currentAudio.audioUrl) {
      return
    }

    audioLoadRef.current = currentAudio

    actions.setHasAutoSetB(false)
    isInitialLoad.current = true
    userSetB.current = false
    
    actions.resetForNewAudio()
    
    loadAudio()
    return () => {
      unloadAudio()
    }
  }, [audioFile, audioUrl, state.isPlayerInitialized, actions, loadAudio, unloadAudio])

  // A-B 구간 무한 반복 로직
  useEffect(() => {
    const isPlaying = playbackState?.state === 'playing' || playbackState?.state === 'buffering'
    if (state.loopState.pointA !== null && state.loopState.pointB !== null && 
        state.isPlayerInitialized && !state.isJumping && progress.position !== undefined && isPlaying) {
      
      const currentTimeSeconds = progress.position || 0
      const pointASeconds = state.loopState.pointA
      const pointBSeconds = state.loopState.pointB
      const durationSeconds = progress.duration || 0
      
      if (currentTimeSeconds >= durationSeconds) {
        return
      }
      
      if (currentTimeSeconds >= pointBSeconds && currentTimeSeconds < durationSeconds) {
        actions.setIsJumping(true)
        
        TrackPlayer.seekTo(pointASeconds * 1000)
          .then(() => {
            // A 지점으로 이동 완료
          })
          .catch((error) => {
            // 이동 실패
          })
          .finally(() => {
            setTimeout(() => {
              actions.setIsJumping(false)
            }, 500)
          })
      }
    }
  }, [progress.position, progress.duration, state.loopState.pointA, state.loopState.pointB, 
      state.isPlayerInitialized, state.isJumping, playbackState?.state, actions])

  // B 지점 자동 설정
  useEffect(() => {
    const currentDuration = (progress.duration || 0) * 1000
    
    if (currentDuration > 0 && state.loopState.pointB === null && !state.hasAutoSetB && 
        isInitialLoad.current && !userSetB.current) {
      
      actions.setLoopState({ pointB: currentDuration / 1000 })
      actions.setHasAutoSetB(true)
      isInitialLoad.current = false
    }
    
    if (onPlaybackStatusUpdate) {
      onPlaybackStatusUpdate({
        isLoaded: true,
        positionMillis: (progress.position || 0) * 1000,
        durationMillis: currentDuration,
        isPlaying: playbackState?.state === "playing"
      })
    }
  }, [progress.position, progress.duration, playbackState, state.loopState.pointB, 
      state.hasAutoSetB, onPlaybackStatusUpdate, actions])

  // 재생/일시정지 토글
  const togglePlayback = useCallback(async () => {
    if (!state.isPlayerInitialized) return

    try {
      const queue = await TrackPlayer.getQueue()
      
      if (queue.length === 0) {
        await loadAudio()
        return
      }
      
      const isCurrentlyPlaying = playbackState?.state === "playing"
      const currentTime = progress.position || 0
      const duration = progress.duration || 0
      
      if (currentTime >= duration && duration > 0) {
        await TrackPlayer.seekTo(0)
        await TrackPlayer.play()
        return
      }
      
      if (state.loopState.pointA !== null && state.loopState.pointB !== null) {
        const currentTimeSeconds = progress.position || 0
        const pointASeconds = state.loopState.pointA
        const pointBSeconds = state.loopState.pointB
        
        if (currentTimeSeconds < pointASeconds || currentTimeSeconds > pointBSeconds) {
          await TrackPlayer.seekTo(pointASeconds * 1000)
          
          if (!isCurrentlyPlaying) {
            await TrackPlayer.play()
          }
        } else {
          if (isCurrentlyPlaying) {
            await TrackPlayer.pause()
          } else {
            await TrackPlayer.play()
          }
        }
      } else {
        if (isCurrentlyPlaying) {
          await TrackPlayer.pause()
        } else {
          await TrackPlayer.play()
        }
      }
    } catch (err) {
      actions.setError("재생 오류")
    }
  }, [state.isPlayerInitialized, state.loopState.pointA, state.loopState.pointB, 
      playbackState?.state, progress.position, progress.duration, loadAudio, actions])

  // 시크 처리
  const handleSeek = useCallback(async (seekProgress: number) => {
    if (!state.isPlayerInitialized || !progress.duration || progress.duration === 0) return

    try {
      const seekPosition = seekProgress * (progress.duration || 0)
      await TrackPlayer.seekTo(seekPosition * 1000)
    } catch (err) {
      // 시크 오류 무시
    }
  }, [state.isPlayerInitialized, progress.duration])

  // A 지점 설정
  const handleSetPointA = useCallback((time: number) => {
    actions.setLoopState({ pointA: time })
  }, [actions])

  // B 지점 설정
  const handleSetPointB = useCallback((time: number) => {
    actions.setLoopState({ pointB: time })
    actions.setHasAutoSetB(true)
    userSetB.current = true
  }, [actions])

  // 마커 클릭 처리
  const handleMarkerPress = useCallback((type: 'A' | 'B') => {
    const currentTime = progress.position || 0
    
    if (type === 'A') {
      if (state.loopState.pointB !== null && currentTime >= state.loopState.pointB) {
        alert("오류", "A 지점은 B 지점보다 앞에 있어야 합니다.")
        return
      }
      handleSetPointA(currentTime)
      TrackPlayer.seekTo(currentTime * 1000)
    } else {
      if (state.loopState.pointA !== null && currentTime <= state.loopState.pointA) {
        alert("오류", "B 지점은 A 지점보다 뒤에 있어야 합니다.")
        return
      }
      handleSetPointB(currentTime)
    }
  }, [progress.position, state.loopState.pointA, state.loopState.pointB, 
      handleSetPointA, handleSetPointB, alert])

  // 구간 저장
  const handleSaveSection = useCallback((name: string) => {
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
    }

    const updatedSections = [...savedSections, newSection]
    onSavedSectionsChange?.(updatedSections)
    saveSectionsToStorage(updatedSections)
    
    alert("저장 완료!", `"${newSection.name}" 구간이 저장되었습니다.`)
  }, [state.loopState.pointA, state.loopState.pointB, savedSections, 
      onSavedSectionsChange, alert])

  // 저장 모달 열기
  const handleOpenSaveModal = useCallback(() => {
    actions.setShowSaveModal(true)
  }, [actions])

  // 저장 모달 닫기
  const handleCloseSaveModal = useCallback(() => {
    actions.setShowSaveModal(false)
  }, [actions])

  // 에러 상태
  if (state.error) {
    return (
      <View style={themed([$container, style])}>
        <Text text={`❌ ${state.error}`} style={themed($errorText)} />
      </View>
    )
  }

  // 초기화 대기 중
  if (!state.isPlayerInitialized) {
    return (
      <View style={themed([$container, style])}>
        <Text text="🎵 플레이어 초기화 중..." style={themed($statusText)} />
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={themed([$container, style])}>
        {/* 트랙 정보 및 시간 표시 */}
        <TrackInfo
          currentPosition={progress.position || 0}
          duration={progress.duration || 0}
          loopState={state.loopState}
        />

        {/* 진행바 및 A-B 마커 */}
        <ProgressBar
          progress={progress.position || 0}
          duration={progress.duration || 0}
          loopState={state.loopState}
          onSeek={handleSeek}
          onSetPointA={handleSetPointA}
          onSetPointB={handleSetPointB}
          onMarkerPress={handleMarkerPress}
        />

        {/* 재생 컨트롤 */}
        <PlayerControls
          playbackState={playbackState}
          isPlayerInitialized={state.isPlayerInitialized}
          isLoading={state.isLoading}
          onPlayPress={togglePlayback}
          onSavePress={handleOpenSaveModal}
        />

        {/* 저장 모달 */}
        <SaveSectionModal
          visible={state.showSaveModal}
          loopState={state.loopState}
          onSave={handleSaveSection}
          onCancel={handleCloseSaveModal}
        />

        {/* 로딩 상태 */}
        {state.isLoading && (
          <Text text="로딩 중..." style={themed($statusText)} />
        )}

        {/* Alert Modal */}
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

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  padding: spacing.lg,
  borderRadius: 16,
  alignItems: "center",
})

const $statusText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  textAlign: "center",
})

const $errorText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  color: colors.error,
  fontFamily: typography.primary.normal,
  textAlign: "center",
})