import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validators";
import { hashPassword } from "@/lib/auth/passwords";
import { createSession, toSessionUser } from "@/lib/auth/session";
import { getMailer, templates } from "@/lib/mail";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const { firstName, lastName, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const user = await db.user.create({
    data: {
      email,
      firstName,
      lastName,
      passwordHash: await hashPassword(password),
      role: "STUDENT",
    },
  });

  await createSession(toSessionUser(user));
  await getMailer().send({
    to: email,
    subject: "Welcome to Vaony",
    html: templates.welcome(firstName),
  });

  return NextResponse.json({ ok: true, redirect: "/student/dashboard" });
}
