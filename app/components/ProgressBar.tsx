import React, { memo, useState, useRef, useCallback } from "react"
import { View, ViewStyle, TextStyle, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import type { SavedSection } from "./AudioPlayer"

interface ProgressBarProps {
  progress: number
  duration: number
  loopState: {
    pointA: number | null
    pointB: number | null
    isLooping: boolean
    currentSection: SavedSection | null
  }
  onSeek: (position: number) => void
  onSetPointA: (time: number) => void
  onSetPointB: (time: number) => void
  onMarkerPress: (type: 'A' | 'B') => void
}

export const ProgressBar = memo<ProgressBarProps>(({ 
  progress, 
  duration, 
  loopState, 
  onSeek, 
  onSetPointA, 
  onSetPointB, 
  onMarkerPress 
}) => {
  const { themed } = useAppTheme()
  const [progressBarWidth, setProgressBarWidth] = useState(200)
  const [isDragging, setIsDragging] = useState<'A' | 'B' | null>(null)
  const progressBarRef = useRef<View>(null)

  const getProgress = useCallback((): number => {
    if (!duration || duration <= 0) return 0
    
    const progressValue = progress / duration
    
    if (isNaN(progressValue) || !isFinite(progressValue)) return 0
    
    return Math.max(0, Math.min(1, progressValue))
  }, [progress, duration])

  const getPercentage = useCallback((value: number | null, total: number | null): `${number}%` => {
    if (value === null || total === null || total <= 0 || isNaN(value) || isNaN(total)) {
      return "0%"
    }
    const percentage = (value / total) * 100
    if (isNaN(percentage) || !isFinite(percentage)) {
      return "0%"
    }
    return `${Math.max(0, Math.min(100, percentage))}%` as `${number}%`
  }, [])

  const getTimeFromPosition = useCallback((x: number): number => {
    const ratio = Math.max(0, Math.min(1, x / progressBarWidth))
    return ratio * (duration || 0)
  }, [progressBarWidth, duration])

  const detectMarkerAtPosition = useCallback((x: number): 'A' | 'B' | null => {
    if (!duration || duration <= 0 || progressBarWidth <= 0) return null
    
    const tolerance = 30
    
    if (loopState.pointA !== null) {
      const aPosition = (loopState.pointA / duration) * progressBarWidth
      if (Math.abs(x - aPosition) <= tolerance) {
        return 'A'
      }
    }
    
    if (loopState.pointB !== null) {
      const bPosition = (loopState.pointB / duration) * progressBarWidth
      if (Math.abs(x - bPosition) <= tolerance) {
        return 'B'
      }
    }
    
    return null
  }, [duration, progressBarWidth, loopState.pointA, loopState.pointB])

  const handleProgressPressIn = useCallback((event: any) => {
    const { locationX } = event.nativeEvent
    
    const nearMarker = detectMarkerAtPosition(locationX)
    if (nearMarker) {
      setIsDragging(nearMarker)
      
      const newTime = getTimeFromPosition(locationX)
      if (nearMarker === 'A') {
        if (loopState.pointB === null || newTime < loopState.pointB) {
          onSetPointA(newTime)
        }
      } else if (nearMarker === 'B') {
        if (loopState.pointA === null || newTime > loopState.pointA) {
          onSetPointB(newTime)
        }
      }
    }
  }, [detectMarkerAtPosition, getTimeFromPosition, loopState.pointA, loopState.pointB, onSetPointA, onSetPointB])

  const handleProgressTouch = useCallback((event: any) => {
    const { locationX } = event.nativeEvent
    const newTime = getTimeFromPosition(locationX)
    
    if (isDragging === 'A') {
      if (loopState.pointB !== null && newTime >= loopState.pointB) {
        return
      }
      onSetPointA(newTime)
    } else if (isDragging === 'B') {
      if (loopState.pointA !== null && newTime <= loopState.pointA) {
        return
      }
      onSetPointB(newTime)
    } else {
      onSeek(locationX / progressBarWidth)
    }
  }, [isDragging, getTimeFromPosition, loopState.pointA, loopState.pointB, onSetPointA, onSetPointB, onSeek, progressBarWidth])

  const handleProgressPressOut = useCallback(() => {
    if (isDragging) {
      setIsDragging(null)
    }
  }, [isDragging])

  const handleProgressBarLayout = useCallback((event: any) => {
    const { width } = event.nativeEvent.layout
    setProgressBarWidth(width)
  }, [])

  const handleAMarkerPress = useCallback(() => {
    onMarkerPress('A')
  }, [onMarkerPress])

  const handleBMarkerPress = useCallback(() => {
    onMarkerPress('B')
  }, [onMarkerPress])

  return (
    <View style={themed($container)}>
      <TouchableOpacity 
        ref={progressBarRef}
        style={themed($progressTrack)}
        onPressIn={handleProgressPressIn}
        onPress={handleProgressTouch}
        onPressOut={handleProgressPressOut}
        onLayout={handleProgressBarLayout}
        activeOpacity={1}
        delayPressOut={100}
      >
        {/* 기본 진행바 */}
        <View 
          style={[
            themed($progressBar), 
            { width: `${getProgress() * 100}%` }
          ]} 
        />
        
        {/* A-B 구간 하이라이트 */}
        {loopState.pointA !== null && loopState.pointB !== null && duration && duration > 0 && (
          <View 
            style={[
              themed($loopHighlight),
              {
                left: getPercentage(loopState.pointA!, duration!),
                width: getPercentage(loopState.pointB! - loopState.pointA!, duration!)
              }
            ]} 
          />
        )}
        
        {/* A 마커 */}
        {loopState.pointA !== null && duration && duration > 0 && (
          <TouchableOpacity
            style={[
              themed($marker), 
              themed($markerA),
              isDragging === 'A' && themed($markerDragging),
              { left: getPercentage(loopState.pointA!, duration!) }
            ]}
            onPress={handleAMarkerPress}
            activeOpacity={0.8}
          >
            <Text text="A" style={themed($markerText)} />
          </TouchableOpacity>
        )}
        
        {/* B 마커 */}
        {loopState.pointB !== null && duration && duration > 0 && (
          <TouchableOpacity
            style={[
              themed($marker), 
              themed($markerB),
              isDragging === 'B' && themed($markerDragging),
              { left: getPercentage(loopState.pointB!, duration!) }
            ]}
            onPress={handleBMarkerPress}
            activeOpacity={0.8}
          >
            <Text text="B" style={themed($markerText)} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* A/B 위치 조정 컨트롤 */}
      <View style={themed($controlsContainer)}>
        <View style={themed($positionButtonsRow)}>
          <TouchableOpacity 
            style={themed($positionButton)} 
            onPress={() => onMarkerPress('A')}
          >
            <Ionicons name="play-skip-back" size={18} color="#007AFF" />
            <Text text="A 여기로" style={themed($positionButtonText)} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={themed($positionButton)} 
            onPress={() => onMarkerPress('B')}
          >
            <Ionicons name="play-skip-forward" size={18} color="#007AFF" />
            <Text text="B 여기로" style={themed($positionButtonText)} />
          </TouchableOpacity>
        </View>
        
        {/* 사용법 안내 */}
        <View style={themed($usageGuideContainer)}>
          <Text 
            text="💡 진행바에서 A, B 마커 근처를 드래그하거나 마커를 터치하여 구간을 설정하세요" 
            style={themed($usageGuideText)} 
          />
        </View>
      </View>
    </View>
  )
})

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.sm,
  width: "100%",
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

const $loopHighlight: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  height: "100%",
  backgroundColor: colors.tint,
  opacity: 0.3,
  borderRadius: 4,
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

const $markerDragging: ThemedStyle<ViewStyle> = ({ colors }) => ({
  shadowOpacity: 0.5,
  shadowRadius: 6,
  borderWidth: 3,
  borderColor: colors.background,
})

const $controlsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
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

const $positionButtonText: ThemedStyle<ViewStyle> = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.text,
  marginLeft: spacing.sm,
})

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