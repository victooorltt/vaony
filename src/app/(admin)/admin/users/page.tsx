import { db } from "@/lib/db";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { AdminActionButton } from "@/components/admin/AdminActionButton";

export default async function AdminUsersPage() {
  const users = await db.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl font-bold text-vaony-ink">Users</h1>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-vaony-ink/8 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-vaony-ink/8 text-left text-[11px] uppercase tracking-wider text-vaony-ink/50">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vaony-ink/5">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar firstName={u.firstName} lastName={u.lastName} src={u.avatarUrl} size="sm" />
                    <div>
                      <p className="font-medium text-vaony-ink">{u.firstName} {u.lastName}</p>
                      <p className="text-[11px] text-vaony-ink/50">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={u.role === "ADMIN" ? "amber" : u.role === "TEACHER" ? "blue" : "neutral"}>
                    {u.role.toLowerCase()}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={u.status === "ACTIVE" ? "green" : "red"}>{u.status.toLowerCase()}</Badge>
                </td>
                <td className="px-4 py-3">
                  {u.role !== "ADMIN" &&
                    (u.status === "ACTIVE" ? (
                      <AdminActionButton
                        endpoint={`/api/admin/users/${u.id}`}
                        payload={{ status: "SUSPENDED" }}
                        label="Suspend"
                        variant="danger"
                      />
                    ) : (
                      <AdminActionButton
                        endpoint={`/api/admin/users/${u.id}`}
                        payload={{ status: "ACTIVE" }}
                        label="Reactivate"
                      />
                    ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
