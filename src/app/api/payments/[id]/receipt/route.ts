import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { formatMoney, formatInTz } from "@/lib/utils";

/** Simple HTML receipt (printable). */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const payment = await db.payment.findUnique({
    where: { id },
    include: {
      user: true,
      booking: { include: { course: true } },
      purchase: { include: { package: true } },
    },
  });
  if (!payment || (payment.userId !== auth.user.id && auth.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (payment.status !== "PAID") {
    return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
  }

  const description =
    payment.booking?.course.title ?? payment.purchase?.package.name ?? "Vaony services";

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Receipt ${payment.id}</title>
<style>
  body{font-family:Arial,sans-serif;max-width:640px;margin:40px auto;color:#000B36;padding:0 20px}
  h1{color:#2924FD} table{width:100%;border-collapse:collapse;margin-top:24px}
  td{padding:10px 0;border-bottom:1px solid #eee} .r{text-align:right}
  .total{font-size:20px;font-weight:bold}
</style></head><body>
  <h1>Vaony — Payment receipt</h1>
  <p>Receipt <strong>#${payment.id}</strong><br/>
  Issued to ${payment.user.firstName} ${payment.user.lastName} (${payment.user.email})<br/>
  Date: ${formatInTz(payment.createdAt, payment.user.timezone, "MMMM d, yyyy · HH:mm")}</p>
  <table>
    <tr><td>${description}</td><td class="r">${formatMoney(payment.amount, payment.currency)}</td></tr>
    <tr><td>Payment method</td><td class="r">${payment.provider}</td></tr>
    <tr><td class="total">Total paid</td><td class="r total">${formatMoney(payment.amount, payment.currency)}</td></tr>
  </table>
  <p style="margin-top:32px;font-size:12px;color:#666">Vaony — online tutoring in exact sciences, engineering &amp; math.</p>
  <script>window.print()</script>
</body></html>`;

  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}
