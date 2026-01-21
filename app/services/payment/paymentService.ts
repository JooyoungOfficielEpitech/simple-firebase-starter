/**
 * Payment Service - Unified payment service supporting Stripe and IAP
 * This is a template/boilerplate implementation
 */

import { Platform } from "react-native";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

import type {
  IPaymentService,
  Product,
  SubscriptionPlan,
  Purchase,
  PurchaseResult,
  SubscriptionInfo,
  PaymentProvider,
  PaymentError,
  PaymentErrorCode,
} from "../../types/payment";

/**
 * Payment configuration
 */
interface PaymentConfig {
  stripePublishableKey?: string;
  merchantId?: string;
  products: Product[];
}

/**
 * Default products configuration
 * Replace with your actual products
 */
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "premium_monthly",
    name: "Premium Monthly",
    description: "Unlock all premium features",
    type: "subscription",
    price: {
      amount: 9.99,
      currency: "USD",
      formattedPrice: "$9.99/month",
    },
    subscriptionPeriod: "monthly",
    features: [
      "Unlimited matches",
      "See who likes you",
      "Advanced filters",
      "No ads",
    ],
    iapProductId: Platform.select({
      ios: "com.app.premium.monthly",
      android: "premium_monthly",
    }),
    stripePriceId: "price_premium_monthly",
  },
  {
    id: "premium_yearly",
    name: "Premium Yearly",
    description: "Best value - Save 50%",
    type: "subscription",
    price: {
      amount: 59.99,
      currency: "USD",
      formattedPrice: "$59.99/year",
    },
    subscriptionPeriod: "yearly",
    features: [
      "Unlimited matches",
      "See who likes you",
      "Advanced filters",
      "No ads",
      "Priority support",
    ],
    isBestValue: true,
    iapProductId: Platform.select({
      ios: "com.app.premium.yearly",
      android: "premium_yearly",
    }),
    stripePriceId: "price_premium_yearly",
  },
  {
    id: "boost_pack",
    name: "Boost Pack",
    description: "Get 5 profile boosts",
    type: "consumable",
    price: {
      amount: 4.99,
      currency: "USD",
      formattedPrice: "$4.99",
    },
    iapProductId: Platform.select({
      ios: "com.app.boost.pack5",
      android: "boost_pack_5",
    }),
    stripePriceId: "price_boost_pack",
  },
];

/**
 * Create a PaymentError
 */
function createPaymentError(
  code: PaymentErrorCode,
  message: string,
  details?: unknown,
): PaymentError {
  return { code, message, details };
}

/**
 * Payment Service Implementation
 */
export class PaymentService implements IPaymentService {
  private isInitialized = false;
  private products: Product[] = [];
  private preferredProvider: PaymentProvider = "iap";
  private db = firestore();

  constructor(private config: PaymentConfig = { products: DEFAULT_PRODUCTS }) {
    this.products = config.products;
  }

  /**
   * Initialize the payment service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Determine preferred provider based on platform
      this.preferredProvider = this.config.stripePublishableKey
        ? "stripe"
        : "iap";

      // Initialize IAP if available
      // TODO: Initialize react-native-iap here
      // await RNIap.initConnection()

      // Initialize Stripe if configured
      // TODO: Initialize @stripe/stripe-react-native here
      // if (this.config.stripePublishableKey) {
      //   await initStripe({ publishableKey: this.config.stripePublishableKey })
      // }

      this.isInitialized = true;
      console.log(
        "PaymentService initialized with provider:",
        this.preferredProvider,
      );
    } catch (error) {
      console.error("Failed to initialize PaymentService:", error);
      throw createPaymentError(
        "UNKNOWN_ERROR",
        "Failed to initialize payment service",
        error,
      );
    }
  }

  /**
   * Check if payment service is available
   */
  isAvailable(): boolean {
    return this.isInitialized;
  }

  /**
   * Get all available products
   */
  async getProducts(): Promise<Product[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // TODO: Fetch actual product info from IAP/Stripe
    // const iapProducts = await RNIap.getProducts(productIds)
    // Merge with local products to get updated prices

    return this.products;
  }

  /**
   * Get a specific product
   */
  async getProduct(productId: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find((p) => p.id === productId) || null;
  }

  /**
   * Get subscription plans only
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const products = await this.getProducts();
    return products.filter(
      (p) => p.type === "subscription",
    ) as SubscriptionPlan[];
  }

  /**
   * Purchase a product
   */
  async purchaseProduct(productId: string): Promise<PurchaseResult> {
    if (!this.isInitialized) {
      return {
        success: false,
        error: createPaymentError(
          "IAP_NOT_AVAILABLE",
          "Payment service not initialized",
        ),
      };
    }

    const product = await this.getProduct(productId);
    if (!product) {
      return {
        success: false,
        error: createPaymentError(
          "PRODUCT_NOT_FOUND",
          `Product ${productId} not found`,
        ),
      };
    }

    try {
      // TODO: Implement actual purchase logic
      // For IAP:
      // const purchase = await RNIap.requestPurchase(product.iapProductId)
      //
      // For Stripe:
      // const { clientSecret } = await createPaymentIntent(...)
      // const { error } = await confirmPayment(clientSecret, { type: 'Card' })

      // Mock successful purchase for template
      const mockPurchase: Purchase = {
        id: `purchase_${Date.now()}`,
        odId: auth().currentUser?.uid || "",
        productId,
        provider: this.preferredProvider,
        status: "succeeded",
        price: product.price,
        purchasedAt: new Date(),
      };

      // Save purchase to Firestore
      await this.savePurchase(mockPurchase);

      return {
        success: true,
        purchase: mockPurchase,
      };
    } catch (error: unknown) {
      console.error("Purchase failed:", error);

      // Check if user cancelled
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("cancel")) {
        return {
          success: false,
          error: createPaymentError(
            "PAYMENT_CANCELLED",
            "Purchase was cancelled",
          ),
        };
      }

      return {
        success: false,
        error: createPaymentError("PAYMENT_FAILED", "Purchase failed", error),
      };
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases(): Promise<Purchase[]> {
    if (!this.isInitialized) {
      throw createPaymentError(
        "IAP_NOT_AVAILABLE",
        "Payment service not initialized",
      );
    }

    try {
      // TODO: Implement actual restore logic
      // For IAP:
      // const purchases = await RNIap.getAvailablePurchases()
      // Validate receipts on server

      // Fetch from Firestore
      const userId = auth().currentUser?.uid;
      if (!userId) {
        return [];
      }

      const snapshot = await this.db
        .collection("purchases")
        .where("odId", "==", userId)
        .where("status", "==", "succeeded")
        .orderBy("purchasedAt", "desc")
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        purchasedAt: doc.data().purchasedAt?.toDate(),
        expiresAt: doc.data().expiresAt?.toDate(),
      })) as Purchase[];
    } catch (error) {
      console.error("Restore failed:", error);
      throw createPaymentError(
        "RESTORE_FAILED",
        "Failed to restore purchases",
        error,
      );
    }
  }

  /**
   * Get purchase history
   */
  async getPurchaseHistory(): Promise<Purchase[]> {
    const userId = auth().currentUser?.uid;
    if (!userId) {
      return [];
    }

    try {
      const snapshot = await this.db
        .collection("purchases")
        .where("odId", "==", userId)
        .orderBy("purchasedAt", "desc")
        .limit(50)
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        purchasedAt: doc.data().purchasedAt?.toDate(),
        expiresAt: doc.data().expiresAt?.toDate(),
      })) as Purchase[];
    } catch (error) {
      console.error("Failed to get purchase history:", error);
      return [];
    }
  }

  /**
   * Get current subscription info
   */
  async getSubscriptionInfo(): Promise<SubscriptionInfo> {
    const userId = auth().currentUser?.uid;
    if (!userId) {
      return { isSubscribed: false, willRenew: false };
    }

    try {
      // Check for active subscription in Firestore
      const snapshot = await this.db
        .collection("subscriptions")
        .where("odId", "==", userId)
        .where("status", "in", ["active", "trialing"])
        .limit(1)
        .get();

      if (snapshot.empty) {
        return { isSubscribed: false, willRenew: false };
      }

      const subscriptionDoc = snapshot.docs[0];
      const subscriptionData = subscriptionDoc.data() as Record<string, any>;

      const subscription = {
        id: subscriptionDoc.id,
        odId: subscriptionData.odId as string,
        productId: subscriptionData.productId as string,
        planId: subscriptionData.planId as string,
        provider: subscriptionData.provider as PaymentProvider,
        status: subscriptionData.status,
        cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd as boolean,
        currentPeriodStart: subscriptionData.currentPeriodStart?.toDate(),
        currentPeriodEnd: subscriptionData.currentPeriodEnd?.toDate(),
        trialEnd: subscriptionData.trialEnd?.toDate(),
      };

      // Get plan info
      const plan = (await this.getProduct(
        subscription.productId,
      )) as SubscriptionPlan | null;

      // Calculate days remaining
      const now = new Date();
      const endDate = subscription.currentPeriodEnd;
      const daysRemaining = endDate
        ? Math.max(
            0,
            Math.ceil(
              (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
            ),
          )
        : 0;

      return {
        isSubscribed: true,
        subscription: subscription as any,
        plan: plan || undefined,
        daysRemaining,
        willRenew: !subscription.cancelAtPeriodEnd,
      };
    } catch (error) {
      console.error("Failed to get subscription info:", error);
      return { isSubscribed: false, willRenew: false };
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(): Promise<boolean> {
    const subscriptionInfo = await this.getSubscriptionInfo();

    if (!subscriptionInfo.isSubscribed || !subscriptionInfo.subscription) {
      throw createPaymentError(
        "NOT_SUBSCRIBED",
        "No active subscription found",
      );
    }

    try {
      // TODO: Implement actual cancellation
      // For IAP: Direct user to App Store/Play Store subscription management
      // For Stripe: Call API to cancel subscription

      // Update Firestore
      await this.db
        .collection("subscriptions")
        .doc(subscriptionInfo.subscription.id)
        .update({
          cancelAtPeriodEnd: true,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      return true;
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      return false;
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    // TODO: Cleanup IAP listeners
    // RNIap.endConnection()
    this.isInitialized = false;
  }

  /**
   * Save purchase to Firestore
   */
  private async savePurchase(purchase: Purchase): Promise<void> {
    try {
      await this.db.collection("purchases").add({
        ...purchase,
        purchasedAt: firestore.FieldValue.serverTimestamp(),
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error("Failed to save purchase:", error);
    }
  }
}

// Singleton instance
export const paymentService = new PaymentService();
