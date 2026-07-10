import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { PortalShell } from "@/components/layout/PortalShell";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user || user.role !== "STUDENT") redirect("/login?next=/student/dashboard");

  const unreadCount = await db.message.count({
    where: {
      readAt: null,
      deleted: false,
      senderId: { not: user.id },
      conversation: { studentId: user.id },
    },
  });

  return (
    <PortalShell user={user} portal="student" unreadCount={unreadCount}>
      {children}
    </PortalShell>
  );
}
