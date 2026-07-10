import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { formatInTz, formatMoney } from "@/lib/utils";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function TeacherDashboard() {
  const user = (await getSession())!;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [upcoming, pendingRequests, unread, paidThisMonth, paidTotal] = await Promise.all([
    db.booking.findMany({
      where: { teacherId: user.id, status: { in: ["CONFIRMED", "RESCHEDULED"] }, startsAt: { gte: now } },
      include: { course: true, student: true },
      orderBy: { startsAt: "asc" },
      take: 5,
    }),
    db.booking.count({ where: { teacherId: user.id, status: "PENDING" } }),
    db.message.count({
      where: {
        readAt: null,
        deleted: false,
        senderId: { not: user.id },
        conversation: { teacherId: user.id },
      },
    }),
    db.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: "PAID",
        createdAt: { gte: monthStart },
        booking: { teacherId: user.id },
      },
    }),
    db.payment.aggregate({
      _sum: { amount: true },
      where: { status: "PAID", booking: { teacherId: user.id } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <p className="font-mono text-xs text-vaony-blue">teacher.dashboard</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-vaony-ink">
          Hi, {user.firstName}
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="upcoming classes" value={upcoming.length} />
        <StatCard label="new requests" value={pendingRequests} sub="awaiting student payment" />
        <StatCard label="unread messages" value={unread} />
        <StatCard
          label="earnings this month"
          value={formatMoney(paidThisMonth._sum.amount ?? 0)}
          sub={`${formatMoney(paidTotal._sum.amount ?? 0)} all time`}
        />
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-vaony-ink">Upcoming classes</h2>
          <Link href="/teacher/schedule" className="text-sm text-vaony-blue hover:underline">
            Manage schedule
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No classes scheduled"
              body="Set your weekly availability so students can start booking."
            />
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {upcoming.map((b) => (
              <Card key={b.id} className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium text-vaony-ink">
                    {b.course.title} · {b.student.firstName} {b.student.lastName}
                  </p>
                  <p className="font-mono text-xs text-vaony-ink/55">
                    {formatInTz(b.startsAt, user.timezone)}
                  </p>
                </div>
                <Badge tone="green">{b.status.toLowerCase()}</Badge>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
