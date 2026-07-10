import { DocumentIcon } from "@heroicons/react/24/outline";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { formatInTz } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { ResourceUploadForm } from "@/components/forms/ResourceUploadForm";
import { DeleteMaterialButton } from "@/components/forms/DeleteMaterialButton";

export default async function TeacherResourcesPage() {
  const user = (await getSession())!;

  const [profile, enrollments, materials] = await Promise.all([
    db.teacherProfile.findUnique({
      where: { userId: user.id },
      include: { courses: { include: { course: true } } },
    }),
    db.enrollment.findMany({
      where: { teacherId: user.id },
      include: { student: true },
      distinct: ["studentId"],
    }),
    db.material.findMany({
      where: { uploaderId: user.id },
      include: { course: true, student: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-vaony-ink">Resources</h1>
        <p className="mt-1 text-sm text-vaony-ink/60">
          Upload materials per student or per course group — files live in
          private storage, visible only to assigned students.
        </p>
      </div>

      <Card>
        <ResourceUploadForm
          courses={profile?.courses.map((ct) => ({ id: ct.course.id, title: ct.course.title })) ?? []}
          students={enrollments.map((e) => ({
            id: e.student.id,
            name: `${e.student.firstName} ${e.student.lastName}`,
          }))}
        />
      </Card>

      <section>
        <h2 className="font-display text-xl font-semibold text-vaony-ink">Uploaded materials</h2>
        {materials.length === 0 ? (
          <p className="mt-3 text-sm text-vaony-ink/50">Nothing uploaded yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-vaony-ink/8 rounded-2xl border border-vaony-ink/8 bg-white">
            {materials.map((m) => (
              <li key={m.id} className="flex items-center gap-4 p-4">
                <span className="rounded-xl bg-vaony-blue/8 p-2.5">
                  <DocumentIcon className="h-5 w-5 text-vaony-blue" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-vaony-ink">{m.title}</p>
                  <p className="font-mono text-[11px] text-vaony-ink/50">
                    {m.course?.title ?? `${m.student?.firstName} ${m.student?.lastName}`} ·{" "}
                    {formatInTz(m.createdAt, user.timezone, "MMM d, yyyy")} ·{" "}
                    {(m.sizeBytes / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
                <a href={m.fileUrl} className="text-sm text-vaony-blue hover:underline">Open</a>
                <DeleteMaterialButton id={m.id} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
