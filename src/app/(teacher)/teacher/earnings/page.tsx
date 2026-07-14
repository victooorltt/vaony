import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { formatInTz, formatMoney } from "@/lib/utils";
import { StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function TeacherEarningsPage() {
  const user = (await getSession())!;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [payments, monthAgg, totalAgg, completedCount] = await Promise.all([
    db.payment.findMany({
      where: { status: "PAID", booking: { teacherId: user.id } },
      include: { booking: { include: { course: true, student: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.payment.aggregate({
      _sum: { amount: true },
      where: { status: "PAID", createdAt: { gte: monthStart }, booking: { teacherId: user.id } },
    }),
    db.payment.aggregate({
      _sum: { amount: true },
      where: { status: "PAID", booking: { teacherId: user.id } },
    }),
    db.booking.count({ where: { teacherId: user.id, status: "COMPLETED" } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <h1 className="font-display text-3xl font-bold text-vaony-ink">Earnings</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="this month" value={formatMoney(monthAgg._sum.amount ?? 0)} />
        <StatCard label="all time" value={formatMoney(totalAgg._sum.amount ?? 0)} />
        <StatCard label="completed sessions" value={completedCount} />
      </div>

      {payments.length === 0 ? (
        <EmptyState title="No payments yet" body="Payments from your students' sessions will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-vaony-ink/8 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-vaony-ink/8 text-left text-[11px] uppercase tracking-wider text-vaony-ink/50">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vaony-ink/5">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-vaony-ink/60">
                    {formatInTz(p.createdAt, user.timezone, "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-vaony-ink">{p.booking?.course.title}</td>
                  <td className="px-4 py-3 text-vaony-ink/70">
                    {p.booking?.student.firstName} {p.booking?.student.lastName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-vaony-ink">
                    {formatMoney(p.amount, p.currency)}
                  </td>
                  <td className="px-4 py-3"><Badge tone="green">paid</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
