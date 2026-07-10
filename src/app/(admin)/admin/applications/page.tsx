import { db } from "@/lib/db";
import { formatInTz } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AdminApplicationsPage() {
  const applications = await db.teacherApplication.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl font-bold text-vaony-ink">Teacher applications</h1>
      <p className="mt-1 text-sm text-vaony-ink/60">
        Approving creates the teacher account and emails them a temporary password.
      </p>
      {applications.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No applications" body="Submissions from the public 'Teach on Vaony' form arrive here." />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {applications.map((a) => (
            <Card key={a.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display font-semibold text-vaony-ink">{a.fullName}</p>
                  <p className="font-mono text-xs text-vaony-ink/55">
                    {a.email} · {a.specialization} · {a.yearsExperience} yrs ·{" "}
                    {formatInTz(a.createdAt, "America/Mexico_City", "MMM d, yyyy")}
                  </p>
                </div>
                <Badge tone={a.status === "PENDING" ? "amber" : a.status === "APPROVED" ? "green" : "red"}>
                  {a.status.toLowerCase()}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-vaony-ink/70">{a.bio}</p>
              {a.cvUrl && (
                <a href={a.cvUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-vaony-blue hover:underline">
                  View CV (PDF) ↗
                </a>
              )}
              {a.status === "PENDING" && (
                <div className="mt-4 flex gap-2">
                  <AdminActionButton
                    endpoint={`/api/admin/applications/${a.id}`}
                    method="POST"
                    payload={{ action: "approve" }}
                    label="Approve & create account"
                    variant="primary"
                  />
                  <AdminActionButton
                    endpoint={`/api/admin/applications/${a.id}`}
                    method="POST"
                    payload={{ action: "reject" }}
                    label="Reject"
                    variant="danger"
                  />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
