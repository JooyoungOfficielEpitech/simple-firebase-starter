import React from "react"
import { View, ViewStyle, TextStyle } from "react-native"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export interface PinMarkerProps {
  type: 'A' | 'B'
  position: number  // 0 to 1 ratio
  isDragging: boolean
  onDragStart: (event: any) => void
  onDrag: (event: any) => void
  onDragEnd: () => void
}

export function PinMarker({
  type,
  position,
  isDragging,
  onDragStart,
  onDrag,
  onDragEnd
}: PinMarkerProps) {
  const { themed } = useAppTheme()

  const color = type === 'A' ? "#4CAF50" : "#F44336"

  return (
    <View
      style={[
        themed($pinMarker),
        type === 'A' ? themed($pinMarkerA) : themed($pinMarkerB),
        isDragging && themed($pinMarkerDragging),
        { left: `${position * 100}%` }
      ]}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => isDragging}
      onResponderGrant={onDragStart}
      onResponderMove={onDrag}
      onResponderRelease={onDragEnd}
      onResponderTerminationRequest={() => false}
    >
      <View style={themed($pinLabel)}>
        <Text style={themed($pinText)}>{type}</Text>
      </View>
      <View style={[themed($pinTriangle), { borderTopColor: color }]} />
    </View>
  )
}

const $pinMarker: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  alignItems: "center",
  marginLeft: 0,
  zIndex: 20,
})

const $pinLabel: ThemedStyle<ViewStyle> = ({ colors }) => ({
  paddingHorizontal: 6,
  paddingVertical: 1,
  borderRadius: 6,
  backgroundColor: colors.palette.neutral100,
  justifyContent: "center",
  alignItems: "center",
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3,
  elevation: 3,
  borderWidth: 2,
  borderColor: colors.palette.neutral400,
})

const $pinTriangle: ThemedStyle<ViewStyle> = () => ({
  width: 0,
  height: 0,
  borderLeftWidth: 5,
  borderRightWidth: 5,
  borderTopWidth: 6,
  borderLeftColor: "transparent",
  borderRightColor: "transparent",
  marginTop: 1,
})

const $pinMarkerA: ThemedStyle<ViewStyle> = () => ({
  zIndex: 21,
})

const $pinMarkerB: ThemedStyle<ViewStyle> = () => ({
  zIndex: 22,
})

const $pinText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.bold,
  color: colors.palette.neutral900,
})

const $pinMarkerDragging: ThemedStyle<ViewStyle> = () => ({
  transform: [{ scale: 1.3 }],
})
