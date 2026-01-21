import { type FC, useCallback, useState } from "react";
import {
  Alert,
  type TextStyle,
  View,
  type ViewStyle,
  ScrollView,
} from "react-native";

import { Button } from "@/components/Button";
import { PricingCard, PaymentSuccessModal } from "@/components/payment";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { useAppTheme } from "@/theme/context";
import { type ThemedStyle } from "@/theme/types";
import type { SubscriptionPlan } from "@/types/payment";

// Mock subscription plans for demo
const DEMO_PLANS: SubscriptionPlan[] = [
  {
    id: "monthly",
    iapProductId: "com.amie.premium.monthly",
    type: "subscription",
    name: "Monthly",
    description: "Perfect for trying out premium features",
    price: {
      amount: 9.99,
      currency: "USD",
      formattedPrice: "$9.99",
    },
    subscriptionPeriod: "monthly",
    features: [
      "Unlimited matches",
      "See who likes you",
      "Advanced filters",
      "No ads",
    ],
    isPopular: true,
    isBestValue: false,
    trialPeriod: 7,
  },
  {
    id: "yearly",
    iapProductId: "com.amie.premium.yearly",
    type: "subscription",
    name: "Yearly",
    description: "Save 50% with annual billing",
    price: {
      amount: 59.99,
      currency: "USD",
      formattedPrice: "$59.99",
    },
    subscriptionPeriod: "yearly",
    features: [
      "Unlimited matches",
      "See who likes you",
      "Advanced filters",
      "No ads",
      "Priority support",
      "Profile boosts",
    ],
    isPopular: false,
    isBestValue: true,
    trialPeriod: 14,
  },
  {
    id: "lifetime",
    iapProductId: "com.amie.premium.lifetime",
    type: "subscription",
    name: "Lifetime",
    description: "One-time purchase, forever access",
    price: {
      amount: 149.99,
      currency: "USD",
      formattedPrice: "$149.99",
    },
    subscriptionPeriod: "lifetime",
    features: [
      "All premium features",
      "Lifetime access",
      "All future updates",
      "VIP support",
    ],
    isPopular: false,
    isBestValue: false,
  },
];

/**
 * Demo screen for payment functionality.
 * Demonstrates PricingCard and PaymentSuccessModal components.
 */
export const PaymentDemoScreen: FC = function PaymentDemoScreen() {
  const { themed } = useAppTheme();

  // State for selected plan
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    DEMO_PLANS.find((p) => p.isBestValue) || DEMO_PLANS[0],
  );

  // State for purchase simulation
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchasedPlan, setPurchasedPlan] = useState<SubscriptionPlan | null>(
    null,
  );

  // State for demo modes
  const [demoMode, setDemoMode] = useState<"success" | "cancel" | "error">(
    "success",
  );

  /**
   * Handle plan selection
   */
  const handleSelectPlan = useCallback((plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  }, []);

  /**
   * Simulate purchase process
   */
  const handlePurchase = useCallback(async () => {
    if (!selectedPlan) return;

    setIsPurchasing(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsPurchasing(false);

    // Handle based on demo mode
    switch (demoMode) {
      case "success":
        setPurchasedPlan(selectedPlan);
        setShowSuccessModal(true);
        break;
      case "cancel":
        Alert.alert("결제 취소", "결제가 취소되었습니다.");
        break;
      case "error":
        Alert.alert(
          "결제 실패",
          "결제 처리 중 오류가 발생했습니다. 다시 시도해 주세요.",
        );
        break;
    }
  }, [selectedPlan, demoMode]);

  /**
   * Handle restore purchases (demo)
   */
  const handleRestorePurchases = useCallback(async () => {
    Alert.alert("구매 복원", "이전 구매 내역을 복원합니다.", [
      { text: "취소", style: "cancel" },
      {
        text: "복원",
        onPress: async () => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          Alert.alert("완료", "구매가 성공적으로 복원되었습니다.");
        },
      },
    ]);
  }, []);

  /**
   * Handle success modal continue
   */
  const handleSuccessContinue = useCallback(() => {
    setShowSuccessModal(false);
    setPurchasedPlan(null);
    Alert.alert("환영합니다!", "프리미엄 기능을 사용할 수 있습니다.");
  }, []);

  return (
    <Screen
      preset="scroll"
      contentContainerStyle={themed($screenContent)}
      safeAreaEdges={["top"]}
    >
      {/* Header */}
      <View style={themed($header)}>
        <Text style={themed($title)} preset="heading">
          결제 데모
        </Text>
        <Text style={themed($subtitle)}>
          PricingCard 및 PaymentSuccessModal 컴포넌트 테스트
        </Text>
      </View>

      {/* Demo Mode Selection */}
      <View style={themed($section)}>
        <Text style={themed($sectionTitle)}>데모 모드</Text>
        <View style={themed($modeButtonRow)}>
          <Button
            text="성공"
            preset={demoMode === "success" ? "filled" : "default"}
            onPress={() => setDemoMode("success")}
            style={themed($modeButton)}
          />
          <Button
            text="취소"
            preset={demoMode === "cancel" ? "filled" : "default"}
            onPress={() => setDemoMode("cancel")}
            style={themed($modeButton)}
          />
          <Button
            text="오류"
            preset={demoMode === "error" ? "filled" : "default"}
            onPress={() => setDemoMode("error")}
            style={themed($modeButton)}
          />
        </View>
        <Text style={themed($modeDescription)}>
          {demoMode === "success" && "구매 시 성공 모달이 표시됩니다."}
          {demoMode === "cancel" && "구매 시 취소 알림이 표시됩니다."}
          {demoMode === "error" && "구매 시 오류 알림이 표시됩니다."}
        </Text>
      </View>

      {/* Pricing Plans */}
      <View style={themed($section)}>
        <Text style={themed($sectionTitle)}>구독 플랜</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={themed($plansScrollContent)}
        >
          {DEMO_PLANS.map((plan) => (
            <View key={plan.id} style={themed($planCardWrapper)}>
              <PricingCard
                plan={plan}
                isSelected={selectedPlan?.id === plan.id}
                onSelect={handleSelectPlan}
                disabled={isPurchasing}
              />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Selected Plan Summary */}
      {selectedPlan && (
        <View style={themed($section)}>
          <Text style={themed($sectionTitle)}>선택된 플랜</Text>
          <View style={themed($summaryCard)}>
            <View style={themed($summaryRow)}>
              <Text style={themed($summaryLabel)}>플랜</Text>
              <Text style={themed($summaryValue)}>{selectedPlan.name}</Text>
            </View>
            <View style={themed($summaryRow)}>
              <Text style={themed($summaryLabel)}>가격</Text>
              <Text style={themed($summaryValue)}>
                {selectedPlan.price.formattedPrice}
              </Text>
            </View>
            {selectedPlan.trialPeriod && (
              <View style={themed($summaryRow)}>
                <Text style={themed($summaryLabel)}>무료 체험</Text>
                <Text style={themed($summaryValue)}>
                  {selectedPlan.trialPeriod}일
                </Text>
              </View>
            )}
            <View style={themed($summaryRow)}>
              <Text style={themed($summaryLabel)}>기능 수</Text>
              <Text style={themed($summaryValue)}>
                {selectedPlan.features?.length || 0}개
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={themed($section)}>
        <Text style={themed($sectionTitle)}>결제 액션</Text>
        <Button
          text={isPurchasing ? "처리 중..." : "구독하기"}
          preset="filled"
          onPress={handlePurchase}
          disabled={!selectedPlan || isPurchasing}
          isLoading={isPurchasing}
          style={themed($actionButton)}
        />
        <Button
          text="구매 복원"
          preset="default"
          onPress={handleRestorePurchases}
          disabled={isPurchasing}
          style={themed($actionButton)}
        />
      </View>

      {/* Component Info */}
      <View style={themed($section)}>
        <Text style={themed($sectionTitle)}>사용된 컴포넌트</Text>
        <View style={themed($infoCard)}>
          <Text style={themed($infoTitle)}>PricingCard</Text>
          <Text style={themed($infoDescription)}>
            구독 플랜을 표시하는 카드 컴포넌트. 선택 상태, 배지(POPULAR, BEST
            VALUE), 무료 체험 기간 등을 표시합니다.
          </Text>
        </View>
        <View style={themed($infoCard)}>
          <Text style={themed($infoTitle)}>PaymentSuccessModal</Text>
          <Text style={themed($infoDescription)}>
            결제 성공 시 표시되는 모달. 애니메이션 효과와 함께 구매한 플랜의
            기능을 보여줍니다.
          </Text>
        </View>
      </View>

      {/* Success Modal */}
      <PaymentSuccessModal
        visible={showSuccessModal}
        plan={purchasedPlan || undefined}
        onClose={() => setShowSuccessModal(false)}
        onContinue={handleSuccessContinue}
      />
    </Screen>
  );
};

const $screenContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexGrow: 1,
  paddingBottom: spacing.xl,
});

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
});

const $title: ThemedStyle<TextStyle> = () => ({
  fontSize: 24,
});

const $subtitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 14,
  color: colors.textDim,
  marginTop: spacing.xxs,
});

const $section: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.md,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  backgroundColor: colors.palette.neutral100,
  borderTopWidth: 1,
  borderBottomWidth: 1,
  borderColor: colors.separator,
});

const $sectionTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 13,
  fontWeight: "600",
  color: colors.textDim,
  textTransform: "uppercase",
  marginBottom: spacing.md,
  letterSpacing: 0.5,
});

const $modeButtonRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
});

const $modeButton: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  minHeight: 44,
});

const $modeDescription: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 12,
  color: colors.textDim,
  marginTop: spacing.sm,
  textAlign: "center",
});

const $plansScrollContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingRight: spacing.md,
  gap: spacing.sm,
});

const $planCardWrapper: ThemedStyle<ViewStyle> = () => ({
  width: 280,
});

const $summaryCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: 12,
  padding: spacing.md,
  gap: spacing.xs,
});

const $summaryRow: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
});

const $summaryLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.textDim,
});

const $summaryValue: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.text,
  fontWeight: "600",
});

const $actionButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
});

const $infoCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  borderRadius: 12,
  padding: spacing.md,
  marginBottom: spacing.sm,
});

const $infoTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 4,
});

const $infoDescription: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  color: colors.textDim,
  lineHeight: 18,
});
