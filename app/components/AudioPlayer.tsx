import React, { useState, useEffect, useRef } from "react"
import { View, ViewStyle, TextStyle, TouchableOpacity, TouchableOpacityProps, ScrollView, Animated, Modal, TextInput } from "react-native"
import { Audio, AVPlaybackStatus } from "expo-av"
import { Ionicons } from "@expo/vector-icons"
import { PanGestureHandler, GestureHandlerRootView } from "react-native-gesture-handler"
import { MMKV } from "react-native-mmkv"

import { AlertModal } from "@/components/AlertModal"
import { Icon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { useAlert } from "@/hooks/useAlert"
import { useAppTheme } from "@/theme/context"
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
  onPlaybackStatusUpdate?: (status: AVPlaybackStatus) => void
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
 * Expo AV 기반 오디오 플레이어 컴포넌트
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
  const { themed } = useAppTheme()
  const { alertState, alert, hideAlert } = useAlert()
  const [sound, setSound] = useState<Audio.Sound | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [duration, setDuration] = useState<number>(0)
  const [position, setPosition] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  // A-B 구간 반복 상태 - 기본값으로 A=0, B=끝지점 설정
  const [loopState, setLoopState] = useState<LoopState>({
    pointA: 0, // 항상 0초부터 시작
    pointB: null, // duration을 알게 되면 설정
    isLooping: true, // 항상 무한 반복
    currentSection: null,
  })
  
  // B 지점 자동 설정 여부를 추적
  const [hasAutoSetB, setHasAutoSetB] = useState(false)
  const isInitialLoad = useRef(true)
  const userSetB = useRef(false) // 사용자가 수동으로 B를 설정했는지 추적
  
  // 구간 저장 모달
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [sectionName, setSectionName] = useState("")
  
  // A-B 루프 제어용 플래그
  const [isJumping, setIsJumping] = useState(false)
  
  // 새로운 UX 상태들
  const [uiMode, setUIMode] = useState<UIMode>('normal')
  const [sectionSettingStep, setSectionSettingStep] = useState<SectionSettingStep>('none')
  const [progressBarWidth, setProgressBarWidth] = useState(200)
  
  // 애니메이션 관련
  const pulseAnim = useRef(new Animated.Value(1)).current
  const progressBarRef = useRef<View>(null)

  // 🎯 디버깅 로그
  console.log("🎵 AudioPlayer Props:", { audioFile, audioUrl })

  // 컴포넌트 초기화 시 로컬 스토리지에서 저장된 구간 로드
  useEffect(() => {
    const loadedSections = loadSavedSections()
    if (loadedSections.length > 0) {
      console.log("📂 로컬 스토리지에서 구간 로드:", loadedSections.length, "개")
      onSavedSectionsChange?.(loadedSections)
    }
  }, [])

  // 오디오 소스 결정
  const getAudioSource = () => {
    console.log("🔍 getAudioSource - audioFile:", audioFile, "audioUrl:", audioUrl)
    
    if (audioFile) {
      // 로컬 파일의 경우 Asset 형태로 로드
      try {
        switch (audioFile) {
          case "sample.mp3":
            console.log("✅ Loading sample.mp3 from assets")
            return require("../../assets/audio/sample.mp3")
          default:
            console.log("❌ Unknown audio file:", audioFile)
            return null
        }
      } catch (error) {
        console.error("❌ 오디오 파일 로드 오류:", audioFile, error)
        return null
      }
    }
    if (audioUrl) {
      console.log("✅ Loading from URL:", audioUrl)
      return { uri: audioUrl }
    }
    
    console.log("❌ No audio source available")
    return null
  }

  const audioSource = getAudioSource()
  console.log("🎼 Final audioSource:", audioSource)

  // 오디오 로드
  useEffect(() => {
    // 새로운 오디오 로드 시 상태 초기화
    setHasAutoSetB(false)
    isInitialLoad.current = true
    userSetB.current = false // 새 파일 로드 시 사용자 설정 플래그 리셋
    
    // 새로운 파일이 로드될 때만 A, B 초기화
    setLoopState(prev => {
      console.log("🔄 오디오 로드 - 상태 초기화:", {
        이전_A: prev.pointA,
        이전_B: prev.pointB,
        새_A: 0,
        새_B: null,
      })
      return {
        ...prev,
        pointA: 0,
        pointB: null,
        currentSection: null,
      }
    })
    
    loadAudio()
    return () => {
      unloadAudio()
    }
  }, [audioFile, audioUrl])

  // A-B 구간 무한 반복 로직 - 단순화된 버전
  useEffect(() => {
    // A와 B가 설정되어 있으면 자동으로 무한 반복
    if (loopState.pointA !== null && loopState.pointB !== null && sound && !isJumping) {
      const currentTimeSeconds = position / 1000
      const pointASeconds = loopState.pointA
      const pointBSeconds = loopState.pointB
      
      // B 지점에 도달하거나 넘어선 경우 A로 즉시 이동
      if (currentTimeSeconds >= pointBSeconds) {
        console.log("🔄 B 지점 도달, A로 무한 반복:", {
          현재시간: currentTimeSeconds.toFixed(2),
          A지점: pointASeconds.toFixed(2),
          B지점: pointBSeconds.toFixed(2),
        })
        
        setIsJumping(true)
        
        sound.setPositionAsync(pointASeconds * 1000)
          .then(() => {
            console.log("✅ A 지점으로 이동 완료 - 무한 반복 계속")
          })
          .catch((error) => {
            console.error("❌ A 지점 이동 실패:", error)
          })
          .finally(() => {
            setTimeout(() => {
              setIsJumping(false)
            }, 500)
          })
      }
    }
  }, [position, loopState.pointA, loopState.pointB, sound, isJumping])

  // service.js와 A-B 루프 상태 동기화
  useEffect(() => {
    if (typeof global.setABLoop === 'function' && loopState.pointA !== null && loopState.pointB !== null) {
      console.log('🔄 AudioPlayer → service.js A-B 동기화:', {
        A: loopState.pointA,
        B: loopState.pointB,
        enabled: loopState.isLooping
      });
      global.setABLoop(loopState.isLooping, loopState.pointA, loopState.pointB);
    }
  }, [loopState.pointA, loopState.pointB, loopState.isLooping]);

  // A-B 구간 변경 시 자동 이동 처리
  useEffect(() => {
    if (sound && loopState.pointA !== null && loopState.pointB !== null && !isJumping) {
      const currentTimeSeconds = position / 1000
      
      // 현재 위치가 A-B 범위 밖에 있으면 A 지점으로 이동
      if (currentTimeSeconds < loopState.pointA || currentTimeSeconds > loopState.pointB) {
        console.log(`📍 A-B 구간 변경으로 인한 자동 이동: ${currentTimeSeconds.toFixed(1)}s → ${loopState.pointA.toFixed(1)}s`)
        setIsJumping(true)
        sound.setPositionAsync(loopState.pointA * 1000)
          .then(() => {
            console.log("✅ A-B 구간 변경으로 A 지점 이동 완료")
          })
          .catch((error) => {
            console.error("❌ A-B 구간 변경으로 인한 이동 실패:", error)
          })
          .finally(() => {
            setTimeout(() => {
              setIsJumping(false)
            }, 300)
          })
      }
    }
  }, [loopState.pointA, loopState.pointB, position, sound, isJumping])

  // 외부에서 구간 로드 요청 처리
  useEffect(() => {
    if (loadSection) {
      console.log("🎯 External load section request:", loadSection.name)
      setLoopState(prev => ({
        ...prev,
        pointA: loadSection.pointA,
        pointB: loadSection.pointB,
        currentSection: loadSection,
        isLooping: false,
      }))
      setHasAutoSetB(true) // 외부 로드 시 자동 설정 방지
      userSetB.current = true // 외부 로드도 사용자 설정으로 간주
      onLoadSection?.(loadSection)
      alert("로드 완료", `"${loadSection.name}" 구간이 로드되었습니다.`)
    }
  }, [loadSection, onLoadSection])

  const loadAudio = async () => {
    try {
      if (!audioSource) {
        setError("오디오 파일을 준비 중입니다")
        return
      }

      setIsLoading(true)
      setError(null)

      // 기존 사운드 언로드
      if (sound) {
        await sound.unloadAsync()
      }

      // 새 사운드 로드
      const { sound: newSound } = await Audio.Sound.createAsync(
        audioSource,
        { shouldPlay: false },
        handlePlaybackStatusUpdate
      )

      setSound(newSound)
      setIsLoading(false)

      console.log("🎵 Audio loaded successfully")
    } catch (err) {
      console.error("Failed to load audio:", err)
      setError("오디오 파일을 준비 중입니다")
      setIsLoading(false)
    }
  }

  const unloadAudio = async () => {
    if (sound) {
      await sound.unloadAsync()
      setSound(null)
    }
  }

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      const currentPosition = status.positionMillis || 0
      const currentDuration = status.durationMillis || 0
      
      setPosition(currentPosition)
      setDuration(currentDuration)
      setIsPlaying(status.isPlaying)
      
      // 초기 로드 시에만 pointB를 자동으로 끝지점으로 설정 (사용자가 설정하지 않은 경우만)
      if (currentDuration > 0 && loopState.pointB === null && !hasAutoSetB && isInitialLoad.current && !userSetB.current) {
        console.log("🎵 자동 B 설정 조건 체크:", {
          duration: currentDuration,
          pointB: loopState.pointB,
          hasAutoSetB,
          isInitialLoad: isInitialLoad.current,
          userSetB: userSetB.current,
        })
        
        setLoopState(prev => ({ 
          ...prev, 
          pointB: currentDuration / 1000 // 초 단위로 변환
        }))
        setHasAutoSetB(true)
        isInitialLoad.current = false
        console.log("✅ Auto-set B point to end:", (currentDuration / 1000).toFixed(1), "seconds")
      } else if (currentDuration > 0 && userSetB.current) {
        console.log("🚫 자동 B 설정 건너뜀 - 사용자가 이미 설정함")
      }
    }
    
    if (onPlaybackStatusUpdate) {
      onPlaybackStatusUpdate(status)
    }
  }

  const togglePlayback = async () => {
    if (!sound) return

    console.log("🎵 재생 버튼 클릭 - 현재 상태:", {
      isPlaying,
      pointA: loopState.pointA,
      pointB: loopState.pointB,
      currentPosition: (position / 1000).toFixed(2)
    })

    try {
      // A-B 구간이 설정되어 있으면 위치 확인 (재생 중이든 아니든)
      if (loopState.pointA !== null && loopState.pointB !== null) {
        // 실제 사운드 객체에서 현재 위치를 가져옴
        const status = await sound.getStatusAsync()
        const actualCurrentTime = status.isLoaded ? (status.positionMillis || 0) / 1000 : position / 1000
        
        const pointASeconds = loopState.pointA
        const pointBSeconds = loopState.pointB
        
        console.log("🔍 위치 체크:", {
          재생중: isPlaying,
          state위치: (position / 1000).toFixed(2),
          실제위치: actualCurrentTime.toFixed(2),
          A지점: pointASeconds.toFixed(2),
          B지점: pointBSeconds.toFixed(2),
          구간내: actualCurrentTime >= pointASeconds && actualCurrentTime <= pointBSeconds
        })
        
        // 현재 위치가 A-B 구간 밖에 있으면 A 지점으로 이동
        if (actualCurrentTime < pointASeconds || actualCurrentTime > pointBSeconds) {
          console.log("🎯 현재 위치가 A-B 구간 밖에 있음, A 지점으로 이동")
          
          // 재생 중이었는지 기억
          const wasPlaying = isPlaying
          
          // 재생 중이면 먼저 일시정지
          if (wasPlaying) {
            await sound.pauseAsync()
          }
          
          // A 지점으로 이동
          await sound.setPositionAsync(pointASeconds * 1000)
          console.log("✅ A 지점으로 이동 완료")
          
          // 이전에 재생 중이었거나 일시정지 상태에서 재생 시작하려는 경우 재생
          if (wasPlaying || !isPlaying) {
            await sound.playAsync()
          }
        } else {
          // A-B 구간 내에 있는 경우 일반적인 재생/일시정지 토글
          if (isPlaying) {
            await sound.pauseAsync()
          } else {
            await sound.playAsync()
          }
        }
      } else {
        // A-B 구간이 설정되지 않은 경우 일반적인 재생/일시정지 토글
        if (isPlaying) {
          await sound.pauseAsync()
        } else {
          await sound.playAsync()
        }
      }
    } catch (err) {
      console.error("Playback error:", err)
      setError("재생 오류")
    }
  }

  const seekToPosition = async (progress: number) => {
    if (!sound || duration === 0) return

    try {
      const seekPosition = progress * duration
      await sound.setPositionAsync(seekPosition)
    } catch (err) {
      console.error("Seek error:", err)
    }
  }

  const handleProgressPress = (event: any) => {
    const { locationX } = event.nativeEvent
    const progress = Math.max(0, Math.min(1, locationX / progressBarWidth))
    
    // 구간 설정 모드일 때
    if (uiMode === 'setting-sections') {
      const timeInSeconds = progress * (duration / 1000)
      
      if (sectionSettingStep === 'setting-a') {
        setLoopState(prev => ({ ...prev, pointA: timeInSeconds }))
        setSectionSettingStep('setting-b')
        startPulseAnimation()
      } else if (sectionSettingStep === 'setting-b') {
        if (loopState.pointA !== null && timeInSeconds <= loopState.pointA) {
          alert("오류", "B 지점은 A 지점보다 뒤에 있어야 합니다.")
          return
        }
        setLoopState(prev => ({ ...prev, pointB: timeInSeconds }))
        setSectionSettingStep('complete')
        setUIMode('normal')
        stopPulseAnimation()
        
        // 자동으로 저장 옵션 표시
        setTimeout(() => {
          alert(
            "구간 설정 완료", 
            "A-B 구간이 무한 반복됩니다. 이 구간을 저장하시겠습니까?",
            [
              { text: "나중에", style: "cancel" },
              { text: "저장하기", onPress: () => setShowSaveModal(true) }
            ]
          )
        }, 500)
      }
    } else {
      // 일반 모드에서는 기존처럼 시크
      seekToPosition(progress)
    }
  }
  
  // 진행바 레이아웃 측정
  const handleProgressBarLayout = (event: any) => {
    const { width } = event.nativeEvent.layout
    setProgressBarWidth(width)
  }
  
  // 펄스 애니메이션
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }
  
  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation()
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }


  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getProgress = () => {
    return duration > 0 ? position / duration : 0
  }

  // A-B 구간 관련 함수들 - 단순화된 버전
  const setPointAToCurrentTime = () => {
    const currentTime = position / 1000
    console.log("🅰️ A 버튼 클릭 - 현재 시간:", currentTime.toFixed(1), "초")
    setLoopState(prev => {
      console.log("🅰️ A 지점 설정 전 상태:", { 이전A: prev.pointA, 이전B: prev.pointB })
      return { ...prev, pointA: currentTime }
    })
    console.log("🅰️ A 지점 설정 완료:", currentTime.toFixed(1), "초")
  }

  const setPointBToCurrentTime = () => {
    const currentTime = position / 1000
    if (loopState.pointA !== null && currentTime <= loopState.pointA) {
      alert("오류", "B 지점은 A 지점보다 뒤에 있어야 합니다.")
      return
    }
    setLoopState(prev => {
      console.log("🅱️ B 지점 수동 설정 - 이전 상태:", prev.pointB, "→ 새 값:", currentTime.toFixed(1))
      return { ...prev, pointB: currentTime }
    })
    setHasAutoSetB(true) // 수동 설정 시 자동 설정 방지
    userSetB.current = true // 사용자가 수동으로 설정했음을 기록
    console.log("🅱️ B 지점 설정 완료:", currentTime.toFixed(1), "초")
  }

  // A/B 마커 드래그 함수들
  const dragStartPosition = useRef(0)
  const dragStartTime = useRef(0)
  
  const createMarkerHandlers = (marker: 'A' | 'B') => {
    const onGestureEvent = (event: any) => {
      const { translationX } = event.nativeEvent
      
      // 드래그 시작 시점의 시간에서 translationX만큼 이동한 새로운 시간 계산
      const dragDistance = translationX / progressBarWidth * (duration / 1000)
      const newTime = Math.max(0, Math.min(duration / 1000, dragStartTime.current + dragDistance))
      
      // 유효성 검사 및 상태 업데이트
      if (marker === 'A') {
        if (loopState.pointB !== null && newTime >= loopState.pointB) {
          return // A는 B보다 앞에 있어야 함
        }
        setLoopState(prev => ({ ...prev, pointA: newTime }))
      } else {
        if (loopState.pointA !== null && newTime <= loopState.pointA) {
          return // B는 A보다 뒤에 있어야 함
        }
        setLoopState(prev => ({ ...prev, pointB: newTime }))
        setHasAutoSetB(true) // 드래그로 설정 시 자동 설정 방지
        userSetB.current = true // 사용자가 드래그로 설정했음을 기록
      }
    }
    
    const onHandlerStateChange = (event: any) => {
      const { state } = event.nativeEvent
      
      // 드래그 시작 시 초기 위치 저장
      if (state === 2) { // State.BEGAN
        dragStartTime.current = marker === 'A' 
          ? (loopState.pointA || 0) 
          : (loopState.pointB || duration / 1000)
        console.log(`🎯 ${marker} 마커 드래그 시작:`, dragStartTime.current.toFixed(1), "초")
      }
      
      // 드래그 종료 시 로그
      if (state === 5) { // State.END
        const finalTime = marker === 'A' ? loopState.pointA : loopState.pointB
        console.log(`✅ ${marker} 마커 드래그 완료:`, finalTime?.toFixed(1), "초")
      }
    }
    
    return { onGestureEvent, onHandlerStateChange }
  }


  // 구간 저장 - 사용자 입력 이름 사용
  const saveSection = (name: string) => {
    if (loopState.pointA === null || loopState.pointB === null) {
      alert("오류", "A, B 구간을 먼저 설정해주세요.")
      return
    }

    const newSection: SavedSection = {
      id: Date.now().toString(),
      name: name,
      pointA: loopState.pointA,
      pointB: loopState.pointB,
      createdAt: new Date(),
    }

    const updatedSections = [...savedSections, newSection]
    onSavedSectionsChange?.(updatedSections)
    
    // 로컬 스토리지에 자동 저장
    saveSectionsToStorage(updatedSections)
    
    alert("저장 완료!", `"${newSection.name}" 구간이 저장되었습니다.`)
  }


  if (error) {
    return (
      <View style={themed([$container, style])}>
        <Text text={`❌ ${error}`} style={themed($errorText)} />
      </View>
    )
  }

  // 상태별 가이드 메시지
  const getGuideMessage = () => {
    if (loopState.pointA !== null && loopState.pointB !== null) {
      const aTime = formatTime(loopState.pointA * 1000)
      const bTime = formatTime(loopState.pointB * 1000)
      console.log("🔄 A-B 구간 활성:", { A: aTime, B: bTime })
      return `🔁 ${aTime} ~ ${bTime} 무한 반복 중`
    }
    console.log("ℹ️ A-B 구간 없음:", { pointA: loopState.pointA, pointB: loopState.pointB })
    return "🎵 전체 곡 재생 중"
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={themed([$container, style])}>
        {/* 상태 표시 */}
        <View style={themed($statusBar)}>
          <Text text={getGuideMessage()} style={themed($statusText)} />
        </View>

      {/* 시간 표시 */}
      <View style={themed($timeContainer)}>
        <Text 
          text={formatTime(position)} 
          style={themed($timeText)} 
        />
        <Text 
          text=" / " 
          style={themed($timeSeparator)} 
        />
        <Text 
          text={formatTime(duration)} 
          style={themed($timeText)} 
        />
      </View>

      {/* 진행바 with A-B 마커 - 단순화된 버전 */}
      <View style={themed($progressContainer)}>
        <TouchableOpacity 
          ref={progressBarRef}
          style={themed($progressTrack)}
          onPress={handleProgressPress}
          onLayout={handleProgressBarLayout}
          activeOpacity={1}
        >
          {/* 기본 진행바 */}
          <View 
            style={themed([$progressBar, { width: `${getProgress() * 100}%` }])} 
          />
          
          {/* A-B 구간 하이라이트 */}
          {loopState.pointA !== null && loopState.pointB !== null && (
            <View 
              style={themed([
                $loopHighlight,
                {
                  left: `${(loopState.pointA / (duration / 1000)) * 100}%`,
                  width: `${((loopState.pointB - loopState.pointA) / (duration / 1000)) * 100}%`
                }
              ])} 
            />
          )}
          
          {/* A 마커 - 드래그 가능 */}
          {loopState.pointA !== null && (
            <PanGestureHandler 
              {...createMarkerHandlers('A')}
            >
              <Animated.View 
                style={themed([
                  $marker, 
                  $markerA,
                  { left: `${(loopState.pointA / (duration / 1000)) * 100}%` }
                ])}
              >
                <Text text="A" style={themed($markerText)} />
              </Animated.View>
            </PanGestureHandler>
          )}
          
          {/* B 마커 - 드래그 가능 */}
          {loopState.pointB !== null && (
            <PanGestureHandler 
              {...createMarkerHandlers('B')}
            >
              <Animated.View 
                style={themed([
                  $marker, 
                  $markerB,
                  { left: `${(loopState.pointB / (duration / 1000)) * 100}%` }
                ])}
              >
                <Text text="B" style={themed($markerText)} />
              </Animated.View>
            </PanGestureHandler>
          )}
        </TouchableOpacity>
      </View>

      {/* A/B 위치 조정 컨트롤 - 간단한 버전 */}
      <View style={themed($simpleControlsContainer)}>
        {/* A/B 위치 설정 버튼들 */}
        <View style={themed($positionButtonsRow)}>
          <TouchableOpacity 
            style={themed($positionButton)} 
            onPress={setPointAToCurrentTime}
          >
            <Ionicons name="play-skip-back" size={18} color="#007AFF" />
            <Text text="A 여기로" style={themed($positionButtonText)} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={themed($positionButton)} 
            onPress={setPointBToCurrentTime}
          >
            <Ionicons name="play-skip-forward" size={18} color="#007AFF" />
            <Text text="B 여기로" style={themed($positionButtonText)} />
          </TouchableOpacity>
        </View>

      </View>

      {/* 간단한 저장 모달 */}
      <Modal
        visible={showSaveModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View style={themed($modalOverlay)}>
          <View style={themed($modalContainer)}>
            <View style={themed($modalHeader)}>
              <Ionicons name="bookmark" size={24} color="#007AFF" />
              <Text text="구간 저장" style={themed($modalTitle)} />
              <TouchableOpacity 
                onPress={() => setShowSaveModal(false)}
                style={themed($modalCloseButton)}
              >
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <Text text="구간 이름을 입력해주세요" style={themed($modalDescription)} />

            {/* 이름 입력 필드 */}
            <TextInput
              style={themed($nameInput)}
              value={sectionName}
              onChangeText={setSectionName}
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
                  setShowSaveModal(false)
                  setSectionName("")
                }}
              >
                <Text text="취소" style={themed($cancelButtonText)} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={themed([$saveButton, { opacity: sectionName.trim() ? 1 : 0.5 }])} 
                onPress={() => {
                  if (sectionName.trim()) {
                    saveSection(sectionName.trim())
                    setShowSaveModal(false)
                    setSectionName("")
                  }
                }}
                disabled={!sectionName.trim()}
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
          icon={isPlaying ? "pause" : "play"}
          onPress={togglePlayback}
          disabled={!sound || isLoading}
          size={32}
          style={themed($playButton)}
        />
        
        {/* 저장 버튼을 Play 버튼과 같은 라인에 배치 */}
        <TouchableOpacity 
          style={themed($saveButtonAligned)} 
          onPress={() => setShowSaveModal(true)}
        >
          <Text text="구간 저장하기" style={themed($saveButtonTextOnly)} />
        </TouchableOpacity>
      </View>


        {/* 상태 표시 */}
        {isLoading && (
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
    </GestureHandlerRootView>
  )
}

interface AudioButtonProps extends TouchableOpacityProps {
  icon: string
  size?: number
  style?: ViewStyle
}

function AudioButton({ icon, size = 24, style, ...props }: AudioButtonProps) {
  const { themed, theme } = useAppTheme()
  
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

const $integratedContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
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

