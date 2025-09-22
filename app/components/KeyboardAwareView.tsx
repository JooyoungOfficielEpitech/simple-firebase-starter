import React, { useEffect, useRef } from "react"
import { 
  View, 
  Keyboard, 
  KeyboardAvoidingView, 
  Platform, 
  Animated, 
  ViewStyle,
  KeyboardEvent
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useAppTheme } from "@/theme/context"

interface KeyboardAwareViewProps {
  children: React.ReactNode
  style?: ViewStyle
  behavior?: "height" | "position" | "padding"
  keyboardVerticalOffset?: number
  avoidKeyboard?: boolean
}

export const KeyboardAwareView = React.memo(({
  children,
  style,
  behavior = Platform.OS === "ios" ? "padding" : "height",
  keyboardVerticalOffset,
  avoidKeyboard = true,
}: KeyboardAwareViewProps) => {
  const { themed } = useAppTheme()
  const insets = useSafeAreaInsets()
  const keyboardHeight = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!avoidKeyboard) return

    const keyboardWillShow = (event: KeyboardEvent) => {
      Animated.timing(keyboardHeight, {
        duration: event.duration || 250,
        toValue: event.endCoordinates.height,
        useNativeDriver: false,
      }).start()
    }

    const keyboardWillHide = (event: KeyboardEvent) => {
      Animated.timing(keyboardHeight, {
        duration: event.duration || 250,
        toValue: 0,
        useNativeDriver: false,
      }).start()
    }

    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow"
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide"

    const showSubscription = Keyboard.addListener(showEvent, keyboardWillShow)
    const hideSubscription = Keyboard.addListener(hideEvent, keyboardWillHide)

    return () => {
      showSubscription?.remove()
      hideSubscription?.remove()
    }
  }, [avoidKeyboard, keyboardHeight])

  if (!avoidKeyboard) {
    return <View style={[themed($container), style]}>{children}</View>
  }

  const defaultOffset = keyboardVerticalOffset ?? insets.bottom

  return (
    <KeyboardAvoidingView
      style={[themed($container), style]}
      behavior={behavior}
      keyboardVerticalOffset={defaultOffset}
    >
      <Animated.View
        style={[
          themed($animatedContainer),
          {
            paddingBottom: Platform.OS === "android" ? keyboardHeight : 0,
          },
        ]}
      >
        {children}
      </Animated.View>
    </KeyboardAvoidingView>
  )
})

// Lightweight keyboard dismissal wrapper
export const DismissKeyboardView = React.memo(({
  children,
  style,
}: {
  children: React.ReactNode
  style?: ViewStyle
}) => {
  const { themed } = useAppTheme()

  return (
    <View
      style={[themed($dismissContainer), style]}
      onStartShouldSetResponder={() => true}
      onResponderGrant={() => Keyboard.dismiss()}
    >
      {children}
    </View>
  )
})

const $container = {
  flex: 1,
}

const $animatedContainer = {
  flex: 1,
}

const $dismissContainer = {
  flex: 1,
}

KeyboardAwareView.displayName = "KeyboardAwareView"
DismissKeyboardView.displayName = "DismissKeyboardView"