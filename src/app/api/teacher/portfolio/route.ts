import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { getStorage, isAllowed, MAX_UPLOAD_BYTES } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const auth = await requireRole(["TEACHER"]);
  if ("error" in auth) return auth.error;

  const formData = await request.formData().catch(() => null);
  const title = String(formData?.get("title") ?? "").trim();
  const externalUrl = String(formData?.get("url") ?? "").trim();
  const file = formData?.get("file");

  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  let url = externalUrl;
  let type = "LINK";
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_UPLOAD_BYTES || !isAllowed(file.name, "credentials")) {
      return NextResponse.json({ error: "File must be PDF/JPG/PNG under 10 MB" }, { status: 400 });
    }
    url = await getStorage().save(Buffer.from(await file.arrayBuffer()), file.name, "credentials");
    type = file.name.toLowerCase().endsWith(".pdf") ? "PDF" : "IMAGE";
  }
  if (!url) return NextResponse.json({ error: "Provide a link or a file" }, { status: 400 });

  const profile = await db.teacherProfile.upsert({
    where: { userId: auth.user.id },
    update: {},
    create: { userId: auth.user.id },
  });
  const item = await db.portfolioItem.create({
    data: { profileId: profile.id, title, url, type },
  });
  return NextResponse.json({ item });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireRole(["TEACHER"]);
  if ("error" in auth) return auth.error;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const item = await db.portfolioItem.findUnique({
    where: { id },
    include: { profile: true },
  });
  if (!item || item.profile.userId !== auth.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await db.portfolioItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
