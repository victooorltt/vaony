import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { BookingCalendar } from "@/components/calendar/BookingCalendar";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatInTz } from "@/lib/utils";
import { CancelBookingButton } from "@/components/calendar/CancelBookingButton";
import { ReviewForm } from "@/components/forms/ReviewForm";
import { Rating } from "@/components/ui/Rating";

export default async function StudentCalendarPage() {
  const user = (await getSession())!;

  const [teacherProfiles, myBookings, pastBookings] = await Promise.all([
    db.teacherProfile.findMany({
      where: { user: { status: "ACTIVE" } },
      include: {
        user: true,
        courses: { include: { course: true } },
      },
    }),
    db.booking.findMany({
      where: { studentId: user.id, status: { in: ["PENDING", "CONFIRMED", "RESCHEDULED"] }, startsAt: { gte: new Date() } },
      include: { course: true, teacher: true },
      orderBy: { startsAt: "asc" },
    }),
    db.booking.findMany({
      where: {
        studentId: user.id,
        OR: [{ status: "COMPLETED" }, { status: "CONFIRMED", endsAt: { lt: new Date() } }],
      },
      include: { course: true, teacher: true, review: true },
      orderBy: { startsAt: "desc" },
      take: 10,
    }),
  ]);

  const teachers = teacherProfiles
    .filter((t) => t.courses.length > 0)
    .map((t) => ({
      id: t.userId,
      name: `${t.user.firstName} ${t.user.lastName} — ${t.specialization ?? ""}`,
      courses: t.courses.map((ct) => ({ id: ct.course.id, title: ct.course.title })),
    }));

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-vaony-ink">Book a class</h1>
        <p className="mt-1 text-sm text-vaony-ink/60">
          Pick a teacher and click any available slot. Times are shown in{" "}
          <span className="font-mono">{user.timezone}</span>.
        </p>
      </div>

      {teachers.length === 0 ? (
        <EmptyState
          title="No teachers available yet"
          body="Check back soon — new teachers are being onboarded."
          action={<ButtonLink href="/courses">Browse courses</ButtonLink>}
        />
      ) : (
        <BookingCalendar teachers={teachers} timezone={user.timezone} />
      )}

      {myBookings.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-semibold text-vaony-ink">
            Your upcoming sessions
          </h2>
          <div className="mt-4 space-y-3">
            {myBookings.map((b) => (
              <div
                key={b.id}
                className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-vaony-ink/8 bg-white p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-medium text-vaony-ink">{b.course.title}</p>
                  <p className="font-mono text-xs text-vaony-ink/55">
                    {formatInTz(b.startsAt, user.timezone)} · {b.teacher.firstName}{" "}
                    {b.teacher.lastName}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={b.status === "CONFIRMED" ? "green" : b.status === "PENDING" ? "amber" : "blue"}>
                    {b.status === "PENDING" ? "awaiting payment" : b.status.toLowerCase()}
                  </Badge>
                  {b.status === "PENDING" && (
                    <ButtonLink href={`/checkout?booking=${b.id}`} size="sm">Pay now</ButtonLink>
                  )}
                  <CancelBookingButton bookingId={b.id} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {pastBookings.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-semibold text-vaony-ink">Past sessions</h2>
          <div className="mt-4 space-y-3">
            {pastBookings.map((b) => (
              <div
                key={b.id}
                className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-vaony-ink/8 bg-white p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-medium text-vaony-ink">{b.course.title}</p>
                  <p className="font-mono text-xs text-vaony-ink/55">
                    {formatInTz(b.startsAt, user.timezone)} · {b.teacher.firstName}{" "}
                    {b.teacher.lastName}
                  </p>
                </div>
                {b.review ? (
                  <Rating value={b.review.rating} />
                ) : (
                  <ReviewForm bookingId={b.id} />
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
