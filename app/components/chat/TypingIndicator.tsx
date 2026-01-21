import { type FC, useEffect, useRef, memo } from "react";
import {
  Animated,
  type StyleProp,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";

import { Text } from "@/components/Text";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";

export interface TypingIndicatorProps {
  /**
   * Whether the partner is currently typing
   */
  isTyping: boolean;
  /**
   * Optional partner name to display
   */
  partnerName?: string;
  /**
   * Optional style override for the container
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * An animated indicator showing that the chat partner is typing.
 * Displays three bouncing dots with the message "상대방이 입력 중..."
 * @param {TypingIndicatorProps} props - The props for the `TypingIndicator` component.
 * @returns {JSX.Element | null} The rendered `TypingIndicator` component or null.
 * @example
 * <TypingIndicator isTyping={isPartnerTyping} />
 */
export const TypingIndicator: FC<TypingIndicatorProps> = memo(
  function TypingIndicator(props) {
    const { isTyping, partnerName, style: $styleOverride } = props;
    const { themed } = useAppTheme();

    // Animation values for three dots
    const dot1Anim = useRef(new Animated.Value(0)).current;
    const dot2Anim = useRef(new Animated.Value(0)).current;
    const dot3Anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (!isTyping) {
        // Reset animations when not typing
        dot1Anim.setValue(0);
        dot2Anim.setValue(0);
        dot3Anim.setValue(0);
        return;
      }

      // Create bounce animation for each dot with staggered timing
      const createBounceAnimation = (
        animValue: Animated.Value,
        delay: number,
      ) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(animValue, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        );
      };

      // Start animations for all three dots
      const animation1 = createBounceAnimation(dot1Anim, 0);
      const animation2 = createBounceAnimation(dot2Anim, 150);
      const animation3 = createBounceAnimation(dot3Anim, 300);

      animation1.start();
      animation2.start();
      animation3.start();

      // Cleanup
      return () => {
        animation1.stop();
        animation2.stop();
        animation3.stop();
      };
    }, [isTyping, dot1Anim, dot2Anim, dot3Anim]);

    if (!isTyping) {
      return null;
    }

    const typingText = partnerName
      ? `${partnerName}님이 입력 중...`
      : "상대방이 입력 중...";

    return (
      <View
        style={[themed($container), $styleOverride]}
        accessibilityRole="text"
        accessibilityLabel={typingText}
        accessibilityLiveRegion="polite"
      >
        <View style={themed($dotsContainer)}>
          <Animated.View
            style={[
              themed($dot),
              {
                transform: [
                  {
                    translateY: dot1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -6],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              themed($dot),
              {
                transform: [
                  {
                    translateY: dot2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -6],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              themed($dot),
              {
                transform: [
                  {
                    translateY: dot3Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -6],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
        <Text text={typingText} style={themed($text)} />
      </View>
    );
  },
);

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
});

const $dotsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginRight: spacing.xs,
});

const $dot: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: 6,
  height: 6,
  borderRadius: 3,
  backgroundColor: colors.palette.neutral400,
  marginHorizontal: spacing.xxxs,
});

const $text: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
  fontStyle: "italic",
});
