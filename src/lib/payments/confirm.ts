import { db } from "@/lib/db";
import { getMailer, templates } from "@/lib/mail";
import { formatMoney } from "@/lib/utils";

/** Shared by all provider webhooks: marks the payment PAID, confirms the
 *  booking, and sends the receipt email. Idempotent. */
export async function confirmPayment(paymentId: string): Promise<void> {
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    include: {
      user: true,
      booking: { include: { course: true } },
      purchase: { include: { package: true } },
    },
  });
  if (!payment || payment.status === "PAID") return;

  await db.payment.update({ where: { id: payment.id }, data: { status: "PAID" } });

  if (payment.bookingId) {
    await db.booking.update({
      where: { id: payment.bookingId },
      data: { status: "CONFIRMED" },
    });
  }

  const description =
    payment.booking?.course.title ?? payment.purchase?.package.name ?? "Vaony services";

  await getMailer().send({
    to: payment.user.email,
    subject: "Payment received — Vaony",
    html: templates.paymentReceipt(formatMoney(payment.amount, payment.currency), description),
  });

  await db.notification.create({
    data: {
      userId: payment.userId,
      type: "PAYMENT",
      title: "Payment confirmed",
      body: `${formatMoney(payment.amount, payment.currency)} — ${description}`,
    },
  });
}
