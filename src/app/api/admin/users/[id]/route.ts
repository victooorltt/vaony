import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(["ADMIN"]);
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const body = (await request.json().catch(() => ({}))) as { status?: string };
  if (body.status !== "ACTIVE" && body.status !== "SUSPENDED") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  if (id === auth.user.id) {
    return NextResponse.json({ error: "You can't change your own status" }, { status: 400 });
  }

  await db.user.update({ where: { id }, data: { status: body.status } });
  if (body.status === "SUSPENDED") {
    await db.refreshToken.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  return NextResponse.json({ ok: true });
}
