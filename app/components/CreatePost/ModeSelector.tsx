import React from "react"
import { View, TouchableOpacity } from "react-native"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import { PostType } from "@/types/post"

interface ModeSelectorProps {
  postMode: PostType
  onModeChange: (mode: PostType) => void
  isEdit?: boolean
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ 
  postMode, 
  onModeChange, 
  isEdit = false 
}) => {
  const { themed } = useAppTheme()

  return (
    <>
      {/* 모드 선택 탭 */}
      <View style={themed($modeTabContainer)}>
        <TouchableOpacity
          style={[themed($modeTab), postMode === 'text' && themed($activeTab)]}
          onPress={() => !isEdit && onModeChange('text')}
          disabled={isEdit}
          accessibilityRole="tab"
          accessibilityLabel="텍스트 모드"
        >
          <Text 
            text="📝 Text" 
            style={[
              themed($modeTabText), 
              postMode === 'text' && themed($activeTabText), 
              isEdit && themed($disabledTabText)
            ]} 
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[themed($modeTab), postMode === 'images' && themed($activeTab)]}
          onPress={() => !isEdit && onModeChange('images')}
          disabled={isEdit}
          accessibilityRole="tab"
          accessibilityLabel="이미지 모드"
        >
          <Text 
            text="📸 Images" 
            style={[
              themed($modeTabText), 
              postMode === 'images' && themed($activeTabText), 
              isEdit && themed($disabledTabText)
            ]} 
          />
        </TouchableOpacity>
      </View>

      {/* 모드 설명 */}
      <View style={themed($modeDescription)}>
        <Text 
          text={postMode === 'text' 
            ? "📝 상세한 정보로 모집공고를 작성하세요" 
            : "📸 이미지로 쉽고 빠르게 모집공고를 작성하세요"
          } 
          style={themed($modeDescriptionText)} 
        />
      </View>
    </>
  )
}

const $modeTabContainer = ({ spacing }) => ({
  flexDirection: "row" as const,
  marginBottom: spacing?.md || 12,
  backgroundColor: "rgba(0,0,0,0.05)",
  borderRadius: 8,
  padding: spacing?.xs || 4,
})

const $modeTab = ({ spacing }) => ({
  flex: 1,
  paddingVertical: spacing?.sm || 8,
  paddingHorizontal: spacing?.md || 12,
  borderRadius: 6,
  alignItems: "center" as const,
})

const $activeTab = ({ colors }) => ({
  backgroundColor: colors.palette.primary500,
})

const $modeTabText = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.textDim,
})

const $activeTabText = ({ colors }) => ({
  color: colors.palette.neutral100,
})

const $disabledTabText = ({ colors }) => ({
  color: colors.textDim,
  opacity: 0.5,
})

const $modeDescription = ({ spacing }) => ({
  marginBottom: spacing?.lg || 16,
  paddingVertical: spacing?.sm || 8,
  paddingHorizontal: spacing?.md || 12,
  backgroundColor: "rgba(0,100,200,0.05)",
  borderRadius: 8,
  borderLeftWidth: 3,
  borderLeftColor: "#0064C8",
})

const $modeDescriptionText = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.palette.primary600,
  textAlign: "center" as const,
})
