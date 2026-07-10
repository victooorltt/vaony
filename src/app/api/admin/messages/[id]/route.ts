import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { db } from "@/lib/db";

/** Chat moderation: flag or soft-delete a message (spec §4.7). */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(["ADMIN"]);
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const body = (await request.json().catch(() => ({}))) as {
    action?: "flag" | "unflag" | "delete";
  };

  if (body.action === "flag" || body.action === "unflag") {
    await db.message.update({
      where: { id },
      data: { flagged: body.action === "flag" },
    });
    return NextResponse.json({ ok: true });
  }
  if (body.action === "delete") {
    await db.message.update({
      where: { id },
      data: { deleted: true, body: "[removed by moderator]" },
    });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
