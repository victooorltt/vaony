import { db } from "@/lib/db";
import { getMailer, templates } from "@/lib/mail";
import { formatInTz } from "@/lib/utils";

/** Sends 24 h and 1 h reminders for confirmed bookings. Runs every 5 min. */
export async function runBookingReminders(): Promise<void> {
  const now = Date.now();
  const mailer = getMailer();

  const in24h = new Date(now + 24 * 60 * 60 * 1000);
  const in1h = new Date(now + 60 * 60 * 1000);

  const [due24, due1] = await Promise.all([
    db.booking.findMany({
      where: {
        status: { in: ["CONFIRMED", "RESCHEDULED"] },
        reminder24Sent: false,
        startsAt: { gte: new Date(now), lte: in24h },
      },
      include: { course: true, student: true },
    }),
    db.booking.findMany({
      where: {
        status: { in: ["CONFIRMED", "RESCHEDULED"] },
        reminder1Sent: false,
        startsAt: { gte: new Date(now), lte: in1h },
      },
      include: { course: true, student: true },
    }),
  ]);

  for (const b of due24) {
    await mailer.send({
      to: b.student.email,
      subject: "Class reminder — 24 hours",
      html: templates.bookingReminder(
        b.course.title,
        formatInTz(b.startsAt, b.student.timezone),
        24
      ),
    });
    await db.booking.update({ where: { id: b.id }, data: { reminder24Sent: true } });
  }

  for (const b of due1) {
    await mailer.send({
      to: b.student.email,
      subject: "Class reminder — 1 hour",
      html: templates.bookingReminder(
        b.course.title,
        formatInTz(b.startsAt, b.student.timezone),
        1
      ),
    });
    await db.booking.update({ where: { id: b.id }, data: { reminder1Sent: true } });
  }
}
