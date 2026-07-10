import Link from "next/link";
import {
  AcademicCapIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";
import { Badge, SoftwareBadge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";
import { Avatar } from "@/components/ui/Avatar";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { FunctionCurve } from "@/components/ui/FunctionCurve";
import { Reveal } from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

const benefits = [
  {
    icon: AcademicCapIcon,
    title: "Real engineers, real specialists",
    body: "Every teacher is a qualified engineer or scientist who works with what they teach — from CNC machines to CFD simulations.",
  },
  {
    icon: CalendarDaysIcon,
    title: "Book around your life",
    body: "Pick a slot on the live calendar, in your own timezone. Reminders arrive 24 hours and 1 hour before class.",
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: "Your teacher, one message away",
    body: "Built-in chat with your teacher between sessions. Send exercises, get unblocked, keep momentum.",
  },
  {
    icon: GlobeAltIcon,
    title: "100% online, one-on-one",
    body: "Live video classes tailored to your syllabus and your pace — not a prerecorded playlist.",
  },
];

export default async function HomePage() {
  const [featuredCourses, featuredTeachers] = await Promise.all([
    db.course.findMany({
      where: { published: true, featured: true },
      include: { category: true },
      take: 4,
    }),
    db.teacherProfile.findMany({
      where: { featured: true },
      include: {
        user: true,
        softwareTags: { include: { tag: true }, take: 4 },
      },
      take: 3,
    }),
  ]);

  return (
    <>
      {/* ---- Hero: the coordinate plane ---- */}
      <section className="grid-pattern section-cut-bottom relative overflow-hidden bg-vaony-paper pb-28 pt-16 sm:pt-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="font-mono text-sm text-vaony-blue">
              let subject ∈ {"{math, physics, programming, CNC…}"}
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-vaony-ink sm:text-5xl lg:text-6xl">
              The subject you&apos;re stuck on,{" "}
              <span className="brand-gradient-text">solved one-on-one.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-vaony-ink/70">
              Private online tutoring in exact sciences, engineering and
              mathematics — with engineers and specialists who use these tools
              every day.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/register" size="lg">
                Book your first class <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/courses" variant="secondary" size="lg">
                Explore courses
              </ButtonLink>
            </div>
            <p className="mt-5 font-mono text-xs text-vaony-ink/50">
              from $15/session · no subscription required
            </p>
          </div>
          <div className="glass-card animate-float rounded-3xl p-4 shadow-xl shadow-vaony-blue/10">
            <FunctionCurve className="h-auto w-full" />
          </div>
        </div>
      </section>

      {/* ---- Counters ---- */}
      <section className="bg-vaony-paper py-14">
        <Reveal>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 px-4 sm:grid-cols-3">
            <AnimatedCounter target={520} suffix="+" notation="∑ students" label="students helped" />
            <AnimatedCounter target={4300} suffix="+" notation="∑ hours" label="hours taught" />
            <AnimatedCounter target={12} notation="|courses|" label="active subjects" />
          </div>
        </Reveal>
      </section>

      {/* ---- Featured courses ---- */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <div className="flex items-end justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-vaony-blue">featured</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-vaony-ink">
                Popular courses
              </h2>
            </div>
            <Link
              href="/courses"
              className="hidden items-center gap-1 text-sm font-medium text-vaony-blue hover:underline sm:inline-flex"
            >
              View full catalog <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredCourses.map((course, i) => (
            <Reveal key={course.id} delay={i * 90}>
              <Link
                href={`/courses/${course.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-transparent bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-vaony-blue/10"
              >
                <Badge tone="blue">{course.category.name}</Badge>
                <h3 className="mt-3 font-display text-lg font-semibold text-vaony-ink group-hover:text-vaony-blue">
                  {course.title}
                </h3>
                <p className="mt-2 flex-1 text-sm text-vaony-ink/60">{course.shortDesc}</p>
                <div className="mt-4 flex items-center justify-between border-t border-transparent pt-4">
                  <span className="font-mono text-sm font-semibold text-vaony-deep">
                    {formatMoney(course.price, course.currency)}
                    <span className="font-normal text-vaony-ink/40">/h</span>
                  </span>
                  <span className="text-xs font-medium text-vaony-blue opacity-0 transition group-hover:opacity-100">
                    Enroll →
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- Benefits ---- */}
      <section className="grid-pattern-dark section-cut-top section-cut-bottom bg-vaony-ink py-24 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-wider text-vaony-amber">why vaony</p>
            <h2 className="mt-2 max-w-xl font-display text-3xl font-bold">
              Built for people who need the subject to finally make sense
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {benefits.map((b, i) => (
              <Reveal key={b.title} delay={i * 80}>
                <div className="rounded-2xl border border-transparent bg-white/5 p-6">
                  <b.icon className="h-7 w-7 text-vaony-amber" />
                  <h3 className="mt-4 font-display text-lg font-semibold">{b.title}</h3>
                  <p className="mt-2 text-sm text-white/65">{b.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Featured teachers ---- */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-wider text-vaony-blue">the team</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-vaony-ink">
            Learn from working specialists
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {featuredTeachers.map((t, i) => (
            <Reveal key={t.id} delay={i * 90}>
              <Link
                href={`/teachers/${t.userId}`}
                className="group block h-full rounded-2xl border border-transparent bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-vaony-blue/10"
              >
                <div className="flex items-center gap-4">
                  <Avatar firstName={t.user.firstName} lastName={t.user.lastName} src={t.user.avatarUrl} size="lg" />
                  <div>
                    <h3 className="font-display font-semibold text-vaony-ink group-hover:text-vaony-blue">
                      {t.user.firstName} {t.user.lastName}
                    </h3>
                    <p className="text-xs text-vaony-ink/55">{t.title}</p>
                    <Rating value={t.ratingAvg} count={t.ratingCount} className="mt-1" />
                  </div>
                </div>
                <p className="mt-4 text-sm text-vaony-ink/65 line-clamp-2">{t.bio}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {t.softwareTags.map((st) => (
                    <SoftwareBadge key={st.tagId} name={st.tag.name} />
                  ))}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- Final CTA ---- */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <Reveal>
          <div className="brand-gradient grid-pattern-dark relative overflow-hidden rounded-3xl px-6 py-14 text-center text-white sm:px-12">
            <p className="font-mono text-sm text-white/70">first_session.book()</p>
            <h2 className="mx-auto mt-3 max-w-2xl font-display text-3xl font-bold sm:text-4xl">
              Stop rereading the same chapter. Get someone who explains it.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/75">
              Create your free account, pick a teacher, and book a slot that fits
              your week — all in under five minutes.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/register" variant="amber" size="lg">
                Create free account
              </ButtonLink>
              <ButtonLink
                href="/contact"
                variant="ghost"
                size="lg"
                className="text-white hover:bg-white/10 hover:text-white"
              >
                Ask us anything
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
