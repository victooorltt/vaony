import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { requireRole } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/passwords";
import { getMailer, templates } from "@/lib/mail";

/** Approve creates the teacher account + profile; reject just marks it. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(["ADMIN"]);
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const body = (await request.json().catch(() => ({}))) as { action?: string };
  const application = await db.teacherApplication.findUnique({ where: { id } });
  if (!application || application.status !== "PENDING") {
    return NextResponse.json({ error: "Application not found or already handled" }, { status: 404 });
  }

  if (body.action === "reject") {
    await db.teacherApplication.update({ where: { id }, data: { status: "REJECTED" } });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "approve") {
    const existing = await db.user.findUnique({ where: { email: application.email } });
    if (existing) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }
    const [firstName, ...rest] = application.fullName.split(" ");
    const tempPassword = crypto.randomBytes(6).toString("hex");
    const user = await db.user.create({
      data: {
        email: application.email,
        firstName: firstName ?? "Teacher",
        lastName: rest.join(" ") || "—",
        passwordHash: await hashPassword(tempPassword),
        role: "TEACHER",
      },
    });
    await db.teacherProfile.create({
      data: {
        userId: user.id,
        specialization: application.specialization,
        bio: application.bio,
      },
    });
    await db.teacherApplication.update({ where: { id }, data: { status: "APPROVED" } });
    await getMailer().send({
      to: application.email,
      subject: "Your Vaony teacher account is ready",
      html: templates.welcome(firstName ?? "Teacher") +
        `<p style="font-family:Arial;max-width:560px;margin:0 auto;padding:0 32px 32px;color:#000B36">Temporary password: <strong>${tempPassword}</strong> — change it after your first login.</p>`,
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
