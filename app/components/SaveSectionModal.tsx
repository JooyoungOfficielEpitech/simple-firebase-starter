import React, { memo, useState } from "react"
import { View, ViewStyle, TextStyle, Modal, TextInput, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import type { SavedSection } from "./AudioPlayer"

interface SaveSectionModalProps {
  visible: boolean
  loopState: {
    pointA: number | null
    pointB: number | null
    isLooping: boolean
    currentSection: SavedSection | null
  }
  onSave: (name: string) => void
  onCancel: () => void
}

export const SaveSectionModal = memo<SaveSectionModalProps>(({ 
  visible, 
  loopState, 
  onSave, 
  onCancel 
}) => {
  const { themed } = useAppTheme()
  const [sectionName, setSectionName] = useState("")

  const handleSave = () => {
    if (sectionName.trim()) {
      onSave(sectionName.trim())
      setSectionName("")
    }
  }

  const handleCancel = () => {
    onCancel()
    setSectionName("")
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={themed($modalOverlay)}>
        <View style={themed($modalContainer)}>
          <View style={themed($modalHeader)}>
            <Ionicons name="bookmark" size={24} color="#007AFF" />
            <Text text="구간 저장" style={themed($modalTitle)} />
            <TouchableOpacity 
              onPress={handleCancel}
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
              onPress={handleCancel}
            >
              <Text text="취소" style={themed($cancelButtonText)} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={themed([$saveButton, { opacity: sectionName.trim() ? 1 : 0.5 }])} 
              onPress={handleSave}
              disabled={!sectionName.trim()}
            >
              <Text text="저장" style={themed($saveButtonText)} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
})

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

const $saveButtonsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: spacing.lg,
  gap: spacing.sm,
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