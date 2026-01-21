/**
 * Avatar Component
 * 아바타 컴포넌트 - 사용자 프로필 이미지 표시에 사용
 */

import { FC } from "react";
import { Image, ImageStyle, Pressable, TextStyle, View, ViewStyle } from "react-native";

import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

import { Text } from "./Text";

// ==========================================
// Types
// ==========================================

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
export type AvatarVariant = "circle" | "rounded" | "square";

export interface AvatarProps {
  /** Image source URI */
  source?: string;
  /** Fallback text (usually initials) */
  fallback?: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Size variant */
  size?: AvatarSize;
  /** Shape variant */
  variant?: AvatarVariant;
  /** Custom background color */
  backgroundColor?: string;
  /** Custom text color for fallback */
  textColor?: string;
  /** Online status indicator */
  status?: "online" | "offline" | "away" | "busy";
  /** Show border */
  bordered?: boolean;
  /** Border color */
  borderColor?: string;
  /** Press handler */
  onPress?: () => void;
  /** Container style override */
  style?: ViewStyle;
}

// ==========================================
// Component
// ==========================================

export const Avatar: FC<AvatarProps> = ({
  source,
  fallback,
  alt,
  size = "md",
  variant = "circle",
  backgroundColor,
  textColor,
  status,
  bordered = false,
  borderColor,
  onPress,
  style,
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme();

  // Get size configuration
  const getSizeConfig = () => {
    switch (size) {
      case "xs":
        return { size: 24, fontSize: 10, statusSize: 8 };
      case "sm":
        return { size: 32, fontSize: 12, statusSize: 10 };
      case "lg":
        return { size: 56, fontSize: 20, statusSize: 14 };
      case "xl":
        return { size: 72, fontSize: 24, statusSize: 16 };
      case "xxl":
        return { size: 96, fontSize: 32, statusSize: 20 };
      default:
        return { size: 44, fontSize: 16, statusSize: 12 };
    }
  };

  const sizeConfig = getSizeConfig();

  // Get border radius based on variant
  const getBorderRadius = () => {
    switch (variant) {
      case "square":
        return 0;
      case "rounded":
        return sizeConfig.size * 0.2;
      default:
        return sizeConfig.size / 2;
    }
  };

  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case "online":
        return colors.palette.secondary500;
      case "away":
        return colors.palette.accent500;
      case "busy":
        return colors.error;
      default:
        return colors.palette.neutral400;
    }
  };

  // Generate color from string (for fallback background)
  const getColorFromString = (str: string) => {
    const colorPalette = [
      colors.tint,
      colors.palette.secondary500,
      colors.palette.accent500,
      colors.palette.primary600,
      colors.palette.neutral500,
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colorPalette[Math.abs(hash) % colorPalette.length];
  };

  const borderRadius = getBorderRadius();
  const bgColor =
    backgroundColor ||
    (fallback ? getColorFromString(fallback) : colors.palette.neutral400);

  const containerStyle: ViewStyle = {
    width: sizeConfig.size,
    height: sizeConfig.size,
    borderRadius,
    backgroundColor: bgColor,
    borderWidth: bordered ? 2 : 0,
    borderColor: borderColor || colors.background,
  };

  const AvatarContent = (
    <View style={[themed($container), containerStyle, style]}>
      {source ? (
        <Image
          source={{ uri: source }}
          style={[
            themed($image),
            {
              width: sizeConfig.size,
              height: sizeConfig.size,
              borderRadius,
            },
          ]}
          accessibilityLabel={alt}
        />
      ) : (
        <Text
          style={[
            themed($fallbackText),
            {
              fontSize: sizeConfig.fontSize,
              color: textColor || colors.palette.neutral100,
            },
          ]}
        >
          {fallback?.slice(0, 2).toUpperCase() || "?"}
        </Text>
      )}

      {/* Status indicator */}
      {status && (
        <View
          style={[
            themed($statusIndicator),
            {
              width: sizeConfig.statusSize,
              height: sizeConfig.statusSize,
              borderRadius: sizeConfig.statusSize / 2,
              backgroundColor: getStatusColor(),
              borderWidth: 2,
              borderColor: colors.background,
              bottom: variant === "circle" ? 0 : -2,
              right: variant === "circle" ? 0 : -2,
            },
          ]}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={alt}>
        {AvatarContent}
      </Pressable>
    );
  }

  return AvatarContent;
};

// ==========================================
// Avatar Group Component
// ==========================================

export interface AvatarGroupProps {
  /** Array of avatar data */
  avatars: Array<{
    source?: string;
    fallback?: string;
    alt?: string;
  }>;
  /** Maximum avatars to show */
  max?: number;
  /** Avatar size */
  size?: AvatarSize;
  /** Overlap amount in pixels */
  overlap?: number;
  /** Container style override */
  style?: ViewStyle;
}

export const AvatarGroup: FC<AvatarGroupProps> = ({
  avatars,
  max = 4,
  size = "md",
  overlap = 8,
  style,
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme();

  const displayAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  // Get size value
  const getSizeValue = () => {
    switch (size) {
      case "xs":
        return 24;
      case "sm":
        return 32;
      case "lg":
        return 56;
      case "xl":
        return 72;
      case "xxl":
        return 96;
      default:
        return 44;
    }
  };

  const sizeValue = getSizeValue();

  return (
    <View style={[themed($groupContainer), style]}>
      {displayAvatars.map((avatar, index) => (
        <View
          key={index}
          style={[
            themed($groupItem),
            {
              marginLeft: index === 0 ? 0 : -overlap,
              zIndex: displayAvatars.length - index,
            },
          ]}
        >
          <Avatar
            source={avatar.source}
            fallback={avatar.fallback}
            alt={avatar.alt}
            size={size}
            bordered
          />
        </View>
      ))}

      {remainingCount > 0 && (
        <View
          style={[
            themed($remainingContainer),
            {
              width: sizeValue,
              height: sizeValue,
              borderRadius: sizeValue / 2,
              marginLeft: -overlap,
              backgroundColor: colors.palette.neutral300,
            },
          ]}
        >
          <Text
            style={[
              themed($remainingText),
              { fontSize: sizeValue * 0.35 },
            ]}
          >
            +{remainingCount}
          </Text>
        </View>
      )}
    </View>
  );
};

// ==========================================
// Styles
// ==========================================

const $container: ThemedStyle<ViewStyle> = () => ({
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
});

const $image: ThemedStyle<ImageStyle> = () => ({
  resizeMode: "cover",
});

const $fallbackText: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontFamily: typography.primary.semiBold,
  textAlign: "center",
});

const $statusIndicator: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
});

const $groupContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
});

const $groupItem: ThemedStyle<ViewStyle> = () => ({});

const $remainingContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 2,
  borderColor: colors.background,
});

const $remainingText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontFamily: typography.primary.semiBold,
  color: colors.text,
});
