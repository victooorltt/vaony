import { db } from "@/lib/db";
import { formatInTz } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AdminInboxPage() {
  const messages = await db.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl font-bold text-vaony-ink">Contact inbox</h1>
      {messages.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="Inbox empty" body="Messages from the public contact form land here." />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {messages.map((m) => (
            <Card key={m.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display font-semibold text-vaony-ink">{m.subject}</p>
                  <p className="text-xs text-vaony-ink/55">
                    {m.name} · <a href={`mailto:${m.email}`} className="text-vaony-blue hover:underline">{m.email}</a>
                    {m.phone && ` · ${m.phone}`}
                  </p>
                </div>
                <span className="text-[11px] text-vaony-ink/45">
                  {formatInTz(m.createdAt, "America/Mexico_City", "MMM d, HH:mm")}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm text-vaony-ink/75">{m.message}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
