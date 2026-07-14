import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { formatInTz } from "@/lib/utils";
import { ScheduleManager } from "@/components/calendar/ScheduleManager";
import { Badge } from "@/components/ui/Badge";
import { CancelBookingButton } from "@/components/calendar/CancelBookingButton";

export default async function TeacherSchedulePage() {
  const user = (await getSession())!;

  const [slots, blocks, bookings] = await Promise.all([
    db.availabilitySlot.findMany({ where: { teacherId: user.id } }),
    db.blockedTime.findMany({
      where: { teacherId: user.id, endsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
    }),
    db.booking.findMany({
      where: {
        teacherId: user.id,
        status: { in: ["PENDING", "CONFIRMED", "RESCHEDULED"] },
        startsAt: { gte: new Date() },
      },
      include: { course: true, student: true },
      orderBy: { startsAt: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-vaony-ink">Schedule</h1>
        <p className="mt-1 text-sm text-vaony-ink/60">
          Define when students can book you, block days off, and manage confirmed classes.
        </p>
      </div>

      <ScheduleManager
        slots={slots}
        blocks={blocks.map((b) => ({
          id: b.id,
          startsAt: b.startsAt.toISOString(),
          endsAt: b.endsAt.toISOString(),
          reason: b.reason,
        }))}
        timezone={user.timezone}
      />

      <section>
        <h2 className="font-display text-xl font-semibold text-vaony-ink">
          Confirmed &amp; pending bookings
        </h2>
        {bookings.length === 0 ? (
          <p className="mt-3 text-sm text-vaony-ink/50">No upcoming bookings.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-vaony-ink/8 bg-white p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-medium text-vaony-ink">
                    {b.course.title} · {b.student.firstName} {b.student.lastName}
                  </p>
                  <p className="text-xs text-vaony-ink/55">
                    {formatInTz(b.startsAt, user.timezone)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={b.status === "PENDING" ? "amber" : "green"}>
                    {b.status === "PENDING" ? "unpaid" : b.status.toLowerCase()}
                  </Badge>
                  <CancelBookingButton bookingId={b.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
