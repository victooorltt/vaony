import { db } from "@/lib/db";
import { formatMoney } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { AdminActionButton } from "@/components/admin/AdminActionButton";

export default async function AdminCoursesPage() {
  const courses = await db.course.findMany({
    include: { category: true, _count: { select: { enrollments: true } } },
    orderBy: { title: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl font-bold text-vaony-ink">Courses</h1>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-vaony-ink/8 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-vaony-ink/8 text-left font-mono text-[11px] uppercase tracking-wider text-vaony-ink/50">
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Enrolled</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vaony-ink/5">
            {courses.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium text-vaony-ink">
                  {c.title}
                  {c.featured && <Badge tone="amber" className="ml-2">featured</Badge>}
                </td>
                <td className="px-4 py-3 text-vaony-ink/60">{c.category.name}</td>
                <td className="px-4 py-3 font-mono">{formatMoney(c.price, c.currency)}</td>
                <td className="px-4 py-3 font-mono">{c._count.enrollments}</td>
                <td className="px-4 py-3">
                  <Badge tone={c.published ? "green" : "neutral"}>
                    {c.published ? "published" : "hidden"}
                  </Badge>
                </td>
                <td className="space-x-2 px-4 py-3">
                  <AdminActionButton
                    endpoint={`/api/admin/courses/${c.id}`}
                    payload={{ published: !c.published }}
                    label={c.published ? "Unpublish" : "Publish"}
                  />
                  <AdminActionButton
                    endpoint={`/api/admin/courses/${c.id}`}
                    payload={{ featured: !c.featured }}
                    label={c.featured ? "Unfeature" : "Feature"}
                    variant="ghost"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
