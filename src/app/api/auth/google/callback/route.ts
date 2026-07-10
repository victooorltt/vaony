import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, toSessionUser } from "@/lib/auth/session";

/** Google OAuth 2.0 callback: exchanges the code, upserts the user, signs in. */
export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const code = request.nextUrl.searchParams.get("code");
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!code || !clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/login?error=google_failed`);
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${appUrl}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });
    const { access_token } = (await tokenRes.json()) as { access_token?: string };
    if (!access_token) throw new Error("No access token");

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const profile = (await profileRes.json()) as {
      id: string;
      email: string;
      given_name?: string;
      family_name?: string;
      picture?: string;
    };

    let user = await db.user.findFirst({
      where: { OR: [{ googleId: profile.id }, { email: profile.email }] },
    });
    if (!user) {
      user = await db.user.create({
        data: {
          email: profile.email,
          googleId: profile.id,
          firstName: profile.given_name ?? "Student",
          lastName: profile.family_name ?? "",
          avatarUrl: profile.picture ?? null,
          role: "STUDENT",
        },
      });
    } else if (!user.googleId) {
      user = await db.user.update({
        where: { id: user.id },
        data: { googleId: profile.id },
      });
    }

    await createSession(toSessionUser(user));
    const portal =
      user.role === "ADMIN" ? "/admin/dashboard" :
      user.role === "TEACHER" ? "/teacher/dashboard" : "/student/dashboard";
    return NextResponse.redirect(`${appUrl}${portal}`);
  } catch {
    return NextResponse.redirect(`${appUrl}/login?error=google_failed`);
  }
}
