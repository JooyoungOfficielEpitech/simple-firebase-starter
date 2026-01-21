import { type FC, useState, useCallback, memo } from "react";
import {
  Image,
  type ImageStyle,
  Modal,
  Pressable,
  type StyleProp,
  type TextStyle,
  View,
  type ViewStyle,
  Dimensions,
  StatusBar,
} from "react-native";

import { Text } from "@/components/Text";
import { LazyImage } from "./LazyImage";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface MessageImageProps {
  /**
   * Image URL to display
   */
  imageUrl: string;
  /**
   * Callback when the image is pressed (opens fullscreen by default)
   */
  onPress?: () => void;
  /**
   * Thumbnail width
   */
  width?: number;
  /**
   * Thumbnail height
   */
  height?: number;
  /**
   * Whether the image is visible in the viewport (for lazy loading)
   */
  isVisible?: boolean;
  /**
   * Optional style override for the container
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * An image component for displaying image messages in chat.
 * Tapping opens a fullscreen modal view of the image.
 * @param {MessageImageProps} props - The props for the `MessageImage` component.
 * @returns {JSX.Element} The rendered `MessageImage` component.
 * @example
 * <MessageImage
 *   imageUrl="https://example.com/image.jpg"
 *   onPress={() => console.log('Image pressed')}
 * />
 */
export const MessageImage: FC<MessageImageProps> = memo(
  function MessageImage(props) {
    const {
      imageUrl,
      onPress,
      width = 200,
      height = 200,
      isVisible = true,
      style: $styleOverride,
    } = props;
    const { themed } = useAppTheme();
    const [isFullscreenVisible, setIsFullscreenVisible] = useState(false);

    const handlePress = useCallback(() => {
      if (onPress) {
        onPress();
      } else {
        setIsFullscreenVisible(true);
      }
    }, [onPress]);

    const handleCloseFullscreen = useCallback(() => {
      setIsFullscreenVisible(false);
    }, []);

    return (
      <>
        <Pressable
          style={[themed($container), { width, height }, $styleOverride]}
          onPress={handlePress}
          accessibilityRole="imagebutton"
          accessibilityLabel="이미지 메시지"
          accessibilityHint="탭하여 이미지를 크게 보기"
        >
          {/* Lazy-loaded thumbnail image */}
          <LazyImage
            uri={imageUrl}
            width={width}
            height={height}
            isVisible={isVisible}
            borderRadius={12}
            resizeMode="cover"
          />
        </Pressable>

        {/* Fullscreen Modal */}
        <Modal
          visible={isFullscreenVisible}
          transparent
          animationType="fade"
          onRequestClose={handleCloseFullscreen}
          statusBarTranslucent
        >
          <StatusBar
            backgroundColor="rgba(0,0,0,0.9)"
            barStyle="light-content"
          />
          <Pressable
            style={themed($modalContainer)}
            onPress={handleCloseFullscreen}
            accessibilityRole="button"
            accessibilityLabel="닫기"
            accessibilityHint="탭하여 이미지 보기를 닫습니다"
          >
            {/* Close button */}
            <Pressable
              style={themed($closeButton)}
              onPress={handleCloseFullscreen}
              accessibilityRole="button"
              accessibilityLabel="닫기"
            >
              <Text style={themed($closeButtonText)}>X</Text>
            </Pressable>

            {/* Fullscreen Image */}
            <Image
              source={{ uri: imageUrl }}
              style={themed($fullscreenImage)}
              resizeMode="contain"
            />
          </Pressable>
        </Modal>
      </>
    );
  },
);

const $container: ThemedStyle<ViewStyle> = () => ({
  borderRadius: 12,
  overflow: "hidden",
});

const $modalContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.9)",
  justifyContent: "center",
  alignItems: "center",
});

const $closeButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "absolute",
  top: spacing.xl + 40, // Account for status bar
  right: spacing.md,
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 10,
});

const $closeButtonText: ThemedStyle<TextStyle> = () => ({
  fontSize: 18,
  color: "#FFFFFF",
  fontWeight: "600",
});

const $fullscreenImage: ThemedStyle<ImageStyle> = () => ({
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT * 0.8,
});
