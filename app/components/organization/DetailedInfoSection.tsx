import React from "react"
import { View } from "react-native"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { TagInputField } from "./TagInputField"
import { CreateOrganization } from "@/types/organization"
import { useAppTheme } from "@/theme/context"

interface DetailedInfoSectionProps {
  formData: CreateOrganization
  onUpdate: (updates: Partial<CreateOrganization>) => void
  onAddArrayItem: (field: keyof Pick<CreateOrganization, 'tags' | 'specialties' | 'pastWorks'>, item: string) => boolean
  onRemoveArrayItem: (field: keyof Pick<CreateOrganization, 'tags' | 'specialties' | 'pastWorks'>, index: number) => void
}

export const DetailedInfoSection: React.FC<DetailedInfoSectionProps> = ({
  formData,
  onUpdate,
  onAddArrayItem,
  onRemoveArrayItem,
}) => {
  const { themed } = useAppTheme()

  return (
    <View style={themed($section)}>
      <Text text="상세 정보" style={themed($sectionLabel)} />

      <TextField
        label="창립 스토리"
        value={formData.foundingStory || ""}
        onChangeText={(text) => onUpdate({ foundingStory: text })}
        placeholder="단체가 어떻게 시작되었나요?"
        multiline
        numberOfLines={4}
      />

      <TextField
        label="비전과 목표"
        value={formData.vision || ""}
        onChangeText={(text) => onUpdate({ vision: text })}
        placeholder="단체의 비전과 목표를 입력해주세요"
        multiline
        numberOfLines={3}
      />

      <TagInputField
        label="전문 분야"
        placeholder="뮤지컬, 연극, 드라마 등"
        items={formData.specialties}
        onAdd={(item) => onAddArrayItem('specialties', item)}
        onRemove={(index) => onRemoveArrayItem('specialties', index)}
      />

      <TagInputField
        label="대표 작품"
        placeholder="대표 작품명을 입력해주세요"
        items={formData.pastWorks}
        onAdd={(item) => onAddArrayItem('pastWorks', item)}
        onRemove={(index) => onRemoveArrayItem('pastWorks', index)}
      />

      <TextField
        label="보유 시설"
        value={formData.facilities || ""}
        onChangeText={(text) => onUpdate({ facilities: text })}
        placeholder="연습실, 소극장, 의상실 등"
        multiline
        numberOfLines={3}
      />

      <TextField
        label="모집 안내"
        value={formData.recruitmentInfo || ""}
        onChangeText={(text) => onUpdate({ recruitmentInfo: text })}
        placeholder="배우/스태프 모집 시 참고할 정보"
        multiline
        numberOfLines={3}
      />

      <TagInputField
        label="태그"
        placeholder="태그를 입력하고 추가 버튼을 눌러주세요"
        items={formData.tags}
        onAdd={(item) => onAddArrayItem('tags', item)}
        onRemove={(index) => onRemoveArrayItem('tags', index)}
      />
    </View>
  )
}

const $section = ({ spacing }) => ({
  gap: spacing?.md || 12,
})

const $sectionLabel = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: 18,
  fontWeight: "600" as const,
  marginTop: spacing?.lg || 16,
  marginBottom: spacing?.sm || 8,
})
