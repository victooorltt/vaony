import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Avatar } from "@/components/ui/Avatar";
import { Rating } from "@/components/ui/Rating";
import { SoftwareBadge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Teachers",
  description:
    "Meet the engineers and specialists who teach on Vaony: mathematics, physics, programming, CNC, fluid mechanics and more.",
};

export default async function TeachersPage() {
  const teachers = await db.teacherProfile.findMany({
    where: { user: { status: "ACTIVE" } },
    include: {
      user: true,
      softwareTags: { include: { tag: true }, take: 5 },
      courses: { include: { course: true }, take: 3 },
    },
    orderBy: { ratingAvg: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-wider text-vaony-blue">directory</p>
      <h1 className="mt-2 font-display text-4xl font-bold text-vaony-ink">Our teachers</h1>
      <p className="mt-3 max-w-2xl text-vaony-ink/65">
        Qualified engineers and specialists from different fields — every profile
        shows real credentials, the software they work with, and ratings from
        their students.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {teachers.map((t, i) => (
          <Reveal key={t.id} delay={(i % 3) * 80}>
            <Link
              href={`/teachers/${t.userId}`}
              className="group block h-full rounded-2xl border border-vaony-ink/8 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-vaony-blue/10"
            >
              <div className="flex items-center gap-4">
                <Avatar firstName={t.user.firstName} lastName={t.user.lastName} src={t.user.avatarUrl} size="lg" />
                <div>
                  <h2 className="font-display font-semibold text-vaony-ink group-hover:text-vaony-blue">
                    {t.user.firstName} {t.user.lastName}
                  </h2>
                  <p className="text-xs text-vaony-ink/55">{t.title}</p>
                  <Rating value={t.ratingAvg} count={t.ratingCount} className="mt-1" />
                </div>
              </div>
              <p className="mt-3 font-mono text-xs text-vaony-blue">{t.specialization}</p>
              <p className="mt-2 text-sm text-vaony-ink/65 line-clamp-3">{t.bio}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {t.softwareTags.map((st) => (
                  <SoftwareBadge key={st.tagId} name={st.tag.name} />
                ))}
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
