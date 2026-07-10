import { db } from "@/lib/db";
import { formatMoney } from "@/lib/utils";
import { StatCard } from "@/components/ui/Card";

export default async function AdminDashboard() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [students, teachers, courses, bookings, revenueMonth, revenueTotal, pendingApps] =
    await Promise.all([
      db.user.count({ where: { role: "STUDENT" } }),
      db.user.count({ where: { role: "TEACHER" } }),
      db.course.count({ where: { published: true } }),
      db.booking.count({ where: { status: { in: ["CONFIRMED", "COMPLETED"] } } }),
      db.payment.aggregate({
        _sum: { amount: true },
        where: { status: "PAID", createdAt: { gte: monthStart } },
      }),
      db.payment.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
      db.teacherApplication.count({ where: { status: "PENDING" } }),
    ]);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <p className="font-mono text-xs text-vaony-blue">admin.dashboard</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-vaony-ink">Platform overview</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="revenue this month" value={formatMoney(revenueMonth._sum.amount ?? 0)} />
        <StatCard label="revenue all time" value={formatMoney(revenueTotal._sum.amount ?? 0)} />
        <StatCard label="booked sessions" value={bookings} />
        <StatCard label="pending applications" value={pendingApps} />
        <StatCard label="students" value={students} />
        <StatCard label="teachers" value={teachers} />
        <StatCard label="published courses" value={courses} />
      </div>
    </div>
  );
}
