import Link from "next/link";
import { VideoCameraIcon } from "@heroicons/react/24/solid";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { formatInTz, formatMoney } from "@/lib/utils";
import { Card, StatCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function StudentDashboard() {
  const user = (await getSession())!;
  const now = new Date();

  const [enrollments, upcoming, pendingPayments] = await Promise.all([
    db.enrollment.findMany({
      where: { studentId: user.id, status: "ACTIVE" },
      include: { course: true, teacher: true },
    }),
    db.booking.findMany({
      where: { studentId: user.id, status: "CONFIRMED", startsAt: { gte: now } },
      include: { course: true, teacher: true },
      orderBy: { startsAt: "asc" },
      take: 3,
    }),
    db.payment.findMany({
      where: { userId: user.id, status: "PENDING" },
      include: { booking: { include: { course: true } } },
    }),
  ]);

  const next = upcoming[0];
  const nextIsSoon = next && next.startsAt.getTime() - now.getTime() < 30 * 60 * 1000;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <p className="font-mono text-xs text-vaony-blue">student.dashboard</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-vaony-ink">
          Hi, {user.firstName}
        </h1>
      </div>

      {/* Join ongoing/next class */}
      {next && (
        <Card className="brand-gradient grid-pattern-dark border-0 text-white">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="font-mono text-xs text-white/60">next class</p>
              <p className="mt-1 font-display text-xl font-semibold">{next.course.title}</p>
              <p className="mt-1 text-sm text-white/75">
                with {next.teacher.firstName} {next.teacher.lastName} ·{" "}
                {formatInTz(next.startsAt, user.timezone)}
              </p>
            </div>
            {next.meetingUrl && (
              <a
                href={next.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                  nextIsSoon
                    ? "bg-vaony-amber text-vaony-ink hover:brightness-105"
                    : "bg-white/15 text-white hover:bg-white/25"
                }`}
              >
                <VideoCameraIcon className="h-4 w-4" /> Join class
              </a>
            )}
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="active courses" value={enrollments.length} />
        <StatCard label="upcoming classes" value={upcoming.length} />
        <StatCard
          label="pending payments"
          value={pendingPayments.length}
          sub={
            pendingPayments[0]
              ? `${formatMoney(pendingPayments[0].amount, pendingPayments[0].currency)} due`
              : undefined
          }
        />
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-vaony-ink">My courses</h2>
          <Link href="/student/courses" className="text-sm text-vaony-blue hover:underline">
            View all
          </Link>
        </div>
        {enrollments.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No courses yet"
              body="Browse the catalog and enroll in your first course to get started."
              action={<ButtonLink href="/courses">Explore courses</ButtonLink>}
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {enrollments.map((e) => (
              <Card key={e.id}>
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-vaony-ink">{e.course.title}</h3>
                  <Badge tone="blue">{e.progress}%</Badge>
                </div>
                <p className="mt-1 text-xs text-vaony-ink/55">
                  with {e.teacher.firstName} {e.teacher.lastName}
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-vaony-ink/8">
                  <div
                    className="brand-gradient h-full rounded-full"
                    style={{ width: `${e.progress}%` }}
                  />
                </div>
                <div className="mt-4 flex gap-2">
                  <ButtonLink href="/student/calendar" variant="secondary" size="sm">
                    Book session
                  </ButtonLink>
                  <ButtonLink href="/student/messages" variant="ghost" size="sm">
                    Message teacher
                  </ButtonLink>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {upcoming.length > 1 && (
        <section>
          <h2 className="font-display text-xl font-semibold text-vaony-ink">Upcoming classes</h2>
          <div className="mt-4 space-y-3">
            {upcoming.slice(1).map((b) => (
              <Card key={b.id} className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium text-vaony-ink">{b.course.title}</p>
                  <p className="font-mono text-xs text-vaony-ink/55">
                    {formatInTz(b.startsAt, user.timezone)}
                  </p>
                </div>
                <Badge tone="green">confirmed</Badge>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
