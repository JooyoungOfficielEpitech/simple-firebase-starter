import { ReactNode } from "react"
import { View, ViewStyle } from "react-native"

import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface ScreenContainerProps {
  children: ReactNode
  style?: ViewStyle
}

/**
 * Unified container component for consistent screen layouts
 */
export function ScreenContainer({ children, style }: ScreenContainerProps) {
  const { themed } = useAppTheme()

  return <View style={[themed($container), style]}>{children}</View>
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexGrow: 1,
  backgroundColor: "transparent",
  paddingHorizontal: spacing.lg,
})