import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Courses & Services",
  description:
    "One-on-one online tutoring catalog: basic mathematics, exact sciences, and engineering specialties like CNC, fluid mechanics and programming.",
};

const levelTone = { BEGINNER: "green", INTERMEDIATE: "amber", ADVANCED: "red" } as const;

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [categories, courses] = await Promise.all([
    db.category.findMany({ orderBy: { order: "asc" } }),
    db.course.findMany({
      where: {
        published: true,
        ...(category ? { category: { slug: category } } : {}),
      },
      include: {
        category: true,
        teachers: { include: { profile: { include: { user: true } } } },
      },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-wider text-vaony-blue">catalog</p>
      <h1 className="mt-2 font-display text-4xl font-bold text-vaony-ink">
        Courses &amp; services
      </h1>
      <p className="mt-3 max-w-2xl text-vaony-ink/65">
        Every course is taught live, one-on-one, and adapted to your syllabus.
        Prices are per one-hour session — save with 5 and 10 session packs.
      </p>

      {/* Category filters (server-side, SEO-friendly URLs) */}
      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/courses"
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition",
            !category
              ? "brand-gradient text-white"
              : "border border-vaony-ink/15 bg-white text-vaony-ink/70 hover:border-vaony-blue/40"
          )}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/courses?category=${c.slug}`}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition",
              category === c.slug
                ? "brand-gradient text-white"
                : "border border-vaony-ink/15 bg-white text-vaony-ink/70 hover:border-vaony-blue/40"
            )}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course, i) => (
          <Reveal key={course.id} delay={(i % 3) * 70}>
            <div className="flex h-full flex-col rounded-2xl border border-vaony-ink/8 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-vaony-blue/30 hover:shadow-lg hover:shadow-vaony-blue/10">
              <div className="flex items-center gap-2">
                <Badge tone="blue">{course.category.name}</Badge>
                <Badge tone={levelTone[course.level as keyof typeof levelTone] ?? "neutral"}>
                  {course.level.toLowerCase()}
                </Badge>
              </div>
              <h2 className="mt-3 font-display text-xl font-semibold text-vaony-ink">
                <Link href={`/courses/${course.slug}`} className="hover:text-vaony-blue">
                  {course.title}
                </Link>
              </h2>
              <p className="mt-2 flex-1 text-sm text-vaony-ink/60">{course.shortDesc}</p>
              <p className="mt-3 font-mono text-xs text-vaony-ink/50">
                {course.durationMinutes} min · online · 1-on-1
                {course.teachers[0] &&
                  ` · with ${course.teachers[0].profile.user.firstName} ${course.teachers[0].profile.user.lastName}`}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-vaony-ink/8 pt-4">
                <span className="font-mono text-lg font-semibold text-vaony-deep">
                  {formatMoney(course.price, course.currency)}
                  <span className="text-xs font-normal text-vaony-ink/40">/session</span>
                </span>
                <Link
                  href={`/courses/${course.slug}`}
                  className="brand-gradient rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:shadow-lg hover:shadow-vaony-blue/25"
                >
                  Enroll
                </Link>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {courses.length === 0 && (
        <p className="mt-12 text-center text-vaony-ink/50">
          No courses in this category yet. Check back soon.
        </p>
      )}
    </div>
  );
}
