import { NextRequest, NextResponse } from "next/server";
import { confirmPayment } from "@/lib/payments/confirm";

/**
 * PayPal webhook — structured placeholder. When PayPal is activated,
 * verify the transmission signature via /v1/notifications/verify-webhook-signature
 * before trusting the event.
 */
export async function POST(request: NextRequest) {
  const event = (await request.json().catch(() => null)) as {
    event_type?: string;
    resource?: { purchase_units?: Array<{ custom_id?: string }>; custom_id?: string };
  } | null;
  if (!event) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  if (event.event_type === "CHECKOUT.ORDER.APPROVED" || event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
    const paymentId =
      event.resource?.purchase_units?.[0]?.custom_id ?? event.resource?.custom_id;
    if (paymentId) await confirmPayment(paymentId);
  }

  return NextResponse.json({ received: true });
}
