import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { getStorage, isAllowed, MAX_UPLOAD_BYTES } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const auth = await requireRole(["ADMIN"]);
  if ("error" in auth) return auth.error;

  const formData = await request.formData().catch(() => null);
  const title = String(formData?.get("title") ?? "").trim();
  const category = String(formData?.get("category") ?? "").trim();
  const file = formData?.get("file");

  if (!title || !category) {
    return NextResponse.json({ error: "Title and category are required" }, { status: 400 });
  }

  let mediaUrl = `placeholder:${category.toLowerCase()}`;
  let type = "IMAGE";
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_UPLOAD_BYTES || !isAllowed(file.name, "materials")) {
      return NextResponse.json({ error: "Invalid file" }, { status: 400 });
    }
    mediaUrl = await getStorage().save(Buffer.from(await file.arrayBuffer()), file.name, "gallery");
    if (file.name.toLowerCase().endsWith(".mp4")) type = "VIDEO";
    else if (file.name.toLowerCase().endsWith(".pdf")) type = "PDF";
  }

  const item = await db.galleryItem.create({
    data: { title, category, mediaUrl, type },
  });
  return NextResponse.json({ item });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireRole(["ADMIN"]);
  if ("error" in auth) return auth.error;
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await db.galleryItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
