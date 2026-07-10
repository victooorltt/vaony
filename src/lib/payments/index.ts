import type { PaymentProvider } from "@/types";
import type { PaymentDriver } from "./provider";
import { StripeDriver } from "./stripe";
import { PayPalDriver } from "./paypal";
import { MercadoPagoDriver } from "./mercadopago";

export function getPaymentDriver(provider: PaymentProvider): PaymentDriver {
  switch (provider) {
    case "STRIPE":
      return new StripeDriver();
    case "PAYPAL":
      return new PayPalDriver();
    case "MERCADOPAGO":
      return new MercadoPagoDriver();
  }
}

export * from "./provider";
