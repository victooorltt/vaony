import { NextRequest, NextResponse } from "next/server";
import { StripeDriver } from "@/lib/payments/stripe";
import { confirmPayment } from "@/lib/payments/confirm";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "No signature" }, { status: 400 });

  const rawBody = await request.text();
  let event;
  try {
    event = new StripeDriver().verifyWebhook(rawBody, signature);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { metadata?: { paymentId?: string } };
    const paymentId = session.metadata?.paymentId;
    if (paymentId) await confirmPayment(paymentId);
  }

  return NextResponse.json({ received: true });
}
