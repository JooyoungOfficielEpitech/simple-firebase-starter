import { type FC, useCallback } from "react";
import {
  ActionSheetIOS,
  Alert,
  Platform,
  Pressable,
  type StyleProp,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";

import { useAppTheme } from "@/theme/context";
import { type ThemedStyle } from "@/theme/types";

import { Icon } from "./Icon";
import { Text } from "./Text";

export type ImageSourceType = "camera" | "gallery" | "both";

export interface ImagePickerButtonProps {
  /**
   * Callback when an image source is selected
   */
  onSourceSelected: (source: "camera" | "gallery") => void;
  /**
   * Image source type: 'camera', 'gallery', or 'both' (shows action sheet)
   */
  source?: ImageSourceType;
  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
  /**
   * Optional style override for the container
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Optional label text
   */
  label?: string;
  /**
   * Icon size
   */
  iconSize?: number;
}

/**
 * A button component for selecting images from camera or gallery.
 * When source='both', shows an ActionSheet (iOS) or Alert (Android) to let user choose.
 * @param {ImagePickerButtonProps} props - The props for the `ImagePickerButton` component.
 * @returns {JSX.Element} The rendered `ImagePickerButton` component.
 * @example
 * <ImagePickerButton
 *   source="both"
 *   onSourceSelected={(source) => handleImagePick(source)}
 * />
 */
export const ImagePickerButton: FC<ImagePickerButtonProps> =
  function ImagePickerButton(props) {
    const {
      onSourceSelected,
      source = "both",
      disabled = false,
      style: $styleOverride,
      label,
      iconSize = 32,
    } = props;

    const { themed, theme } = useAppTheme();

    /**
     * Show source selection options (ActionSheet on iOS, Alert on Android)
     */
    const showSourceOptions = useCallback(() => {
      if (Platform.OS === "ios") {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ["취소", "카메라로 촬영", "갤러리에서 선택"],
            cancelButtonIndex: 0,
            title: "이미지 선택",
          },
          (buttonIndex) => {
            if (buttonIndex === 1) {
              onSourceSelected("camera");
            } else if (buttonIndex === 2) {
              onSourceSelected("gallery");
            }
          },
        );
      } else {
        Alert.alert(
          "이미지 선택",
          "이미지를 어디서 가져올까요?",
          [
            {
              text: "카메라로 촬영",
              onPress: () => onSourceSelected("camera"),
            },
            {
              text: "갤러리에서 선택",
              onPress: () => onSourceSelected("gallery"),
            },
            {
              text: "취소",
              style: "cancel",
            },
          ],
          { cancelable: true },
        );
      }
    }, [onSourceSelected]);

    /**
     * Handle button press based on source type
     */
    const handlePress = useCallback(() => {
      if (source === "both") {
        showSourceOptions();
      } else {
        onSourceSelected(source);
      }
    }, [source, showSourceOptions, onSourceSelected]);

    /**
     * Get the appropriate icon based on source type
     */
    const getIconName = (): "camera" | "gallery" => {
      if (source === "camera") return "camera";
      if (source === "gallery") return "gallery";
      return "camera"; // Default for 'both'
    };

    return (
      <Pressable
        style={({ pressed }) => [
          themed($container),
          pressed && !disabled && themed($containerPressed),
          disabled && themed($containerDisabled),
          $styleOverride,
        ]}
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label || "이미지 선택"}
        accessibilityState={{ disabled }}
        accessibilityHint={
          source === "both"
            ? "카메라 또는 갤러리에서 이미지를 선택합니다"
            : source === "camera"
              ? "카메라로 사진을 촬영합니다"
              : "갤러리에서 이미지를 선택합니다"
        }
      >
        <View style={themed($iconContainer)}>
          <Icon
            icon="more"
            size={iconSize}
            color={
              disabled ? theme.colors.textDim : theme.colors.palette.primary500
            }
          />
        </View>
        {label && (
          <Text
            text={label}
            style={[themed($label), disabled && themed($labelDisabled)]}
            numberOfLines={1}
          />
        )}
      </Pressable>
    );
  };

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  alignItems: "center",
  justifyContent: "center",
  padding: spacing.md,
  borderRadius: 12,
  borderWidth: 2,
  borderStyle: "dashed",
  borderColor: colors.palette.neutral300,
  backgroundColor: colors.palette.neutral100,
  minWidth: 100,
  minHeight: 100,
});

const $containerPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral200,
  borderColor: colors.palette.primary500,
});

const $containerDisabled: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral200,
  borderColor: colors.palette.neutral300,
  opacity: 0.6,
});

const $iconContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
});

const $label: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: "500",
  color: colors.text,
  textAlign: "center",
});

const $labelDisabled: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
});
