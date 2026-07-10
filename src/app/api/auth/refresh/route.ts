import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyRefreshToken } from "@/lib/auth/jwt";
import { createSession, toSessionUser, REFRESH_COOKIE } from "@/lib/auth/session";

/** Rotates the refresh token: old one is revoked, a fresh pair is issued. */
export async function POST(_request: NextRequest) {
  const jar = await cookies();
  const token = jar.get(REFRESH_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "No refresh token" }, { status: 401 });

  const userId = await verifyRefreshToken(token);
  const stored = await db.refreshToken.findUnique({ where: { token } });

  if (!userId || !stored || stored.revokedAt || stored.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Account unavailable" }, { status: 401 });
  }

  await db.refreshToken.update({
    where: { token },
    data: { revokedAt: new Date() },
  });
  await createSession(toSessionUser(user));

  return NextResponse.json({ ok: true });
}
