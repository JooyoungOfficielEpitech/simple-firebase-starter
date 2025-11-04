import React from "react"
import { View, TextInput, Switch } from "react-native"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import { FormData } from "@/hooks/useCreatePostForm"

interface BenefitsSectionProps {
  formData: FormData
  updateFormData: (field: string, value: string | boolean) => void
}

export const BenefitsSection: React.FC<BenefitsSectionProps> = ({ formData, updateFormData }) => {
  const { themed, theme: { colors } } = useAppTheme()

  return (
    <View style={themed($formSection)}>
      <Text text="💰 혜택 정보" style={themed($sectionHeader)} />
      
      <View style={themed($inputSection)}>
        <Text text="출연료/활동비" style={themed($label) as any} />
        <TextInput
          style={themed($textInput)}
          value={formData.fee}
          onChangeText={(text) => updateFormData("fee", text)}
          placeholder="예: 회차당 5만원, 협의 후 결정"
          placeholderTextColor={colors.textDim}
        />
      </View>

      <View style={themed($benefitsSection)}>
        <Text text="제공 혜택" style={themed($label) as any} />
        
        <View style={themed($benefitRow)}>
          <Text text="🚗 교통비 지원" style={themed($benefitLabel)} />
          <Switch
            value={formData.transportation}
            onValueChange={(value) => updateFormData("transportation", value)}
            trackColor={{ false: colors.palette.neutral300, true: colors.palette.primary200 }}
            thumbColor={formData.transportation ? colors.palette.primary500 : colors.palette.neutral400}
            ios_backgroundColor={colors.palette.neutral300}
            accessibilityLabel="교통비 지원 토글"
          />
        </View>

        <View style={themed($benefitRow)}>
          <Text text="👗 의상 제공" style={themed($benefitLabel)} />
          <Switch
            value={formData.costume}
            onValueChange={(value) => updateFormData("costume", value)}
            trackColor={{ false: colors.palette.neutral300, true: colors.palette.primary200 }}
            thumbColor={formData.costume ? colors.palette.primary500 : colors.palette.neutral400}
            ios_backgroundColor={colors.palette.neutral300}
            accessibilityLabel="의상 제공 토글"
          />
        </View>

        <View style={themed($benefitRow)}>
          <Text text="🍽️ 식사 제공" style={themed($benefitLabel)} />
          <Switch
            value={formData.meals}
            onValueChange={(value) => updateFormData("meals", value)}
            trackColor={{ false: colors.palette.neutral300, true: colors.palette.primary200 }}
            thumbColor={formData.meals ? colors.palette.primary500 : colors.palette.neutral400}
            ios_backgroundColor={colors.palette.neutral300}
            accessibilityLabel="식사 제공 토글"
          />
        </View>

        <View style={themed($benefitRow)}>
          <Text text="📸 포트폴리오 제공" style={themed($benefitLabel)} />
          <Switch
            value={formData.portfolio}
            onValueChange={(value) => updateFormData("portfolio", value)}
            trackColor={{ false: colors.palette.neutral300, true: colors.palette.primary200 }}
            thumbColor={formData.portfolio ? colors.palette.primary500 : colors.palette.neutral400}
            ios_backgroundColor={colors.palette.neutral300}
            accessibilityLabel="포트폴리오 제공 토글"
          />
        </View>
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

const $benefitsSection = ({ spacing }) => ({
  marginTop: spacing?.sm || 8,
})

const $benefitRow = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  paddingVertical: spacing?.sm || 8,
  borderBottomWidth: 1,
  borderBottomColor: "rgba(0,0,0,0.05)",
})

const $benefitLabel = ({ colors, typography }) => ({
  fontSize: 16,
  color: colors.text,
  fontFamily: typography.primary.normal,
  flex: 1,
})
