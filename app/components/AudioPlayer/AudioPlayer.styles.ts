import { ViewStyle, TextStyle } from "react-native"
import type { ThemedStyle } from "@/theme/types"

export const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  padding: spacing.lg,
  borderRadius: 16,
  alignItems: "center",
})

export const $controlsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: spacing.lg,
})

export const $playButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  width: 64,
  height: 64,
  borderRadius: 32,
  backgroundColor: colors.tint,
  marginHorizontal: spacing.md,
  justifyContent: "center",
  alignItems: "center",
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 4,
})

export const $timeContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginTop: spacing.sm,
})

export const $timeText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
})

export const $timeSeparator: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  marginHorizontal: 4,
})

export const $statusText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  color: colors.textDim,
  fontFamily: typography.primary.normal,
  textAlign: "center",
})

export const $errorText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  color: colors.error,
  fontFamily: typography.primary.normal,
  textAlign: "center",
})

export const $saveButtonAligned: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.tint,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  borderRadius: 12,
  marginLeft: spacing.lg,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 3,
})

export const $saveButtonTextOnly: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.medium,
  color: colors.background,
  textAlign: "center",
})
