import { type FC } from "react";
import { Modal, type TextStyle, View, type ViewStyle } from "react-native";

import { translate } from "@/i18n";
import { useAppTheme } from "@/theme/context";
import { type ThemedStyle } from "@/theme/types";
import { $styles } from "@/theme/styles";

import { Button } from "./Button";
import { Text } from "./Text";

export interface NotificationPermissionPromptProps {
  /**
   * Whether the modal is visible
   */
  visible: boolean;
  /**
   * Callback when user allows notifications
   */
  onAllow: () => void;
  /**
   * Callback when user dismisses the modal
   */
  onDismiss: () => void;
}

/**
 * A modal component that prompts the user to allow push notifications.
 * Displays the importance of notifications and provides "Allow" and "Later" options.
 * @param {NotificationPermissionPromptProps} props - The props for the `NotificationPermissionPrompt` component.
 * @returns {JSX.Element} The rendered `NotificationPermissionPrompt` component.
 * @example
 * <NotificationPermissionPrompt
 *   visible={showPrompt}
 *   onAllow={handleAllow}
 *   onDismiss={handleDismiss}
 * />
 */
export const NotificationPermissionPrompt: FC<NotificationPermissionPromptProps> =
  function NotificationPermissionPrompt(props) {
    const { visible, onAllow, onDismiss } = props;
    const { themed } = useAppTheme();

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onDismiss}
        accessibilityViewIsModal
      >
        <View style={themed($overlay)}>
          <View style={themed($container)}>
            {/* Title */}
            <Text style={themed($title)} weight="bold">
              {translate("notifications.permissionPrompt.title")}
            </Text>

            {/* Description */}
            <Text style={themed($description)}>
              {translate("notifications.permissionPrompt.description")}
            </Text>

            {/* Buttons */}
            <View style={$styles.row}>
              <Button
                text={translate("notifications.permissionPrompt.later")}
                preset="default"
                onPress={onDismiss}
                style={themed($button)}
                accessibilityLabel={translate("notifications.permissionPrompt.later")}
              />
              <Button
                text={translate("notifications.permissionPrompt.allow")}
                preset="cta"
                onPress={onAllow}
                style={themed($button)}
                accessibilityLabel={translate("notifications.permissionPrompt.allow")}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  };

const $overlay: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
});

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: spacing.md,
  padding: spacing.lg,
  width: "100%",
  maxWidth: 400,
  shadowColor: colors.palette.neutral800,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
});

const $title: ThemedStyle<TextStyle> = ({ spacing }) => ({
  fontSize: 20,
  marginBottom: spacing.xs,
  textAlign: "center",
});

const $description: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  fontSize: 16,
  marginBottom: spacing.lg,
  textAlign: "center",
  color: colors.textDim,
  lineHeight: 24,
});

const $button: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  marginHorizontal: spacing.xs,
});
