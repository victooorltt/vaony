import Stripe from "stripe";
import type { CheckoutInput, CheckoutResult, PaymentDriver } from "./provider";

export class StripeDriver implements PaymentDriver {
  name = "STRIPE" as const;
  private client: Stripe;

  constructor() {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
    this.client = new Stripe(key);
  }

  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    const session = await this.client.checkout.sessions.create({
      mode: "payment",
      customer_email: input.customerEmail,
      line_items: [
        {
          price_data: {
            currency: input.currency.toLowerCase(),
            product_data: { name: input.description },
            unit_amount: Math.round(input.amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: { paymentId: input.paymentId },
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
    });
    return { redirectUrl: session.url ?? input.cancelUrl, providerRef: session.id };
  }

  verifyWebhook(rawBody: string, signature: string): Stripe.Event {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
    return this.client.webhooks.constructEvent(rawBody, signature, secret);
  }
}
