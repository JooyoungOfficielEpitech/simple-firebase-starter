import React from "react"
import { Modal, View, TextInput, TouchableOpacity, ViewStyle, TextStyle } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export interface SaveSectionModalProps {
  visible: boolean
  sectionName: string
  onChangeName: (name: string) => void
  onSave: () => void
  onCancel: () => void
}

export function SaveSectionModal({
  visible,
  sectionName,
  onChangeName,
  onSave,
  onCancel
}: SaveSectionModalProps) {
  const { themed } = useAppTheme()

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={themed($modalOverlay)}>
        <View style={themed($modalContainer)}>
          <View style={themed($modalHeader)}>
            <Ionicons name="bookmark" size={24} color="#007AFF" />
            <Text text="구간 저장" style={themed($modalTitle)} />
            <TouchableOpacity 
              onPress={onCancel}
              style={themed($modalCloseButton)}
            >
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <Text text="구간 이름을 입력해주세요" style={themed($modalDescription)} />

          <TextInput
            style={themed($nameInput)}
            value={sectionName}
            onChangeText={onChangeName}
            placeholder="예: 어려운 구간, 연습할 부분..."
            placeholderTextColor="#999"
            autoFocus={true}
            maxLength={50}
          />

          <View style={themed($saveButtonsContainer)}>
            <TouchableOpacity 
              style={themed($cancelButton)} 
              onPress={onCancel}
            >
              <Text text="취소" style={themed($cancelButtonText)} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={themed([$saveButton, { opacity: sectionName.trim() ? 1 : 0.5 }])} 
              onPress={onSave}
              disabled={!sectionName.trim()}
            >
              <Text text="저장" style={themed($saveButtonText)} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

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
