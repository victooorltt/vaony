import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { reviewSchema } from "@/lib/validators";

/** Student rates a completed session; the teacher's cached average updates. */
export async function POST(request: NextRequest) {
  const auth = await requireRole(["STUDENT"]);
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { bookingId, rating, comment } = parsed.data;

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { review: true },
  });
  if (!booking || booking.studentId !== auth.user.id) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.status !== "COMPLETED" && booking.endsAt > new Date()) {
    return NextResponse.json({ error: "You can review a session after it ends" }, { status: 400 });
  }
  if (booking.review) {
    return NextResponse.json({ error: "You already reviewed this session" }, { status: 409 });
  }

  await db.review.create({
    data: {
      bookingId,
      studentId: auth.user.id,
      teacherId: booking.teacherId,
      rating,
      comment: comment ?? null,
    },
  });

  // Recompute the teacher's cached rating
  const agg = await db.review.aggregate({
    _avg: { rating: true },
    _count: true,
    where: { teacherId: booking.teacherId },
  });
  await db.teacherProfile.updateMany({
    where: { userId: booking.teacherId },
    data: { ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count },
  });

  return NextResponse.json({ ok: true });
}
