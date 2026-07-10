import { SignJWT, jwtVerify } from "jose";
import type { Role, SessionUser } from "@/types";

const ACCESS_TTL = "15m";
const REFRESH_TTL_DAYS = 7;

function secret(key: "JWT_SECRET" | "JWT_REFRESH_SECRET") {
  const value = process.env[key];
  if (!value) throw new Error(`${key} is not set`);
  return new TextEncoder().encode(value);
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  timezone: string;
  avatarUrl?: string | null;
}

export async function signAccessToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    timezone: user.timezone,
    avatarUrl: user.avatarUrl ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(secret("JWT_SECRET"));
}

export async function verifyAccessToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret("JWT_SECRET"));
    return {
      id: payload.sub as string,
      email: payload.email as string,
      role: payload.role as Role,
      firstName: payload.firstName as string,
      lastName: payload.lastName as string,
      timezone: (payload.timezone as string) ?? "UTC",
      avatarUrl: (payload.avatarUrl as string | null) ?? null,
    };
  } catch {
    return null;
  }
}

export async function signRefreshToken(userId: string): Promise<{
  token: string;
  expiresAt: Date;
}> {
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TTL_DAYS}d`)
    .setJti(crypto.randomUUID())
    .sign(secret("JWT_REFRESH_SECRET"));
  return { token, expiresAt };
}

export async function verifyRefreshToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret("JWT_REFRESH_SECRET"));
    return payload.sub ?? null;
  } catch {
    return null;
  }
}
