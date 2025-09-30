import { View } from "react-native"
import { Text } from "@/components/Text"
import { Button } from "@/components/Button"
import { useAppTheme } from "@/theme/context"
import { translate } from "@/i18n"

interface ErrorStateProps {
  title?: string
  description?: string
  actionText?: string
  onAction?: () => void
  icon?: string
}

export const ErrorState = ({
  title = translate("common:error.title"),
  description = translate("common:error.description"),
  actionText = translate("common:error.retry"),
  onAction,
  icon = "❌",
}) => {
  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()

  return (
    <View style={themed($errorContainer)}>
      <View style={themed($errorIconContainer)}>
        <Text text={icon} style={themed($errorIcon)} />
      </View>
      <Text text={title} style={themed($errorTitle)} />
      <Text text={description} style={themed($errorDescription)} />
      
      {onAction && (
        <Button
          text={actionText}
          onPress={onAction}
          style={themed($errorButton)}
          textStyle={themed($errorButtonText)}
        />
      )}
    </View>
  )
}

// Styles
const $errorContainer = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  paddingHorizontal: spacing?.xl || 24,
  paddingTop: spacing?.xl || 24,
})

const $errorIconContainer = ({ colors, spacing }) => ({
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: colors.palette.angry100,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  marginBottom: spacing?.lg || 16,
})

const $errorIcon = {
  fontSize: 40,
}

const $errorTitle = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: 18,
  fontWeight: "600" as const,
  textAlign: "center" as const,
  marginBottom: spacing?.sm || 8,
})

const $errorDescription = ({ colors, spacing }) => ({
  color: colors.textDim,
  fontSize: 14,
  textAlign: "center" as const,
  lineHeight: 20,
  marginBottom: spacing?.xl || 24,
})

const $errorButton = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.primary500,
  paddingVertical: spacing?.md || 12,
  paddingHorizontal: spacing?.lg || 16,
  borderRadius: 8,
  minHeight: 44,
})

const $errorButtonText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 16,
  lineHeight: 24,
  fontFamily: typography.primary.medium,
  textAlign: "center" as const,
})