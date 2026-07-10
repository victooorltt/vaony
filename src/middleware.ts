import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ROLE_ROUTES: Array<{ prefix: string; role: string }> = [
  { prefix: "/student", role: "STUDENT" },
  { prefix: "/teacher", role: "TEACHER" },
  { prefix: "/admin", role: "ADMIN" },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const match = ROLE_ROUTES.find((r) => pathname.startsWith(r.prefix));
  if (!match) return NextResponse.next();

  const token = request.cookies.get("vaony_at")?.value;
  const loginUrl = new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url);

  if (!token) return NextResponse.redirect(loginUrl);

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    if (payload.role !== match.role) {
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/student/:path*", "/teacher/:path*", "/admin/:path*"],
};
