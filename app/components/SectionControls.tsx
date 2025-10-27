import React, { memo } from "react"
import { View, ViewStyle, TextStyle, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface SectionControlsProps {
  currentPosition: number // in seconds
  onSetPointA: () => void
  onSetPointB: () => void
  onShowSaveModal: () => void
}

export const SectionControls = memo(function SectionControls({
  currentPosition,
  onSetPointA,
  onSetPointB,
  onShowSaveModal,
}: SectionControlsProps) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($simpleControlsContainer)}>
      {/* A/B position setting buttons */}
      <View style={themed($positionButtonsRow)}>
        <TouchableOpacity 
          style={themed($positionButton)} 
          onPress={onSetPointA}
        >
          <Ionicons name="play-skip-back" size={18} color="#007AFF" />
          <Text text="A 여기로" style={themed($positionButtonText)} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={themed($positionButton)} 
          onPress={onSetPointB}
        >
          <Ionicons name="play-skip-forward" size={18} color="#007AFF" />
          <Text text="B 여기로" style={themed($positionButtonText)} />
        </TouchableOpacity>
      </View>
      
      {/* Usage guide */}
      <View style={themed($usageGuideContainer)}>
        <Text 
          text="💡 진행바에서 A, B 마커 근처를 드래그하거나 마커를 터치하여 구간을 설정하세요" 
          style={themed($usageGuideText)} 
        />
      </View>

      {/* Save button container */}
      <View style={themed($saveButtonContainer)}>
        <TouchableOpacity 
          style={themed($saveButtonCentered)} 
          onPress={onShowSaveModal}
        >
          <Text text="구간 저장하기" style={themed($saveButtonText)} />
        </TouchableOpacity>
      </View>
    </View>
  )
})

// Styles
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

const $saveButtonText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.background,
  textAlign: "center",
})