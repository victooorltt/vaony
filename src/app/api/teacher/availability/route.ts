import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { availabilitySlotSchema, blockedTimeSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const auth = await requireRole(["TEACHER"]);
  if ("error" in auth) return auth.error;

  const body = (await request.json().catch(() => null)) as {
    kind?: "slot" | "block";
  } | null;
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  if (body.kind === "slot") {
    const parsed = availabilitySlotSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
    if (parsed.data.startTime >= parsed.data.endTime) {
      return NextResponse.json({ error: "End time must be after start time" }, { status: 400 });
    }
    const slot = await db.availabilitySlot.create({
      data: { teacherId: auth.user.id, ...parsed.data },
    });
    return NextResponse.json({ slot });
  }

  if (body.kind === "block") {
    const parsed = blockedTimeSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid block" }, { status: 400 });
    const block = await db.blockedTime.create({
      data: {
        teacherId: auth.user.id,
        startsAt: new Date(parsed.data.startsAt),
        endsAt: new Date(parsed.data.endsAt),
        reason: parsed.data.reason ?? null,
      },
    });
    return NextResponse.json({ block });
  }

  return NextResponse.json({ error: "Unknown kind" }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireRole(["TEACHER"]);
  if ("error" in auth) return auth.error;

  const id = request.nextUrl.searchParams.get("id");
  const kind = request.nextUrl.searchParams.get("kind");
  if (!id || !kind) return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

  if (kind === "slot") {
    await db.availabilitySlot.deleteMany({ where: { id, teacherId: auth.user.id } });
  } else if (kind === "block") {
    await db.blockedTime.deleteMany({ where: { id, teacherId: auth.user.id } });
  }
  return NextResponse.json({ ok: true });
}
