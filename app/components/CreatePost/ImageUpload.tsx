import React from "react"
import { View, TouchableOpacity, ScrollView, Image } from "react-native"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"

interface ImageUploadProps {
  selectedImages: string[]
  uploadingImages: boolean
  onPickImages: () => void
  onRemoveImage: (index: number) => void
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  selectedImages,
  uploadingImages,
  onPickImages,
  onRemoveImage,
}) => {
  const { themed } = useAppTheme()

  return (
    <View style={themed($imageSection)}>
      <Text text="📸 이미지 업로드" style={themed($sectionHeader)} />
      
      <TouchableOpacity
        style={themed($imageUploadButton)}
        onPress={onPickImages}
        disabled={uploadingImages || selectedImages.length >= 5}
        accessibilityRole="button"
        accessibilityLabel="이미지 선택"
      >
        <Text text="📷" style={themed($imageUploadIcon)} />
        <Text 
          text={uploadingImages ? "업로드 중..." : `이미지 선택 (${selectedImages.length}/5)`} 
          style={themed($imageUploadText)} 
        />
      </TouchableOpacity>
      
      {selectedImages.length > 0 && (
        <View style={themed($imagePreviewContainer)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedImages.map((imageUrl, idx) => (
              <View key={idx} style={themed($imagePreviewItem)}>
                <Image source={{ uri: imageUrl }} style={themed($imagePreview)} />
                <TouchableOpacity
                  style={themed($imageRemoveButton)}
                  onPress={() => onRemoveImage(idx)}
                  accessibilityRole="button"
                  accessibilityLabel={`이미지 삭제`}
                >
                  <Text text="✖" style={themed($imageRemoveText)} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      
      <Text text="💡 최대 5개까지 선택 가능합니다" style={themed($hintText)} />
    </View>
  )
}

const $imageSection = ({ spacing }) => ({
  marginBottom: spacing?.lg || 16,
})

const $sectionHeader = ({ colors, spacing, typography }) => ({
  fontSize: 18,
  fontFamily: typography.primary.medium,
  color: colors.text,
  marginBottom: spacing?.md || 12,
})

const $imageUploadButton = ({ colors, spacing }) => ({
  borderWidth: 2,
  borderColor: colors.palette.primary500,
  borderRadius: 12,
  paddingVertical: spacing?.lg || 16,
  paddingHorizontal: spacing?.md || 12,
  backgroundColor: colors.background,
  alignItems: "center" as const,
  borderStyle: "dashed" as const,
})

const $imageUploadIcon = {
  fontSize: 24,
  marginBottom: 8,
}

const $imageUploadText = ({ colors, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: colors.palette.primary500,
})

const $imagePreviewContainer = ({ spacing }) => ({
  marginTop: spacing?.md || 12,
  marginBottom: spacing?.sm || 8,
})

const $imagePreviewItem = ({ spacing }) => ({
  marginRight: spacing?.sm || 8,
  position: "relative" as const,
})

const $imagePreview = {
  width: 100,
  height: 100,
  borderRadius: 8,
  backgroundColor: "#f0f0f0",
}

const $imageRemoveButton = ({ colors, spacing }) => ({
  position: "absolute" as const,
  top: -spacing?.xs || -4,
  right: -spacing?.xs || -4,
  backgroundColor: colors.palette.angry500,
  borderRadius: 12,
  width: 24,
  height: 24,
  alignItems: "center" as const,
  justifyContent: "center" as const,
})

const $imageRemoveText = ({ colors }) => ({
  fontSize: 12,
  color: colors.palette.neutral100,
  fontWeight: "bold" as const,
})

const $hintText = ({ colors, spacing }) => ({
  fontSize: 12,
  color: colors.textDim,
  marginTop: spacing?.xs || 4,
  fontStyle: "italic" as const,
  lineHeight: 16,
})
