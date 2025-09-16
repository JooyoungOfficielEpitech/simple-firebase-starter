import { type TextStyle, type ViewStyle } from "react-native"

import { type ThemedStyle } from "./types"

/**
 * 인증 화면들에서 공통으로 사용되는 스타일들
 */

export const $authHeaderContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  paddingVertical: spacing.xl,
})

export const $authTitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  fontSize: 24,
  fontWeight: "bold",
  marginBottom: spacing.xs,
})

export const $authSubtitle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  fontSize: 16,
  textAlign: "center",
  paddingHorizontal: spacing.md,
})

export const $authFormContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  gap: spacing.md,
})

export const $authErrorText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.error,
  textAlign: "center",
})