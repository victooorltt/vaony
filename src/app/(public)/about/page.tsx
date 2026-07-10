import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Avatar } from "@/components/ui/Avatar";
import { Rating } from "@/components/ui/Rating";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Vaony's mission: make exact sciences learnable for everyone through one-on-one tutoring with real engineers and specialists.",
};

const values = [
  {
    k: "axiom 1",
    title: "Anyone can learn this",
    body: "Exact sciences aren't a talent lottery. With the right explanation, at the right pace, the hardest subject becomes a sequence of small, solvable steps.",
  },
  {
    k: "axiom 2",
    title: "Practitioners teach best",
    body: "Our teachers use MATLAB, G-code and Navier-Stokes at work, not just on a whiteboard. You learn the subject the way it's actually used.",
  },
  {
    k: "axiom 3",
    title: "One-on-one or nothing",
    body: "No crowded group calls, no prerecorded playlists. Every session is built around your syllabus, your gaps, and your goals.",
  },
];

export default async function AboutPage() {
  const teachers = await db.teacherProfile.findMany({
    include: { user: true },
    orderBy: { ratingAvg: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-wider text-vaony-blue">about vaony</p>
      <h1 className="mt-2 max-w-2xl font-display text-4xl font-bold text-vaony-ink">
        We exist so nobody drops a career over one subject
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-vaony-ink/65">
        <strong>Mission:</strong> make exact sciences learnable for every student
        and professional, through personal online teaching by people who master
        the field. <strong>Vision:</strong> become the reference platform for
        technical tutoring in Latin America and beyond.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {values.map((v, i) => (
          <Reveal key={v.k} delay={i * 90}>
            <div className="grid-pattern h-full rounded-2xl border border-vaony-ink/8 bg-white p-6">
              <p className="font-mono text-xs text-vaony-blue">{v.k}</p>
              <h2 className="mt-2 font-display text-lg font-semibold text-vaony-ink">{v.title}</h2>
              <p className="mt-2 text-sm text-vaony-ink/65">{v.body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-16">
        <h2 className="font-display text-3xl font-bold text-vaony-ink">The team</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {teachers.map((t) => (
            <Link
              key={t.id}
              href={`/teachers/${t.userId}`}
              className="group rounded-2xl border border-vaony-ink/8 bg-white p-5 text-center transition hover:-translate-y-1 hover:shadow-lg hover:shadow-vaony-blue/10"
            >
              <Avatar firstName={t.user.firstName} lastName={t.user.lastName} src={t.user.avatarUrl} size="lg" className="mx-auto" />
              <h3 className="mt-3 font-display font-semibold text-vaony-ink group-hover:text-vaony-blue">
                {t.user.firstName} {t.user.lastName}
              </h3>
              <p className="text-xs text-vaony-ink/55">{t.specialization}</p>
              <Rating value={t.ratingAvg} className="mt-2 justify-center" />
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-16 rounded-3xl bg-vaony-ink px-6 py-12 text-center text-white grid-pattern-dark">
        <h2 className="font-display text-2xl font-bold">Are you an engineer who loves teaching?</h2>
        <p className="mx-auto mt-2 max-w-md text-white/65">
          Join Vaony, set your own schedule and earn teaching what you master.
        </p>
        <ButtonLink href="/apply-teacher" variant="amber" size="lg" className="mt-6">
          Apply to teach
        </ButtonLink>
      </div>
    </div>
  );
}
