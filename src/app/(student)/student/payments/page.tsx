import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { formatInTz, formatMoney } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

const tone = { PAID: "green", PENDING: "amber", FAILED: "red", REFUNDED: "neutral" } as const;

export default async function StudentPaymentsPage() {
  const user = (await getSession())!;
  const payments = await db.payment.findMany({
    where: { userId: user.id },
    include: {
      booking: { include: { course: true } },
      purchase: { include: { package: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl font-bold text-vaony-ink">Payment history</h1>
      {payments.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No payments yet" body="Your session and package payments will appear here with downloadable receipts." />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-vaony-ink/8 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-vaony-ink/8 text-left font-mono text-[11px] uppercase tracking-wider text-vaony-ink/50">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vaony-ink/5">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-vaony-ink/60">
                    {formatInTz(p.createdAt, user.timezone, "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-vaony-ink">
                    {p.booking?.course.title ?? p.purchase?.package.name ?? "Payment"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-vaony-ink/60">
                    {p.provider.toLowerCase()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono font-medium text-vaony-ink">
                    {formatMoney(p.amount, p.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={tone[p.status as keyof typeof tone] ?? "neutral"}>
                      {p.status.toLowerCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {p.status === "PAID" ? (
                      <a
                        href={`/api/payments/${p.id}/receipt`}
                        className="text-vaony-blue hover:underline"
                      >
                        Download
                      </a>
                    ) : (
                      <span className="text-vaony-ink/30">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
