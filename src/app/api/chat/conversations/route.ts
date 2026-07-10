import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { db } from "@/lib/db";

/** Lists the user's conversations. A conversation is created lazily when a
 *  paid booking exists between student and teacher (spec §4.7). */
export async function GET() {
  const auth = await requireRole(["STUDENT", "TEACHER", "ADMIN"]);
  if ("error" in auth) return auth.error;
  const userId = auth.user.id;

  // Auto-create conversations for paid bookings that don't have one yet
  if (auth.user.role !== "ADMIN") {
    const paidPairs = await db.booking.findMany({
      where: {
        ...(auth.user.role === "STUDENT" ? { studentId: userId } : { teacherId: userId }),
        payment: { status: "PAID" },
      },
      select: { studentId: true, teacherId: true },
      distinct: ["studentId", "teacherId"],
    });
    for (const pair of paidPairs) {
      await db.conversation.upsert({
        where: { studentId_teacherId: { studentId: pair.studentId, teacherId: pair.teacherId } },
        update: {},
        create: { studentId: pair.studentId, teacherId: pair.teacherId },
      });
    }
  }

  const where =
    auth.user.role === "ADMIN"
      ? {}
      : auth.user.role === "STUDENT"
        ? { studentId: userId }
        : { teacherId: userId };

  const conversations = await db.conversation.findMany({
    where,
    include: {
      student: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      teacher: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      messages: { orderBy: { sentAt: "desc" }, take: 1, where: { deleted: false } },
    },
  });

  const withUnread = await Promise.all(
    conversations.map(async (c) => ({
      id: c.id,
      student: c.student,
      teacher: c.teacher,
      lastMessage: c.messages[0] ?? null,
      unread: await db.message.count({
        where: { conversationId: c.id, senderId: { not: userId }, readAt: null, deleted: false },
      }),
    }))
  );

  withUnread.sort((a, b) => {
    const ta = a.lastMessage ? new Date(a.lastMessage.sentAt).getTime() : 0;
    const tb = b.lastMessage ? new Date(b.lastMessage.sentAt).getTime() : 0;
    return tb - ta;
  });

  return NextResponse.json({ conversations: withUnread });
}
