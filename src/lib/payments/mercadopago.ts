import type { CheckoutInput, CheckoutResult, PaymentDriver } from "./provider";

/**
 * Mercado Pago driver — structured placeholder using the Checkout Pro
 * preferences API. Set MERCADOPAGO_ACCESS_TOKEN to activate (supports OXXO,
 * bank transfer and cards for the Mexican market).
 */
export class MercadoPagoDriver implements PaymentDriver {
  name = "MERCADOPAGO" as const;

  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) {
      throw new Error("Mercado Pago is not configured yet. Add MERCADOPAGO_ACCESS_TOKEN.");
    }
    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_reference: input.paymentId,
        items: [
          {
            title: input.description,
            quantity: 1,
            currency_id: input.currency,
            unit_price: input.amount,
          },
        ],
        payer: { email: input.customerEmail },
        back_urls: {
          success: input.successUrl,
          failure: input.cancelUrl,
          pending: input.successUrl,
        },
        auto_return: "approved",
      }),
    });
    const pref = (await res.json()) as { id: string; init_point: string };
    return { redirectUrl: pref.init_point, providerRef: pref.id };
  }
}
