import { type FC, useState, useCallback, memo } from "react";
import {
  Pressable,
  type StyleProp,
  TextInput,
  type TextStyle,
  View,
  type ViewStyle,
  Platform,
  KeyboardAvoidingView,
} from "react-native";

import { Text } from "@/components/Text";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

export interface MessageInputProps {
  /**
   * Callback when message is sent
   */
  onSend: (text: string) => void;
  /**
   * Callback when image picker is pressed
   */
  onImagePick?: () => void;
  /**
   * Whether the input is disabled
   */
  disabled?: boolean;
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Optional style override for the container
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * A message input component with send button and optional image picker.
 * Includes keyboard avoidance behavior.
 * @param {MessageInputProps} props - The props for the `MessageInput` component.
 * @returns {JSX.Element} The rendered `MessageInput` component.
 * @example
 * <MessageInput
 *   onSend={(text) => sendMessage(text)}
 *   onImagePick={() => pickImage()}
 *   disabled={isSending}
 * />
 */
export const MessageInput: FC<MessageInputProps> = memo(
  function MessageInput(props) {
    const {
      onSend,
      onImagePick,
      disabled = false,
      placeholder = "메시지를 입력하세요...",
      style: $styleOverride,
    } = props;
    const { themed, theme } = useAppTheme();
    const [text, setText] = useState("");

    const handleSend = useCallback(() => {
      const trimmedText = text.trim();
      if (trimmedText && !disabled) {
        onSend(trimmedText);
        setText("");
      }
    }, [text, disabled, onSend]);

    const handleTextChange = useCallback((newText: string) => {
      setText(newText);
    }, []);

    const canSend = text.trim().length > 0 && !disabled;

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={[themed($container), $styleOverride]}>
          {/* Image Picker Button */}
          {onImagePick && (
            <Pressable
              style={({ pressed }) => [
                themed($iconButton),
                pressed && themed($iconButtonPressed),
                disabled && themed($iconButtonDisabled),
              ]}
              onPress={onImagePick}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel="이미지 첨부"
              accessibilityState={{ disabled }}
            >
              <Text style={themed($iconText)}>+</Text>
            </Pressable>
          )}

          {/* Text Input */}
          <View style={themed($inputWrapper)}>
            <TextInput
              style={themed($input)}
              value={text}
              onChangeText={handleTextChange}
              placeholder={placeholder}
              placeholderTextColor={theme.colors.textDim}
              multiline
              maxLength={1000}
              editable={!disabled}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
              accessibilityLabel="메시지 입력"
              accessibilityHint="메시지를 입력하고 전송 버튼을 누르세요"
            />
          </View>

          {/* Send Button */}
          <Pressable
            style={({ pressed }) => [
              themed($sendButton),
              canSend ? themed($sendButtonActive) : themed($sendButtonInactive),
              pressed && canSend && themed($sendButtonPressed),
            ]}
            onPress={handleSend}
            disabled={!canSend}
            accessibilityRole="button"
            accessibilityLabel="메시지 전송"
            accessibilityState={{ disabled: !canSend }}
          >
            <Text
              style={[
                themed($sendButtonText),
                canSend && themed($sendButtonTextActive),
              ]}
            >
              전송
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  },
);

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-end",
  backgroundColor: colors.background,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderTopWidth: 1,
  borderTopColor: colors.separator,
});

const $iconButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: colors.palette.neutral200,
  justifyContent: "center",
  alignItems: "center",
  marginRight: spacing.xs,
});

const $iconButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral300,
});

const $iconButtonDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.5,
});

const $iconText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 22,
  fontWeight: "500",
  color: colors.text,
});

const $inputWrapper: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  backgroundColor: colors.palette.neutral100,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  paddingHorizontal: spacing.sm,
  paddingVertical: Platform.OS === "ios" ? spacing.xs : 0,
  marginRight: spacing.xs,
  maxHeight: 100,
});

const $input: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 15,
  color: colors.text,
  paddingTop: Platform.OS === "ios" ? 0 : 8,
  paddingBottom: Platform.OS === "ios" ? 0 : 8,
  minHeight: 20,
  maxHeight: 80,
});

const $sendButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderRadius: 18,
  minWidth: 50,
  height: 36,
  justifyContent: "center",
  alignItems: "center",
});

const $sendButtonActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.primary500,
});

const $sendButtonInactive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral200,
});

const $sendButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.primary600,
});

const $sendButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.textDim,
});

const $sendButtonTextActive: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.neutral100,
});
