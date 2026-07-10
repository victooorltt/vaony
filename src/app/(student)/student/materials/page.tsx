import { ArrowDownTrayIcon, DocumentIcon } from "@heroicons/react/24/outline";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { formatInTz } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function StudentMaterialsPage() {
  const user = (await getSession())!;
  const enrollments = await db.enrollment.findMany({
    where: { studentId: user.id },
    select: { courseId: true },
  });
  const materials = await db.material.findMany({
    where: {
      OR: [
        { studentId: user.id },
        { courseId: { in: enrollments.map((e) => e.courseId) } },
      ],
    },
    include: { course: true, uploader: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl font-bold text-vaony-ink">Course materials</h1>
      <p className="mt-2 text-sm text-vaony-ink/60">
        Files your teachers shared with you — per course or just for you.
      </p>
      {materials.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No materials yet"
            body="When your teacher uploads exercises or notes, they'll show up here."
          />
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-vaony-ink/8 rounded-2xl border border-vaony-ink/8 bg-white">
          {materials.map((m) => (
            <li key={m.id} className="flex items-center gap-4 p-4">
              <span className="rounded-xl bg-vaony-blue/8 p-2.5">
                <DocumentIcon className="h-5 w-5 text-vaony-blue" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-vaony-ink">{m.title}</p>
                <p className="font-mono text-[11px] text-vaony-ink/50">
                  {m.course?.title ?? "Personal"} · {m.uploader.firstName} {m.uploader.lastName} ·{" "}
                  {formatInTz(m.createdAt, user.timezone, "MMM d, yyyy")} ·{" "}
                  {(m.sizeBytes / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              <a
                href={m.fileUrl}
                download
                className="inline-flex items-center gap-1.5 rounded-xl border border-vaony-blue/30 px-3 py-1.5 text-sm font-medium text-vaony-blue transition hover:bg-vaony-blue/5"
              >
                <ArrowDownTrayIcon className="h-4 w-4" /> Download
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
