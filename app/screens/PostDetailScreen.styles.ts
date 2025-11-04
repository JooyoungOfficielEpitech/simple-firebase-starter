// PostDetailScreen.styles.ts
// Centralized styles for PostDetailScreen and its components

// Container & Layout Styles
export const $container = ({ spacing }) => ({
  flexGrow: 1,
  backgroundColor: "transparent",
  paddingHorizontal: spacing.lg,
})

export const $centerContainer = {
  flex: 1,
  justifyContent: "center" as const,
  alignItems: "center" as const,
}

export const $section = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

export const $sectionTitle = ({ colors, spacing }) => ({
  color: colors.text,
  marginBottom: spacing.xs,
})

// Post Header Styles
export const $postTitle = ({ colors, spacing }) => ({
  color: colors.text,
  marginBottom: spacing.lg,
})

export const $productionText = ({ colors }) => ({
  color: colors.text,
  fontSize: 18,
  fontWeight: "600" as const,
})

export const $organizationText = ({ colors }) => ({
  color: colors.tint,
  fontSize: 16,
  fontWeight: "500" as const,
})

// Hero Card Styles
export const $heroCard = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  padding: spacing?.md || 12,
  marginBottom: spacing?.lg || 16,
  borderWidth: 1,
  borderColor: colors.border,
  shadowColor: colors.palette.neutral500,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
})

export const $statusHeader = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.sm || 8,
})

export const $activeBadge = ({ colors, spacing }) => ({
  paddingHorizontal: spacing?.xs || 4,
  paddingVertical: 4,
  borderRadius: 6,
  backgroundColor: colors.palette.primary500 + "20",
})

export const $closedBadge = ({ colors, spacing }) => ({
  paddingHorizontal: spacing?.xs || 4,
  paddingVertical: 4,
  borderRadius: 6,
  backgroundColor: colors.textDim + "20",
})

export const $activeText = ({ colors, typography }) => ({
  fontSize: 12,
  lineHeight: 16,
  fontFamily: typography.primary.medium,
  color: colors.palette.primary500,
})

export const $closedText = ({ colors, typography }) => ({
  fontSize: 12,
  lineHeight: 16,
  fontFamily: typography.primary.medium,
  color: colors.textDim,
})

export const $deadlineText = ({ colors, typography }) => ({
  fontSize: 12,
  lineHeight: 18,
  color: colors.textDim,
  fontFamily: typography.primary.medium,
})

export const $keyInfoRow = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-around" as const,
  alignItems: "center" as const,
  marginTop: spacing?.sm || 8,
  marginBottom: spacing?.md || 12,
})

export const $infoItem = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  flex: 1,
  justifyContent: "center" as const,
})

export const $infoIcon = {
  fontSize: 16,
  marginRight: 8,
}

export const $infoText = ({ colors }) => ({
  color: colors.text,
  fontSize: 16,
  lineHeight: 24,
})

export const $descriptionText = ({ colors }) => ({
  color: colors.text,
  fontSize: 16,
  lineHeight: 24,
})

// Stats Styles
export const $statsRow = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-around" as const,
  alignItems: "center" as const,
  marginTop: spacing?.sm || 8,
  marginBottom: spacing?.md || 12,
})

export const $statItem = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  flex: 1,
  justifyContent: "center" as const,
})

export const $statIcon = {
  fontSize: 14,
  marginRight: 6,
}

export const $statText = ({ colors, typography }) => ({
  fontSize: 13,
  lineHeight: 18,
  color: colors.textDim,
  fontFamily: typography.primary.medium,
})

// Action Buttons Styles
export const $actionButtonsRow = ({ spacing }) => ({
  flexDirection: "row" as const,
  gap: spacing?.sm || 8,
  marginTop: spacing?.md || 12,
  flexWrap: "wrap" as const,
})

export const $applicationButtonContainer = () => ({
  flex: 1,
  minHeight: 44,
  alignSelf: "stretch" as const,
})

export const $applyButton = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.primary500,
  paddingVertical: spacing?.sm || 8,
  paddingHorizontal: spacing?.md || 12,
  borderRadius: 8,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  flex: 1,
  minWidth: 100,
  minHeight: 44,
})

export const $applyButtonText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 14,
  lineHeight: 20,
  fontFamily: typography.primary.medium,
})

export const $withdrawButton = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.error500,
  paddingVertical: spacing?.sm || 8,
  paddingHorizontal: spacing?.md || 12,
  borderRadius: 8,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  flex: 1,
  minWidth: 100,
  minHeight: 44,
})

export const $withdrawButtonText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 14,
  lineHeight: 20,
  fontFamily: typography.primary.medium,
})

export const $statusButton = (status: string) => ({ colors, spacing }) => ({
  backgroundColor:
    status === 'pending' ? colors.palette.goldAccent400 :
    status === 'accepted' ? colors.palette.primary500 :
    status === 'rejected' ? colors.palette.error500 :
    colors.palette.neutral500,
  paddingVertical: spacing?.sm || 8,
  paddingHorizontal: spacing?.md || 12,
  borderRadius: 8,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  flex: 1,
  minWidth: 100,
  minHeight: 44,
})

export const $statusButtonText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 14,
  lineHeight: 20,
  fontFamily: typography.primary.medium,
})

export const $manageButton = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.secondary500 || colors.tint,
  paddingVertical: spacing?.sm || 8,
  paddingHorizontal: spacing?.md || 12,
  borderRadius: 8,
  alignItems: "center" as const,
  flex: 1,
  minWidth: 120,
})

export const $manageButtonText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 14,
  lineHeight: 20,
  fontFamily: typography.primary.medium,
})

export const $contactButton = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderWidth: 1,
  borderColor: colors.border,
  paddingVertical: spacing?.sm || 8,
  paddingHorizontal: spacing?.md || 12,
  borderRadius: 8,
  alignItems: "center" as const,
  flex: 1,
  minWidth: 100,
})

export const $contactButtonText = ({ colors, typography }) => ({
  color: colors.text,
  fontSize: 14,
  lineHeight: 20,
  fontFamily: typography.primary.medium,
})

// Role Card Styles
export const $roleCard = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
  padding: spacing.md,
  marginBottom: spacing.sm,
})

export const $roleHeader = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.xs || 4,
})

export const $roleName = ({ colors }) => ({
  color: colors.text,
  fontSize: 16,
  fontWeight: "600" as const,
})

export const $roleCountBadge = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.primary500,
  paddingHorizontal: spacing?.xs || 4,
  paddingVertical: 2,
  borderRadius: 12,
})

export const $roleCountText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 12,
  lineHeight: 16,
  fontFamily: typography.primary.medium,
})

export const $roleDetails = ({ spacing }) => ({
  flexDirection: "row" as const,
  gap: spacing?.md || 12,
  marginBottom: spacing?.xs || 4,
})

export const $roleDetailItem = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
})

export const $roleIcon = {
  fontSize: 14,
  marginRight: 4,
}

export const $roleDetailText = ({ colors, typography }) => ({
  fontSize: 13,
  lineHeight: 20,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
})

export const $roleRequirements = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: 14,
  marginTop: spacing.xs,
})

// Audition Card Styles
export const $auditionCard = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral50,
  borderRadius: 12,
  padding: spacing?.md || 12,
  borderLeftWidth: 4,
  borderLeftColor: colors.palette.primary500,
})

export const $auditionInfoRow = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.sm || 8,
})

export const $preparationSection = ({ spacing }) => ({
  marginTop: spacing?.md || 12,
  paddingTop: spacing?.sm || 8,
  borderTopWidth: 1,
  borderTopColor: "rgba(0,0,0,0.1)",
})

export const $preparationTitle = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.text,
  marginBottom: spacing?.xs || 4,
})

export const $preparationItem = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "flex-start" as const,
  marginBottom: spacing?.xs || 4,
})

export const $preparationText = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.text,
  flex: 1,
  marginLeft: 8,
})

export const $bulletPoint = ({ colors }) => ({
  fontSize: 14,
  color: colors.text,
  marginRight: 4,
})

// Performance Card Styles
export const $performanceCard = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.secondary50 || colors.palette.neutral50,
  borderRadius: 12,
  padding: spacing?.md || 12,
  borderLeftWidth: 4,
  borderLeftColor: colors.palette.secondary500 || colors.tint,
})

export const $performanceInfoRow = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "flex-start" as const,
  marginBottom: spacing?.md || 12,
})

export const $performanceDetails = {
  flex: 1,
  marginLeft: 8,
}

export const $performanceLabel = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.text,
  marginBottom: spacing?.xs || 4,
})

export const $performanceText = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.text,
})

export const $performanceDate = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.text,
  marginBottom: spacing?.xs || 4,
})

// Benefits Card Styles
export const $benefitsCard = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.primary50 || colors.palette.neutral50,
  borderRadius: 12,
  padding: spacing?.md || 12,
  borderLeftWidth: 4,
  borderLeftColor: colors.palette.primary500,
})

export const $benefitRow = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.md || 12,
})

export const $benefitIcon = {
  fontSize: 20,
  marginRight: 12,
}

export const $benefitContent = {
  flex: 1,
}

export const $benefitLabel = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.text,
  marginBottom: spacing?.xs || 4,
})

export const $benefitValue = ({ colors, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.normal,
  color: colors.palette.primary600,
  fontWeight: "600" as const,
})

export const $providedBenefits = ({ spacing }) => ({
  marginTop: spacing?.sm || 8,
  paddingTop: spacing?.sm || 8,
  borderTopWidth: 1,
  borderTopColor: "rgba(0,0,0,0.1)",
})

export const $benefitSectionTitle = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.text,
  marginBottom: spacing?.sm || 8,
})

export const $benefitsList = ({ spacing }) => ({
  marginBottom: spacing?.sm || 8,
})

export const $benefitItem = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.xs || 4,
})

export const $benefitItemText = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.text,
})

export const $otherBenefits = ({ spacing }) => ({
  marginTop: spacing?.sm || 8,
  paddingTop: spacing?.sm || 8,
  borderTopWidth: 1,
  borderTopColor: "rgba(0,0,0,0.1)",
})

export const $otherBenefitText = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.text,
  marginLeft: 8,
  flex: 1,
})

// Contact Card Styles
export const $contactCard = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral50,
  borderRadius: 12,
  padding: spacing?.md || 12,
  borderLeftWidth: 4,
  borderLeftColor: colors.palette.secondary500 || colors.tint,
})

export const $contactRow = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "flex-start" as const,
  marginBottom: spacing?.md || 12,
})

export const $contactIcon = {
  fontSize: 18,
  marginRight: 12,
  marginTop: 2,
}

export const $contactContent = {
  flex: 1,
}

export const $contactLabel = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.text,
  marginBottom: spacing?.xs || 4,
})

export const $contactText = ({ colors }) => ({
  color: colors.tint,
  fontSize: 16,
  fontWeight: "500" as const,
})

export const $contactValue = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.text,
})

export const $documentsSection = ({ spacing }) => ({
  marginTop: spacing?.xs || 4,
})

export const $documentsList = ({ spacing }) => ({
  marginTop: spacing?.xs || 4,
})

export const $documentItem = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "flex-start" as const,
  marginBottom: spacing?.xs || 4,
})

export const $documentText = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.text,
  marginLeft: 8,
  flex: 1,
})

// Tag Styles
export const $tagsContainer = ({ spacing }) => ({
  flexDirection: "row" as const,
  flexWrap: "wrap" as const,
  marginTop: spacing?.xs || 4,
})

export const $tag = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.primary100,
  paddingHorizontal: spacing?.sm || 8,
  paddingVertical: spacing?.xs || 4,
  borderRadius: 16,
  marginRight: spacing?.xs || 4,
  marginBottom: spacing?.xs || 4,
})

export const $tagText = ({ colors, typography }) => ({
  color: colors.palette.primary600,
  fontSize: 12,
  fontFamily: typography.primary.medium,
})

// Action Buttons Container
export const $actionButtonsContainer = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  marginTop: spacing.lg,
  gap: spacing.md,
  paddingHorizontal: spacing.md,
})

export const $editButton = ({ colors, spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  backgroundColor: colors.palette.primary500,
  paddingVertical: spacing?.md || 12,
  paddingHorizontal: spacing?.lg || 20,
  borderRadius: 25,
  minWidth: 120,
  minHeight: 50,
  shadowColor: colors.palette.primary500,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
})

export const $editButtonText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 16,
  lineHeight: 24,
  fontFamily: typography.primary.medium,
  marginLeft: 6,
})

export const $deleteButton = ({ colors, spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  backgroundColor: colors.palette.angry500,
  paddingVertical: spacing?.md || 12,
  paddingHorizontal: spacing?.lg || 20,
  borderRadius: 25,
  minWidth: 120,
  minHeight: 50,
  shadowColor: colors.palette.angry500,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
})

export const $deleteButtonText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 16,
  lineHeight: 24,
  fontFamily: typography.primary.medium,
  marginLeft: 6,
})

export const $buttonIcon = {
  fontSize: 18,
}

// Modal Styles
export const $modalOverlay = ({ colors }) => ({
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "center" as const,
  alignItems: "center" as const,
  padding: 20,
})

export const $modalContent = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: 12,
  padding: spacing?.lg || 16,
  width: "100%" as const,
  maxWidth: 400,
  maxHeight: "80%" as const,
})

export const $modalHeader = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.md || 12,
})

export const $modalTitle = ({ colors }) => ({
  color: colors.text,
  flex: 1,
})

export const $closeButton = ({ spacing }) => ({
  padding: spacing?.xs || 4,
  minWidth: 32,
  minHeight: 32,
  justifyContent: "center" as const,
  alignItems: "center" as const,
})

export const $closeButtonText = ({ colors }) => ({
  fontSize: 18,
  color: colors.textDim,
})

export const $modalPostTitle = ({ colors, typography, spacing }) => ({
  fontSize: 16,
  lineHeight: 24,
  color: colors.text,
  fontFamily: typography.primary.medium,
  marginBottom: spacing?.xs || 4,
})

export const $modalOrgName = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  lineHeight: 20,
  color: colors.tint,
  fontFamily: typography.primary.normal,
  marginBottom: spacing?.lg || 16,
})

export const $modalScrollView = ({ spacing }) => ({
  maxHeight: 400,
  marginBottom: spacing?.md || 12,
})

export const $rolesSection = ({ spacing }) => ({
  marginBottom: spacing?.lg || 16,
  padding: spacing?.sm || 8,
  backgroundColor: "rgba(0, 0, 0, 0.03)",
  borderRadius: 8,
})

export const $sectionLabel = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  lineHeight: 20,
  color: colors.text,
  fontFamily: typography.primary.medium,
  marginBottom: spacing?.xs || 4,
})

export const $roleItem = ({ spacing }) => ({
  marginBottom: spacing?.xs || 4,
})

export const $roleItemText = ({ colors, typography }) => ({
  fontSize: 14,
  lineHeight: 20,
  color: colors.text,
  fontFamily: typography.primary.medium,
})

export const $modalRoleDetailText = ({ colors, typography }) => ({
  fontSize: 12,
  lineHeight: 16,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
})

export const $formInput = ({ spacing }) => ({
  marginBottom: spacing?.md || 12,
})

export const $modalButtons = ({ spacing }) => ({
  flexDirection: "row" as const,
  gap: spacing?.sm || 8,
})

export const $cancelButton = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderWidth: 1,
  borderColor: colors.border,
  paddingVertical: spacing?.md || 12,
  paddingHorizontal: spacing?.lg || 16,
  borderRadius: 8,
  alignItems: "center" as const,
  flex: 1,
})

export const $cancelButtonText = ({ colors, typography }) => ({
  color: colors.text,
  fontSize: 16,
  lineHeight: 24,
  fontFamily: typography.primary.medium,
})

export const $submitButton = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.primary500,
  paddingVertical: spacing?.md || 12,
  paddingHorizontal: spacing?.lg || 16,
  borderRadius: 8,
  alignItems: "center" as const,
  flex: 1,
})

export const $submitButtonText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 16,
  lineHeight: 24,
  fontFamily: typography.primary.medium,
})

// Full Width Image Section
export const $fullWidthImageSection = ({ spacing }) => ({
  marginHorizontal: -(spacing?.lg || 16),
  marginVertical: spacing?.md || 12,
})
