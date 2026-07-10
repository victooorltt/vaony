import { NextRequest, NextResponse } from "next/server";
import { addMinutes } from "date-fns";
import { requireRole } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { bookingSchema } from "@/lib/validators";
import { isSlotAvailable } from "@/lib/availability";
import { getMailer, templates } from "@/lib/mail";
import { formatInTz } from "@/lib/utils";

/** Student books a slot. Payment happens right after via /api/payments/checkout. */
export async function POST(request: NextRequest) {
  const auth = await requireRole(["STUDENT"]);
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { teacherId, courseId, startsAt, notes } = parsed.data;

  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course || !course.published) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const start = new Date(startsAt);
  const end = addMinutes(start, course.durationMinutes);

  if (!(await isSlotAvailable(teacherId, start, end))) {
    return NextResponse.json(
      { error: "That slot is no longer available. Pick another one." },
      { status: 409 }
    );
  }

  const booking = await db.booking.create({
    data: {
      studentId: auth.user.id,
      teacherId,
      courseId,
      startsAt: start,
      endsAt: end,
      notes: notes ?? null,
      status: "PENDING",
    },
    include: { course: true, teacher: true },
  });

  // Ensure enrollment exists
  await db.enrollment.upsert({
    where: { studentId_courseId: { studentId: auth.user.id, courseId } },
    update: {},
    create: { studentId: auth.user.id, courseId, teacherId },
  });

  await getMailer().send({
    to: auth.user.email,
    subject: "Booking received — complete your payment",
    html: templates.bookingConfirmed(
      booking.course.title,
      formatInTz(booking.startsAt, auth.user.timezone)
    ),
  });

  return NextResponse.json({ ok: true, bookingId: booking.id });
}

export async function GET() {
  const auth = await requireRole(["STUDENT", "TEACHER"]);
  if ("error" in auth) return auth.error;

  const where =
    auth.user.role === "STUDENT"
      ? { studentId: auth.user.id }
      : { teacherId: auth.user.id };

  const bookings = await db.booking.findMany({
    where,
    include: { course: true, teacher: true, student: true },
    orderBy: { startsAt: "asc" },
  });
  return NextResponse.json({ bookings });
}
