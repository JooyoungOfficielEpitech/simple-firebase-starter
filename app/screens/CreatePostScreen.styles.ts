/**
 * CreatePostScreen Styles
 * Centralized style definitions for the CreatePostScreen component
 */

export const $container = ({ spacing }) => ({
  flex: 1,
  paddingHorizontal: spacing?.lg || 16,
  paddingTop: spacing?.md || 12,
  paddingBottom: spacing?.xl || 24,
})

export const $centerContainer = {
  flex: 1,
  justifyContent: "center" as const,
  alignItems: "center" as const,
}

export const $messageText = ({ colors, spacing }) => ({
  fontSize: 16,
  color: colors.text,
  textAlign: "center" as const,
  marginBottom: spacing.md,
})

export const $debugInfoText = ({ colors, spacing }) => ({
  fontSize: 14,
  color: colors.textDim,
  textAlign: "center" as const,
  marginBottom: spacing.lg,
})

export const $convertButton = ({ colors, spacing }) => ({
  backgroundColor: colors.tint,
  marginTop: spacing.md,
})

export const $saveSection = ({ spacing }) => ({
  marginTop: spacing?.lg || 16,
  marginBottom: spacing?.xl || 24,
  paddingHorizontal: spacing?.sm || 8,
})

export const $saveButton = {
  // Additional styling if needed
}

export const $progressSection = ({ spacing }) => ({
  marginBottom: spacing?.lg || 16,
})

export const $progressHeader = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.sm || 8,
})

export const $progressTitle = ({ colors, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: colors.text,
})

export const $progressBarContainer = ({ colors, spacing }) => ({
  height: 8,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 4,
  marginBottom: spacing?.sm || 8,
  overflow: "hidden" as const,
})

export const $progressBar = ({ colors }) => ({
  height: "100%" as const,
  backgroundColor: colors.palette.primary500,
  borderRadius: 4,
})

export const $progressTips = ({ spacing }) => ({
  marginTop: spacing?.xs || 4,
})

export const $progressTipText = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.normal,
  color: colors.palette.secondary600,
  textAlign: "center" as const,
})

export const $progressCompletedText = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.medium,
  color: colors.palette.secondary700,
  textAlign: "center" as const,
})

export const $templateSection = ({ spacing }) => ({
  marginBottom: spacing?.lg || 16,
})

export const $templateButton = ({ colors, spacing }) => ({
  borderWidth: 2,
  borderColor: colors.palette.primary500,
  borderRadius: 12,
  paddingVertical: spacing?.md || 12,
  paddingHorizontal: spacing?.md || 12,
  backgroundColor: colors.background,
  flexDirection: "column" as const,
  alignItems: "flex-start" as const,
  borderStyle: "dashed" as const,
})

export const $templateButtonContent = {
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  width: "100%" as const,
}

export const $templateButtonText = ({ colors, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: colors.palette.primary500,
  flex: 1,
})

export const $templateButtonSubText = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.normal,
  color: colors.palette.primary600,
  marginTop: 2,
  flex: 1,
})

export const $templateButtonArrow = ({ colors }) => ({
  fontSize: 16,
  color: colors.palette.primary500,
  fontWeight: "bold" as const,
})

export const $selectedTemplateIndicator = ({ colors, spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "space-between" as const,
  backgroundColor: colors.palette.secondary100,
  paddingVertical: spacing?.xs || 4,
  paddingHorizontal: spacing?.sm || 8,
  borderRadius: 8,
  marginTop: spacing?.xs || 4,
})

export const $selectedTemplateText = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.palette.secondary700,
  flex: 1,
})

export const $removeTemplateButton = ({ colors, spacing }) => ({
  fontSize: 14,
  color: colors.palette.angry500,
  fontWeight: "bold" as const,
  paddingHorizontal: spacing.xs,
})

export const $modalOverlay = () => ({
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "flex-end" as const,
})

export const $modalContainer = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  paddingHorizontal: spacing?.md || 12,
  paddingTop: spacing?.md || 12,
  paddingBottom: spacing?.xl || 24,
  height: "80%" as const,
  width: "100%" as const,
})

export const $modalHeader = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.lg || 16,
})

export const $modalTitle = ({ colors, typography }) => ({
  fontSize: 18,
  fontFamily: typography.primary.medium,
  color: colors.text,
})

export const $modalCloseButton = ({ spacing }) => ({
  padding: spacing?.xs || 4,
})

export const $modalCloseText = ({ colors }) => ({
  fontSize: 18,
  color: colors.textDim,
})

export const $templateScrollView = ({ spacing }) => ({
  flex: 1,
  paddingTop: spacing?.sm || 8,
})

export const $templateItem = ({ colors, spacing }) => ({
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 12,
  padding: spacing?.md || 12,
  marginBottom: spacing?.md || 12,
  backgroundColor: colors.background,
  minHeight: 80,
})

export const $templateItemHeader = ({ spacing }) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.sm || 8,
})

export const $templateIcon = {
  fontSize: 24,
  marginRight: 12,
}

export const $templateInfo = {
  flex: 1,
}

export const $templateName = ({ colors, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: colors.text,
  marginBottom: 2,
})

export const $templateCategory = ({ colors, typography, spacing }) => ({
  fontSize: 12,
  fontFamily: typography.primary.normal,
  color: colors.palette.primary500,
  backgroundColor: colors.palette.primary100,
  paddingHorizontal: spacing.xs,
  paddingVertical: 2,
  borderRadius: 4,
  alignSelf: "flex-start" as const,
})

export const $templatePreview = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.normal,
  color: colors.textDim,
  lineHeight: 20,
})

export const $switchContainer = ({ spacing }) => ({
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  paddingVertical: spacing?.sm || 8,
})

export const $switchLabelContainer = {
  flex: 1,
}

export const $statusText = ({ colors, typography, spacing }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.text,
  marginTop: spacing?.xs || 4,
})

export const $formSection = ({ spacing }) => ({
  marginBottom: spacing?.xl || 24,
})

export const $sectionHeader = ({ colors, spacing, typography }) => ({
  fontSize: 18,
  fontFamily: typography.primary.medium,
  color: colors.text,
  marginBottom: spacing?.md || 12,
})

export const $inputSection = ({ spacing }) => ({
  marginBottom: spacing?.lg || 16,
  marginTop: spacing?.xs || 4,
  flex: 1,
})

export const $label = ({ colors, spacing, typography }) => ({
  color: colors.text,
  fontFamily: typography.primary.medium,
  fontSize: 16,
  marginBottom: spacing.xs,
})

export const $hintText = ({ colors, spacing }) => ({
  fontSize: 12,
  color: colors.textDim,
  marginTop: spacing?.xs || 4,
  fontStyle: "italic" as const,
  lineHeight: 16,
})
