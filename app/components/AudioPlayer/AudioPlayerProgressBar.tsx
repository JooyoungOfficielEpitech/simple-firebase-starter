import React, { useRef } from "react"
import { View, ViewStyle } from "react-native"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { PinMarker } from "./PinMarker"

export interface AudioPlayerProgressBarProps {
  progress: number  // 0 to 1
  pointA: number | null
  pointB: number | null
  duration: number
  isDragging: 'A' | 'B' | null
  onProgressPressIn: (event: any) => void
  onProgressTouch: (event: any) => void
  onProgressPressOut: () => void
  onLayout: (event: any) => void
  onMarkerDragStart: (marker: 'A' | 'B', event: any) => void
  onMarkerDrag: (event: any) => void
  onMarkerDragEnd: () => void
}

export const AudioPlayerProgressBar = React.forwardRef<View, AudioPlayerProgressBarProps>(
  (props, ref) => {
    const { themed } = useAppTheme()

    const {
      progress,
      pointA,
      pointB,
      duration,
      isDragging,
      onProgressPressIn,
      onProgressTouch,
      onProgressPressOut,
      onLayout,
      onMarkerDragStart,
      onMarkerDrag,
      onMarkerDragEnd
    } = props

    return (
      <View style={themed($progressContainer)}>
        {/* A, B Pin 마커 - 진행바 위에 위치 */}
        <View style={themed($pinsContainer)}>
          {pointA !== null && (
            <PinMarker
              type="A"
              position={pointA / (duration || 1)}
              isDragging={isDragging === 'A'}
              onDragStart={(e) => onMarkerDragStart('A', e)}
              onDrag={onMarkerDrag}
              onDragEnd={onMarkerDragEnd}
            />
          )}

          {pointB !== null && (
            <PinMarker
              type="B"
              position={pointB / (duration || 1)}
              isDragging={isDragging === 'B'}
              onDragStart={(e) => onMarkerDragStart('B', e)}
              onDrag={onMarkerDrag}
              onDragEnd={onMarkerDragEnd}
            />
          )}
        </View>

        {/* 진행바 */}
        <View
          ref={ref}
          style={themed($progressTrack)}
          onStartShouldSetResponder={() => true}
          onResponderGrant={onProgressPressIn}
          onResponderMove={onProgressTouch}
          onResponderRelease={onProgressPressOut}
          onLayout={onLayout}
        >
          {/* A-B 구간 하이라이트 */}
          {pointA !== null && pointB !== null && (
            <View
              style={[
                themed($loopHighlight),
                {
                  left: `${(pointA / (duration || 1)) * 100}%`,
                  width: `${((pointB - pointA) / (duration || 1)) * 100}%`
                }
              ]}
            />
          )}

          {/* 기본 진행바 */}
          <View
            style={[
              themed($progressBar),
              { width: `${progress * 100}%` as any }
            ]}
          />
        </View>
      </View>
    )
  }
)

AudioPlayerProgressBar.displayName = 'AudioPlayerProgressBar'

const $progressContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "relative",
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.sm,
  width: "100%",
  paddingTop: 22,
})

const $pinsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "absolute",
  top: -18,
  left: 0,
  right: 0,
  paddingHorizontal: spacing.sm,
  height: 18,
  zIndex: 20,
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
  opacity: 0.2,
  borderRadius: 4,
})
