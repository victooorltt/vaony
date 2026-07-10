import { NextRequest, NextResponse } from "next/server";
import { confirmPayment } from "@/lib/payments/confirm";

/**
 * Mercado Pago webhook — structured placeholder. On "payment" events we fetch
 * the payment from the MP API and confirm by external_reference.
 */
export async function POST(request: NextRequest) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const event = (await request.json().catch(() => null)) as {
    type?: string;
    data?: { id?: string };
  } | null;
  if (!event) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  if (event.type === "payment" && event.data?.id && token) {
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${event.data.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const mp = (await res.json()) as { status?: string; external_reference?: string };
      if (mp.status === "approved" && mp.external_reference) {
        await confirmPayment(mp.external_reference);
      }
    }
  }

  return NextResponse.json({ received: true });
}
