import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validators";
import { getMailer, templates } from "@/lib/mail";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  // Always respond ok — never reveal whether the email exists.
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    await db.passwordReset.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    const link = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    await getMailer().send({
      to: user.email,
      subject: "Reset your Vaony password",
      html: templates.passwordReset(link),
    });
  }

  return NextResponse.json({ ok: true });
}
