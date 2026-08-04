import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";

export default async function StudentCoursesPage() {
  const user = (await getSession())!;
  const enrollments = await db.enrollment.findMany({
    where: { studentId: user.id },
    include: {
      course: { include: { category: true } },
      teacher: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl font-bold text-vaony-ink">My courses</h1>
      {enrollments.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="You're not enrolled in any course"
            body="Pick a teacher and book your first class — your materials will appear here."
            action={<ButtonLink href="/teachers">Explore teachers</ButtonLink>}
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {enrollments.map((e) => (
            <Card key={e.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge tone="blue">{e.course.category.name}</Badge>
                  <h2 className="mt-2 font-display text-lg font-semibold text-vaony-ink">
                    {e.course.title}
                  </h2>
                </div>
                <Badge tone={e.status === "ACTIVE" ? "green" : "neutral"}>
                  {e.status.toLowerCase()}
                </Badge>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Avatar firstName={e.teacher.firstName} lastName={e.teacher.lastName} src={e.teacher.avatarUrl} size="sm" />
                <span className="text-sm text-vaony-ink/65">
                  {e.teacher.firstName} {e.teacher.lastName}
                </span>
              </div>
              <p className="mt-3 text-xs text-vaony-ink/50">progress: {e.progress}%</p>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-vaony-ink/8">
                <div className="brand-gradient h-full rounded-full" style={{ width: `${e.progress}%` }} />
              </div>
              <div className="mt-4 flex gap-2">
                <ButtonLink href="/student/calendar" size="sm">Book session</ButtonLink>
                <ButtonLink href="/student/materials" variant="secondary" size="sm">Materials</ButtonLink>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
