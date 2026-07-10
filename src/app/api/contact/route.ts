import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactSchema } from "@/lib/validators";
import { getMailer, templates } from "@/lib/mail";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { name, email, phone, subject, message } = parsed.data;

  await db.contactMessage.create({
    data: { name, email, phone: phone || null, subject, message },
  });

  const mailer = getMailer();
  await Promise.all([
    mailer.send({ to: email, subject: "We got your message — Vaony", html: templates.contactAutoReply(name) }),
    mailer.send({ to: "admin@vaony.com", subject: `[Contact] ${subject}`, html: templates.contactAdminNotice(name, email, subject, message) }),
  ]);

  return NextResponse.json({ ok: true });
}
