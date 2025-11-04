import React from "react"
import { View, TouchableOpacity } from "react-native"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import { translate } from "@/i18n"
import { Organization } from "@/types/organization"

interface OrganizationCardProps {
  organization: Organization
  onPress: (organizationId: string) => void
}

export const OrganizationCard: React.FC<OrganizationCardProps> = ({ organization, onPress }) => {
  const { themed } = useAppTheme()

  return (
    <TouchableOpacity
      style={themed($organizationCard)}
      onPress={() => onPress(organization.id)}
    >
      <View style={themed($organizationHeader)}>
        <Text preset="subheading" text={organization.name} style={themed($organizationName)} />
        {organization.isVerified && (
          <View style={themed($verifiedBadge)}>
            <Text text={translate("bulletinBoard:status.verified")} style={themed($verifiedText)} />
          </View>
        )}
      </View>
      
      <Text text={organization.description} style={themed($organizationDescription)} numberOfLines={2} />
      
      <View style={themed($organizationFooter)}>
        <Text text={organization.location} style={themed($organizationLocation)} />
        <Text text={`활성 공고 ${organization.activePostCount}개`} style={themed($organizationStats)} />
      </View>

      {organization.tags && organization.tags.length > 0 && (
        <View style={themed($tagsContainer)}>
          {organization.tags.slice(0, 3).map((tag, tagIndex) => (
            <View key={tagIndex} style={themed($tag)}>
              <Text text={tag} style={themed($tagText)} />
            </View>
          ))}
          {organization.tags.length > 3 && (
            <View style={themed($tag)}>
              <Text text={`+${organization.tags.length - 3}`} style={themed($tagText)} />
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  )
}

const $organizationCard = ({ colors, spacing }) => ({
  backgroundColor: colors.secondaryAction + '20',
  borderRadius: 12,
  padding: spacing?.md || 12,
  marginBottom: spacing?.md || 12,
  borderWidth: 2,
  borderColor: colors.secondaryAction + '60',
})

const $organizationHeader = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "flex-start" as const,
  marginBottom: spacing?.xs || 4,
})

const $organizationName = ({ colors, spacing }) => ({
  color: colors.secondaryAction,
  flex: 1,
  marginRight: spacing?.xs || 4,
  fontWeight: "600" as const,
})

const $verifiedBadge = ({ colors, spacing }) => ({
  backgroundColor: colors.tint + "20",
  paddingHorizontal: spacing?.xs || 4,
  paddingVertical: 4,
  borderRadius: 6,
})

const $verifiedText = ({ colors }) => ({
  color: colors.tint,
  fontSize: 12,
  fontWeight: "bold" as const,
})

const $organizationDescription = ({ colors, spacing }) => ({
  color: colors.textDim,
  fontSize: 14,
  lineHeight: 20,
  marginBottom: spacing?.sm || 8,
})

const $organizationFooter = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.sm || 8,
})

const $organizationLocation = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 14,
})

const $organizationStats = ({ colors }) => ({
  color: colors.tint,
  fontSize: 14,
  fontWeight: "500" as const,
})

const $tagsContainer = ({ spacing }) => ({
  flexDirection: "row" as const,
  flexWrap: "wrap" as const,
  marginTop: spacing?.xs || 4,
})

const $tag = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  paddingHorizontal: spacing?.xs || 4,
  paddingVertical: 2,
  borderRadius: 4,
  marginRight: spacing?.xs || 4,
  marginBottom: 4,
})

const $tagText = ({ colors }) => ({
  color: colors.palette.neutral600,
  fontSize: 12,
})
