import React, { type FC, memo, useEffect, useRef } from "react";
import {
  View,
  type ViewStyle,
  type TextStyle,
  Modal,
  Animated,
  TouchableOpacity,
} from "react-native";

import { Button } from "@/components/Button";
import { Text } from "@/components/Text";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";
import type { SubscriptionPlan } from "@/types/payment";

export interface PaymentSuccessModalProps {
  visible: boolean;
  plan?: SubscriptionPlan;
  onClose: () => void;
  onContinue?: () => void;
}

/**
 * Success modal shown after successful payment
 */
export const PaymentSuccessModal: FC<PaymentSuccessModalProps> = memo(
  function PaymentSuccessModal({ visible, plan, onClose, onContinue }) {
    const { themed, theme } = useAppTheme();
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (visible) {
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        scaleAnim.setValue(0);
        opacityAnim.setValue(0);
      }
    }, [visible, scaleAnim, opacityAnim]);

    const handleContinue = () => {
      if (onContinue) {
        onContinue();
      } else {
        onClose();
      }
    };

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={themed($overlay)}
          activeOpacity={1}
          onPress={onClose}
        >
          <Animated.View
            style={[
              themed($container),
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1} style={themed($innerContent)}>
              {/* Success Icon */}
              <View style={themed($iconContainer)}>
                <View style={themed($iconCircle)}>
                  <Text style={themed($iconText)}>✓</Text>
                </View>
              </View>

              {/* Title */}
              <Text style={themed($title)} weight="bold">
                Payment Successful!
              </Text>

              {/* Description */}
              <Text style={themed($description)}>
                {plan
                  ? `You're now subscribed to ${plan.name}. Enjoy all premium features!`
                  : "Your purchase was successful. Thank you for your support!"}
              </Text>

              {/* Features (if subscription) */}
              {plan && plan.features && (
                <View style={themed($featuresContainer)}>
                  <Text style={themed($featuresTitle)}>What you get:</Text>
                  {plan.features.slice(0, 4).map((feature, index) => (
                    <View key={index} style={themed($featureRow)}>
                      <Text style={themed($featureCheck)}>✓</Text>
                      <Text style={themed($featureText)}>{feature}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Button */}
              <Button
                text="Continue"
                onPress={handleContinue}
                preset="filled"
                style={themed($button)}
              />
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    );
  },
);

// Styles
const $overlay: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "center",
  alignItems: "center",
  padding: 24,
});

const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: 24,
  padding: spacing.lg,
  width: "100%",
  maxWidth: 340,
});

const $innerContent: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  alignItems: "center",
});

const $iconContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
});

const $iconCircle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: colors.tint + "20",
  alignItems: "center",
  justifyContent: "center",
});

const $iconText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 40,
  color: colors.tint,
});

const $title: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 24,
  color: colors.text,
  textAlign: "center",
  marginBottom: spacing.sm,
});

const $description: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 16,
  color: colors.textDim,
  textAlign: "center",
  lineHeight: 24,
  marginBottom: spacing.md,
});

const $featuresContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: "100%",
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  padding: spacing.md,
  marginBottom: spacing.md,
});

const $featuresTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
  marginBottom: spacing.sm,
});

const $featureRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.xs,
});

const $featureCheck: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.tint,
  marginRight: 8,
});

const $featureText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.text,
  flex: 1,
});

const $button: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
});
