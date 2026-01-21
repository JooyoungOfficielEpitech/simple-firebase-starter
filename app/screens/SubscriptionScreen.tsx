import { type FC, useCallback, useEffect, useState } from "react";
import {
  View,
  type ViewStyle,
  type TextStyle,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { PricingCard, PaymentSuccessModal } from "@/components/payment";
import { paymentService } from "@/services/payment";
import { useAppTheme } from "@/theme/context";
import { $styles } from "@/theme/styles";
import type { ThemedStyle } from "@/theme/types";
import type { SubscriptionPlan, SubscriptionInfo } from "@/types/payment";

// Define navigation types - adjust based on your navigator
type SubscriptionScreenProps = NativeStackScreenProps<any, "Subscription">;

/**
 * Subscription screen for managing premium subscriptions
 */
export const SubscriptionScreen: FC<SubscriptionScreenProps> =
  function SubscriptionScreen({ navigation }) {
    const { themed, theme } = useAppTheme();

    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
      null,
    );
    const [subscriptionInfo, setSubscriptionInfo] =
      useState<SubscriptionInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    /**
     * Load subscription plans and current subscription status
     */
    useEffect(() => {
      const loadData = async () => {
        setIsLoading(true);
        try {
          await paymentService.initialize();

          const [loadedPlans, info] = await Promise.all([
            paymentService.getSubscriptionPlans(),
            paymentService.getSubscriptionInfo(),
          ]);

          setPlans(loadedPlans);
          setSubscriptionInfo(info);

          // Pre-select the best value plan or first plan
          if (loadedPlans.length > 0 && !info.isSubscribed) {
            const bestValue = loadedPlans.find((p) => p.isBestValue);
            setSelectedPlan(bestValue || loadedPlans[0]);
          }
        } catch (error) {
          console.error("Failed to load subscription data:", error);
          Alert.alert(
            "Error",
            "Failed to load subscription plans. Please try again.",
          );
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    }, []);

    /**
     * Handle plan selection
     */
    const handleSelectPlan = useCallback((plan: SubscriptionPlan) => {
      setSelectedPlan(plan);
    }, []);

    /**
     * Handle subscription purchase
     */
    const handleSubscribe = useCallback(async () => {
      if (!selectedPlan) return;

      setIsPurchasing(true);
      try {
        const result = await paymentService.purchaseProduct(selectedPlan.id);

        if (result.success) {
          setShowSuccessModal(true);
          // Refresh subscription info
          const info = await paymentService.getSubscriptionInfo();
          setSubscriptionInfo(info);
        } else if (result.error?.code !== "PAYMENT_CANCELLED") {
          Alert.alert(
            "Purchase Failed",
            result.error?.message || "An error occurred during purchase.",
          );
        }
      } catch (error) {
        console.error("Purchase error:", error);
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      } finally {
        setIsPurchasing(false);
      }
    }, [selectedPlan]);

    /**
     * Handle restore purchases
     */
    const handleRestorePurchases = useCallback(async () => {
      setIsRestoring(true);
      try {
        const purchases = await paymentService.restorePurchases();

        if (purchases.length > 0) {
          Alert.alert("Success", "Your purchases have been restored.");
          // Refresh subscription info
          const info = await paymentService.getSubscriptionInfo();
          setSubscriptionInfo(info);
        } else {
          Alert.alert(
            "No Purchases Found",
            "No previous purchases were found to restore.",
          );
        }
      } catch (error) {
        console.error("Restore error:", error);
        Alert.alert("Error", "Failed to restore purchases. Please try again.");
      } finally {
        setIsRestoring(false);
      }
    }, []);

    /**
     * Handle cancel subscription
     */
    const handleCancelSubscription = useCallback(async () => {
      Alert.alert(
        "Cancel Subscription",
        "Are you sure you want to cancel your subscription? You will continue to have access until the end of your billing period.",
        [
          { text: "Keep Subscription", style: "cancel" },
          {
            text: "Cancel",
            style: "destructive",
            onPress: async () => {
              try {
                const success = await paymentService.cancelSubscription();
                if (success) {
                  Alert.alert(
                    "Subscription Cancelled",
                    "Your subscription has been cancelled. You will have access until the end of your current billing period.",
                  );
                  const info = await paymentService.getSubscriptionInfo();
                  setSubscriptionInfo(info);
                }
              } catch (error) {
                Alert.alert(
                  "Error",
                  "Failed to cancel subscription. Please try again.",
                );
              }
            },
          },
        ],
      );
    }, []);

    /**
     * Render loading state
     */
    if (isLoading) {
      return (
        <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
          <Header
            title="Premium"
            leftIcon="back"
            onLeftPress={() => navigation.goBack()}
          />
          <View style={themed($loadingContainer)}>
            <ActivityIndicator size="large" color={theme.colors.tint} />
            <Text style={themed($loadingText)}>Loading plans...</Text>
          </View>
        </Screen>
      );
    }

    /**
     * Render active subscription view
     */
    if (subscriptionInfo?.isSubscribed && subscriptionInfo.subscription) {
      return (
        <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
          <Header
            title="Premium"
            leftIcon="back"
            onLeftPress={() => navigation.goBack()}
          />
          <ScrollView
            style={$styles.flex1}
            contentContainerStyle={themed($scrollContent)}
            showsVerticalScrollIndicator={false}
          >
            {/* Active Subscription Card */}
            <View style={themed($activeSubscriptionCard)}>
              <View style={themed($activeIconContainer)}>
                <Text style={themed($activeIcon)}>⭐</Text>
              </View>
              <Text style={themed($activeTitle)} weight="bold">
                You're Premium!
              </Text>
              <Text style={themed($activeDescription)}>
                {subscriptionInfo.plan?.name || "Premium Subscription"}
              </Text>

              {/* Subscription Details */}
              <View style={themed($detailsContainer)}>
                <View style={themed($detailRow)}>
                  <Text style={themed($detailLabel)}>Status</Text>
                  <Text style={themed($detailValue)}>
                    {subscriptionInfo.subscription.status}
                  </Text>
                </View>
                <View style={themed($detailRow)}>
                  <Text style={themed($detailLabel)}>Days Remaining</Text>
                  <Text style={themed($detailValue)}>
                    {subscriptionInfo.daysRemaining} days
                  </Text>
                </View>
                <View style={themed($detailRow)}>
                  <Text style={themed($detailLabel)}>Renewal</Text>
                  <Text style={themed($detailValue)}>
                    {subscriptionInfo.willRenew
                      ? "Auto-renew"
                      : "Will not renew"}
                  </Text>
                </View>
              </View>

              {/* Features */}
              {subscriptionInfo.plan?.features && (
                <View style={themed($featuresContainer)}>
                  <Text style={themed($featuresTitle)}>Your Benefits:</Text>
                  {subscriptionInfo.plan.features.map((feature, index) => (
                    <View key={index} style={themed($featureRow)}>
                      <Text style={themed($featureCheck)}>✓</Text>
                      <Text style={themed($featureText)}>{feature}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Cancel Button */}
            {subscriptionInfo.willRenew && (
              <Button
                text="Cancel Subscription"
                preset="default"
                onPress={handleCancelSubscription}
                style={themed($cancelButton)}
              />
            )}
          </ScrollView>
        </Screen>
      );
    }

    /**
     * Render subscription plans
     */
    return (
      <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
        <Header
          title="Go Premium"
          leftIcon="back"
          onLeftPress={() => navigation.goBack()}
        />

        <ScrollView
          style={$styles.flex1}
          contentContainerStyle={themed($scrollContent)}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={themed($headerSection)}>
            <Text style={themed($headerTitle)} weight="bold">
              Unlock Premium Features
            </Text>
            <Text style={themed($headerDescription)}>
              Get unlimited access to all features and boost your matching
              experience
            </Text>
          </View>

          {/* Plans */}
          <View style={themed($plansContainer)}>
            {plans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                isSelected={selectedPlan?.id === plan.id}
                onSelect={handleSelectPlan}
                disabled={isPurchasing}
              />
            ))}
          </View>

          {/* Subscribe Button */}
          <Button
            text={isPurchasing ? "Processing..." : "Subscribe Now"}
            preset="filled"
            onPress={handleSubscribe}
            disabled={!selectedPlan || isPurchasing}
            style={themed($subscribeButton)}
          />

          {/* Restore Purchases */}
          <Button
            text={isRestoring ? "Restoring..." : "Restore Purchases"}
            preset="default"
            onPress={handleRestorePurchases}
            disabled={isRestoring}
            style={themed($restoreButton)}
          />

          {/* Terms */}
          <Text style={themed($termsText)}>
            By subscribing, you agree to our Terms of Service and Privacy
            Policy. Subscriptions automatically renew unless cancelled at least
            24 hours before the end of the current period.
          </Text>
        </ScrollView>

        {/* Success Modal */}
        <PaymentSuccessModal
          visible={showSuccessModal}
          plan={selectedPlan || undefined}
          onClose={() => setShowSuccessModal(false)}
          onContinue={() => {
            setShowSuccessModal(false);
            navigation.goBack();
          }}
        />
      </Screen>
    );
  };

// Styles
const $loadingContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
});

const $loadingText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 16,
  color: colors.textDim,
  marginTop: spacing.md,
});

const $scrollContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
  paddingBottom: spacing.xxl,
});

const $headerSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  marginBottom: spacing.lg,
});

const $headerTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 28,
  color: colors.text,
  textAlign: "center",
});

const $headerDescription: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 16,
  color: colors.textDim,
  textAlign: "center",
  marginTop: spacing.sm,
  lineHeight: 24,
});

const $plansContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
});

const $subscribeButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
});

const $restoreButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
});

const $termsText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
  textAlign: "center",
  lineHeight: 18,
});

// Active subscription styles
const $activeSubscriptionCard: ThemedStyle<ViewStyle> = ({
  colors,
  spacing,
}) => ({
  backgroundColor: colors.tint + "10",
  borderRadius: 20,
  padding: spacing.lg,
  alignItems: "center",
  borderWidth: 2,
  borderColor: colors.tint,
});

const $activeIconContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
});

const $activeIcon: ThemedStyle<TextStyle> = () => ({
  fontSize: 48,
});

const $activeTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 24,
  color: colors.tint,
});

const $activeDescription: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 16,
  color: colors.text,
  marginTop: spacing.xs,
});

const $detailsContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: "100%",
  marginTop: spacing.lg,
  backgroundColor: colors.background,
  borderRadius: 12,
  padding: spacing.md,
});

const $detailRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  paddingVertical: spacing.xs,
});

const $detailLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.textDim,
});

const $detailValue: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.text,
  fontWeight: "600",
});

const $featuresContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "100%",
  marginTop: spacing.md,
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

const $cancelButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.lg,
});
