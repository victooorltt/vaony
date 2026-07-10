import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { confirmPayment } from "@/lib/payments/confirm";

/** Development-only: simulates a successful provider webhook so the full
 *  booking→payment→confirmation flow can be exercised without API keys.
 *  Hard-disabled in production. */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
  const auth = await requireRole(["STUDENT"]);
  if ("error" in auth) return auth.error;

  const body = (await request.json().catch(() => ({}))) as {
    bookingId?: string;
    packageId?: string;
  };

  if (body.bookingId) {
    const booking = await db.booking.findUnique({
      where: { id: body.bookingId },
      include: { course: true, payment: true },
    });
    if (!booking || booking.studentId !== auth.user.id) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    const payment =
      booking.payment ??
      (await db.payment.create({
        data: {
          userId: auth.user.id,
          bookingId: booking.id,
          provider: "STRIPE",
          providerRef: "dev-simulated",
          amount: booking.course.price,
          currency: booking.course.currency,
        },
      }));
    await confirmPayment(payment.id);
    return NextResponse.json({ ok: true });
  }

  if (body.packageId) {
    const pkg = await db.sessionPackage.findUnique({ where: { id: body.packageId } });
    if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 });
    const purchase = await db.packagePurchase.create({
      data: { userId: auth.user.id, packageId: pkg.id, sessionsLeft: pkg.sessions },
    });
    const payment = await db.payment.create({
      data: {
        userId: auth.user.id,
        purchaseId: purchase.id,
        provider: "STRIPE",
        providerRef: "dev-simulated",
        amount: pkg.price,
        currency: pkg.currency,
      },
    });
    await confirmPayment(payment.id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Nothing to confirm" }, { status: 400 });
}
