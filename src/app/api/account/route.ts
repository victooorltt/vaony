import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/passwords";
import { createSession, toSessionUser } from "@/lib/auth/session";
import { getStorage, isAllowed, MAX_UPLOAD_BYTES } from "@/lib/storage";

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Invalid form" }, { status: 400 });

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "");

  if (firstName.length < 2 || lastName.length < 2) {
    return NextResponse.json({ error: "Name is too short" }, { status: 400 });
  }
  if (newPassword && newPassword.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  let avatarUrl: string | undefined;
  const avatar = formData.get("avatar");
  if (avatar instanceof File && avatar.size > 0) {
    if (avatar.size > MAX_UPLOAD_BYTES || !isAllowed(avatar.name, "avatars")) {
      return NextResponse.json({ error: "Avatar must be an image under 10 MB" }, { status: 400 });
    }
    avatarUrl = await getStorage().save(
      Buffer.from(await avatar.arrayBuffer()),
      avatar.name,
      "avatars"
    );
  }

  const updated = await db.user.update({
    where: { id: auth.user.id },
    data: {
      firstName,
      lastName,
      timezone: timezone || undefined,
      ...(avatarUrl ? { avatarUrl } : {}),
      ...(newPassword ? { passwordHash: await hashPassword(newPassword) } : {}),
    },
  });

  // Re-issue the access token so the session reflects the new data
  await createSession(toSessionUser(updated));

  return NextResponse.json({ ok: true });
}
