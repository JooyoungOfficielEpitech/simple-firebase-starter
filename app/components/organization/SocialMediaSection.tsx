import React from "react"
import { View } from "react-native"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { CreateOrganization } from "@/types/organization"
import { useAppTheme } from "@/theme/context"

interface SocialMediaSectionProps {
  formData: CreateOrganization
  onUpdate: (updates: Partial<CreateOrganization>) => void
}

export const SocialMediaSection: React.FC<SocialMediaSectionProps> = ({ formData, onUpdate }) => {
  const { themed } = useAppTheme()

  return (
    <View style={themed($section)}>
      <Text text="소셜 미디어" style={themed($sectionLabel)} />
      
      <TextField
        label="인스타그램"
        value={formData.instagramUrl || ""}
        onChangeText={(text) => onUpdate({ instagramUrl: text })}
        placeholder="https://instagram.com/your_theater"
        keyboardType="url"
        autoCapitalize="none"
      />

      <TextField
        label="유튜브"
        value={formData.youtubeUrl || ""}
        onChangeText={(text) => onUpdate({ youtubeUrl: text })}
        placeholder="https://youtube.com/@your_theater"
        keyboardType="url"
        autoCapitalize="none"
      />

      <TextField
        label="페이스북"
        value={formData.facebookUrl || ""}
        onChangeText={(text) => onUpdate({ facebookUrl: text })}
        placeholder="https://facebook.com/your_theater"
        keyboardType="url"
        autoCapitalize="none"
      />

      <TextField
        label="트위터"
        value={formData.twitterUrl || ""}
        onChangeText={(text) => onUpdate({ twitterUrl: text })}
        placeholder="https://twitter.com/your_theater"
        keyboardType="url"
        autoCapitalize="none"
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
