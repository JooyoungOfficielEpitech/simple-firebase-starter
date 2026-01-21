/**
 * Payment System Types
 * Supports both Stripe and In-App Purchase (IAP)
 */

// ==========================================
// Common Types
// ==========================================

export type PaymentProvider = "stripe" | "iap";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "cancelled"
  | "refunded";

export type SubscriptionStatus =
  | "active"
  | "cancelled"
  | "expired"
  | "past_due"
  | "paused"
  | "trialing";

export type Currency = "USD" | "KRW" | "JPY" | "EUR";

export interface Price {
  amount: number;
  currency: Currency;
  formattedPrice: string;
}

// ==========================================
// Product Types
// ==========================================

export type ProductType = "consumable" | "non_consumable" | "subscription";

export interface Product {
  id: string;
  name: string;
  description: string;
  type: ProductType;
  price: Price;
  // IAP specific
  iapProductId?: string;
  // Stripe specific
  stripePriceId?: string;
  // Subscription specific
  subscriptionPeriod?: SubscriptionPeriod;
  trialPeriod?: number; // days
  features?: string[];
  isPopular?: boolean;
  isBestValue?: boolean;
}

export type SubscriptionPeriod =
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly"
  | "lifetime";

export interface SubscriptionPlan extends Product {
  type: "subscription";
  subscriptionPeriod: SubscriptionPeriod;
  trialPeriod?: number;
  features: string[];
}

// ==========================================
// Purchase Types
// ==========================================

export interface Purchase {
  id: string;
  odId: string;
  productId: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  price: Price;
  purchasedAt: Date;
  expiresAt?: Date;
  // IAP specific
  transactionId?: string;
  receipt?: string;
  // Stripe specific
  paymentIntentId?: string;
  subscriptionId?: string;
}

export interface PurchaseResult {
  success: boolean;
  purchase?: Purchase;
  error?: PaymentError;
}

// ==========================================
// Subscription Types
// ==========================================

export interface Subscription {
  id: string;
  odId: string;
  productId: string;
  planId: string;
  provider: PaymentProvider;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  // IAP specific
  originalTransactionId?: string;
  // Stripe specific
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
}

export interface SubscriptionInfo {
  isSubscribed: boolean;
  subscription?: Subscription;
  plan?: SubscriptionPlan;
  daysRemaining?: number;
  willRenew: boolean;
}

// ==========================================
// Stripe Specific Types
// ==========================================

export interface StripeConfig {
  publishableKey: string;
  merchantId?: string;
  urlScheme?: string;
}

export interface CreatePaymentIntentParams {
  amount: number;
  currency: Currency;
  productId: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
}

export interface PaymentSheetParams {
  paymentIntentClientSecret: string;
  merchantDisplayName: string;
  customerId?: string;
  customerEphemeralKeySecret?: string;
  applePay?: {
    merchantCountryCode: string;
  };
  googlePay?: {
    merchantCountryCode: string;
    testEnv?: boolean;
  };
}

// ==========================================
// IAP Specific Types
// ==========================================

export interface IAPProduct {
  productId: string;
  title: string;
  description: string;
  price: string;
  priceAmountMicros: string;
  priceCurrencyCode: string;
  subscriptionPeriodAndroid?: string;
  subscriptionPeriodIOS?: string;
  freeTrialPeriodAndroid?: string;
  introductoryPriceAndroid?: string;
  introductoryPriceIOS?: string;
}

export interface IAPPurchase {
  productId: string;
  transactionId: string;
  transactionDate: number;
  transactionReceipt: string;
  purchaseToken?: string; // Android
  originalTransactionIdentifierIOS?: string; // iOS subscription
}

export interface IAPReceipt {
  platform: "ios" | "android";
  receipt: string;
  productId: string;
  transactionId: string;
}

// ==========================================
// Error Types
// ==========================================

export type PaymentErrorCode =
  | "PAYMENT_CANCELLED"
  | "PAYMENT_FAILED"
  | "INVALID_PRODUCT"
  | "PRODUCT_NOT_FOUND"
  | "NETWORK_ERROR"
  | "RECEIPT_VALIDATION_FAILED"
  | "SUBSCRIPTION_EXPIRED"
  | "ALREADY_SUBSCRIBED"
  | "NOT_SUBSCRIBED"
  | "RESTORE_FAILED"
  | "IAP_NOT_AVAILABLE"
  | "STRIPE_ERROR"
  | "UNKNOWN_ERROR";

export interface PaymentError {
  code: PaymentErrorCode;
  message: string;
  details?: unknown;
}

// ==========================================
// Event Types (for analytics)
// ==========================================

export type PaymentEventType =
  | "purchase_initiated"
  | "purchase_completed"
  | "purchase_failed"
  | "subscription_started"
  | "subscription_renewed"
  | "subscription_cancelled"
  | "subscription_expired"
  | "refund_requested"
  | "refund_completed";

export interface PaymentEvent {
  type: PaymentEventType;
  odId: string;
  productId: string;
  provider: PaymentProvider;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// ==========================================
// Service Interface
// ==========================================

export interface IPaymentService {
  // Initialization
  initialize(): Promise<void>;
  isAvailable(): boolean;

  // Products
  getProducts(): Promise<Product[]>;
  getProduct(productId: string): Promise<Product | null>;
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;

  // Purchases
  purchaseProduct(productId: string): Promise<PurchaseResult>;
  restorePurchases(): Promise<Purchase[]>;
  getPurchaseHistory(): Promise<Purchase[]>;

  // Subscriptions
  getSubscriptionInfo(): Promise<SubscriptionInfo>;
  cancelSubscription(): Promise<boolean>;

  // Cleanup
  cleanup(): void;
}
