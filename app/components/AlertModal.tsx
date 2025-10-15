import React from "react"
import {
  Modal,
  View,
  Pressable,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native"

import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { Button } from "./Button"
import { Text } from "./Text"

export interface AlertButton {
  text: string
  onPress?: () => void
  style?: "default" | "destructive" | "cancel"
}

export interface AlertModalProps {
  /**
   * Whether the modal is visible
   */
  visible: boolean
  /**
   * Title of the alert
   */
  title: string
  /**
   * Message content of the alert
   */
  message?: string
  /**
   * Array of buttons to display
   */
  buttons?: AlertButton[]
  /**
   * Called when the modal is dismissed by tapping outside
   */
  onDismiss?: () => void
  /**
   * Whether the modal can be dismissed by tapping outside (default: false)
   */
  dismissable?: boolean
  /**
   * Optional style override for the modal container
   */
  style?: StyleProp<ViewStyle>
  /**
   * Optional style override for the title text
   */
  titleStyle?: StyleProp<TextStyle>
  /**
   * Optional style override for the message text
   */
  messageStyle?: StyleProp<TextStyle>
}

/**
 * A themed modal component that replaces React Native's Alert
 * Provides consistent styling with the app theme
 */
export function AlertModal(props: AlertModalProps) {
  const {
    visible,
    title,
    message,
    buttons = [{ text: "확인", onPress: () => {} }],
    onDismiss,
    dismissable = false,
    style: $containerStyleOverride,
    titleStyle: $titleStyleOverride,
    messageStyle: $messageStyleOverride,
  } = props

  const { themed } = useAppTheme()

  const handleBackdropPress = () => {
    if (dismissable && onDismiss) {
      onDismiss()
    }
  }

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress()
    }
    if (onDismiss) {
      onDismiss()
    }
  }

  const getButtonPreset = (style?: string) => {
    switch (style) {
      case "destructive":
        return "accent" as const
      case "cancel":
        return "default" as const
      default:
        return "cta" as const
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Pressable style={themed($backdrop)} onPress={handleBackdropPress}>
        <Pressable style={[themed($container), $containerStyleOverride]}>
          <View style={themed($content)}>
            {/* Title */}
            <Text style={[themed($title), $titleStyleOverride]}>{title}</Text>

            {/* Message */}
            {message && (
              <Text style={[themed($message), $messageStyleOverride]}>
                {message}
              </Text>
            )}

            {/* Buttons */}
            <View style={themed($buttonsContainer)}>
              {buttons.map((button, index) => (
                <Button
                  key={index}
                  text={button.text}
                  preset={getButtonPreset(button.style)}
                  style={themed($button)}
                  onPress={() => handleButtonPress(button)}
                />
              ))}
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

// Themed styles
const $backdrop: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
})

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  minWidth: 280,
  maxWidth: "90%",
  elevation: 10,
  shadowColor: colors.palette.neutral900,
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.25,
  shadowRadius: 8,
})

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.lg,
})

const $title: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  fontFamily: typography.primary.semiBold,
  fontSize: 18,
  lineHeight: 24,
  color: colors.text,
  textAlign: "center",
  marginBottom: spacing.sm,
})

const $message: ThemedStyle<TextStyle> = ({ colors, typography, spacing }) => ({
  fontFamily: typography.primary.normal,
  fontSize: 16,
  lineHeight: 22,
  color: colors.textDim,
  textAlign: "center",
  marginBottom: spacing.lg,
})

const $buttonsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "center",
  gap: spacing.sm,
  flexWrap: "wrap",
})

const $button: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minWidth: 100,
  flex: 1,
  maxWidth: 120,
})