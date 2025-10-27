import React, { memo } from "react"
import { View, ViewStyle, TextStyle } from "react-native"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import type { SavedSection } from "./AudioPlayer"

interface TrackInfoProps {
  currentPosition: number
  duration: number
  loopState: {
    pointA: number | null
    pointB: number | null
    isLooping: boolean
    currentSection: SavedSection | null
  }
}

export const TrackInfo = memo<TrackInfoProps>(({ 
  currentPosition, 
  duration, 
  loopState 
}) => {
  const { themed } = useAppTheme()

  const formatTime = (milliseconds: number): string => {
    if (!milliseconds || isNaN(milliseconds) || milliseconds < 0) {
      return "0:00"
    }
    
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getGuideMessage = (): string => {
    try {
      if (loopState.pointA !== null && loopState.pointB !== null) {
        const aTime = formatTime((loopState.pointA || 0) * 1000)
        const bTime = formatTime((loopState.pointB || 0) * 1000)
        return `🔁 ${aTime} ~ ${bTime} 무한 반복 중`
      }
      return "🎵 전체 곡 재생 중"
    } catch (error) {
      return "🎵 재생 중"
    }
  }

  return (
    <View>
      {/* 상태 표시 */}
      <View style={themed($statusBar)}>
        <Text text={getGuideMessage()} style={themed($statusText)} />
      </View>

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
          text={formatTime(duration * 1000)} 
          style={themed($timeText)} 
        />
      </View>
    </View>
  )
})

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

const $statusText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  textAlign: "center",
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