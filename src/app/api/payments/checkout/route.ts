import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { checkoutSchema } from "@/lib/validators";
import { getPaymentDriver } from "@/lib/payments";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/** Creates our Payment row and a provider checkout session, returns redirect URL. */
export async function POST(request: NextRequest) {
  const auth = await requireRole(["STUDENT"]);
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { provider, bookingId, packageId } = parsed.data;

  let amount = 0;
  let currency = "USD";
  let description = "";
  let purchaseId: string | undefined;

  if (bookingId) {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { course: true, payment: true },
    });
    if (!booking || booking.studentId !== auth.user.id) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (booking.payment?.status === "PAID") {
      return NextResponse.json({ error: "Already paid" }, { status: 409 });
    }
    amount = booking.course.price;
    currency = booking.course.currency;
    description = `${booking.course.title} — 1 session`;
  } else if (packageId) {
    const pkg = await db.sessionPackage.findUnique({ where: { id: packageId } });
    if (!pkg || !pkg.active) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }
    amount = pkg.price;
    currency = pkg.currency;
    description = `${pkg.name} (${pkg.sessions} sessions)`;
    const purchase = await db.packagePurchase.create({
      data: { userId: auth.user.id, packageId: pkg.id, sessionsLeft: pkg.sessions },
    });
    purchaseId = purchase.id;
  } else {
    return NextResponse.json({ error: "Nothing to pay for" }, { status: 400 });
  }

  // Reuse a pending payment for the same booking if one exists
  const payment = bookingId
    ? await db.payment.upsert({
        where: { bookingId },
        update: { provider, status: "PENDING" },
        create: { userId: auth.user.id, bookingId, provider, amount, currency },
      })
    : await db.payment.create({
        data: { userId: auth.user.id, purchaseId, provider, amount, currency },
      });

  try {
    const driver = getPaymentDriver(provider);
    const result = await driver.createCheckout({
      paymentId: payment.id,
      amount,
      currency,
      description,
      customerEmail: auth.user.email,
      successUrl: `${APP_URL}/checkout/success?payment=${payment.id}`,
      cancelUrl: `${APP_URL}/checkout?booking=${bookingId ?? ""}&cancelled=1`,
    });
    await db.payment.update({
      where: { id: payment.id },
      data: { providerRef: result.providerRef },
    });
    return NextResponse.json({ redirectUrl: result.redirectUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Payment provider error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
