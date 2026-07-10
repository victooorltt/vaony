import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teacherApplicationSchema } from "@/lib/validators";
import { getStorage, isAllowed, MAX_UPLOAD_BYTES } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Invalid form" }, { status: 400 });

  const parsed = teacherApplicationSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  let cvUrl: string | null = null;
  const cv = formData.get("cv");
  if (cv instanceof File && cv.size > 0) {
    if (cv.size > MAX_UPLOAD_BYTES || !isAllowed(cv.name, "cv")) {
      return NextResponse.json({ error: "CV must be a PDF under 10 MB" }, { status: 400 });
    }
    cvUrl = await getStorage().save(Buffer.from(await cv.arrayBuffer()), cv.name, "cv");
  }

  await db.teacherApplication.create({
    data: { ...parsed.data, cvUrl },
  });

  return NextResponse.json({ ok: true });
}
