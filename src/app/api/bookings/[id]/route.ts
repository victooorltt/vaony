import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { getMailer, templates } from "@/lib/mail";
import { formatInTz } from "@/lib/utils";

/** Cancel or reschedule a booking. Teachers and the owning student only. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(["STUDENT", "TEACHER", "ADMIN"]);
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const booking = await db.booking.findUnique({
    where: { id },
    include: { course: true, student: true, teacher: true },
  });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isParty =
    auth.user.role === "ADMIN" ||
    booking.studentId === auth.user.id ||
    booking.teacherId === auth.user.id;
  if (!isParty) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await request.json().catch(() => ({}))) as {
    action?: "cancel" | "reschedule" | "complete";
    startsAt?: string;
  };

  if (body.action === "cancel") {
    await db.booking.update({ where: { id }, data: { status: "CANCELLED" } });
    // Notify the other party automatically (spec §4.3 / §4.6)
    const other = auth.user.id === booking.studentId ? booking.teacher : booking.student;
    await getMailer().send({
      to: other.email,
      subject: "A class was cancelled",
      html: templates.bookingCancelled(
        booking.course.title,
        formatInTz(booking.startsAt, other.timezone)
      ),
    });
    await db.notification.create({
      data: {
        userId: other.id,
        type: "BOOKING",
        title: "Class cancelled",
        body: `${booking.course.title} on ${formatInTz(booking.startsAt, other.timezone)}`,
      },
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "reschedule" && body.startsAt) {
    const start = new Date(body.startsAt);
    const durationMs = booking.endsAt.getTime() - booking.startsAt.getTime();
    const end = new Date(start.getTime() + durationMs);
    await db.booking.update({
      where: { id },
      data: { startsAt: start, endsAt: end, status: "RESCHEDULED", reminder24Sent: false, reminder1Sent: false },
    });
    const other = auth.user.id === booking.studentId ? booking.teacher : booking.student;
    await getMailer().send({
      to: other.email,
      subject: "A class was rescheduled",
      html: templates.bookingConfirmed(
        booking.course.title,
        formatInTz(start, other.timezone)
      ),
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "complete" && (auth.user.role === "TEACHER" || auth.user.role === "ADMIN")) {
    await db.booking.update({ where: { id }, data: { status: "COMPLETED" } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
