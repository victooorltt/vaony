import { addDays, addMinutes, isBefore, startOfDay } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { db } from "@/lib/db";
import type { AvailableSlot } from "@/types";

/**
 * Single source of truth for bookable slots:
 * weekly availability template − blocked times − existing bookings.
 * Slots are computed in the teacher's timezone and returned as UTC ISO strings;
 * the client projects them into the student's timezone.
 */
export async function getAvailableSlots(
  teacherId: string,
  from: Date,
  to: Date,
  slotMinutes = 60
): Promise<AvailableSlot[]> {
  const [teacher, template, blocked, bookings] = await Promise.all([
    db.user.findUnique({ where: { id: teacherId }, select: { timezone: true } }),
    db.availabilitySlot.findMany({ where: { teacherId } }),
    db.blockedTime.findMany({
      where: { teacherId, endsAt: { gte: from }, startsAt: { lte: to } },
    }),
    db.booking.findMany({
      where: {
        teacherId,
        status: { in: ["PENDING", "CONFIRMED", "RESCHEDULED"] },
        endsAt: { gte: from },
        startsAt: { lte: to },
      },
      select: { startsAt: true, endsAt: true },
    }),
  ]);

  if (!teacher || template.length === 0) return [];
  const tz = teacher.timezone;
  const now = new Date();
  const slots: AvailableSlot[] = [];

  for (let day = startOfDay(from); isBefore(day, to); day = addDays(day, 1)) {
    // Resolve this calendar day in the teacher's timezone
    const dayStr = formatInTimeZone(day, tz, "yyyy-MM-dd");
    const weekday = Number(formatInTimeZone(day, tz, "i")) % 7; // ISO 1-7 → 0=Sun
    const daySlots = template.filter((s) => s.weekday === weekday);

    for (const s of daySlots) {
      let cursor = fromZonedTime(`${dayStr}T${s.startTime}:00`, tz);
      const windowEnd = fromZonedTime(`${dayStr}T${s.endTime}:00`, tz);

      while (isBefore(addMinutes(cursor, slotMinutes), addMinutes(windowEnd, 1))) {
        const slotEnd = addMinutes(cursor, slotMinutes);
        const overlapsBlocked = blocked.some(
          (b) => cursor < b.endsAt && slotEnd > b.startsAt
        );
        const overlapsBooking = bookings.some(
          (b) => cursor < b.endsAt && slotEnd > b.startsAt
        );
        if (!overlapsBlocked && !overlapsBooking && cursor > now) {
          slots.push({ startsAt: cursor.toISOString(), endsAt: slotEnd.toISOString() });
        }
        cursor = slotEnd;
      }
    }
  }

  return slots;
}

export async function isSlotAvailable(
  teacherId: string,
  startsAt: Date,
  endsAt: Date
): Promise<boolean> {
  const slots = await getAvailableSlots(teacherId, startsAt, endsAt);
  return slots.some(
    (s) =>
      new Date(s.startsAt).getTime() === startsAt.getTime() &&
      new Date(s.endsAt).getTime() === endsAt.getTime()
  );
}
