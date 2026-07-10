import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { PortalShell } from "@/components/layout/PortalShell";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user || user.role !== "TEACHER") redirect("/login?next=/teacher/dashboard");

  const unreadCount = await db.message.count({
    where: {
      readAt: null,
      deleted: false,
      senderId: { not: user.id },
      conversation: { teacherId: user.id },
    },
  });

  return (
    <PortalShell user={user} portal="teacher" unreadCount={unreadCount}>
      {children}
    </PortalShell>
  );
}
