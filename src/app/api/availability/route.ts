import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { getAvailableSlots } from "@/lib/availability";

/** GET /api/availability?teacherId=…&from=ISO&to=ISO */
export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const teacherId = request.nextUrl.searchParams.get("teacherId");
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");
  if (!teacherId || !from || !to) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);
  // Cap the range to avoid unbounded computation
  const maxRange = 62 * 24 * 60 * 60 * 1000;
  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime()) || toDate.getTime() - fromDate.getTime() > maxRange) {
    return NextResponse.json({ error: "Invalid range" }, { status: 400 });
  }

  const slots = await getAvailableSlots(teacherId, fromDate, toDate);
  return NextResponse.json({ slots });
}
