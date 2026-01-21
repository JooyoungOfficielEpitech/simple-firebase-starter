import { type FC } from "react";
import {
  ActivityIndicator,
  Pressable,
  type StyleProp,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { useAppTheme } from "@/theme/context";
import { type ThemedStyle } from "@/theme/types";

import { Text } from "./Text";

export interface ImageUploadProgressProps {
  /**
   * Upload progress (0-100)
   */
  progress: number;
  /**
   * Whether upload is in progress
   */
  isUploading: boolean;
  /**
   * Optional callback when cancel is pressed
   */
  onCancel?: () => void;
  /**
   * Optional style override for the container
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Progress bar variant: 'linear' or 'circular'
   */
  variant?: "linear" | "circular";
  /**
   * Show percentage text
   */
  showPercentage?: boolean;
}

/**
 * A component that displays upload progress with optional cancel functionality.
 * Supports both linear and circular progress indicators.
 * @param {ImageUploadProgressProps} props - The props for the `ImageUploadProgress` component.
 * @returns {JSX.Element} The rendered `ImageUploadProgress` component.
 * @example
 * <ImageUploadProgress
 *   progress={65}
 *   isUploading={true}
 *   onCancel={() => cancelUpload()}
 * />
 */
export const ImageUploadProgress: FC<ImageUploadProgressProps> =
  function ImageUploadProgress(props) {
    const {
      progress,
      isUploading,
      onCancel,
      style: $styleOverride,
      variant = "linear",
      showPercentage = true,
    } = props;

    const { themed, theme } = useAppTheme();

    // Clamp progress between 0 and 100
    const clampedProgress = Math.min(100, Math.max(0, progress));

    // Animated progress value for smooth transitions
    const animatedProgress = useSharedValue(clampedProgress);

    // Update animated value when progress changes
    if (animatedProgress.value !== clampedProgress) {
      animatedProgress.value = withTiming(clampedProgress, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
    }

    // Animated style for linear progress bar
    const animatedBarStyle = useAnimatedStyle(() => ({
      width: `${animatedProgress.value}%`,
    }));

    if (!isUploading && progress === 0) {
      return null;
    }

    const renderLinearProgress = () => (
      <View style={themed($linearContainer)}>
        <View style={themed($progressBarBackground)}>
          <Animated.View style={[themed($progressBarFill), animatedBarStyle]} />
        </View>
        <View style={themed($linearInfoRow)}>
          {showPercentage && (
            <Text
              text={`${Math.round(clampedProgress)}%`}
              style={themed($percentageText)}
            />
          )}
          {isUploading && onCancel && (
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                themed($cancelButton),
                pressed && themed($cancelButtonPressed),
              ]}
              accessibilityRole="button"
              accessibilityLabel="업로드 취소"
            >
              <Text text="취소" style={themed($cancelButtonText)} />
            </Pressable>
          )}
        </View>
      </View>
    );

    const renderCircularProgress = () => {
      const size = 80;
      const strokeWidth = 6;
      const radius = (size - strokeWidth) / 2;
      const circumference = 2 * Math.PI * radius;
      const strokeDashoffset =
        circumference - (clampedProgress / 100) * circumference;

      return (
        <View style={themed($circularContainer)}>
          <View style={{ width: size, height: size }}>
            {/* Background circle */}
            <View
              style={[
                themed($circularBackground),
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderWidth: strokeWidth,
                },
              ]}
            />
            {/* Progress indicator - using ActivityIndicator for simplicity */}
            {isUploading && (
              <View style={themed($circularOverlay)}>
                <ActivityIndicator
                  size="large"
                  color={theme.colors.palette.primary500}
                />
              </View>
            )}
            {/* Percentage text in center */}
            <View style={themed($circularTextContainer)}>
              {showPercentage && (
                <Text
                  text={`${Math.round(clampedProgress)}%`}
                  style={themed($circularPercentageText)}
                />
              )}
            </View>
          </View>
          {isUploading && onCancel && (
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                themed($cancelButton),
                themed($circularCancelButton),
                pressed && themed($cancelButtonPressed),
              ]}
              accessibilityRole="button"
              accessibilityLabel="업로드 취소"
            >
              <Text text="취소" style={themed($cancelButtonText)} />
            </Pressable>
          )}
        </View>
      );
    };

    return (
      <View
        style={[themed($container), $styleOverride]}
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: clampedProgress,
        }}
        accessibilityLabel={`업로드 진행률 ${Math.round(clampedProgress)}%`}
      >
        {isUploading && (
          <Text
            text="업로드 중..."
            style={themed($uploadingText)}
            accessibilityElementsHidden
          />
        )}
        {!isUploading && progress === 100 && (
          <Text text="업로드 완료!" style={themed($completedText)} />
        )}
        {variant === "linear"
          ? renderLinearProgress()
          : renderCircularProgress()}
      </View>
    );
  };

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
});

const $linearContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "100%",
});

const $progressBarBackground: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: colors.palette.neutral300,
  overflow: "hidden",
});

const $progressBarFill: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: "100%",
  borderRadius: 4,
  backgroundColor: colors.palette.primary500,
});

const $linearInfoRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: spacing.xs,
});

const $percentageText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
});

const $uploadingText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 14,
  fontWeight: "500",
  color: colors.textDim,
  marginBottom: spacing.sm,
});

const $completedText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.palette.primary500,
  marginBottom: spacing.sm,
});

const $cancelButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxs,
  borderRadius: 4,
  backgroundColor: colors.palette.neutral200,
});

const $cancelButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral300,
});

const $cancelButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  fontWeight: "500",
  color: colors.error,
});

const $circularContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  justifyContent: "center",
});

const $circularBackground: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.palette.neutral300,
});

const $circularOverlay: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: "center",
  alignItems: "center",
});

const $circularTextContainer: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: "center",
  alignItems: "center",
});

const $circularPercentageText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  fontWeight: "700",
  color: colors.text,
});

const $circularCancelButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
});
