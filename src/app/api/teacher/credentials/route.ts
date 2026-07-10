import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { getStorage, isAllowed, MAX_UPLOAD_BYTES } from "@/lib/storage";

async function getProfile(userId: string) {
  return db.teacherProfile.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireRole(["TEACHER"]);
  if ("error" in auth) return auth.error;

  const formData = await request.formData().catch(() => null);
  const title = String(formData?.get("title") ?? "").trim();
  const institution = String(formData?.get("institution") ?? "").trim();
  const file = formData?.get("file");

  if (!title || !institution) {
    return NextResponse.json({ error: "Title and institution are required" }, { status: 400 });
  }

  let fileUrl: string | null = null;
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_UPLOAD_BYTES || !isAllowed(file.name, "credentials")) {
      return NextResponse.json({ error: "File must be PDF/JPG/PNG under 10 MB" }, { status: 400 });
    }
    fileUrl = await getStorage().save(Buffer.from(await file.arrayBuffer()), file.name, "credentials");
  }

  const profile = await getProfile(auth.user.id);
  const credential = await db.credential.create({
    data: { profileId: profile.id, title, institution, fileUrl },
  });
  return NextResponse.json({ credential });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireRole(["TEACHER"]);
  if ("error" in auth) return auth.error;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const credential = await db.credential.findUnique({
    where: { id },
    include: { profile: true },
  });
  if (!credential || credential.profile.userId !== auth.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await db.credential.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
