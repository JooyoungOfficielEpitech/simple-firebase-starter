import { type FC, useState, useCallback, memo, useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  type ImageStyle,
  type StyleProp,
  View,
  type ViewStyle,
  Animated,
} from "react-native";

import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

export interface LazyImageProps {
  /**
   * Image URL to display
   */
  uri: string;
  /**
   * Width of the image
   */
  width: number;
  /**
   * Height of the image
   */
  height: number;
  /**
   * Whether the image is currently visible in the viewport
   */
  isVisible?: boolean;
  /**
   * Border radius for the image
   */
  borderRadius?: number;
  /**
   * Resize mode for the image
   */
  resizeMode?: "cover" | "contain" | "stretch" | "center";
  /**
   * Optional style override
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Callback when image loads successfully
   */
  onLoad?: () => void;
  /**
   * Callback when image fails to load
   */
  onError?: () => void;
}

/**
 * A lazy-loading image component optimized for chat message lists.
 * Only loads the image when it becomes visible in the viewport.
 * Shows a placeholder until loaded with a smooth fade-in animation.
 * @param {LazyImageProps} props - The props for the `LazyImage` component.
 * @returns {JSX.Element} The rendered `LazyImage` component.
 * @example
 * <LazyImage
 *   uri="https://example.com/image.jpg"
 *   width={200}
 *   height={200}
 *   isVisible={true}
 * />
 */
export const LazyImage: FC<LazyImageProps> = memo(function LazyImage(props) {
  const {
    uri,
    width,
    height,
    isVisible = true,
    borderRadius = 12,
    resizeMode = "cover",
    style: $styleOverride,
    onLoad,
    onError,
  } = props;
  const { themed, theme } = useAppTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [fadeAnim] = useState(() => new Animated.Value(0));

  // Start loading when visible
  useEffect(() => {
    if (isVisible && !shouldLoad) {
      setShouldLoad(true);
    }
  }, [isVisible, shouldLoad]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    onLoad?.();
  }, [fadeAnim, onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  }, [onError]);

  return (
    <View
      style={[
        themed($container),
        { width, height, borderRadius },
        $styleOverride,
      ]}
    >
      {/* Placeholder - always visible until image loads */}
      {(isLoading || !shouldLoad) && (
        <View style={[themed($placeholder), { borderRadius }]}>
          {shouldLoad && (
            <ActivityIndicator size="small" color={theme.colors.tint} />
          )}
        </View>
      )}

      {/* Error state */}
      {hasError && (
        <View style={[themed($errorContainer), { borderRadius }]}>
          <View style={themed($errorIcon)} />
        </View>
      )}

      {/* Actual image - only rendered when shouldLoad is true */}
      {shouldLoad && !hasError && (
        <Animated.Image
          source={{ uri }}
          style={[
            themed($image),
            { width, height, borderRadius, opacity: fadeAnim },
          ]}
          resizeMode={resizeMode}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </View>
  );
});

const $container: ThemedStyle<ViewStyle> = () => ({
  overflow: "hidden",
  position: "relative",
});

const $placeholder: ThemedStyle<ViewStyle> = ({ colors }) => ({
  ...absoluteFill,
  backgroundColor: colors.palette.neutral200,
  justifyContent: "center",
  alignItems: "center",
});

const $errorContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  ...absoluteFill,
  backgroundColor: colors.palette.neutral200,
  justifyContent: "center",
  alignItems: "center",
});

const $errorIcon: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: colors.palette.neutral400,
});

const $image: ThemedStyle<ImageStyle> = () => ({
  position: "absolute",
  top: 0,
  left: 0,
});

// Helper for absolute positioning
const absoluteFill: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};
