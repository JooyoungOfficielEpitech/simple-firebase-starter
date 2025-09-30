import { ReactNode } from "react"
import { View, ViewStyle, TextStyle } from "react-native"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface ContentSectionProps {
  title?: string
  subtitle?: string
  children: ReactNode
  style?: ViewStyle
  variant?: "default" | "card" | "flat"
}

/**
 * Unified content section component for consistent content grouping
 */
export function ContentSection({
  title,
  subtitle,
  children,
  style,
  variant = "default",
}: ContentSectionProps) {
  const { themed } = useAppTheme()

  return (
    <View style={[themed($sectionPresets[variant]), style]}>
      {(title || subtitle) && (
        <View style={themed($sectionHeader)}>
          {title && <Text text={title} style={themed($sectionTitle)} />}
          {subtitle && <Text text={subtitle} style={themed($sectionSubtitle)} />}
        </View>
      )}
      {children}
    </View>
  )
}

const $sectionBase: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  maxWidth: 400,
  marginBottom: 24,
})

const $sectionPresets = {
  default: [
    $sectionBase,
    () => ({
      padding: 20,
      borderRadius: 12,
      backgroundColor: "rgba(0, 0, 0, 0.05)",
    }),
  ] as ThemedStyle<ViewStyle>[],
  
  card: [
    $sectionBase,
    ({ colors }) => ({
      padding: 20,
      borderRadius: 12,
      backgroundColor: colors.palette.neutral100,
      borderWidth: 1,
      borderColor: colors.separator,
    }),
  ] as ThemedStyle<ViewStyle>[],
  
  flat: [
    $sectionBase,
    () => ({
      padding: 16,
    }),
  ] as ThemedStyle<ViewStyle>[],
}

const $sectionHeader: ThemedStyle<ViewStyle> = () => ({
  marginBottom: 16,
})

const $sectionTitle: ThemedStyle<TextStyle> = () => ({
  fontSize: 18,
  fontWeight: "600",
  marginBottom: 8,
  textAlign: "center",
})

const $sectionSubtitle: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 14,
  color: theme.colors.textDim,
  textAlign: "center",
})