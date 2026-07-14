import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AcademicCapIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  LanguageIcon,
} from "@heroicons/react/24/outline";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Rating } from "@/components/ui/Rating";
import { SoftwareBadge, Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const profile = await db.teacherProfile.findUnique({
    where: { userId: id },
    include: { user: true },
  });
  if (!profile) return {};
  return {
    title: `${profile.user.firstName} ${profile.user.lastName} — ${profile.specialization}`,
    description: profile.bio?.slice(0, 160),
  };
}

export default async function TeacherPublicProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await db.teacherProfile.findUnique({
    where: { userId: id },
    include: {
      user: true,
      softwareTags: { include: { tag: true } },
      credentials: true,
      portfolioItems: true,
      courses: { include: { course: { include: { category: true } } } },
    },
  });
  if (!profile) notFound();

  const reviews = await db.review.findMany({
    where: { teacherId: id },
    include: { student: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: `${profile.user.firstName} ${profile.user.lastName}`,
    jobTitle: profile.title,
    description: profile.bio,
    knowsLanguage: profile.languages.split(",").map((l) => l.trim()),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <div className="grid-pattern rounded-3xl border border-vaony-ink/8 bg-white p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar firstName={profile.user.firstName} lastName={profile.user.lastName} src={profile.user.avatarUrl} size="xl" />
          <div className="flex-1">
            <h1 className="font-display text-3xl font-bold text-vaony-ink">
              {profile.user.firstName} {profile.user.lastName}
            </h1>
            <p className="mt-1 text-vaony-ink/60">{profile.title}</p>
            <p className="text-sm text-vaony-blue">{profile.specialization}</p>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <Rating value={profile.ratingAvg} count={profile.ratingCount} />
              <span className="inline-flex items-center gap-1 text-xs text-vaony-ink/55">
                <LanguageIcon className="h-4 w-4" /> {profile.languages}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <ButtonLink href={`/register?teacher=${profile.userId}`}>
              Book a class
            </ButtonLink>
            {profile.linkedinUrl && (
              <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-center text-xs text-vaony-blue hover:underline">
                LinkedIn ↗
              </a>
            )}
            {profile.githubUrl && (
              <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-center text-xs text-vaony-blue hover:underline">
                GitHub ↗
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-10">
          <section>
            <h2 className="font-display text-xl font-semibold text-vaony-ink">About</h2>
            <p className="mt-3 whitespace-pre-line text-vaony-ink/70">{profile.bio}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {profile.softwareTags.map((st) => (
                <SoftwareBadge key={st.tagId} name={st.tag.name} />
              ))}
            </div>
          </section>

          {profile.credentials.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-vaony-ink">
                <AcademicCapIcon className="h-5 w-5 text-vaony-blue" /> Certificates &amp; credentials
              </h2>
              <ul className="mt-4 space-y-3">
                {profile.credentials.map((c) => (
                  <li key={c.id} className="rounded-xl border border-vaony-ink/8 bg-white p-4">
                    <p className="font-medium text-vaony-ink">{c.title}</p>
                    <p className="text-xs text-vaony-ink/55">{c.institution}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {profile.portfolioItems.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-vaony-ink">
                <BriefcaseIcon className="h-5 w-5 text-vaony-blue" /> Projects &amp; portfolio
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {profile.portfolioItems.map((p) => (
                  <li key={p.id} className="rounded-xl border border-vaony-ink/8 bg-white p-4">
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="font-medium text-vaony-blue hover:underline">
                      {p.title} ↗
                    </a>
                    <p className="text-[11px] text-vaony-ink/45">{p.type.toLowerCase()}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {reviews.length > 0 && (
            <section>
              <h2 className="font-display text-xl font-semibold text-vaony-ink">Student reviews</h2>
              <div className="mt-4 space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-xl border border-vaony-ink/8 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-vaony-ink">
                        {r.student.firstName} {r.student.lastName[0]}.
                      </p>
                      <Rating value={r.rating} />
                    </div>
                    {r.comment && <p className="mt-2 text-sm text-vaony-ink/65">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="h-fit space-y-4 lg:sticky lg:top-24">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-vaony-ink">
            <GlobeAltIcon className="h-5 w-5 text-vaony-blue" /> Subjects taught
          </h2>
          {profile.courses.map(({ course }) => (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="block rounded-xl border border-vaony-ink/8 bg-white p-4 transition hover:border-vaony-blue/30 hover:shadow-md"
            >
              <Badge tone="blue">{course.category.name}</Badge>
              <p className="mt-2 font-medium text-vaony-ink">{course.title}</p>
              <p className="mt-1 text-sm text-vaony-deep">
                {formatMoney(course.price, course.currency)}/session
              </p>
            </Link>
          ))}
        </aside>
      </div>
    </div>
  );
}
