import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { getStorage, isAllowed, MAX_UPLOAD_BYTES } from "@/lib/storage";

/** Teacher uploads a resource for a course group or a specific student. */
export async function POST(request: NextRequest) {
  const auth = await requireRole(["TEACHER", "ADMIN"]);
  if ("error" in auth) return auth.error;

  const formData = await request.formData().catch(() => null);
  const title = String(formData?.get("title") ?? "").trim();
  const courseId = String(formData?.get("courseId") ?? "") || null;
  const studentId = String(formData?.get("studentId") ?? "") || null;
  const file = formData?.get("file");

  if (!title || !(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Title and file are required" }, { status: 400 });
  }
  if (!courseId && !studentId) {
    return NextResponse.json({ error: "Choose a course or a student" }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "File exceeds the 10 MB limit" }, { status: 400 });
  }
  if (!isAllowed(file.name, "materials")) {
    return NextResponse.json({ error: "Format not allowed (PDF, DOCX, XLSX, JPG, PNG, MP4, ZIP)" }, { status: 400 });
  }

  const fileUrl = await getStorage().save(
    Buffer.from(await file.arrayBuffer()),
    file.name,
    "materials"
  );

  const material = await db.material.create({
    data: {
      uploaderId: auth.user.id,
      courseId,
      studentId,
      title,
      fileUrl,
      fileType: file.name.split(".").pop()?.toLowerCase() ?? "file",
      sizeBytes: file.size,
    },
  });

  return NextResponse.json({ material });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireRole(["TEACHER", "ADMIN"]);
  if ("error" in auth) return auth.error;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const where =
    auth.user.role === "ADMIN" ? { id } : { id, uploaderId: auth.user.id };
  await db.material.deleteMany({ where });
  return NextResponse.json({ ok: true });
}
