import React from "react"
import { View, TextInput } from "react-native"
import { Text } from "@/components/Text"
import { Dropdown } from "@/components/Dropdown"
import { useAppTheme } from "@/theme/context"
import { FormData } from "@/hooks/useCreatePostForm"

interface RoleSectionProps {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
}

export const RoleSection: React.FC<RoleSectionProps> = ({ formData, setFormData }) => {
  const { themed, theme: { colors } } = useAppTheme()

  return (
    <View style={themed($formSection)}>
      <Text text="🎭 모집 역할" style={themed($sectionHeader)} />
      
      <View style={themed($inputSection)}>
        <Text text="역할명" style={themed($label) as any} />
        <TextInput
          style={themed($textInput)}
          value={formData.roles[0]?.name || ""}
          onChangeText={(text) => {
            const newRoles = [...formData.roles]
            newRoles[0] = { ...newRoles[0], name: text }
            setFormData(prev => ({ ...prev, roles: newRoles }))
          }}
          placeholder="예: 레미제라블 양상블"
          placeholderTextColor={colors.textDim}
        />
      </View>

      <View style={themed($inputSection)}>
        <Text text="성별 조건" style={themed($label) as any} />
        <Dropdown
          value={formData.roles[0]?.gender || "any"}
          options={[
            { label: "무관", value: "any" },
            { label: "남성", value: "male" },
            { label: "여성", value: "female" }
          ]}
          placeholder="성별 조건을 선택하세요"
          onSelect={(value) => {
            const newRoles = [...formData.roles]
            newRoles[0] = { ...newRoles[0], gender: value as any }
            setFormData(prev => ({ ...prev, roles: newRoles }))
          }}
        />
      </View>
      
      <View style={themed($inputSection)}>
        <Text text="나이 조건" style={themed($label) as any} />
        <TextInput
          style={themed($textInput)}
          value={formData.roles[0]?.ageRange || ""}
          onChangeText={(text) => {
            const newRoles = [...formData.roles]
            newRoles[0] = { ...newRoles[0], ageRange: text }
            setFormData(prev => ({ ...prev, roles: newRoles }))
          }}
          placeholder="예: 20-40세"
          placeholderTextColor={colors.textDim}
        />
      </View>

      <View style={themed($inputSection)}>
        <Text text="역할 요구사항" style={themed($label) as any} />
        <TextInput
          style={[themed($textInput), themed($textArea)]}
          value={formData.roles[0]?.requirements || ""}
          onChangeText={(text) => {
            const newRoles = [...formData.roles]
            newRoles[0] = { ...newRoles[0], requirements: text }
            setFormData(prev => ({ ...prev, roles: newRoles }))
          }}
          placeholder="예: 노래 가능자, 단체 연기 경험자"
          placeholderTextColor={colors.textDim}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>
    </View>
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
