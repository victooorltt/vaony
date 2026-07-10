import { db } from "@/lib/db";
import { formatInTz } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { AdminActionButton } from "@/components/admin/AdminActionButton";

export default async function AdminModerationPage() {
  const messages = await db.message.findMany({
    where: { deleted: false },
    include: {
      sender: { select: { firstName: true, lastName: true, role: true } },
      conversation: {
        include: {
          student: { select: { firstName: true, lastName: true } },
          teacher: { select: { firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { sentAt: "desc" },
    take: 80,
  });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl font-bold text-vaony-ink">Chat moderation</h1>
      <p className="mt-1 text-sm text-vaony-ink/60">
        Latest messages across all conversations. Flag suspicious content or remove it.
      </p>
      <div className="mt-6 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className="rounded-2xl border border-vaony-ink/8 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-[11px] text-vaony-ink/50">
                {m.sender.firstName} {m.sender.lastName} ({m.sender.role.toLowerCase()}) →{" "}
                {m.conversation.student.firstName}/{m.conversation.teacher.firstName} ·{" "}
                {formatInTz(m.sentAt, "America/Mexico_City", "MMM d HH:mm")}
              </p>
              {m.flagged && <Badge tone="red">flagged</Badge>}
            </div>
            <p className="mt-2 text-sm text-vaony-ink">{m.body}</p>
            <div className="mt-3 flex gap-2">
              <AdminActionButton
                endpoint={`/api/admin/messages/${m.id}`}
                payload={{ action: m.flagged ? "unflag" : "flag" }}
                label={m.flagged ? "Unflag" : "Flag"}
              />
              <AdminActionButton
                endpoint={`/api/admin/messages/${m.id}`}
                payload={{ action: "delete" }}
                label="Remove"
                variant="danger"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
