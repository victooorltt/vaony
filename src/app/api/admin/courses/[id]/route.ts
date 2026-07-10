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

  const body = (await request.json().catch(() => ({}))) as {
    published?: boolean;
    featured?: boolean;
    price?: number;
  };

  await db.course.update({
    where: { id },
    data: {
      ...(typeof body.published === "boolean" ? { published: body.published } : {}),
      ...(typeof body.featured === "boolean" ? { featured: body.featured } : {}),
      ...(typeof body.price === "number" && body.price > 0 ? { price: body.price } : {}),
    },
  });
  return NextResponse.json({ ok: true });
}
