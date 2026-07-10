import { NextResponse } from "next/server";
import { getSession } from "./session";
import type { Role, SessionUser } from "@/types";

/**
 * Route-handler guard. Never rely on middleware alone — every API endpoint
 * verifies the session and role itself.
 */
export async function requireRole(
  roles: Role[]
): Promise<{ user: SessionUser } | { error: NextResponse }> {
  const user = await getSession();
  if (!user) {
    return {
      error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }),
    };
  }
  if (!roles.includes(user.role)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { user };
}

export async function requireAuth(): Promise<
  { user: SessionUser } | { error: NextResponse }
> {
  return requireRole(["ADMIN", "STUDENT", "TEACHER"]);
}
