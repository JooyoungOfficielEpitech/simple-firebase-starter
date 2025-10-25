import { type FC } from "react"
import { ActivityIndicator, Modal, type TextStyle, View, type ViewStyle, TouchableOpacity } from "react-native"

import { Text } from "./Text"
import { useAppTheme } from "@/theme/context"
import { type ThemedStyle } from "@/theme/types"

export interface LoadingOverlayProps {
  /** Controls the visibility of the overlay */
  visible: boolean
  /** Message shown under the spinner (default: "Loading...") */
  message?: string
  /** Accessibility label announced by screen readers */
  accessibilityLabel?: string
  /** Optional spinner color (defaults to theme primary) */
  spinnerColor?: string
  /** Spinner size */
  spinnerSize?: number | "small" | "large"
  /** Android back button / iOS swipe to close handler */
  onRequestClose?: () => void
  /** Optional testID for E2E/UI tests */
  testID?: string
}

/**
 * Reusable loading overlay component with dimmed background, spinner, and message.
 * 모달 기반 로딩 오버레이 컴포넌트로 재사용을 위해 분리했습니다.
 */
export const LoadingOverlay: FC<LoadingOverlayProps> = function LoadingOverlay({
  visible,
  message = "Loading...",
  accessibilityLabel = "Loading in progress",
  spinnerColor,
  spinnerSize = "large",
  onRequestClose,
  testID,
}) {
  const { themed, theme } = useAppTheme()

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onRequestClose}
      accessible
      accessibilityViewIsModal
      testID={testID}
    >
      <TouchableOpacity
        style={themed($overlay)}
        accessibilityRole="alert"
        accessibilityLabel={accessibilityLabel}
        accessibilityLiveRegion="polite"
        onPress={onRequestClose}
        activeOpacity={1}
      >
        <View style={themed($container)}>
          <ActivityIndicator
            size={spinnerSize}
            color={spinnerColor ?? theme.colors.tint}
            style={themed($spinner)}
            accessibilityLabel="Loading spinner"
          />
          <Text style={themed($message)} accessibilityRole="text" accessibilityLiveRegion="polite">
            {message}
          </Text>
          {onRequestClose && (
            <TouchableOpacity
              style={themed($emergencyButton)}
              onPress={onRequestClose}
              accessibilityRole="button"
              accessibilityLabel="Cancel loading"
            >
              <Text style={themed($emergencyButtonText)}>
                🚨 응급 취소
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

const $overlay: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
})

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 16,
  padding: spacing.lg,
  alignItems: "center",
  justifyContent: "center",
  minWidth: 120,
  shadowColor: colors.palette.neutral900,
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.15,
  shadowRadius: 12,
  elevation: 8,
})

const $spinner: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $message: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 16,
  fontFamily: typography.primary.medium,
  color: colors.text,
  textAlign: "center",
})

const $emergencyButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  marginTop: spacing.md,
  backgroundColor: colors.error,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderRadius: 8,
  borderWidth: 2,
  borderColor: colors.errorBackground,
})

const $emergencyButtonText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 14,
  fontFamily: typography.primary.bold,
  color: colors.errorBackground,
  textAlign: "center",
})

export default LoadingOverlay
