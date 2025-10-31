import React, { useEffect, useRef, useCallback, useMemo, useState } from "react"
import { View, ViewStyle, TouchableOpacity, Modal, TextInput, TouchableOpacityProps, TextStyle } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import TrackPlayer, { usePlaybackState, useProgress, State } from 'react-native-track-player'
import { MMKV } from "react-native-mmkv"

import { AlertModal } from "@/components/AlertModal"
import { Text } from "@/components/Text"
import { Icon } from "@/components/Icon"
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

// 로컬 스토리지 유틸리티 함수들
const loadSavedSections = (): SavedSection[] => {
  try {
    const sectionsString = storage.getString(SAVED_SECTIONS_KEY)
    if (sectionsString) {
      return JSON.parse(sectionsString)
    }
    return []
  } catch (error) {
    console.error("❌ 저장된 구간 로드 실패:", error)
    return []
  }
}

const saveSectionsToStorage = (sections: SavedSection[]) => {
  try {
    storage.set(SAVED_SECTIONS_KEY, JSON.stringify(sections))
    console.log("✅ 구간을 로컬 스토리지에 저장 완료:", sections.length, "개")
  } catch (error) {
    console.error("❌ 구간 저장 실패:", error)
  }
}

// 구간 저장 타입 (A/B 로직은 제거, 저장 기능만 유지)
export interface SavedSection {
  id: string
  name: string
  pointA: number
  pointB: number
  createdAt: Date
}

export interface AudioPlayerProps {
  /**
   * 로컬 오디오 파일명 (assets/audio/에서 참조)
   */
  audioFile?: string
  /**
   * 오디오 URL (Firebase Storage 등)
   */
  audioUrl?: string
  /**
   * 컨테이너 스타일
   */
  style?: ViewStyle
  /**
   * 재생 상태 변경 콜백
   */
  onPlaybackStatusUpdate?: (status: any) => void
  /**
   * 저장된 구간들
   */
  savedSections?: SavedSection[]
  /**
   * 저장된 구간 업데이트 콜백
   */
  onSavedSectionsChange?: (sections: SavedSection[]) => void
  /**
   * 구간 로드 콜백
   */
  onLoadSection?: (section: SavedSection) => void
  /**
   * 외부에서 로드할 구간 (이 값이 변경되면 자동으로 로드됨)
   */
  loadSection?: SavedSection | null
}

/**
 * TrackPlayer 기반 오디오 플레이어 컴포넌트
 */
export function AudioPlayer({
  audioFile,
  audioUrl,
  style,
  onPlaybackStatusUpdate,
  savedSections = [],
  onSavedSectionsChange,
  onLoadSection,
  loadSection,
}: AudioPlayerProps) {
  // Validate props to prevent text rendering errors
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
  
  const progressBarRef = useRef<View>(null)
  const seekTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSeekTimeRef = useRef<number>(0) // 마지막 seek 시간 추적
  const isLoadingDurationRef = useRef<boolean>(false) // duration 로드 중 플래그
  const lastABLoopTimeRef = useRef<number>(0) // 마지막 A-B 반복 점프 시간 추적

  // 로컬 position 추적 (useProgress보다 빠른 업데이트)
  const [localPosition, setLocalPosition] = useState<number | null>(null)
  const localPositionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 🔧 통합 seekTo 함수 - 모든 재생 위치 변경을 여기서 관리
  const safeSeekTo = useCallback(async (positionSeconds: number, reason: string = '') => {
    if (__DEV__) console.log(`🎯 safeSeekTo 시작 (${reason}): ${positionSeconds.toFixed(2)}초`)

    // 🔑 로컬 position 즉시 업데이트 (useProgress보다 빠름)
    setLocalPosition(positionSeconds)

    // isJumping 플래그 설정
    actions.setIsJumping(true)

    try {
      // TrackPlayer.seekTo는 초 단위를 받음 (milliseconds 아님!)
      await TrackPlayer.seekTo(positionSeconds)
      if (__DEV__) console.log(`✅ safeSeekTo 성공 (${reason}): ${positionSeconds.toFixed(2)}초`)
      return true
    } catch (error) {
      if (__DEV__) console.error(`❌ safeSeekTo 실패 (${reason}):`, error)
      return false
    } finally {
      // 기존 타이머 취소
      if (seekTimeoutRef.current) {
        clearTimeout(seekTimeoutRef.current)
      }

      // 진행바 클릭/드래그는 즉시 플래그 해제 (빠른 반응을 위해)
      if (reason === '진행바 클릭') {
        actions.setIsJumping(false)
        if (__DEV__) console.log(`✅ isJumping 플래그 즉시 리셋 (${reason})`)
      } else {
        // 다른 경우는 짧은 대기 후 해제
        seekTimeoutRef.current = setTimeout(() => {
          actions.setIsJumping(false)
          if (__DEV__) console.log(`✅ isJumping 플래그 리셋 (${reason})`)
        }, 50)
      }
    }
  }, [actions])

  // TrackPlayer 초기화 - 폴링 방식으로 개선
  useEffect(() => {
    let retryCount = 0
    const maxRetries = 3
    let initTimeoutId: NodeJS.Timeout | null = null

    const checkServiceReady = (retries = 10): void => {
      if (typeof global.isPlayerInitialized === 'function') {
        if (__DEV__) console.log('✅ service.js 준비 완료, 초기화 시작')
        initializeTrackPlayer()
      } else if (retries > 0) {
        if (__DEV__) console.log(`⏳ service.js 대기 중... (${11 - retries}/10)`)
        initTimeoutId = setTimeout(() => checkServiceReady(retries - 1), 100)
      } else {
        if (__DEV__) console.error('❌ service.js 로딩 시간 초과')
        actions.setError('플레이어 초기화 시간 초과. 앱을 재시작해주세요.')
      }
    }

    const initializeTrackPlayer = async () => {
      try {
        if (__DEV__) console.log('🎵 AudioPlayer TrackPlayer 초기화 시작...')

        // 이미 초기화되었는지 확인 (중복 방지)
        if (global.isPlayerInitialized?.()) {
          if (__DEV__) console.log('✅ AudioPlayer TrackPlayer 이미 초기화됨 - 건너뛰기')
          actions.setPlayerInitialized(true)
          return
        }

        // TrackPlayer 초기화
        if (__DEV__) console.log('⚙️ AudioPlayer TrackPlayer.setupPlayer() 호출...')
        await TrackPlayer.setupPlayer({
          waitForBuffer: true,
        })
        if (__DEV__) console.log('✅ AudioPlayer TrackPlayer.setupPlayer() 완료')

        // 초기화 상태 업데이트
        global.setPlayerInitialized?.(true)

        actions.setPlayerInitialized(true)
        if (__DEV__) console.log('✅ AudioPlayer 초기화 완료')
      } catch (error) {
        if (__DEV__) {
          console.error('❌ AudioPlayer TrackPlayer 초기화 실패:', error)
          console.error('❌ 에러 스택:', (error as Error).stack)
        }

        // 재시도 로직
        if (retryCount < maxRetries) {
          retryCount++
          if (__DEV__) console.log(`🔄 초기화 재시도 ${retryCount}/${maxRetries}...`)
          initTimeoutId = setTimeout(() => initializeTrackPlayer(), 1000 * retryCount)
        } else {
          actions.setError('TrackPlayer 초기화에 실패했습니다. 앱을 재시작해주세요.')
          actions.setPlayerInitialized(false)
        }
      }
    }

    // service.js 준비 상태 확인 후 초기화
    checkServiceReady()

    // Cleanup: 모든 타이머 정리
    return () => {
      if (initTimeoutId) {
        clearTimeout(initTimeoutId)
      }
      if (seekTimeoutRef.current) {
        clearTimeout(seekTimeoutRef.current)
      }
      if (localPositionTimeoutRef.current) {
        clearTimeout(localPositionTimeoutRef.current)
      }
    }
  }, [])

  // 컴포넌트 초기화 시 로컬 스토리지에서 저장된 구간 로드
  useEffect(() => {
    const loadedSections = loadSavedSections()
    if (loadedSections.length > 0) {
      onSavedSectionsChange?.(loadedSections)
    }
  }, [])

  // TrackPlayer용 오디오 소스 결정
  const getAudioSource = useCallback(() => {
    // URL이 있으면 우선적으로 사용
    if (audioUrl) {
      return audioUrl
    }
    
    if (audioFile) {
      // 로컬 파일의 경우 require로 로드
      try {
        // 동적으로 assets/audio/ 폴더에서 파일 찾기
        const audioAssets = {
          "sample.mp3": require("../../assets/audio/sample.mp3"),
          // 새 파일을 추가할 때 여기에 추가하세요
          // "my-song.mp3": require("../../assets/audio/my-song.mp3"),
          // "another-song.mp3": require("../../assets/audio/another-song.mp3"),
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

  // TrackPlayer용 오디오 로드 함수
  const loadAudio = async () => {
    let retryCount = 0
    const maxRetries = 2

    const attemptLoad = async (): Promise<void> => {
      try {
        if (!audioSource) {
          actions.setError("오디오 파일을 준비 중입니다")
          return
        }

        actions.setLoading(true)
        actions.setError(null)

        // 기존 트랙들 클리어
        try {
          await TrackPlayer.reset()
        } catch (resetError) {
          // 빈 큐일 때는 무시
        }

        // 새 트랙 추가
        const trackToAdd = audioSource ? {
          id: 'audioplayerTrack',
          url: audioSource,
          title: audioFile || 'Audio Track',
          artist: 'AudioPlayer',
        } : null

        if (trackToAdd) {
          await TrackPlayer.add(trackToAdd)
          if (__DEV__) console.log('🎵 TrackPlayer 트랙 추가 완료')
        }

        actions.setLoading(false)
        if (__DEV__) console.log("🎵 AudioPlayer TrackPlayer 오디오 로드 완료")
      } catch (err) {
        if (__DEV__) console.error("❌ AudioPlayer TrackPlayer 오디오 로드 실패:", err)

        // 재시도 로직
        if (retryCount < maxRetries) {
          retryCount++
          if (__DEV__) console.log(`🔄 오디오 로드 재시도 ${retryCount}/${maxRetries}...`)
          await new Promise(resolve => setTimeout(resolve, 500 * retryCount))
          return attemptLoad()
        } else {
          actions.setError("오디오 파일을 로드할 수 없습니다. 다시 시도해주세요.")
          actions.setLoading(false)
        }
      }
    }

    return attemptLoad()
  }

  const unloadAudio = async () => {
    try {
      await TrackPlayer.reset()
      if (__DEV__) console.log('🧹 AudioPlayer TrackPlayer 언로드 완료')
    } catch (error) {
      if (__DEV__) console.error('❌ AudioPlayer TrackPlayer 언로드 오류:', error)
    }
  }

  // 오디오 로드 - TrackPlayer 초기화 후에만 실행
  const audioLoadRef = useRef({ audioFile: '', audioUrl: '' })
  useEffect(() => {
    if (!state.isPlayerInitialized) {
      console.log('⏳ TrackPlayer 초기화 대기 중...');
      return;
    }

    // 실제로 오디오 파일이 변경되었는지 확인
    const currentAudio = { audioFile: audioFile || '', audioUrl: audioUrl || '' }
    
    if (audioLoadRef.current.audioFile === currentAudio.audioFile && 
        audioLoadRef.current.audioUrl === currentAudio.audioUrl) {
      return
    }
    audioLoadRef.current = currentAudio

    loadAudio()
    return () => {
      unloadAudio()
    }
  }, [audioFile, audioUrl, state.isPlayerInitialized])

  // 🎵 오디오 로드 시 A-B 초기값 설정
  useEffect(() => {
    const duration = progress.duration || 0

    // duration이 있고, A나 B가 아직 설정 안 되어 있으면 자동 설정
    if (duration > 0 && (state.loopState.pointA === null || state.loopState.pointB === null)) {
      if (__DEV__) console.log(`🎵 오디오 로드 완료 - A-B 초기값 설정 (duration: ${duration}s)`)
      actions.setLoopState({
        pointA: 0,
        pointB: duration,
        isLooping: true
      })
    }
  }, [progress.duration, state.loopState.pointA, state.loopState.pointB, actions])

  // 🔁 A-B 반복 재생 로직
  useEffect(() => {
    const { pointA, pointB, isLooping } = state.loopState

    // A-B가 모두 설정되어 있고, 반복이 활성화되어 있을 때만
    if (pointA === null || pointB === null || !isLooping) {
      return
    }

    // 현재 재생 위치 확인
    const currentPos = progress.position || 0

    // B점을 넘어갔으면 A점으로 돌아가기
    if (currentPos >= pointB && !state.isJumping) {
      // 마지막 A-B 점프로부터 최소 500ms 경과했는지 확인 (버벅임 방지)
      const now = Date.now()
      const timeSinceLastLoop = now - lastABLoopTimeRef.current

      if (timeSinceLastLoop < 500) {
        if (__DEV__) console.log(`⏳ A-B 반복 쿨다운 중... (${timeSinceLastLoop}ms < 500ms)`)
        return
      }

      if (__DEV__) console.log(`🔁 B점 도달 (${currentPos.toFixed(2)}s) → A점으로 이동 (${pointA.toFixed(2)}s)`)
      lastABLoopTimeRef.current = now
      safeSeekTo(pointA, 'A-B 반복')
    }
  }, [progress.position, state.loopState, state.isJumping, safeSeekTo])

  // 🔑 useProgress가 localPosition을 따라잡으면 자동으로 해제
  useEffect(() => {
    if (localPosition !== null) {
      const progressPos = progress.position || 0
      const diff = Math.abs(progressPos - localPosition)

      // useProgress가 localPosition에 충분히 가까워지면 (0.5초 이내) 해제
      if (diff < 0.5) {
        // 기존 타이머 취소
        if (localPositionTimeoutRef.current) {
          clearTimeout(localPositionTimeoutRef.current)
        }

        // 즉시 해제
        setLocalPosition(null)
        if (__DEV__) console.log(`✅ localPosition 자동 해제 - useProgress 따라잡음 (diff: ${diff.toFixed(3)}s)`)
      } else {
        // 아직 멀면 안전장치로 1초 후 강제 해제
        if (localPositionTimeoutRef.current) {
          clearTimeout(localPositionTimeoutRef.current)
        }

        localPositionTimeoutRef.current = setTimeout(() => {
          setLocalPosition(null)
          if (__DEV__) console.log('⚠️ localPosition 타임아웃 해제 (1초 경과)')
        }, 1000)
      }
    }
  }, [progress.position, localPosition])

  // TrackPlayer progress 모니터링
  useEffect(() => {
    const currentPosition = (progress.position || 0) * 1000 // ms로 변환
    const currentDuration = (progress.duration || 0) * 1000 // ms로 변환

    if (onPlaybackStatusUpdate) {
      onPlaybackStatusUpdate({
        isLoaded: true,
        positionMillis: currentPosition,
        durationMillis: currentDuration,
        isPlaying: playbackState &&
                  playbackState.state !== undefined &&
                  String(playbackState.state) === "playing"
      })
    }
  }, [progress.position, progress.duration, playbackState, onPlaybackStatusUpdate])

  const togglePlayback = async () => {
    if (!state.isPlayerInitialized) return

    try {
      // TrackPlayer 기본 상태 확인
      const queue = await TrackPlayer.getQueue()

      // 큐가 비어있으면 오디오를 다시 로드
      if (queue.length === 0) {
        if (__DEV__) console.log("⚠️ TrackPlayer 큐가 비어있음, 오디오 재로드 시도")
        await loadAudio()
        return
      }

      const isCurrentlyPlaying = playbackState &&
                                playbackState.state !== undefined &&
                                String(playbackState.state) === "playing"

      const currentTime = progress.position || 0
      const duration = progress.duration || 0

      // 곡이 끝난 상태면 처음부터 다시 재생
      if (currentTime >= duration && duration > 0) {
        await safeSeekTo(0, '곡 끝난 후 처음부터')
        await TrackPlayer.play()
        return
      }

      // 일반적인 재생/일시정지 토글
      if (isCurrentlyPlaying) {
        await TrackPlayer.pause()
      } else {
        await TrackPlayer.play()
      }
    } catch (err) {
      console.error("Playback error:", err)
      actions.setError("재생 오류")
    }
  }

  const seekToPosition = async (seekProgress: number) => {
    if (__DEV__) console.log("🎯 seekToPosition 호출:", {
      seekProgress,
      isPlayerInitialized: state.isPlayerInitialized,
      duration: progress.duration
    })

    if (!state.isPlayerInitialized) {
      if (__DEV__) console.log("❌ 플레이어 초기화 안됨")
      return
    }

    // duration이 없으면 먼저 재생을 시작해서 duration을 로드
    if (!progress.duration || progress.duration === 0) {
      // 이미 duration 로드 중이면 대기
      if (isLoadingDurationRef.current) {
        if (__DEV__) console.log("⏳ duration 로드 중 - 대기")

        // duration이 로드될 때까지 대기 (최대 3초)
        let waitRetries = 30
        while (waitRetries > 0 && isLoadingDurationRef.current) {
          await new Promise(resolve => setTimeout(resolve, 100))
          waitRetries--
        }

        // 대기 후 duration 확인
        const currentProgress = await TrackPlayer.getProgress()
        if (currentProgress.duration > 0) {
          const seekPosition = seekProgress * currentProgress.duration
          if (__DEV__) console.log("✅ 대기 후 seek 실행:", { seekProgress, seekPosition, duration: currentProgress.duration })
          await safeSeekTo(seekPosition, '진행바 클릭')
          return
        }

        if (__DEV__) console.log("❌ 대기 후에도 duration 없음")
        return
      }

      // duration 로드 시작
      isLoadingDurationRef.current = true
      if (__DEV__) console.log("⚠️ duration 없음 - 재생 시작하여 duration 로드")

      try {
        // 재생 전 현재 재생 상태 저장
        const wasPlaying = playbackState &&
                          playbackState.state !== undefined &&
                          String(playbackState.state) === "playing"

        // 재생 시작
        await TrackPlayer.play()

        // duration이 로드될 때까지 잠시 대기 (최대 2초)
        let retries = 20
        while (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 100))
          const currentProgress = await TrackPlayer.getProgress()

          if (currentProgress.duration > 0) {
            if (__DEV__) console.log("✅ duration 로드됨:", currentProgress.duration)

            // 목표 위치로 seek
            const seekPosition = seekProgress * currentProgress.duration
            if (__DEV__) console.log("✅ seek 실행:", { seekProgress, seekPosition, duration: currentProgress.duration })
            await safeSeekTo(seekPosition, '진행바 클릭')

            // 원래 재생 중이 아니었으면 다시 일시정지
            if (!wasPlaying) {
              await TrackPlayer.pause()
            }

            isLoadingDurationRef.current = false
            return
          }

          retries--
        }

        if (__DEV__) console.log("❌ duration 로드 타임아웃")
        isLoadingDurationRef.current = false
        return
      } catch (error) {
        if (__DEV__) console.error("❌ seekToPosition 에러:", error)
        isLoadingDurationRef.current = false
        return
      }
    }

    const seekPosition = seekProgress * progress.duration
    if (__DEV__) console.log("✅ seek 실행:", { seekProgress, seekPosition, duration: progress.duration })
    await safeSeekTo(seekPosition, '진행바 클릭')
  }

  // handleProgressPress function removed - functionality moved to touch handlers
  
  // 진행바 레이아웃 측정
  const handleProgressBarLayout = (event: any) => {
    const { width } = event.nativeEvent.layout
    actions.setProgressBarWidth(width)
  }
  
  // 펄스 애니메이션 기능은 현재 사용되지 않음
  // const startPulseAnimation = () => { ... }
  // const stopPulseAnimation = () => { ... }


  const formatTime = (milliseconds: number) => {
    // Handle invalid or undefined values
    if (!milliseconds || isNaN(milliseconds) || milliseconds < 0) {
      return "0:00"
    }
    
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // 현재 position 가져오기 (로컬 우선) - useMemo로 메모이제이션
  const currentPosition = useMemo(() => {
    return localPosition !== null ? localPosition : (progress.position || 0)
  }, [localPosition, progress.position])

  // 진행바 progress 계산 - useMemo로 메모이제이션
  const currentProgress = useMemo(() => {
    const duration = progress.duration || 0

    if (!duration || duration <= 0) return 0

    const progressValue = currentPosition / duration

    // Ensure we return a valid number between 0 and 1
    if (isNaN(progressValue) || !isFinite(progressValue)) return 0

    return Math.max(0, Math.min(1, progressValue))
  }, [currentPosition, progress.duration])

  // 진행바 터치 핸들러 - 마커 드래그 처리 추가
  const handleProgressPressIn = (event: any) => {
    // 마커 드래그 중이면 마커 드래그 처리
    if (state.isDragging) {
      handleMarkerDrag(event)
      return
    }

    // pageX와 measure()를 사용하여 정확한 위치 계산
    const { pageX } = event.nativeEvent
    if (progressBarRef.current) {
      progressBarRef.current.measure((_x, _y, width, _height, pageXPos, _pageYPos) => {
        const relativeX = pageX - pageXPos
        const ratio = Math.max(0, Math.min(1, relativeX / width))

        // A-B 구간이 설정되어 있으면 구간 내로 제한
        const duration = progress.duration || 0
        if (duration > 0 && state.loopState.pointA !== null && state.loopState.pointB !== null) {
          const targetPosition = ratio * duration
          const pointA = state.loopState.pointA
          const pointB = state.loopState.pointB

          // A-B 구간 밖이면 차단
          if (targetPosition < pointA || targetPosition > pointB) {
            if (__DEV__) console.log(`🚫 진행바 터치 차단: ${targetPosition.toFixed(2)}s는 A-B 구간[${pointA.toFixed(2)}s, ${pointB.toFixed(2)}s] 밖`)
            return
          }
        }

        if (__DEV__) console.log('👆 진행바 터치:', { pageX, pageXPos, relativeX, width, ratio: ratio.toFixed(3) })
        seekToPosition(ratio)
      })
    }
  }

  const handleProgressTouch = (event: any) => {
    // 마커 드래그 중이면 마커 드래그 처리
    if (state.isDragging) {
      handleMarkerDrag(event)
      return
    }

    // 드래그 중에는 50ms throttle 적용 (부드러운 드래그를 위해)
    const now = Date.now()
    if (now - lastSeekTimeRef.current < 50) {
      return
    }
    lastSeekTimeRef.current = now

    // pageX와 measure()를 사용하여 정확한 위치 계산
    const { pageX } = event.nativeEvent
    if (progressBarRef.current) {
      progressBarRef.current.measure((_x, _y, width, _height, pageXPos, _pageYPos) => {
        const relativeX = pageX - pageXPos
        const ratio = Math.max(0, Math.min(1, relativeX / width))

        // A-B 구간이 설정되어 있으면 구간 내로 제한
        const duration = progress.duration || 0
        if (duration > 0 && state.loopState.pointA !== null && state.loopState.pointB !== null) {
          const targetPosition = ratio * duration
          const pointA = state.loopState.pointA
          const pointB = state.loopState.pointB

          // A-B 구간 밖이면 차단
          if (targetPosition < pointA || targetPosition > pointB) {
            if (__DEV__) console.log(`🚫 진행바 드래그 차단: ${targetPosition.toFixed(2)}s는 A-B 구간[${pointA.toFixed(2)}s, ${pointB.toFixed(2)}s] 밖`)
            return
          }
        }

        if (__DEV__) console.log('👉 진행바 드래그:', { pageX, pageXPos, relativeX, width, ratio: ratio.toFixed(3) })
        seekToPosition(ratio)
      })
    }
  }

  const handleProgressPressOut = () => {
    // 마커 드래그 종료 처리
    if (state.isDragging) {
      handleMarkerDragEnd()
      return
    }

    // 터치 종료 처리
    if (__DEV__) console.log('✋ 진행바 터치 종료')
  }



  // A, B 점 설정 및 리셋 함수 제거 - 드래그로만 조작

  // 마커 드래그 핸들러
  const handleMarkerDragStart = useCallback((marker: 'A' | 'B', event: any) => {
    event.stopPropagation()
    actions.setDragging(marker)
    const { pageX } = event.nativeEvent
    if (__DEV__) console.log(`🖐️ ${marker} 마커 드래그 시작:`, pageX)
  }, [actions])

  const handleMarkerDrag = useCallback((event: any) => {
    if (!state.isDragging) return

    const { pageX } = event.nativeEvent
    const duration = progress.duration || 0
    if (duration === 0 || state.progressBarWidth === 0) return

    // 진행바의 절대 위치를 측정하여 상대 위치 계산
    if (progressBarRef.current) {
      progressBarRef.current.measure((x, y, width, height, pageXPos, pageYPos) => {
        const relativeX = pageX - pageXPos
        const ratio = Math.max(0, Math.min(1, relativeX / width))
        const newPosition = ratio * duration

        if (__DEV__) console.log(`👆 ${state.isDragging} 마커 드래그:`, {
          pageX,
          pageXPos,
          relativeX,
          ratio: ratio.toFixed(3),
          newPosition: newPosition.toFixed(2)
        })

        // A 또는 B 위치 업데이트
        if (state.isDragging === 'A') {
          // B가 있으면 A는 B보다 앞에만 가능
          if (state.loopState.pointB !== null && newPosition >= state.loopState.pointB) {
            return
          }
          actions.setLoopState({ pointA: newPosition })
        } else if (state.isDragging === 'B') {
          // A가 있으면 B는 A보다 뒤에만 가능
          if (state.loopState.pointA !== null && newPosition <= state.loopState.pointA) {
            return
          }
          actions.setLoopState({ pointB: newPosition })
        }
      })
    }
  }, [state.isDragging, state.loopState, state.progressBarWidth, progress.duration, actions])

  const handleMarkerDragEnd = useCallback(() => {
    if (state.isDragging) {
      if (__DEV__) console.log(`✋ ${state.isDragging} 마커 드래그 종료`)

      // A 마커 드래그 종료 시, 플레이어가 A-B 구간 밖에 있으면 A로 이동
      if (state.isDragging === 'A' && state.loopState.pointA !== null && state.loopState.pointB !== null) {
        const currentPos = currentPosition
        const pointA = state.loopState.pointA
        const pointB = state.loopState.pointB

        // 플레이어가 A-B 구간 밖에 있는지 체크
        const isOutsideAB = currentPos < pointA || currentPos > pointB

        if (isOutsideAB) {
          if (__DEV__) console.log(`🎯 플레이어(${currentPos.toFixed(2)}s)가 A-B 구간[${pointA.toFixed(2)}s, ${pointB.toFixed(2)}s] 밖 → A로 이동`)
          safeSeekTo(pointA, 'A 마커 드래그로 구간 밖으로 벗어남')
        } else {
          if (__DEV__) console.log(`✅ 플레이어(${currentPos.toFixed(2)}s)가 A-B 구간[${pointA.toFixed(2)}s, ${pointB.toFixed(2)}s] 안 → 유지`)
        }
      }

      actions.setDragging(null)
    }
  }, [state.isDragging, state.loopState.pointA, state.loopState.pointB, actions, currentPosition, safeSeekTo])

  // 구간 저장 - 사용자 입력 이름 사용
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
    }

    const updatedSections = [...savedSections, newSection]
    onSavedSectionsChange?.(updatedSections)

    // 로컬 스토리지에 자동 저장
    saveSectionsToStorage(updatedSections)

    alert("저장 완료!", `"${newSection.name}" 구간이 저장되었습니다.`)
  }


  if (state.error) {
    return (
      <View style={themed([$container, style])}>
        <Text text={`❌ ${state.error}`} style={themed($errorText)} />
      </View>
    )
  }

  // TrackPlayer 초기화 대기 중
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
        {/* 상태 표시 제거 - A/B 로직 없음 */}

      {/* 시간 표시 */}
      <View style={themed($timeContainer)}>
        <Text
          text={formatTime(currentPosition * 1000)}
          style={themed($timeText)}
        />
        <Text
          text=" / "
          style={themed($timeSeparator)}
        />
        <Text
          text={formatTime((progress.duration || 0) * 1000)}
          style={themed($timeText)}
        />
      </View>

      {/* 진행바 + A-B Pin 마커 */}
      <View style={themed($progressContainer)}>
        {/* A, B Pin 마커 - 진행바 위에 위치 */}
        <View style={themed($pinsContainer)}>
          {/* A Pin 마커 */}
          {state.loopState.pointA !== null && (
            <View
              style={[
                themed($pinMarker),
                themed($pinMarkerA),
                state.isDragging === 'A' && themed($pinMarkerDragging),
                { left: `${(state.loopState.pointA / (progress.duration || 1)) * 100}%` }
              ]}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => state.isDragging === 'A'}
              onResponderGrant={(event) => handleMarkerDragStart('A', event)}
              onResponderMove={(event) => handleMarkerDrag(event)}
              onResponderRelease={handleMarkerDragEnd}
              onResponderTerminationRequest={() => false}
            >
              <View style={[themed($pinHead), { backgroundColor: "#4CAF50" }]}>
                <Text style={themed($pinText)}>A</Text>
              </View>
              <View style={themed($pinNeedle)} />
            </View>
          )}

          {/* B Pin 마커 */}
          {state.loopState.pointB !== null && (
            <View
              style={[
                themed($pinMarker),
                themed($pinMarkerB),
                state.isDragging === 'B' && themed($pinMarkerDragging),
                { left: `${(state.loopState.pointB / (progress.duration || 1)) * 100}%` }
              ]}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => state.isDragging === 'B'}
              onResponderGrant={(event) => handleMarkerDragStart('B', event)}
              onResponderMove={(event) => handleMarkerDrag(event)}
              onResponderRelease={handleMarkerDragEnd}
              onResponderTerminationRequest={() => false}
            >
              <View style={[themed($pinHead), { backgroundColor: "#F44336" }]}>
                <Text style={themed($pinText)}>B</Text>
              </View>
              <View style={themed($pinNeedle)} />
            </View>
          )}
        </View>

        {/* 진행바 */}
        <View
          ref={progressBarRef}
          style={themed($progressTrack)}
          onStartShouldSetResponder={() => true}
          onResponderGrant={(event) => handleProgressPressIn(event)}
          onResponderMove={(event) => handleProgressTouch(event)}
          onResponderRelease={() => handleProgressPressOut()}
          onLayout={handleProgressBarLayout}
        >
          {/* A-B 구간 하이라이트 */}
          {state.loopState.pointA !== null && state.loopState.pointB !== null && (
            <View
              style={[
                themed($loopHighlight),
                {
                  left: `${(state.loopState.pointA / (progress.duration || 1)) * 100}%`,
                  width: `${((state.loopState.pointB - state.loopState.pointA) / (progress.duration || 1)) * 100}%`
                }
              ]}
            />
          )}

          {/* 기본 진행바 */}
          <View
            style={[
              themed($progressBar),
              { width: `${currentProgress * 100}%` as any }
            ]}
          />
        </View>
      </View>

      {/* A-B 제어 버튼 제거 - 드래그로만 조작 */}

      {/* 간단한 저장 모달 */}
      <Modal
        visible={state.showSaveModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => actions.setShowSaveModal(false)}
      >
        <View style={themed($modalOverlay)}>
          <View style={themed($modalContainer)}>
            <View style={themed($modalHeader)}>
              <Ionicons name="bookmark" size={24} color="#007AFF" />
              <Text text="구간 저장" style={themed($modalTitle)} />
              <TouchableOpacity 
                onPress={() => actions.setShowSaveModal(false)}
                style={themed($modalCloseButton)}
              >
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <Text text="구간 이름을 입력해주세요" style={themed($modalDescription)} />

            {/* 이름 입력 필드 */}
            <TextInput
              style={themed($nameInput)}
              value={state.sectionName}
              onChangeText={actions.setSectionName}
              placeholder="예: 어려운 구간, 연습할 부분..."
              placeholderTextColor="#999"
              autoFocus={true}
              maxLength={50}
            />

            {/* 저장 버튼 */}
            <View style={themed($saveButtonsContainer)}>
              <TouchableOpacity 
                style={themed($cancelButton)} 
                onPress={() => {
                  actions.setShowSaveModal(false)
                  actions.setSectionName("")
                }}
              >
                <Text text="취소" style={themed($cancelButtonText)} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={themed([$saveButton, { opacity: state.sectionName.trim() ? 1 : 0.5 }])} 
                onPress={() => {
                  if (state.sectionName.trim()) {
                    saveSection(state.sectionName.trim())
                    actions.setShowSaveModal(false)
                    actions.setSectionName("")
                  }
                }}
                disabled={!state.sectionName.trim()}
              >
                <Text text="저장" style={themed($saveButtonText)} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 재생 컨트롤 및 저장 버튼 */}
      <View style={themed($controlsContainer)}>
        <AudioButton
          icon={(() => {
            try {
              if (!playbackState || playbackState.state === undefined || playbackState.state === null) {
                return "play"
              }
              const isPlaying = String(playbackState.state) === "playing"
              return isPlaying ? "pause" : "play"
            } catch (error) {
              if (__DEV__) console.error("🎵 PlaybackState error:", error)
              return "play"
            }
          })()}
          onPress={togglePlayback}
          disabled={!state.isPlayerInitialized || state.isLoading}
          size={32}
          style={themed($playButton)}
        />
        
        {/* 저장 버튼을 Play 버튼과 같은 라인에 배치 */}
        <TouchableOpacity
          style={themed($saveButtonAligned)}
          onPress={() => {
            if (__DEV__) console.log("🎵 Save button TouchableOpacity pressed")
            actions.setShowSaveModal(true)
          }}
        >
          <Text text="구간 저장하기" style={themed($saveButtonTextOnly)} />
        </TouchableOpacity>
      </View>


        {/* 상태 표시 */}
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

interface AudioButtonProps extends TouchableOpacityProps {
  icon: string
  size?: number
  style?: ViewStyle
}

function AudioButton({ icon, size = 24, style, ...props }: AudioButtonProps) {
  const { themed, theme } = useAppTheme()

  // Validate icon prop
  if (typeof icon !== 'string') {
    if (__DEV__) console.error("AudioButton: icon must be a string, received:", typeof icon, icon)
    return (
      <TouchableOpacity style={themed([$button, style])} {...props}>
        <Text text="?" />
      </TouchableOpacity>
    )
  }

  // Ionicons 아이콘 매핑
  const getIoniconName = (iconName: string): keyof typeof Ionicons.glyphMap => {
    switch (iconName) {
      case "play":
        return "play"  // 재생 아이콘
      case "pause":
        return "pause"  // 일시정지 아이콘
      case "stop":
        return "stop"  // 정지 아이콘
      default:
        return "ellipse"
    }
  }

  const isAudioIcon = ["play", "pause", "stop"].includes(icon)

  return (
    <TouchableOpacity
      style={themed([$button, style])}
      activeOpacity={0.7}
      {...props}
    >
      {isAudioIcon ? (
        <Ionicons
          name={getIoniconName(icon)}
          size={size}
          color={props.disabled ? theme.colors.textDim : 
                 (icon === "play" || icon === "pause") ? theme.colors.background : theme.colors.tint}
        />
      ) : (
        <Icon
          icon={icon as any}
          size={size}
          color={props.disabled ? theme.colors.textDim : theme.colors.tint}
        />
      )}
    </TouchableOpacity>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  padding: spacing.lg,
  borderRadius: 16,
  alignItems: "center",
})

const $controlsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: spacing.lg,
})

const $button: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  padding: spacing.sm,
  borderRadius: 50,
  backgroundColor: colors.palette.neutral200,
  marginHorizontal: spacing.xs,
  justifyContent: "center",
  alignItems: "center",
})

const $playButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  width: 64,
  height: 64,
  borderRadius: 32,
  backgroundColor: colors.tint,
  marginHorizontal: spacing.md,
  justifyContent: "center",
  alignItems: "center",
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 4,
})


const $progressContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "relative",
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.sm,
  width: "100%",
  paddingTop: 50, // Pin 마커 공간 확보
})

const $timeContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginTop: spacing.sm,
})

const $timeText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
})

const $timeSeparator: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  marginHorizontal: 4,
})

const $progressTrack: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 8,
  backgroundColor: colors.separator,
  borderRadius: 4,
  justifyContent: "center",
  width: "100%",
})

const $progressBar: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: "100%",
  backgroundColor: colors.tint,
  borderRadius: 4,
  minWidth: 8,
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

// A/B 관련 스타일
const $loopHighlight: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  height: "100%",
  backgroundColor: colors.tint,
  opacity: 0.2,
  borderRadius: 4,
})

// Pin 마커 컨테이너 (진행바 위)
const $pinsContainer: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  top: -40, // 진행바 위 40px
  left: 0,
  right: 0,
  height: 40,
  zIndex: 20,
})

// Pin 마커 (A, B)
const $pinMarker: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  alignItems: "center",
  width: 40,
  marginLeft: -20, // 중앙 정렬
  zIndex: 20,
})

// Pin 머리 (원형)
const $pinHead: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 28,
  height: 28,
  borderRadius: 14,
  justifyContent: "center",
  alignItems: "center",
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 3,
  elevation: 4,
})

// Pin 바늘 (세로선)
const $pinNeedle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 2,
  height: 20,
  backgroundColor: colors.palette.neutral800,
})

// A Pin 색상
const $pinMarkerA: ThemedStyle<ViewStyle> = () => ({
  zIndex: 21,
})

// B Pin 색상
const $pinMarkerB: ThemedStyle<ViewStyle> = () => ({
  zIndex: 22,
})

// Pin 텍스트
const $pinText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.bold,
  color: colors.background,
})

// Pin 드래그 상태
const $pinMarkerDragging: ThemedStyle<ViewStyle> = () => ({
  transform: [{ scale: 1.3 }],
})

// A-B 버튼 스타일 제거됨 - 드래그로만 조작

const $saveButtonsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: spacing.lg,
  gap: spacing.sm,
})

const $saveButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.tint,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  borderRadius: 8,
  flex: 1,
  marginLeft: spacing.sm,
  alignItems: "center",
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 3,
})

const $saveButtonText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  color: colors.background,
  fontFamily: typography.primary.medium,
  fontSize: 16,
})



// 모달 스타일들
const $modalOverlay: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
})

const $modalContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: 16,
  padding: spacing.lg,
  width: "100%",
  maxWidth: 400,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.25,
  shadowRadius: 16,
  elevation: 8,
})

const $modalHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.md,
})

const $modalTitle: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  fontSize: 18,
  fontFamily: typography.primary.bold,
  color: colors.text,
  flex: 1,
  marginLeft: spacing.sm,
})

const $modalCloseButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.xs,
  borderRadius: 4,
})

const $modalDescription: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.textDim,
  textAlign: "center",
  marginBottom: spacing.lg,
})

// 저장 버튼 관련 스타일

const $saveButtonAligned: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.tint,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  borderRadius: 12,
  marginLeft: spacing.lg,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 3,
})

const $saveButtonTextOnly: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.background,
  textAlign: "center",
})

// 새로운 모달 입력 관련 스타일
const $nameInput: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  backgroundColor: colors.background,
  borderWidth: 1,
  borderColor: colors.separator,
  borderRadius: 8,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
  fontSize: 16,
  fontFamily: typography.primary.normal,
  color: colors.text,
  marginVertical: spacing.lg,
  minHeight: 48,
})

const $cancelButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  borderRadius: 8,
  flex: 1,
  marginRight: spacing.sm,
  alignItems: "center",
})

const $cancelButtonText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: colors.text,
})
