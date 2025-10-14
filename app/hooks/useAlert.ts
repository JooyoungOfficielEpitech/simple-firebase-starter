import { useState, useCallback } from "react"
import type { AlertButton } from "@/components/AlertModal"

export interface ShowAlertOptions {
  title: string
  message?: string
  buttons?: AlertButton[]
  dismissable?: boolean
}

/**
 * Hook for showing themed alert modals
 * Provides a simple API similar to React Native's Alert.alert()
 */
export function useAlert() {
  const [alertState, setAlertState] = useState<{
    visible: boolean
    title: string
    message?: string
    buttons?: AlertButton[]
    dismissable?: boolean
  }>({
    visible: false,
    title: "",
    message: undefined,
    buttons: undefined,
    dismissable: true,
  })

  const showAlert = useCallback((options: ShowAlertOptions) => {
    setAlertState({
      visible: true,
      title: options.title,
      message: options.message,
      buttons: options.buttons || [{ text: "확인" }],
      dismissable: options.dismissable ?? true,
    })
  }, [])

  const hideAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, visible: false }))
  }, [])

  // Simple alert with just title and message
  const alert = useCallback(
    (title: string, message?: string, buttons?: AlertButton[]) => {
      showAlert({ title, message, buttons })
    },
    [showAlert],
  )

  // Confirmation dialog with OK/Cancel buttons
  const confirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      onCancel?: () => void,
    ) => {
      showAlert({
        title,
        message,
        buttons: [
          {
            text: "취소",
            style: "cancel",
            onPress: onCancel,
          },
          {
            text: "확인",
            style: "default",
            onPress: onConfirm,
          },
        ],
      })
    },
    [showAlert],
  )

  // Destructive action confirmation
  const confirmDestructive = useCallback(
    (
      title: string,
      message: string,
      destructiveText: string,
      onConfirm: () => void,
      onCancel?: () => void,
    ) => {
      showAlert({
        title,
        message,
        buttons: [
          {
            text: "취소",
            style: "cancel",
            onPress: onCancel,
          },
          {
            text: destructiveText,
            style: "destructive",
            onPress: onConfirm,
          },
        ],
      })
    },
    [showAlert],
  )

  return {
    // Alert state for the modal component
    alertState,
    showAlert,
    hideAlert,
    
    // Convenience methods
    alert,
    confirm,
    confirmDestructive,
  }
}