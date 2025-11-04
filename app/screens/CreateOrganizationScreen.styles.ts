export const $container = ({ spacing }) => ({
  paddingHorizontal: spacing?.lg || 16,
})

export const $form = ({ spacing }) => ({
  gap: spacing?.md || 12,
})

export const $loadingContainer = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  paddingHorizontal: spacing?.xl || 24,
})

export const $loadingText = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 16,
  textAlign: "center" as const,
})

export const $submitButton = ({ colors, spacing }) => ({
  backgroundColor: colors.tint,
  marginTop: spacing?.lg || 16,
})
