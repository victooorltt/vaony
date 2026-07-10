import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { PortalShell } from "@/components/layout/PortalShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") redirect("/login?next=/admin/dashboard");
  return (
    <PortalShell user={user} portal="admin">
      {children}
    </PortalShell>
  );
}
