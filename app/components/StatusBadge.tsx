import React from "react"
import { View } from "react-native"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"

interface StatusBadgeProps {
  status: "active" | "inactive" | "verified" | "closed"
  text: string
  variant?: "default" | "small"
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  text, 
  variant = "default" 
}) => {
  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()

  const getBadgeStyle = () => {
    switch (status) {
      case "active":
        return themed($activeBadge)
      case "verified":
        return themed($verifiedBadge)
      case "closed":
      case "inactive":
      default:
        return themed($inactiveBadge)
    }
  }

  const getTextStyle = () => {
    switch (status) {
      case "active":
        return themed($activeText)
      case "verified":
        return themed($verifiedText)
      case "closed":
      case "inactive":
      default:
        return themed($inactiveText)
    }
  }

  return (
    <View style={getBadgeStyle()}>
      <Text text={text} style={getTextStyle()} />
    </View>
  )
}

// Styles - BOLD: Using secondary colors
const $activeBadge = ({ colors, spacing }) => ({
  paddingHorizontal: spacing?.xs || 4,
  paddingVertical: 4,
  borderRadius: 6,
  backgroundColor: colors.secondaryAction, // BOLD: Full secondary color for active badges
})

const $verifiedBadge = ({ colors, spacing }) => ({
  paddingHorizontal: spacing?.xs || 4,
  paddingVertical: 4,
  borderRadius: 6,
  backgroundColor: colors.secondaryAction + "80", // Secondary color with 80% opacity
})

const $inactiveBadge = ({ colors, spacing }) => ({
  paddingHorizontal: spacing?.xs || 4,
  paddingVertical: 4,
  borderRadius: 6,
  backgroundColor: colors.textDim + "20",
})

const $activeText = ({ colors }) => ({
  fontSize: 12,
  fontWeight: "bold" as const,
  color: "#FFFFFF", // BOLD: White text on secondary background
})

const $verifiedText = ({ colors }) => ({
  fontSize: 12,
  fontWeight: "bold" as const,
  color: "#FFFFFF", // BOLD: White text for better contrast
})

const $inactiveText = ({ colors }) => ({
  fontSize: 12,
  fontWeight: "bold" as const,
  color: colors.textDim,
})