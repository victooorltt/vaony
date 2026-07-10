import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { requireRole } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { getStorage, isAllowed, MAX_UPLOAD_BYTES } from "@/lib/storage";

/** Uploads a chat attachment (≤10 MB, PDF/images/DOCX/XLSX) and persists the
 *  message. The realtime layer picks it up via the returned message. */
export async function POST(request: NextRequest) {
  const auth = await requireRole(["STUDENT", "TEACHER"]);
  if ("error" in auth) return auth.error;

  const formData = await request.formData().catch(() => null);
  const conversationId = String(formData?.get("conversationId") ?? "");
  const file = formData?.get("file");

  if (!conversationId || !(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Missing file or conversation" }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "File exceeds the 10 MB limit" }, { status: 400 });
  }
  if (!isAllowed(file.name, "chat")) {
    return NextResponse.json({ error: "File type not allowed (PDF, images, DOCX, XLSX)" }, { status: 400 });
  }

  const convo = await db.conversation.findUnique({ where: { id: conversationId } });
  if (!convo || (convo.studentId !== auth.user.id && convo.teacherId !== auth.user.id)) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const fileUrl = await getStorage().save(
    Buffer.from(await file.arrayBuffer()),
    file.name,
    "chat"
  );

  const message = await db.message.create({
    data: {
      conversationId,
      senderId: auth.user.id,
      body: `📎 ${file.name}`,
      fileUrl,
      fileName: file.name,
      fileType: path.extname(file.name).slice(1).toLowerCase(),
    },
  });

  return NextResponse.json({ message });
}
