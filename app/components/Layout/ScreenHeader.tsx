import { ReactNode } from "react"
import { View, ViewStyle, TextStyle } from "react-native"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface UnifiedScreenHeaderProps {
  title: string
  subtitle?: string
  rightContent?: ReactNode
  leftContent?: ReactNode
  style?: ViewStyle
}

/**
 * Unified header component for consistent screen headers
 */
export function UnifiedScreenHeader({
  title,
  subtitle,
  rightContent,
  leftContent,
  style,
}: UnifiedScreenHeaderProps) {
  const { themed } = useAppTheme()

  return (
    <View style={[themed($header), style]}>
      <View style={themed($headerContent)}>
        {leftContent && <View style={themed($leftContent)}>{leftContent}</View>}
        
        <View style={themed($titleContainer)}>
          <Text text={title} preset="heading" style={themed($title)} />
          {subtitle && <Text text={subtitle} style={themed($subtitle)} />}
        </View>
        
        {rightContent && <View style={themed($rightContent)}>{rightContent}</View>}
      </View>
    </View>
  )
}

const $header: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: 0,
  paddingVertical: spacing.md,
  backgroundColor: colors.background,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
})

const $headerContent: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
})

const $titleContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  alignItems: "center",
})

const $title: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  textAlign: "center",
  color: colors.palette.primary500,
  fontFamily: typography.primary.bold,
  marginBottom: spacing.xs,
})

const $subtitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  textAlign: "center",
  color: colors.textDim,
  fontSize: 14,
})

const $leftContent: ThemedStyle<ViewStyle> = () => ({
  minWidth: 40,
  alignItems: "flex-start",
})

const $rightContent: ThemedStyle<ViewStyle> = () => ({
  minWidth: 40,
  alignItems: "flex-end",
})