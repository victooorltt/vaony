import { cookies } from "next/headers";
import { db } from "@/lib/db";
import type { SessionUser } from "@/types";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
} from "./jwt";

export const ACCESS_COOKIE = "vaony_at";
export const REFRESH_COOKIE = "vaony_rt";

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function createSession(user: SessionUser): Promise<void> {
  const accessToken = await signAccessToken(user);
  const { token: refreshToken, expiresAt } = await signRefreshToken(user.id);

  await db.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt },
  });

  const jar = await cookies();
  jar.set(ACCESS_COOKIE, accessToken, { ...cookieBase, maxAge: 60 * 15 });
  jar.set(REFRESH_COOKIE, refreshToken, {
    ...cookieBase,
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(ACCESS_COOKIE)?.value;
  if (!token) return null;
  return verifyAccessToken(token);
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const refreshToken = jar.get(REFRESH_COOKIE)?.value;
  if (refreshToken) {
    await db.refreshToken.updateMany({
      where: { token: refreshToken, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

export function toSessionUser(user: {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  timezone: string;
}): SessionUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role as SessionUser["role"],
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl,
    timezone: user.timezone,
  };
}
