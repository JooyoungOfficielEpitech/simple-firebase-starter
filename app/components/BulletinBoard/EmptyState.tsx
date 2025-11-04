import React from "react"
import { View } from "react-native"
import { Text } from "@/components/Text"
import { Button } from "@/components/Button"
import { useAppTheme } from "@/theme/context"
import { translate } from "@/i18n"

interface EmptyStateProps {
  type: 'posts' | 'organizations'
  hasOrganizationFilter?: boolean
  onExploreOrganizations?: () => void
  onAddSampleData?: () => void
  showSampleData?: boolean
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  type, 
  hasOrganizationFilter = false,
  onExploreOrganizations,
  onAddSampleData,
  showSampleData = false
}) => {
  const { themed } = useAppTheme()

  const icon = type === 'posts' ? '🎭' : '🏢'
  const titleKey = type === 'posts' ? 'bulletinBoard:empty.posts.title' : 'bulletinBoard:empty.organizations.title'
  const descriptionKey = type === 'posts' 
    ? (hasOrganizationFilter ? 'bulletinBoard:empty.posts.organizationDescription' : 'bulletinBoard:empty.posts.description')
    : 'bulletinBoard:empty.organizations.description'

  return (
    <View style={themed($emptyStateContainer)}>
      <View style={themed($emptyIconContainer)}>
        <Text text={icon} style={themed($emptyIcon)} />
      </View>
      <Text text={translate(titleKey)} style={themed($emptyTitle)} />
      <Text text={translate(descriptionKey)} style={themed($emptyDescription)} />
      
      {(onExploreOrganizations || onAddSampleData) && (
        <View style={themed($emptyActions)}>
          {onExploreOrganizations && !hasOrganizationFilter && (
            <Button
              text={translate("bulletinBoard:actions.exploreOrganizations")}
              style={themed($secondaryEmptyButton)}
              textStyle={themed($secondaryEmptyButtonText)}
              onPress={onExploreOrganizations}
            />
          )}
          
          {showSampleData && onAddSampleData && (
            <Button
              text={translate("bulletinBoard:actions.addSampleData")}
              style={themed($sampleDataButton)}
              textStyle={themed($sampleDataButtonText)}
              onPress={onAddSampleData}
            />
          )}
        </View>
      )}
    </View>
  )
}

const $emptyStateContainer = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  paddingHorizontal: spacing.xl,
  paddingTop: spacing.xl,
})

const $emptyIconContainer = ({ colors, spacing }) => ({
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: colors.palette.neutral100,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  marginBottom: spacing.lg,
})

const $emptyIcon = {
  fontSize: 40,
}

const $emptyTitle = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: 18,
  fontWeight: "600" as const,
  textAlign: "center" as const,
  marginBottom: spacing.sm,
})

const $emptyDescription = ({ colors, spacing }) => ({
  color: colors.textDim,
  fontSize: 14,
  textAlign: "center" as const,
  lineHeight: 20,
  marginBottom: spacing.xl,
})

const $emptyActions = ({ spacing }) => ({
  marginTop: spacing.lg,
})

const $sampleDataButton = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral200,
  borderColor: colors.palette.neutral300,
  paddingHorizontal: spacing?.lg || 16,
  paddingVertical: spacing?.sm || 8,
})

const $sampleDataButtonText = ({ colors }) => ({
  color: colors.palette.neutral600,
  fontSize: 14,
})

const $secondaryEmptyButton = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderWidth: 1,
  borderColor: colors.palette.primary500,
  paddingVertical: spacing?.md || 12,
  paddingHorizontal: spacing?.lg || 16,
  borderRadius: 8,
  marginBottom: spacing?.sm || 8,
  minHeight: 56,
})

const $secondaryEmptyButtonText = ({ colors, typography }) => ({
  color: colors.palette.primary500,
  fontSize: 16,
  lineHeight: 24,
  fontFamily: typography.primary.medium,
  textAlign: "center" as const,
})
