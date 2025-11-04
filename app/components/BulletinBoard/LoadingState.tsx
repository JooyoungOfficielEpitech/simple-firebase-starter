import React from "react"
import { View } from "react-native"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import { translate } from "@/i18n"

export const LoadingState: React.FC = () => {
  const { themed } = useAppTheme()

  return (
    <View style={themed($loadingContainer)}>
      <View style={themed($loadingIconContainer)}>
        <Text text="🎭" style={themed($loadingIcon)} />
      </View>
      <Text text={translate("bulletinBoard:loading")} style={themed($loadingText)} />
    </View>
  )
}

const $loadingContainer = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  paddingHorizontal: spacing?.xl || 24,
})

const $loadingIconContainer = ({ colors, spacing }) => ({
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: colors.palette.neutral100,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.md || 12,
})

const $loadingIcon = {
  fontSize: 30,
}

const $loadingText = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 16,
  textAlign: "center" as const,
})
