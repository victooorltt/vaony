import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckIcon } from "@heroicons/react/20/solid";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/utils";
import { Badge, SoftwareBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Rating } from "@/components/ui/Rating";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await db.course.findUnique({ where: { slug } });
  if (!course) return {};
  return { title: course.title, description: course.shortDesc };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await db.course.findUnique({
    where: { slug },
    include: {
      category: true,
      teachers: {
        include: {
          profile: {
            include: { user: true, softwareTags: { include: { tag: true }, take: 6 } },
          },
        },
      },
    },
  });
  if (!course || !course.published) notFound();

  const included = [
    "Live 1-on-1 video session tailored to your syllabus",
    "Exercises and materials in your student portal",
    "Direct chat with your teacher between sessions",
    "Session recording notes and next-step plan",
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.shortDesc,
    provider: { "@type": "Organization", name: "Vaony" },
    offers: {
      "@type": "Offer",
      price: course.price,
      priceCurrency: course.currency,
      category: course.category.name,
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="font-mono text-xs text-vaony-ink/50">
        <Link href="/courses" className="hover:text-vaony-blue">courses</Link>
        {" / "}
        <span>{course.slug}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex gap-2">
            <Badge tone="blue">{course.category.name}</Badge>
            <Badge tone="neutral">{course.level.toLowerCase()}</Badge>
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold text-vaony-ink">
            {course.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-vaony-ink/70">{course.description}</p>

          <h2 className="mt-10 font-display text-xl font-semibold text-vaony-ink">
            What&apos;s included
          </h2>
          <ul className="mt-4 space-y-2.5">
            {included.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-vaony-ink/75">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-vaony-blue" />
                {item}
              </li>
            ))}
          </ul>

          {course.teachers.length > 0 && (
            <>
              <h2 className="mt-10 font-display text-xl font-semibold text-vaony-ink">
                Taught by
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {course.teachers.map(({ profile }) => (
                  <Link
                    key={profile.id}
                    href={`/teachers/${profile.userId}`}
                    className="group rounded-2xl border border-vaony-ink/8 bg-white p-5 transition hover:border-vaony-blue/30 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar firstName={profile.user.firstName} lastName={profile.user.lastName} src={profile.user.avatarUrl} />
                      <div>
                        <p className="font-medium text-vaony-ink group-hover:text-vaony-blue">
                          {profile.user.firstName} {profile.user.lastName}
                        </p>
                        <p className="text-xs text-vaony-ink/55">{profile.title}</p>
                      </div>
                    </div>
                    <Rating value={profile.ratingAvg} count={profile.ratingCount} className="mt-3" />
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {profile.softwareTags.map((st) => (
                        <SoftwareBadge key={st.tagId} name={st.tag.name} />
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Enrollment card */}
        <aside className="h-fit lg:sticky lg:top-24">
          <div className="glass-card grid-pattern rounded-3xl p-7 shadow-xl shadow-vaony-blue/10">
            <p className="font-mono text-xs text-vaony-ink/50">price per session</p>
            <p className="mt-1 font-display text-4xl font-bold text-vaony-ink">
              {formatMoney(course.price, course.currency)}
            </p>
            <p className="mt-1 font-mono text-xs text-vaony-ink/50">
              {course.durationMinutes} min · live · 1-on-1
            </p>
            <div className="mt-6 space-y-3">
              <ButtonLink href={`/register?course=${course.slug}`} size="lg" className="w-full">
                Enroll now
              </ButtonLink>
              <ButtonLink href="/contact" variant="secondary" size="lg" className="w-full">
                Ask a question first
              </ButtonLink>
            </div>
            <p className="mt-5 text-center font-mono text-[11px] text-vaony-ink/45">
              save 10% with 5-packs · 20% with 10-packs
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
