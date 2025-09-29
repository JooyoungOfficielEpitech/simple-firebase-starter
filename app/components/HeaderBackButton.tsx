import React from "react"
import { TouchableOpacity } from "react-native"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"

interface HeaderBackButtonProps {
  onPress: () => void
  accessibilityLabel?: string
  icon?: string
}

export const HeaderBackButton: React.FC<HeaderBackButtonProps> = ({ 
  onPress, 
  accessibilityLabel = "뒤로가기",
  icon = "←"
}) => {
  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()

  return (
    <TouchableOpacity
      style={themed($backButton)}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Text text={icon} style={themed($backButtonText)} />
    </TouchableOpacity>
  )
}

// Styles
const $backButton = ({ spacing }) => ({
  paddingHorizontal: spacing?.sm || 8,
  paddingVertical: spacing?.xs || 4,
  minWidth: 44,
  minHeight: 44,
  justifyContent: "center" as const,
  alignItems: "center" as const,
})

const $backButtonText = ({ colors, typography }) => ({
  fontSize: 24,
  color: colors.palette.primary500,
  fontFamily: typography.primary.bold,
})