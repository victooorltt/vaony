import type { CheckoutInput, CheckoutResult, PaymentDriver } from "./provider";

/**
 * PayPal driver — structured placeholder. The Orders v2 API flow is wired;
 * set PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET to activate.
 */
export class PayPalDriver implements PaymentDriver {
  name = "PAYPAL" as const;

  private get configured(): boolean {
    return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
  }

  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    if (!this.configured) {
      throw new Error("PayPal is not configured yet. Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.");
    }
    const base = "https://api-m.sandbox.paypal.com";
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    const tokenRes = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    const { access_token } = (await tokenRes.json()) as { access_token: string };

    const orderRes = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            custom_id: input.paymentId,
            description: input.description,
            amount: {
              currency_code: input.currency,
              value: input.amount.toFixed(2),
            },
          },
        ],
        application_context: {
          return_url: input.successUrl,
          cancel_url: input.cancelUrl,
        },
      }),
    });
    const order = (await orderRes.json()) as {
      id: string;
      links: Array<{ rel: string; href: string }>;
    };
    const approve = order.links.find((l) => l.rel === "approve");
    return { redirectUrl: approve?.href ?? input.cancelUrl, providerRef: order.id };
  }
}
