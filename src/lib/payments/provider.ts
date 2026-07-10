import type { PaymentProvider as ProviderName } from "@/types";

export interface CheckoutInput {
  paymentId: string; // our internal Payment row id
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  /** URL the user is redirected to in order to pay */
  redirectUrl: string;
  /** Provider-side reference (session id, order id, preference id) */
  providerRef: string;
}

export interface PaymentDriver {
  name: ProviderName;
  createCheckout(input: CheckoutInput): Promise<CheckoutResult>;
}
