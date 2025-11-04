import React from "react"
import { View } from "react-native"
import { TextField } from "@/components/TextField"
import { CreateOrganization } from "@/types/organization"
import { useAppTheme } from "@/theme/context"

interface BasicInfoSectionProps {
  formData: CreateOrganization
  onUpdate: (updates: Partial<CreateOrganization>) => void
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ formData, onUpdate }) => {
  const { themed } = useAppTheme()

  return (
    <View style={themed($section)}>
      <TextField
        label="단체명 *"
        value={formData.name}
        onChangeText={(text) => onUpdate({ name: text })}
        placeholder="극단명을 입력해주세요"
      />

      <TextField
        label="단체 소개 *"
        value={formData.description}
        onChangeText={(text) => onUpdate({ description: text })}
        placeholder="단체에 대한 간단한 소개를 입력해주세요"
        multiline
        numberOfLines={4}
      />

      <TextField
        label="연락처 이메일 *"
        value={formData.contactEmail}
        onChangeText={(text) => onUpdate({ contactEmail: text })}
        placeholder="contact@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextField
        label="연락처 전화번호"
        value={formData.contactPhone || ""}
        onChangeText={(text) => onUpdate({ contactPhone: text })}
        placeholder="02-1234-5678"
        keyboardType="phone-pad"
      />

      <TextField
        label="웹사이트"
        value={formData.website || ""}
        onChangeText={(text) => onUpdate({ website: text })}
        placeholder="https://example.com"
        keyboardType="url"
        autoCapitalize="none"
      />

      <TextField
        label="소재지 *"
        value={formData.location}
        onChangeText={(text) => onUpdate({ location: text })}
        placeholder="서울특별시 강남구"
      />

      <TextField
        label="설립일"
        value={formData.establishedDate || ""}
        onChangeText={(text) => onUpdate({ establishedDate: text })}
        placeholder="2020-01-01"
      />
    </View>
  )
}

const $section = ({ spacing }) => ({
  gap: spacing?.md || 12,
})
