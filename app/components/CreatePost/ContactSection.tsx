import React from "react"
import { View, TextInput } from "react-native"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import { PostType } from "@/types/post"
import { FormData } from "@/hooks/useCreatePostForm"

interface ContactSectionProps {
  postMode: PostType
  formData: FormData
  updateFormData: (field: string, value: string) => void
}

export const ContactSection: React.FC<ContactSectionProps> = ({ postMode, formData, updateFormData }) => {
  const { themed, theme: { colors } } = useAppTheme()

  return (
    <>
      {/* 연락처 정보 섹션 */}
      <View style={themed($formSection)}>
        <Text text="📞 연락처 정보" style={themed($sectionHeader)} />
        
        <View style={themed($inputSection)}>
          <View style={themed($labelRow)}>
            <Text text="담당자 이메일" style={themed($label) as any} />
            <Text text="*" style={themed($required)} />
          </View>
          <TextInput
            style={themed($textInput)}
            value={formData.contactEmail}
            onChangeText={(text) => updateFormData("contactEmail", text)}
            placeholder="contact@example.com"
            placeholderTextColor={colors.textDim}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View style={themed($inputSection)}>
          <Text text="연락처" style={themed($label) as any} />
          <TextInput
            style={themed($textInput)}
            value={formData.contactPhone}
            onChangeText={(text) => updateFormData("contactPhone", text)}
            placeholder="010-1234-5678"
            placeholderTextColor={colors.textDim}
            keyboardType="phone-pad"
          />
        </View>

        <View style={themed($inputSection)}>
          <Text text="제출 서류" style={themed($label) as any} />
          <TextInput
            style={themed($textInput)}
            value={formData.requiredDocuments}
            onChangeText={(text) => updateFormData("requiredDocuments", text)}
            placeholder="예: 이력서, 자기소개서, 프로필 사진"
            placeholderTextColor={colors.textDim}
          />
          <Text text="💡 쉼표로 구분해서 입력해주세요" style={themed($hintText)} />
        </View>
      </View>

      {/* 상세 설명 섹션 */}
      <View style={themed($formSection)}>
        <Text text="📝 상세 설명" style={themed($sectionHeader)} />
        
        <View style={themed($inputSection)}>
          <View style={themed($labelRow)}>
            <Text text="상세 설명" style={themed($label) as any} />
            {postMode === 'text' && <Text text="*" style={themed($required)} />}
            {postMode === 'images' && <Text text="(선택사항)" style={themed($optionalLabel)} />}
          </View>
          <TextInput
            style={[themed($textInput), themed($textArea)]}
            value={formData.description}
            onChangeText={(text) => updateFormData("description", text)}
            placeholder={postMode === 'images' 
              ? "추가 설명이 필요한 경우 입력해주세요" 
              : "🎵 레미제라블 양상블을 모집합니다!\n\n자세한 모집 내용과 요구사항을 입력해주세요."
            }
            placeholderTextColor={colors.textDim}
            multiline
            numberOfLines={postMode === 'images' ? 3 : 6}
            textAlignVertical="top"
          />
          <Text 
            text={postMode === 'images' 
              ? "💡 이미지에 모든 정보가 포함되어 있다면 비워두셔도 됩니다" 
              : "💡 매력적인 설명으로 지원자들의 관심을 끌어보세요!"
            } 
            style={themed($hintText)} 
          />
        </View>

        <View style={themed($inputSection)}>
          <Text text="태그" style={themed($label) as any} />
          <TextInput
            style={themed($textInput)}
            value={formData.tags}
            onChangeText={(text) => updateFormData("tags", text)}
            placeholder="예: 뮤지컬, 남성역할, 여성역할"
            placeholderTextColor={colors.textDim}
          />
          <Text text="💡 쉼표로 구분해서 입력해주세요" style={themed($hintText)} />
        </View>
      </View>
    </>
  )
}

const $formSection = ({ spacing }) => ({
  marginBottom: spacing?.xl || 24,
})

const $sectionHeader = ({ colors, spacing, typography }) => ({
  fontSize: 18,
  fontFamily: typography.primary.medium,
  color: colors.text,
  marginBottom: spacing?.md || 12,
})

const $inputSection = ({ spacing }) => ({
  marginBottom: spacing?.lg || 16,
  marginTop: spacing?.xs || 4,
  flex: 1,
})

const $label = ({ colors, spacing, typography }) => ({
  color: colors.text,
  fontFamily: typography.primary.medium,
  fontSize: 16,
  marginBottom: spacing.xs,
})

const $labelRow = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.xs || 4,
})

const $required = ({ colors, typography }) => ({
  color: colors.palette.angry500,
  marginLeft: 2,
  fontSize: 14,
  fontFamily: typography.primary.normal,
})

const $optionalLabel = ({ colors, typography }) => ({
  color: colors.textDim,
  marginLeft: 4,
  fontSize: 12,
  fontFamily: typography.primary.normal,
  fontStyle: "italic" as const,
})

const $textInput = ({ colors, spacing, typography }) => ({
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 8,
  padding: spacing?.md || 12,
  fontSize: 16,
  fontFamily: typography.primary.normal,
  color: colors.text,
  backgroundColor: colors.background,
  minHeight: 44,
  flex: 1,
  marginBottom: spacing?.xs || 4,
})

const $textArea = {
  height: 120,
}

const $hintText = ({ colors, spacing }) => ({
  fontSize: 12,
  color: colors.textDim,
  marginTop: spacing?.xs || 4,
  fontStyle: "italic" as const,
  lineHeight: 16,
})
