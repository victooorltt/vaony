import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { db } from "@/lib/db";

/** GET /api/chat/messages?conversationId=…&cursor=… — history, newest first, 40/page */
export async function GET(request: NextRequest) {
  const auth = await requireRole(["STUDENT", "TEACHER", "ADMIN"]);
  if ("error" in auth) return auth.error;

  const conversationId = request.nextUrl.searchParams.get("conversationId");
  const cursor = request.nextUrl.searchParams.get("cursor");
  if (!conversationId) return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });

  const convo = await db.conversation.findUnique({ where: { id: conversationId } });
  if (
    !convo ||
    (auth.user.role !== "ADMIN" &&
      convo.studentId !== auth.user.id &&
      convo.teacherId !== auth.user.id)
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await db.message.findMany({
    where: { conversationId, deleted: false },
    orderBy: { sentAt: "desc" },
    take: 40,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  return NextResponse.json({
    messages: messages.reverse(),
    nextCursor: messages.length === 40 ? messages[0]?.id : null,
  });
}
