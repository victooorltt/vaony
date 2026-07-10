import { db } from "@/lib/db";
import { formatInTz, formatMoney } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/Card";

const tone = { PAID: "green", PENDING: "amber", FAILED: "red", REFUNDED: "neutral" } as const;

export default async function AdminPaymentsPage() {
  const [payments, totals] = await Promise.all([
    db.payment.findMany({
      include: {
        user: true,
        booking: { include: { course: true, teacher: true } },
        purchase: { include: { package: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.payment.groupBy({
      by: ["provider"],
      _sum: { amount: true },
      where: { status: "PAID" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <h1 className="font-display text-3xl font-bold text-vaony-ink">Transactions</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        {["STRIPE", "PAYPAL", "MERCADOPAGO"].map((p) => (
          <StatCard
            key={p}
            label={`revenue via ${p.toLowerCase()}`}
            value={formatMoney(totals.find((t) => t.provider === p)?._sum.amount ?? 0)}
          />
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-vaony-ink/8 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-vaony-ink/8 text-left font-mono text-[11px] uppercase tracking-wider text-vaony-ink/50">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Payer</th>
              <th className="px-4 py-3">Concept</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vaony-ink/5">
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-vaony-ink/60">
                  {formatInTz(p.createdAt, "America/Mexico_City", "MMM d, yyyy HH:mm")}
                </td>
                <td className="px-4 py-3 text-vaony-ink">
                  {p.user.firstName} {p.user.lastName}
                </td>
                <td className="px-4 py-3 text-vaony-ink/70">
                  {p.booking?.course.title ?? p.purchase?.package.name ?? "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{p.provider.toLowerCase()}</td>
                <td className="whitespace-nowrap px-4 py-3 font-mono font-medium">
                  {formatMoney(p.amount, p.currency)}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={tone[p.status as keyof typeof tone] ?? "neutral"}>
                    {p.status.toLowerCase()}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
