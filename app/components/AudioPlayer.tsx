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

// A-B 구간 반복 관련 타입
export interface SavedSection {
  id: string
  name: string
  pointA: number
  pointB: number
  createdAt: Date
}

interface LoopState {
  pointA: number | null
  pointB: number | null
  isLooping: boolean
  currentSection: SavedSection | null
}

// UI 모드 타입
type UIMode = 'normal' | 'setting-sections' | 'loop-active'

// A-B 설정 단계
type SectionSettingStep = 'none' | 'setting-a' | 'setting-b' | 'complete'

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
  
  const isInitialLoad = useRef(true)
  const userSetB = useRef(false) // 사용자가 수동으로 B를 설정했는지 추적
  const progressBarRef = useRef<View>(null)
  // const pulseAnim = useRef(new Animated.Value(1)).current // Removed - not used

  // TrackPlayer 초기화
  useEffect(() => {
    const initializeTrackPlayer = async () => {
      try {
        // 이미 초기화되었는지 확인 (중복 방지)
        if (typeof global.state.isPlayerInitialized === 'function' && global.state.isPlayerInitialized()) {
          actions.setPlayerInitialized(true);
          return;
        }

        // TrackPlayer 초기화
        await TrackPlayer.setupPlayer({
          waitForBuffer: true,
        });

        // 초기화 상태 업데이트
        if (typeof global.setPlayerInitialized === 'function') {
          global.setPlayerInitialized(true);
        }
        
        actions.setPlayerInitialized(true);
      } catch (error) {
        actions.setError('TrackPlayer 초기화에 실패했습니다.');
        actions.setPlayerInitialized(false);
      }
    };

    // service.js가 로드될 때까지 1초 대기 후 초기화
    setTimeout(() => {
      initializeTrackPlayer();
    }, 1000);
  }, []);

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
      let trackToAdd;
      if (audioSource) {
        trackToAdd = {
          id: 'audioplayerTrack',
          url: audioSource, // getAudioSource()에서 반환한 실제 소스 사용
          title: audioFile || 'Audio Track',
          artist: 'AudioPlayer',
        }
      }

      if (trackToAdd) {
        await TrackPlayer.add(trackToAdd)
        console.log('🎵 TrackPlayer 트랙 추가 완료')
      }

      actions.setLoading(false)
      console.log("🎵 AudioPlayer TrackPlayer 오디오 로드 완료")
    } catch (err) {
      console.error("❌ AudioPlayer TrackPlayer 오디오 로드 실패:", err)
      actions.setError("오디오 파일을 로드할 수 없습니다")
      actions.setLoading(false)
    }
  }

  const unloadAudio = async () => {
    try {
      await TrackPlayer.reset()
      console.log('🧹 AudioPlayer TrackPlayer 언로드 완료')
    } catch (error) {
      console.error('❌ AudioPlayer TrackPlayer 언로드 오류:', error)
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

    // 새로운 오디오 로드 시 상태 초기화
    actions.setHasAutoSetB(false)
    isInitialLoad.current = true
    userSetB.current = false // 새 파일 로드 시 사용자 설정 플래그 리셋
    
    // 새로운 파일이 로드될 때만 A, B 초기화
    console.log("🔄 오디오 로드 - 상태 초기화:", {
      이전_A: state.loopState.pointA,
      이전_B: state.loopState.pointB,
      새_A: 0,
      새_B: null,
    })
    actions.setLoopState({
      pointA: 0,
      pointB: null,
      currentSection: null,
      isLooping: false,
    })
    
    loadAudio()
    return () => {
      unloadAudio()
    }
  }, [audioFile, audioUrl, state.isPlayerInitialized])

  // A-B 구간 무한 반복 로직 - TrackPlayer 버전
  useEffect(() => {
    // A와 B가 설정되어 있으면 자동으로 무한 반복 (재생 중일 때만)
    const isPlaying = playbackState?.state === 'playing' || playbackState?.state === 'buffering'
    if (state.loopState.pointA !== null && state.loopState.pointB !== null && state.isPlayerInitialized && !state.isJumping && progress.position !== undefined && isPlaying) {
      const currentTimeSeconds = progress.position || 0
      const pointASeconds = state.loopState.pointA
      const pointBSeconds = state.loopState.pointB
      const durationSeconds = progress.duration || 0
      
      // 재생이 끝났으면 루프 중지
      if (currentTimeSeconds >= durationSeconds) {
        console.log("🛑 재생 완료, A-B 루프 중지:", {
          현재시간: currentTimeSeconds.toFixed(2),
          곡길이: durationSeconds.toFixed(2)
        })
        return
      }
      
      // B 지점에 도달하거나 넘어선 경우 A로 즉시 이동 (단, 곡이 끝나지 않은 경우만)
      if (currentTimeSeconds >= pointBSeconds && currentTimeSeconds < durationSeconds) {
        console.log("🔄 B 지점 도달, A로 무한 반복:", {
          현재시간: currentTimeSeconds.toFixed(2),
          A지점: pointASeconds.toFixed(2),
          B지점: pointBSeconds.toFixed(2),
        })
        
        actions.setIsJumping(true)
        
        TrackPlayer.seekTo(pointASeconds * 1000)
          .then(() => {
            console.log("✅ A 지점으로 이동 완료 - 무한 반복 계속")
          })
          .catch((error) => {
            console.error("❌ A 지점 이동 실패:", error)
          })
          .finally(() => {
            setTimeout(() => {
              actions.setIsJumping(false)
            }, 500)
          })
      }
    }
  }, [progress.position, progress.duration, state.loopState.pointA, state.loopState.pointB, state.isPlayerInitialized, state.isJumping, playbackState?.state])

  // service.js와 A-B 루프 상태 동기화
  useEffect(() => {
    if (typeof global.setABLoop === 'function' && state.isPlayerInitialized) {
      if (state.loopState.pointA !== null && state.loopState.pointB !== null) {
        console.log('🔄 AudioPlayer → service.js A-B 동기화:', {
          A: state.loopState.pointA,
          B: state.loopState.pointB,
          enabled: state.loopState.isLooping
        });
        global.setABLoop(state.loopState.isLooping, state.loopState.pointA, state.loopState.pointB);
        
        // 백그라운드 A-B 루프 체크 시작
        if (typeof global.startABLoopCheck === 'function') {
          global.startABLoopCheck();
        }
      } else {
        // A-B 설정이 없으면 루프 비활성화
        console.log('🛑 A-B 루프 비활성화');
        global.setABLoop(false, null, null);
        
        // 백그라운드 A-B 루프 체크 중지
        if (typeof global.stopABLoopCheck === 'function') {
          global.stopABLoopCheck();
        }
      }
    }
  }, [state.loopState.pointA, state.loopState.pointB, state.loopState.isLooping, state.isPlayerInitialized]);

  // A-B 구간 변경 시 자동 이동 처리 - TrackPlayer 버전 (재생 중일 때만)
  useEffect(() => {
    const isPlaying = playbackState?.state === 'playing' || playbackState?.state === 'buffering'
    if (state.isPlayerInitialized && state.loopState.pointA !== null && state.loopState.pointB !== null && !state.isJumping && progress.position !== undefined && isPlaying) {
      const currentTimeSeconds = progress.position || 0
      
      // 현재 위치가 A-B 범위 밖에 있으면 A 지점으로 이동
      if (currentTimeSeconds < state.loopState.pointA || currentTimeSeconds > state.loopState.pointB) {
        console.log(`📍 A-B 구간 변경으로 인한 자동 이동: ${currentTimeSeconds.toFixed(1)}s → ${state.loopState.pointA.toFixed(1)}s`)
        actions.setIsJumping(true)
        TrackPlayer.seekTo(state.loopState.pointA * 1000)
          .then(() => {
            console.log("✅ A-B 구간 변경으로 A 지점 이동 완료")
          })
          .catch((error) => {
            console.error("❌ A-B 구간 변경으로 인한 이동 실패:", error)
          })
          .finally(() => {
            setTimeout(() => {
              actions.setIsJumping(false)
            }, 300)
          })
      }
    }
  }, [state.loopState.pointA, state.loopState.pointB, progress.position, state.isPlayerInitialized, state.isJumping, playbackState?.state])

  // 외부에서 구간 로드 요청 처리
  useEffect(() => {
    if (loadSection && state.isPlayerInitialized) {
      console.log("🎯 External load section request:", loadSection.name)
      actions.setLoopState({
        pointA: loadSection.pointA,
        pointB: loadSection.pointB,
        currentSection: loadSection,
        isLooping: false,
      })
      actions.setHasAutoSetB(true) // 외부 로드 시 자동 설정 방지
      userSetB.current = true // 외부 로드도 사용자 설정으로 간주
      
      // TrackPlayer로 해당 지점으로 이동
      TrackPlayer.seekTo(loadSection.pointA * 1000)
        .then(() => {
          console.log("✅ 로드된 구간 A 지점으로 이동 완료")
        })
        .catch(error => {
          console.error("❌ 구간 로드 시 이동 실패:", error)
        })
      
      onLoadSection?.(loadSection)
      alert("로드 완료", `"${loadSection.name}" 구간이 로드되었습니다.`)
    }
  }, [loadSection, onLoadSection, state.isPlayerInitialized])

  // initializeTrackPlayer function removed - functionality moved to loadAudio

  // TrackPlayer progress 모니터링
  useEffect(() => {
    const currentPosition = (progress.position || 0) * 1000 // ms로 변환
    const currentDuration = (progress.duration || 0) * 1000 // ms로 변환
    
    // 초기 로드 시에만 pointB를 자동으로 끝지점으로 설정 (사용자가 설정하지 않은 경우만)
    if (currentDuration > 0 && state.loopState.pointB === null && !state.hasAutoSetB && isInitialLoad.current && !userSetB.current) {
      console.log("🎵 자동 B 설정 조건 체크:", {
        duration: currentDuration,
        pointB: state.loopState.pointB,
        hasAutoSetB: state.hasAutoSetB,
        isInitialLoad: isInitialLoad.current,
        userSetB: userSetB.current,
      })
      
      actions.setLoopState({ 
        pointA: state.loopState.pointA,
        pointB: currentDuration / 1000, // 초 단위로 변환
        currentSection: state.loopState.currentSection,
        isLooping: state.loopState.isLooping,
      })
      actions.setHasAutoSetB(true)
      isInitialLoad.current = false
      console.log("✅ Auto-set B point to end:", (currentDuration / 1000).toFixed(1), "seconds")
    } else if (currentDuration > 0 && userSetB.current) {
      console.log("🚫 자동 B 설정 건너뜀 - 사용자가 이미 설정함")
    }
    
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
  }, [progress.position, progress.duration, playbackState, state.loopState.pointB, state.hasAutoSetB, onPlaybackStatusUpdate])

  const togglePlayback = async () => {
    if (!state.isPlayerInitialized) return

    console.log("🎵 재생 버튼 클릭 - 현재 상태:", {
      playbackState,
      pointA: state.loopState.pointA,
      pointB: state.loopState.pointB,
      currentPosition: (progress.position || 0).toFixed(2),
      duration: (progress.duration || 0).toFixed(2)
    })

    try {
      // TrackPlayer 기본 상태 확인
      const queue = await TrackPlayer.getQueue()
      const currentTrack = await TrackPlayer.getActiveTrack()
      const trackPlayerState = await TrackPlayer.getPlaybackState()
      
      console.log("🔍 TrackPlayer 기본 상태:", {
        queueLength: queue.length,
        hasCurrentTrack: !!currentTrack,
        trackPlayerState,
        playbackStateFromHook: playbackState
      })
      
      // 큐가 비어있으면 오디오를 다시 로드
      if (queue.length === 0) {
        console.log("⚠️ TrackPlayer 큐가 비어있음, 오디오 재로드 시도")
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
        console.log("🔄 곡이 끝난 상태, 처음부터 다시 재생")
        
        // TrackPlayer 상태 상세 확인
        const trackPlayerState = await TrackPlayer.getPlaybackState()
        const queue = await TrackPlayer.getQueue()
        const currentTrack = await TrackPlayer.getActiveTrack()
        
        console.log("🔍 TrackPlayer 상태 상세:", {
          trackPlayerState,
          queueLength: queue.length,
          currentTrack: currentTrack?.title,
          currentTrackId: currentTrack?.id
        })
        
        // 0초로 이동 시도
        console.log("🎯 0초로 이동 시도...")
        await TrackPlayer.seekTo(0) // 0은 * 1000해도 0이므로 그대로
        
        // 재생 시도
        console.log("▶️ 재생 시도...")
        await TrackPlayer.play()
        
        // 상태 재확인
        setTimeout(async () => {
          const newState = await TrackPlayer.getPlaybackState()
          const newProgress = await TrackPlayer.getProgress()
          console.log("🔍 재생 시도 후 상태:", {
            state: newState,
            position: newProgress.position,
            duration: newProgress.duration
          })
        }, 500)
        
        return
      }
      
      // A-B 구간이 설정되어 있으면 위치 확인
      if (state.loopState.pointA !== null && state.loopState.pointB !== null) {
        const currentTimeSeconds = progress.position || 0
        const pointASeconds = state.loopState.pointA
        const pointBSeconds = state.loopState.pointB
        
        console.log("🔍 위치 체크:", {
          재생중: isCurrentlyPlaying,
          현재위치: currentTimeSeconds.toFixed(2),
          A지점: pointASeconds.toFixed(2),
          B지점: pointBSeconds.toFixed(2),
          구간내: currentTimeSeconds >= pointASeconds && currentTimeSeconds <= pointBSeconds
        })
        
        // 현재 위치가 A-B 구간 밖에 있으면 A 지점으로 이동
        if (currentTimeSeconds < pointASeconds || currentTimeSeconds > pointBSeconds) {
          console.log("🎯 현재 위치가 A-B 구간 밖에 있음, A 지점으로 이동")
          
          // A 지점으로 이동
          await TrackPlayer.seekTo(pointASeconds * 1000)
          console.log("✅ A 지점으로 이동 완료")
          
          // 재생 시작 (이전 상태와 관계없이)
          if (!isCurrentlyPlaying) {
            await TrackPlayer.play()
          }
        } else {
          // A-B 구간 내에 있는 경우 일반적인 재생/일시정지 토글
          if (isCurrentlyPlaying) {
            await TrackPlayer.pause()
          } else {
            await TrackPlayer.play()
          }
        }
      } else {
        // A-B 구간이 설정되지 않은 경우 일반적인 재생/일시정지 토글
        if (isCurrentlyPlaying) {
          await TrackPlayer.pause()
        } else {
          await TrackPlayer.play()
        }
      }
    } catch (err) {
      console.error("Playback error:", err)
      actions.setError("재생 오류")
    }
  }

  const seekToPosition = async (seekProgress: number) => {
    if (!state.isPlayerInitialized || !progress.duration || progress.duration === 0) return

    try {
      const seekPosition = seekProgress * (progress.duration || 0)
      console.log("🎯 seekToPosition:", { seekProgress, seekPosition })
      await TrackPlayer.seekTo(seekPosition * 1000) // 초 단위를 밀리초로 변환
    } catch (err) {
      console.error("Seek error:", err)
    }
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

  const getProgress = () => {
    const duration = progress.duration || 0
    const position = progress.position || 0
    
    if (!duration || duration <= 0) return 0
    
    const progressValue = position / duration
    
    // Ensure we return a valid number between 0 and 1
    if (isNaN(progressValue) || !isFinite(progressValue)) return 0
    
    return Math.max(0, Math.min(1, progressValue))
  }

  // Safe percentage calculation for markers
  const getPercentage = (value: number | null, total: number | null): string => {
    if (value === null || total === null || total <= 0 || isNaN(value) || isNaN(total)) {
      return "0%"
    }
    const percentage = (value / total) * 100
    if (isNaN(percentage) || !isFinite(percentage)) {
      return "0%"
    }
    return `${Math.max(0, Math.min(100, percentage))}%`
  }

  // A-B 구간 관련 함수들 - TrackPlayer 버전
  const setPointAToCurrentTime = () => {
    const currentTime = progress.position || 0
    console.log("🅰️ A 버튼 클릭 - 현재 시간:", currentTime.toFixed(1), "초")
    console.log("🅰️ A 지점 설정 전 상태:", { 이전A: state.loopState.pointA, 이전B: state.loopState.pointB })
    actions.setLoopState({ 
      pointA: currentTime,
      pointB: state.loopState.pointB,
      currentSection: state.loopState.currentSection,
      isLooping: state.loopState.isLooping,
    })
    console.log("🅰️ A 지점 설정 완룈:", currentTime.toFixed(1), "초")
  }

  const setPointBToCurrentTime = () => {
    const currentTime = progress.position || 0
    if (state.loopState.pointA !== null && currentTime <= state.loopState.pointA) {
      alert("오류", "B 지점은 A 지점보다 뒤에 있어야 합니다.")
      return
    }
    console.log("🅱️ B 지점 수동 설정 - 이전 상태:", state.loopState.pointB, "→ 새 값:", currentTime.toFixed(1))
    actions.setLoopState({ 
      pointA: state.loopState.pointA,
      pointB: currentTime,
      currentSection: state.loopState.currentSection,
      isLooping: state.loopState.isLooping,
    })
    actions.setHasAutoSetB(true) // 수동 설정 시 자동 설정 방지
    userSetB.current = true // 사용자가 수동으로 설정했음을 기록
    console.log("🅱️ B 지점 설정 완료:", currentTime.toFixed(1), "초")
  }

  // A/B 마커 드래그 상태 관리
  const [isDragging, setIsDragging] = useState<'A' | 'B' | null>(null)
  
  // 진행바에서 위치를 시간으로 변환
  const getTimeFromPosition = (x: number): number => {
    const ratio = Math.max(0, Math.min(1, x / state.progressBarWidth))
    return ratio * (progress.duration || 0)
  }
  
  // A 마커 터치 핸들러 - 즉시 현재 위치로 이동
  const handleAMarkerPress = () => {
    console.log('🅰️ A 마커 터치 - 현재 위치로 설정')
    const currentTime = progress.position || 0
    
    if (state.loopState.pointB !== null && currentTime >= state.loopState.pointB) {
      alert("오류", "A 지점은 B 지점보다 앞에 있어야 합니다.")
      return
    }
    
    actions.setLoopState({ 
      pointA: currentTime,
      pointB: state.loopState.pointB,
      currentSection: state.loopState.currentSection,
      isLooping: state.loopState.isLooping,
    })
    
    // A 마커 설정 시 재생 위치를 A로 이동
    TrackPlayer.seekTo(currentTime * 1000)
      .then(() => {
        console.log('✅ A 지점으로 재생 위치 이동:', currentTime.toFixed(2))
      })
      .catch((error) => {
        console.error('❌ A 지점 이동 실패:', error)
      })
  }
  
  // B 마커 터치 핸들러 - 즉시 현재 위치로 이동
  const handleBMarkerPress = () => {
    console.log('🅱️ B 마커 터치 - 현재 위치로 설정')
    const currentTime = progress.position || 0
    
    if (state.loopState.pointA !== null && currentTime <= state.loopState.pointA) {
      alert("오류", "B 지점은 A 지점보다 뒤에 있어야 합니다.")
      return
    }
    
    actions.setLoopState({ 
      pointA: state.loopState.pointA,
      pointB: currentTime,
      currentSection: state.loopState.currentSection,
      isLooping: state.loopState.isLooping,
    })
    actions.setHasAutoSetB(true)
    userSetB.current = true
    console.log('✅ B 지점 설정 완료:', currentTime.toFixed(2))
  }
  
  // 진행바에서 마커 드래그 감지 및 처리
  const detectMarkerAtPosition = (x: number): 'A' | 'B' | null => {
    if (!progress.duration || progress.duration <= 0 || state.progressBarWidth <= 0) return null
    
    const tolerance = 30 // 30px 허용 범위 (더 넓게)
    
    // A 마커 위치 계산
    if (state.loopState.pointA !== null) {
      const aPosition = (state.loopState.pointA / progress.duration) * state.progressBarWidth
      const distance = Math.abs(x - aPosition)
      console.log('🎯 A 마커 감지 체크:', {
        x,
        aPosition: aPosition.toFixed(1),
        distance: distance.toFixed(1),
        tolerance,
        detected: distance <= tolerance
      })
      if (distance <= tolerance) {
        return 'A'
      }
    }
    
    // B 마커 위치 계산
    if (state.loopState.pointB !== null) {
      const bPosition = (state.loopState.pointB / progress.duration) * state.progressBarWidth
      const distance = Math.abs(x - bPosition)
      console.log('🎯 B 마커 감지 체크:', {
        x,
        bPosition: bPosition.toFixed(1),
        distance: distance.toFixed(1),
        tolerance,
        detected: distance <= tolerance
      })
      if (distance <= tolerance) {
        return 'B'
      }
    }
    
    return null
  }
  
  // 진행바 터치 시작 핸들러
  const handleProgressPressIn = (event: any) => {
    const { locationX } = event.nativeEvent
    console.log('🎵 Progress press in - locationX:', locationX, 'state.progressBarWidth:', state.progressBarWidth)
    console.log('🎵 Current markers:', {
      pointA: state.loopState.pointA,
      pointB: state.loopState.pointB,
      duration: progress.duration
    })
    
    // 마커 근처에서 터치했는지 확인
    const nearMarker = detectMarkerAtPosition(locationX)
    if (nearMarker) {
      console.log(`🎯 ${nearMarker} 마커 드래그 시작!`)
      setIsDragging(nearMarker)
      // 드래그 시작 위치 기록 (필요시 복원 가능)
      // setDragStartX(locationX)
      // setDragStartTime(nearMarker === 'A' ? (state.loopState.pointA || 0) : (state.loopState.pointB || 0))
      
      // 즉시 현재 터치 위치로 마커 이동
      const newTime = getTimeFromPosition(locationX)
      if (nearMarker === 'A') {
        if (state.loopState.pointB === null || newTime < state.loopState.pointB) {
          actions.setLoopState({ 
            pointA: newTime,
            pointB: state.loopState.pointB,
            currentSection: state.loopState.currentSection,
            isLooping: state.loopState.isLooping,
          })
          TrackPlayer.seekTo(newTime * 1000)
            .then(() => console.log('✅ A 지점 즉시 이동:', newTime.toFixed(2)))
            .catch(error => console.error('❌ A 지점 이동 실패:', error))
        }
      } else if (nearMarker === 'B') {
        if (state.loopState.pointA === null || newTime > state.loopState.pointA) {
          actions.setLoopState({ 
            pointA: state.loopState.pointA,
            pointB: newTime,
            currentSection: state.loopState.currentSection,
            isLooping: state.loopState.isLooping,
          })
          actions.setHasAutoSetB(true)
          userSetB.current = true
          console.log('✅ B 지점 즉시 이동:', newTime.toFixed(2))
        }
      }
    } else {
      console.log('🎵 마커 근처가 아님, 일반 터치')
    }
  }
  
  // 진행바 터치 핸들러
  const handleProgressTouch = (event: any) => {
    const { locationX } = event.nativeEvent
    console.log('🎵 Progress touch - locationX:', locationX, 'isDragging:', isDragging)
    
    const newTime = getTimeFromPosition(locationX)
    
    if (isDragging === 'A') {
      // A 마커 드래그 중
      console.log('🅰️ A 마커 드래그 위치 업데이트:', newTime.toFixed(2))
      if (state.loopState.pointB !== null && newTime >= state.loopState.pointB) {
        console.log('⚠️ A는 B보다 앞에 있어야 함')
        return
      }
      
      actions.setLoopState({ 
        pointA: newTime,
        pointB: state.loopState.pointB,
        currentSection: state.loopState.currentSection,
        isLooping: state.loopState.isLooping,
      })
      
      // A 마커 드래그 시 재생 위치도 함께 이동
      TrackPlayer.seekTo(newTime * 1000)
        .then(() => {
          console.log('✅ A 지점으로 재생 위치 이동:', newTime.toFixed(2))
        })
        .catch((error) => {
          console.error('❌ A 지점 이동 실패:', error)
        })
      
    } else if (isDragging === 'B') {
      // B 마커 드래그 중
      console.log('🅱️ B 마커 드래그 위치 업데이트:', newTime.toFixed(2))
      if (state.loopState.pointA !== null && newTime <= state.loopState.pointA) {
        console.log('⚠️ B는 A보다 뒤에 있어야 함')
        return
      }
      
      actions.setLoopState({ 
        pointA: state.loopState.pointA,
        pointB: newTime,
        currentSection: state.loopState.currentSection,
        isLooping: state.loopState.isLooping,
      })
      actions.setHasAutoSetB(true)
      userSetB.current = true
      
    } else {
      // 일반 진행바 터치 (구간 설정 모드가 아닐 때만)
      console.log('🎵 일반 진행바 터치:', newTime.toFixed(2))
      if (state.uiMode !== 'setting-sections') {
        seekToPosition(locationX / state.progressBarWidth)
      }
    }
  }
  
  // 진행바 터치 종료 핸들러
  const handleProgressPressOut = () => {
    if (isDragging) {
      console.log(`✅ ${isDragging} 마커 드래그 완료`)
      setIsDragging(null)
    }
  }



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

  // 상태별 가이드 메시지
  const getGuideMessage = () => {
    try {
      if (state.loopState.pointA !== null && state.loopState.pointB !== null) {
        const aTime = formatTime((state.loopState.pointA || 0) * 1000)
        const bTime = formatTime((state.loopState.pointB || 0) * 1000)
        console.log("🔄 A-B 구간 활성:", { A: aTime, B: bTime })
        return `🔁 ${aTime} ~ ${bTime} 무한 반복 중`
      }
      console.log("ℹ️ A-B 구간 없음:", { pointA: state.loopState.pointA, pointB: state.loopState.pointB })
      return "🎵 전체 곡 재생 중"
    } catch (error) {
      console.error("getGuideMessage error:", error)
      return "🎵 재생 중"
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={themed([$container, style])}>
        {/* 상태 표시 */}
        <View style={themed($statusBar)}>
          <Text text={getGuideMessage()} style={themed($statusText)} />
        </View>

      {/* 시간 표시 */}
      <View style={themed($timeContainer)}>
        <Text 
          text={formatTime((progress.position || 0) * 1000)} 
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

      {/* 진행바 with A-B 마커 - 단순화된 버전 */}
      <View style={themed($progressContainer)}>
        <TouchableOpacity 
          ref={progressBarRef}
          style={themed($progressTrack)}
          onPressIn={(event) => {
            console.log("🎵 Progress bar onPressIn")
            handleProgressPressIn(event)
          }}
          onPress={(event) => {
            console.log("🎵 Progress bar onPress, isDragging:", isDragging)
            handleProgressTouch(event)
          }}
          onPressOut={() => {
            console.log("🎵 Progress bar onPressOut")
            handleProgressPressOut()
          }}
          onLayout={(event) => {
            console.log("🎵 Progress bar onLayout")
            handleProgressBarLayout(event)
          }}
          activeOpacity={1}
          delayPressOut={100}
        >
          {/* 기본 진행바 */}
          <View 
            style={[
              themed($progressBar), 
              { width: (() => {
                const progressValue = getProgress()
                const widthValue = `${progressValue * 100}%` as any
                console.log("🎵 Progress calculation:", { progressValue, widthValue })
                return widthValue
              })() }
            ]} 
          />
          
          {/* A-B 구간 하이라이트 */}
          {(() => {
            const shouldShow = state.loopState.pointA !== null && state.loopState.pointB !== null && progress.duration && progress.duration > 0
            console.log("🎵 A-B highlight condition:", { 
              pointA: state.loopState.pointA, 
              pointB: state.loopState.pointB, 
              duration: progress.duration, 
              shouldShow 
            })
            return shouldShow ? (
              <View 
                style={[
                  themed($loopHighlight),
                  {
                    left: getPercentage(state.loopState.pointA!, progress.duration!) as any,
                    width: getPercentage(state.loopState.pointB! - state.loopState.pointA!, progress.duration!) as any
                  }
                ]} 
              />
            ) : null
          })()}
          
          {/* A 마커 - 드래그 가능 */}
          {(() => {
            console.log("🎵 A marker rendering check:", { 
              pointA: state.loopState.pointA, 
              duration: progress.duration,
              shouldRender: state.loopState.pointA !== null && progress.duration && progress.duration > 0
            })
            return state.loopState.pointA !== null && progress.duration && progress.duration > 0 ? (
              <TouchableOpacity
                style={[
                  themed($marker), 
                  themed($markerA),
                  isDragging === 'A' && themed($markerDragging),
                  { left: getPercentage(state.loopState.pointA!, progress.duration!) as any }
                ]}
                onPress={handleAMarkerPress}
                activeOpacity={0.8}
              >
                <Text text="A" style={themed($markerText)} />
              </TouchableOpacity>
            ) : null
          })()}
          
          {/* B 마커 - 드래그 가능 */}
          {(() => {
            console.log("🎵 B marker rendering check:", { 
              pointB: state.loopState.pointB, 
              duration: progress.duration,
              shouldRender: state.loopState.pointB !== null && progress.duration && progress.duration > 0
            })
            return state.loopState.pointB !== null && progress.duration && progress.duration > 0 ? (
              <TouchableOpacity
                style={[
                  themed($marker), 
                  themed($markerB),
                  isDragging === 'B' && themed($markerDragging),
                  { left: getPercentage(state.loopState.pointB!, progress.duration!) as any }
                ]}
                onPress={handleBMarkerPress}
                activeOpacity={0.8}
              >
                <Text text="B" style={themed($markerText)} />
              </TouchableOpacity>
            ) : null
          })()}
        </TouchableOpacity>
      </View>

      {/* A/B 위치 조정 컨트롤 - 간단한 버전 */}
      <View style={themed($simpleControlsContainer)}>
        {/* A/B 위치 설정 버튼들 */}
        <View style={themed($positionButtonsRow)}>
          <TouchableOpacity 
            style={themed($positionButton)} 
            onPress={() => {
              console.log("🎵 A button TouchableOpacity pressed")
              setPointAToCurrentTime()
            }}
          >
            <Ionicons name="play-skip-back" size={18} color="#007AFF" />
            <Text text="A 여기로" style={themed($positionButtonText)} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={themed($positionButton)} 
            onPress={() => {
              console.log("🎵 B button TouchableOpacity pressed")
              setPointBToCurrentTime()
            }}
          >
            <Ionicons name="play-skip-forward" size={18} color="#007AFF" />
            <Text text="B 여기로" style={themed($positionButtonText)} />
          </TouchableOpacity>
        </View>
        
        {/* 사용법 안내 */}
        <View style={themed($usageGuideContainer)}>
          <Text text="💡 진행바에서 A, B 마커 근처를 드래그하거나 마커를 터치하여 구간을 설정하세요" style={themed($usageGuideText)} />
        </View>

      </View>

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
              console.log("🎵 PlaybackState Check:", { 
                playbackState, 
                state: playbackState?.state, 
                stateType: typeof playbackState?.state,
                StateEnumValue: State?.Playing,
                StateEnumType: typeof State?.Playing
              })
              
              // Ultra-safe comparison
              if (!playbackState || playbackState.state === undefined || playbackState.state === null) {
                console.log("🎵 No valid playbackState, defaulting to play")
                return "play"
              }
              
              // String comparison instead of enum comparison
              const isPlaying = String(playbackState.state) === "playing"
              console.log("🎵 String comparison result:", { 
                stateString: String(playbackState.state), 
                isPlaying 
              })
              
              return isPlaying ? "pause" : "play"
            } catch (error) {
              console.error("🎵 PlaybackState error:", error)
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
            console.log("🎵 Save button TouchableOpacity pressed")
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
  
  console.log("🎵 AudioButton props:", { icon, size, disabled: props.disabled })
  
  // Validate icon prop
  if (typeof icon !== 'string') {
    console.error("AudioButton: icon must be a string, received:", typeof icon, icon)
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
  console.log("🎵 AudioButton render:", { icon, isAudioIcon, ioniconName: getIoniconName(icon) })
  
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
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.sm,
  width: "100%",
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

const $iconText: ThemedStyle<TextStyle> = ({ typography }) => ({
  textAlign: "center",
  fontFamily: typography.primary.medium,
})

// 새로운 UX 스타일들
const $statusBar: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.accent100,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderRadius: 8,
  marginBottom: spacing.md,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
})


const $actionButtonsRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.sm,
})

const $actionButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderWidth: 1,
  borderColor: colors.separator,
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 8,
  minWidth: 80,
  justifyContent: "center",
})

const $actionButtonActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
  borderColor: colors.tint,
})

const $actionButtonText: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  fontSize: 12,
  fontFamily: typography.primary.medium,
  color: colors.text,
  marginLeft: spacing.xs,
})

const $actionButtonTextActive: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.background,
})

// A-B 구간 관련 스타일
const $loopHighlight: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  height: "100%",
  backgroundColor: colors.tint,
  opacity: 0.3,
  borderRadius: 4,
})

const $loopHighlightActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  opacity: 0.5,
  backgroundColor: colors.error,
})

const $marker: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  top: -15,
  width: 28,
  height: 28,
  borderRadius: 14,
  justifyContent: "center",
  alignItems: "center",
  transform: [{ translateX: -14 }],
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 4,
  borderWidth: 2,
  borderColor: colors.background,
})

const $markerA: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.error,
})

const $markerB: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: "#007AFF",
})

const $markerText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 10,
  fontWeight: "bold",
  color: colors.background,
  fontFamily: typography.primary.bold,
})

const $loopControlsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  marginVertical: spacing.md,
  flexWrap: "wrap",
})

const $loopButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.palette.neutral200,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 8,
  marginHorizontal: spacing.xs,
  minWidth: 40,
  alignItems: "center",
})

const $loopButtonActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
})

const $loopButtonText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.text,
})

const $saveInputContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.palette.neutral100,
  padding: spacing.lg,
  borderRadius: 12,
  marginVertical: spacing.md,
  borderWidth: 1,
  borderColor: colors.separator,
})

const $saveInputTitle: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: colors.text,
  marginBottom: spacing.md,
  textAlign: "center",
})

const $quickTemplatesContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $quickTemplatesLabel: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.textDim,
  marginBottom: spacing.sm,
})

const $quickTemplatesRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.sm,
})

const $quickTemplateButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.tint,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderRadius: 20,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
})

const $quickTemplateText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.medium,
  color: colors.background,
})

const $customInputContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderTopWidth: 1,
  borderTopColor: colors.separator,
  paddingTop: spacing.md,
})

const $customInputLabel: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.textDim,
  marginBottom: spacing.sm,
})

const $saveInput: ThemedStyle<ViewStyle> = ({ spacing, colors, typography }) => ({
  backgroundColor: colors.background,
  borderWidth: 1,
  borderColor: colors.separator,
  borderRadius: 8,
  padding: spacing.sm,
  fontSize: 16,
  fontFamily: typography.primary.normal,
  marginBottom: spacing.sm,
})

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

const $quickSaveContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.sm,
})

const $quickSaveButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.separator,
})

const $quickSaveText: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: colors.text,
  marginLeft: spacing.sm,
  flex: 1,
})

// 단순화된 UI 스타일들
const $simpleControlsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginVertical: spacing.lg,
})

const $positionButtonsRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-around",
  marginBottom: spacing.md,
})

const $positionButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.separator,
  minWidth: 120,
  justifyContent: "center",
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
})

const $positionButtonText: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.text,
  marginLeft: spacing.sm,
})

// 저장 버튼 관련 스타일
const $saveButtonContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  marginTop: spacing.md,
})

const $saveButtonCentered: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.tint,
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  borderRadius: 12,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 3,
})

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

// 사용법 안내 스타일
const $usageGuideContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  backgroundColor: colors.palette.accent100,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderRadius: 8,
  marginTop: spacing.md,
})

const $usageGuideText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.normal,
  color: colors.textDim,
  textAlign: "center",
})

// 드래그 중 마커 스타일
const $markerDragging: ThemedStyle<ViewStyle> = ({ colors }) => ({
  shadowOpacity: 0.5,
  shadowRadius: 6,
  borderWidth: 3,
  borderColor: colors.background,
  // Note: transform with scale is applied separately via Animated.View if needed
})

