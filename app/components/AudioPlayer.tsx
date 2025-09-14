import React, { useState, useEffect } from "react"
import { View, ViewStyle, TouchableOpacity, TouchableOpacityProps } from "react-native"
import { Audio, AVPlaybackStatus } from "expo-av"

import { Icon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

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
}

/**
 * Expo AV 기반 오디오 플레이어 컴포넌트
 */
export function AudioPlayer({
  audioFile,
  audioUrl,
  style,
  onPlaybackStatusUpdate,
}: AudioPlayerProps) {
  const { themed } = useAppTheme()
  const [sound, setSound] = useState<Audio.Sound | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [duration, setDuration] = useState<number>(0)
  const [position, setPosition] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  // 🎯 디버깅 로그
  console.log("🎵 AudioPlayer Props:", { audioFile, audioUrl })

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
    loadAudio()
    return () => {
      unloadAudio()
    }
  }, [audioFile, audioUrl])

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
      setPosition(status.positionMillis || 0)
      setDuration(status.durationMillis || 0)
      setIsPlaying(status.isPlaying)
    }
    
    if (onPlaybackStatusUpdate) {
      onPlaybackStatusUpdate(status)
    }
  }

  const togglePlayback = async () => {
    if (!sound) return

    try {
      if (isPlaying) {
        await sound.pauseAsync()
      } else {
        await sound.playAsync()
      }
    } catch (err) {
      console.error("Playback error:", err)
      setError("재생 오류")
    }
  }

  const stopPlayback = async () => {
    if (!sound) return

    try {
      await sound.stopAsync()
      await sound.setPositionAsync(0)
    } catch (err) {
      console.error("Stop error:", err)
    }
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

  if (error) {
    return (
      <View style={themed([$container, style])}>
        <Text text={`❌ ${error}`} style={themed($errorText)} />
      </View>
    )
  }

  return (
    <View style={themed([$container, style])}>
      {/* 재생 컨트롤 */}
      <View style={themed($controls)}>
        <AudioButton
          icon="caretLeft"
          onPress={stopPlayback}
          disabled={!sound || isLoading}
        />
        
        <AudioButton
          icon={isPlaying ? "pause" : "caretRight"}
          onPress={togglePlayback}
          disabled={!sound || isLoading}
          size={32}
        />
      </View>

      {/* 진행바 영역 */}
      <View style={themed($progressContainer)}>
        <Text 
          text={formatTime(position)} 
          style={themed($timeText)} 
        />
        
        <View style={themed($progressTrack)}>
          <View 
            style={themed([$progressBar, { width: `${getProgress() * 100}%` }])} 
          />
        </View>
        
        <Text 
          text={formatTime(duration)} 
          style={themed($timeText)} 
        />
      </View>

      {/* 상태 표시 */}
      {isLoading && (
        <Text text="로딩 중..." style={themed($statusText)} />
      )}
    </View>
  )
}

interface AudioButtonProps extends TouchableOpacityProps {
  icon: string
  size?: number
}

function AudioButton({ icon, size = 24, ...props }: AudioButtonProps) {
  const { themed, theme } = useAppTheme()
  
  return (
    <TouchableOpacity
      style={themed($button)}
      activeOpacity={0.7}
      {...props}
    >
      <Icon
        icon={icon as any}
        size={size}
        color={props.disabled ? theme.colors.textDim : theme.colors.tint}
      />
    </TouchableOpacity>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  padding: spacing.md,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.separator,
})

const $controls: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: spacing.md,
})

const $button: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.sm,
  marginHorizontal: spacing.sm,
})

const $progressContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.sm,
})

const $timeText: ThemedStyle<ViewStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  minWidth: 40,
  textAlign: "center",
})

const $progressTrack: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  height: 4,
  backgroundColor: colors.separator,
  borderRadius: 2,
  marginHorizontal: spacing.sm,
})

const $progressBar: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: "100%",
  backgroundColor: colors.tint,
  borderRadius: 2,
})

const $statusText: ThemedStyle<ViewStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  textAlign: "center",
})

const $errorText: ThemedStyle<ViewStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  color: colors.error,
  fontFamily: typography.primary.normal,
  textAlign: "center",
})