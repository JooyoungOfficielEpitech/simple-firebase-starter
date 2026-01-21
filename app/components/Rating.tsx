/**
 * Rating Component
 * 별점 컴포넌트 - 평점 표시 및 입력
 */

import { FC, useCallback } from "react";
import { View, ViewStyle, Pressable } from "react-native";

import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

import { Icon } from "./Icon";
import { Text } from "./Text";

// ==========================================
// Types
// ==========================================

export interface RatingProps {
  /** 현재 평점 (0-5) */
  value: number;
  /** 평점 변경 콜백 (없으면 읽기 전용) */
  onChange?: (value: number) => void;
  /** 최대 별 개수 */
  maxStars?: number;
  /** 별 크기 */
  size?: "sm" | "md" | "lg";
  /** 반별 허용 */
  allowHalf?: boolean;
  /** 비활성화 */
  disabled?: boolean;
  /** 평점 텍스트 표시 */
  showValue?: boolean;
  /** 리뷰 개수 표시 */
  reviewCount?: number;
  /** 컨테이너 스타일 */
  style?: ViewStyle;
}

// ==========================================
// Component
// ==========================================

const SIZES = {
  sm: 16,
  md: 24,
  lg: 32,
};

export const Rating: FC<RatingProps> = ({
  value,
  onChange,
  maxStars = 5,
  size = "md",
  allowHalf = false,
  disabled = false,
  showValue = false,
  reviewCount,
  style,
}) => {
  const { themed, theme: { colors } } = useAppTheme();
  const starSize = SIZES[size];
  const isReadOnly = !onChange || disabled;

  const handlePress = useCallback((index: number, isHalf: boolean = false) => {
    if (isReadOnly) return;

    let newValue = index + 1;
    if (allowHalf && isHalf) {
      newValue = index + 0.5;
    }

    // 같은 값 클릭 시 리셋
    if (newValue === value) {
      onChange?.(0);
    } else {
      onChange?.(newValue);
    }
  }, [isReadOnly, allowHalf, value, onChange]);

  const renderStar = (index: number) => {
    const filled = value >= index + 1;
    const halfFilled = !filled && value >= index + 0.5;

    const starColor = filled || halfFilled ? colors.palette.accent400 : colors.palette.neutral400;

    if (isReadOnly) {
      return (
        <View key={index} style={$starContainer}>
          {halfFilled ? (
            <View style={$halfStarContainer}>
              <View style={[$halfStar, { width: starSize / 2 }]}>
                <Icon icon="heart" size={starSize} color={colors.palette.accent400} />
              </View>
              <Icon
                icon="heart"
                size={starSize}
                color={colors.palette.neutral400}
                style={$starOutline}
              />
            </View>
          ) : (
            <Icon icon="heart" size={starSize} color={starColor} />
          )}
        </View>
      );
    }

    return (
      <Pressable
        key={index}
        onPress={() => handlePress(index)}
        style={({ pressed }) => [$starContainer, pressed && { opacity: 0.7 }]}
      >
        <Icon icon="heart" size={starSize} color={starColor} />
      </Pressable>
    );
  };

  return (
    <View style={[themed($container), style]}>
      <View style={$starsContainer}>
        {Array.from({ length: maxStars }, (_, i) => renderStar(i))}
      </View>

      {showValue && (
        <Text size="sm" style={themed($valueText)}>
          {value.toFixed(1)}
        </Text>
      )}

      {reviewCount !== undefined && (
        <Text size="xs" style={themed($reviewText)}>
          ({reviewCount.toLocaleString()})
        </Text>
      )}
    </View>
  );
};

// ==========================================
// Styles
// ==========================================

const $container: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
});

const $starsContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
};

const $starContainer: ViewStyle = {
  marginRight: 2,
};

const $halfStarContainer: ViewStyle = {
  position: "relative",
};

const $halfStar: ViewStyle = {
  position: "absolute",
  overflow: "hidden",
  zIndex: 1,
};

const $starOutline: ViewStyle = {
  opacity: 0.3,
};

const $valueText: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  marginLeft: spacing.xs,
  fontWeight: "600",
});

const $reviewText: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginLeft: spacing.xxs,
});
