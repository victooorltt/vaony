import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { teacherProfileSchema } from "@/lib/validators";

export async function PATCH(request: NextRequest) {
  const auth = await requireRole(["TEACHER"]);
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = teacherProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { softwareTags, linkedinUrl, githubUrl, websiteUrl, ...fields } = parsed.data;

  const profile = await db.teacherProfile.upsert({
    where: { userId: auth.user.id },
    update: {
      ...fields,
      linkedinUrl: linkedinUrl || null,
      githubUrl: githubUrl || null,
      websiteUrl: websiteUrl || null,
    },
    create: {
      userId: auth.user.id,
      ...fields,
      linkedinUrl: linkedinUrl || null,
      githubUrl: githubUrl || null,
      websiteUrl: websiteUrl || null,
    },
  });

  if (softwareTags) {
    await db.teacherSoftwareTag.deleteMany({ where: { profileId: profile.id } });
    for (const name of softwareTags) {
      const tag = await db.softwareTag.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      await db.teacherSoftwareTag.create({
        data: { profileId: profile.id, tagId: tag.id },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
