import React, { type FC, memo } from "react";
import {
  View,
  type ViewStyle,
  type TextStyle,
  TouchableOpacity,
  type TouchableOpacityProps,
} from "react-native";

import { Text } from "@/components/Text";
import { useAppTheme } from "@/theme/context";
import type { ThemedStyle } from "@/theme/types";
import type { SubscriptionPlan } from "@/types/payment";

export interface PricingCardProps
  extends Omit<TouchableOpacityProps, "onPress"> {
  plan: SubscriptionPlan;
  isSelected?: boolean;
  onSelect?: (plan: SubscriptionPlan) => void;
  disabled?: boolean;
}

/**
 * Pricing card component for displaying subscription plans
 */
export const PricingCard: FC<PricingCardProps> = memo(function PricingCard({
  plan,
  isSelected = false,
  onSelect,
  disabled = false,
  style,
  ...props
}) {
  const { themed, theme } = useAppTheme();

  const handlePress = () => {
    if (!disabled && onSelect) {
      onSelect(plan);
    }
  };

  return (
    <TouchableOpacity
      style={[
        themed($container),
        isSelected && themed($containerSelected),
        disabled && themed($containerDisabled),
        style,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected, disabled }}
      accessibilityLabel={`${plan.name} plan, ${plan.price.formattedPrice}`}
      {...props}
    >
      {/* Badges */}
      <View style={themed($badgeContainer)}>
        {plan.isPopular && (
          <View style={[themed($badge), themed($badgePopular)]}>
            <Text style={themed($badgeText)}>POPULAR</Text>
          </View>
        )}
        {plan.isBestValue && (
          <View style={[themed($badge), themed($badgeBestValue)]}>
            <Text style={themed($badgeText)}>BEST VALUE</Text>
          </View>
        )}
      </View>

      {/* Plan Name */}
      <Text
        style={[themed($planName), isSelected && themed($planNameSelected)]}
        weight="bold"
      >
        {plan.name}
      </Text>

      {/* Price */}
      <View style={themed($priceContainer)}>
        <Text
          style={[themed($price), isSelected && themed($priceSelected)]}
          weight="bold"
        >
          {plan.price.formattedPrice}
        </Text>
        {plan.subscriptionPeriod && (
          <Text style={themed($pricePeriod)}>
            /{getPeriodLabel(plan.subscriptionPeriod)}
          </Text>
        )}
      </View>

      {/* Description */}
      <Text style={themed($description)}>{plan.description}</Text>

      {/* Features */}
      {plan.features && plan.features.length > 0 && (
        <View style={themed($featuresContainer)}>
          {plan.features.map((feature, index) => (
            <View key={index} style={themed($featureRow)}>
              <Text style={themed($featureCheck)}>✓</Text>
              <Text style={themed($featureText)}>{feature}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Trial Badge */}
      {plan.trialPeriod && plan.trialPeriod > 0 && (
        <View style={themed($trialBadge)}>
          <Text style={themed($trialText)}>
            {plan.trialPeriod} day free trial
          </Text>
        </View>
      )}

      {/* Selection Indicator */}
      <View
        style={[
          themed($selectionIndicator),
          isSelected && themed($selectionIndicatorSelected),
        ]}
      >
        {isSelected && <View style={themed($selectionDot)} />}
      </View>
    </TouchableOpacity>
  );
});

/**
 * Get human-readable period label
 */
function getPeriodLabel(period: string): string {
  switch (period) {
    case "weekly":
      return "week";
    case "monthly":
      return "month";
    case "quarterly":
      return "3 months";
    case "yearly":
      return "year";
    case "lifetime":
      return "lifetime";
    default:
      return period;
  }
}

// Styles
const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: 16,
  borderWidth: 2,
  borderColor: colors.border,
  padding: spacing.md,
  marginVertical: spacing.xs,
  position: "relative",
});

const $containerSelected: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.tint,
  backgroundColor: colors.tint + "10",
});

const $containerDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.5,
});

const $badgeContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  position: "absolute",
  top: -12,
  left: 16,
  gap: 8,
});

const $badge: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxs,
  borderRadius: 12,
});

const $badgePopular: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.tint,
});

const $badgeBestValue: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: "#FFB800",
});

const $badgeText: ThemedStyle<TextStyle> = () => ({
  color: "#FFFFFF",
  fontSize: 10,
  fontWeight: "bold",
});

const $planName: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 20,
  color: colors.text,
  marginTop: spacing.xs,
});

const $planNameSelected: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
});

const $priceContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "baseline",
  marginTop: spacing.xs,
});

const $price: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 28,
  color: colors.text,
});

const $priceSelected: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
});

const $pricePeriod: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.textDim,
  marginLeft: 4,
});

const $description: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 14,
  color: colors.textDim,
  marginTop: spacing.xs,
});

const $featuresContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
  gap: spacing.xs,
});

const $featureRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
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

const $trialBadge: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  marginTop: spacing.md,
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.sm,
  backgroundColor: colors.tint + "20",
  borderRadius: 8,
  alignSelf: "flex-start",
});

const $trialText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.tint,
  fontWeight: "600",
});

const $selectionIndicator: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  top: 16,
  right: 16,
  width: 24,
  height: 24,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: colors.border,
  alignItems: "center",
  justifyContent: "center",
});

const $selectionIndicatorSelected: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.tint,
});

const $selectionDot: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 12,
  height: 12,
  borderRadius: 6,
  backgroundColor: colors.tint,
});
