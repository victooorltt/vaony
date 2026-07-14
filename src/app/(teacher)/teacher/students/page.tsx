import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { formatInTz } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function TeacherStudentsPage() {
  const user = (await getSession())!;

  const enrollments = await db.enrollment.findMany({
    where: { teacherId: user.id },
    include: { student: true, course: true },
    orderBy: { createdAt: "desc" },
  });

  const sessionHistory = await db.booking.findMany({
    where: { teacherId: user.id },
    orderBy: { startsAt: "desc" },
    take: 200,
    select: { studentId: true, status: true, startsAt: true, notes: true, course: { select: { title: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl font-bold text-vaony-ink">My students</h1>
      {enrollments.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No students yet" body="When students enroll in your courses they'll appear here with their session history." />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {enrollments.map((e) => {
            const history = sessionHistory.filter((s) => s.studentId === e.studentId);
            return (
              <Card key={e.id}>
                <div className="flex items-center gap-3">
                  <Avatar firstName={e.student.firstName} lastName={e.student.lastName} src={e.student.avatarUrl} />
                  <div className="flex-1">
                    <p className="font-medium text-vaony-ink">
                      {e.student.firstName} {e.student.lastName}
                    </p>
                    <p className="text-xs text-vaony-ink/55">
                      {e.course.title} · progress {e.progress}%
                    </p>
                  </div>
                  <Badge tone={e.status === "ACTIVE" ? "green" : "neutral"}>{e.status.toLowerCase()}</Badge>
                </div>
                {history.length > 0 && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs text-vaony-blue">
                      session history ({history.length})
                    </summary>
                    <ul className="mt-2 space-y-1.5 border-l-2 border-vaony-blue/15 pl-4">
                      {history.slice(0, 8).map((s, i) => (
                        <li key={i} className="text-xs text-vaony-ink/65">
                          <span>{formatInTz(s.startsAt, user.timezone, "MMM d, yyyy HH:mm")}</span>
                          {" · "}{s.course.title}{" · "}
                          <span className="lowercase">{s.status}</span>
                          {s.notes && <span className="block text-vaony-ink/50">note: {s.notes}</span>}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
