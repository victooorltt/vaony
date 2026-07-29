import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import {
  AcademicCapIcon,
  BriefcaseIcon,
  ClockIcon,
  LanguageIcon,
  LinkIcon,
  PlayCircleIcon,
  SparklesIcon,
  BookOpenIcon,
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon, StarIcon } from "@heroicons/react/24/solid";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { getAvailableSlots } from "@/lib/availability";
import { formatMoney, initials, parseYouTubeId } from "@/lib/utils";
import { Badge, SoftwareBadge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { AvailabilityWeek, type AvailabilityDay } from "@/components/teachers/AvailabilityWeek";
import { ContactTeacherDialog } from "@/components/teachers/ContactTeacherDialog";
import { TeacherProfileActions } from "@/components/teachers/TeacherProfileActions";
import { YouTubePreview } from "@/components/teachers/YouTubePreview";

export const dynamic = "force-dynamic";

const AVAILABILITY_DAYS = 14;
const MAX_SLOTS_PER_DAY = 8;
const MAX_DAYS_SHOWN = 10;

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
  const name = `${profile.user.firstName} ${profile.user.lastName}`;
  return {
    title: `${name} — ${profile.specialization ?? "Profesor"} | Vaony`,
    description:
      profile.bio?.slice(0, 160) ??
      `Reserva clases online con ${name} en Vaony.`,
  };
}

/** Groups free slots into day buckets, pre-formatted in the teacher's timezone
 *  so server and client render exactly the same strings. */
function buildAvailability(
  slots: { startsAt: string }[],
  timezone: string
): AvailabilityDay[] {
  const byDay = new Map<string, string[]>();
  for (const slot of slots) {
    const key = formatInTimeZone(slot.startsAt, timezone, "yyyy-MM-dd");
    const time = formatInTimeZone(slot.startsAt, timezone, "HH:mm");
    const times = byDay.get(key);
    if (times) {
      if (times.length < MAX_SLOTS_PER_DAY) times.push(time);
    } else {
      byDay.set(key, [time]);
    }
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, MAX_DAYS_SHOWN)
    .map(([key, times]) => {
      const reference = new Date(`${key}T12:00:00Z`);
      return {
        key,
        weekdayLabel: formatInTimeZone(reference, timezone, "EEE", { locale: es }),
        dayLabel: formatInTimeZone(reference, timezone, "d MMM", { locale: es }),
        times,
      };
    });
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
      credentials: { orderBy: { createdAt: "asc" } },
      portfolioItems: { orderBy: { createdAt: "asc" } },
      courses: { include: { course: { include: { category: true } } } },
    },
  });
  if (!profile) notFound();

  const from = new Date();
  const to = new Date(from.getTime() + AVAILABILITY_DAYS * 24 * 60 * 60 * 1000);

  const [reviews, ratingBuckets, slots, session] = await Promise.all([
    db.review.findMany({
      where: { teacherId: id },
      include: { student: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.review.groupBy({
      by: ["rating"],
      where: { teacherId: id },
      _count: { rating: true },
    }),
    getAvailableSlots(id, from, to),
    getSession(),
  ]);

  const fullName = `${profile.user.firstName} ${profile.user.lastName}`;
  const certified = profile.credentials.length > 0;
  const languages = profile.languages
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);
  const extraSubjects = (profile.extraSubjects ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const coursePrices = profile.courses.map(({ course }) => course.price);
  const minPrice = coursePrices.length > 0 ? Math.min(...coursePrices) : null;
  const currency = profile.courses[0]?.course.currency ?? "USD";

  const categories = [
    ...new Map(
      profile.courses.map(({ course }) => [course.category.id, course.category.name])
    ).values(),
  ];

  const videoId = parseYouTubeId(profile.youtubeUrl);
  const availability = buildAvailability(slots, profile.user.timezone);
  const timezoneLabel = `Horario del profesor · ${formatInTimeZone(from, profile.user.timezone, "OOO")}`;

  // Signed-out visitors are routed to sign-up; students go straight to booking.
  const bookingHref =
    session?.role === "STUDENT" ? "/student/calendar" : "/register/student";

  const totalReviews = ratingBuckets.reduce((sum, b) => sum + b._count.rating, 0);
  const ratingRows = [5, 4, 3, 2, 1].map((stars) => {
    const count = ratingBuckets.find((b) => b.rating === stars)?._count.rating ?? 0;
    return {
      stars,
      count,
      pct: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0,
    };
  });

  const links = [
    { href: profile.linkedinUrl, label: "LinkedIn" },
    { href: profile.githubUrl, label: "GitHub" },
    { href: profile.websiteUrl, label: "Sitio web" },
  ].filter((l): l is { href: string; label: string } => Boolean(l.href));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: fullName,
    jobTitle: profile.title,
    description: profile.bio,
    image: profile.user.avatarUrl ?? undefined,
    knowsLanguage: languages,
    knowsAbout: [profile.specialization, ...extraSubjects].filter(Boolean),
    ...(profile.ratingCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: profile.ratingAvg.toFixed(1),
        reviewCount: profile.ratingCount,
        bestRating: 5,
      },
    }),
  };

  return (
    <div className="pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        {/* Breadcrumb */}
        <nav aria-label="Ruta de navegación" className="text-xs text-vaony-ink/50">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-vaony-blue">Inicio</Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/teachers" className="hover:text-vaony-blue">Profesores</Link>
            </li>
            <li aria-hidden>/</li>
            <li className="font-medium text-vaony-ink/75">{fullName}</li>
          </ol>
        </nav>

        {/* ---- HEADER ---- */}
        <header className="mt-5 overflow-hidden rounded-3xl border border-vaony-ink/8 bg-white shadow-sm">
          <div className="brand-gradient h-1.5 w-full" />
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[200px_1fr]">
            <div className="mx-auto w-40 sm:w-48 lg:mx-0 lg:w-full">
              {profile.user.avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={profile.user.avatarUrl}
                  alt={fullName}
                  className="aspect-square w-full rounded-2xl object-cover shadow-md"
                />
              ) : (
                <span
                  aria-hidden
                  className="brand-gradient flex aspect-square w-full items-center justify-center rounded-2xl font-display text-4xl font-bold text-white"
                >
                  {initials(profile.user.firstName, profile.user.lastName)}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display text-3xl font-bold text-vaony-ink sm:text-4xl">
                  {fullName}
                </h1>
                {certified && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-vaony-amber/35 bg-vaony-amber/12 px-3 py-1 text-xs font-bold text-amber-700">
                    <CheckBadgeIcon className="h-4 w-4" />
                    Profesor certificado
                  </span>
                )}
              </div>

              <p className="mt-2 text-base font-semibold text-vaony-blue">
                {profile.specialization}
              </p>
              <p className="text-sm text-vaony-ink/60">{profile.title}</p>

              {/* Fact strip */}
              <dl className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                <div className="flex items-center gap-1.5">
                  <StarIcon className="h-4.5 w-4.5 text-vaony-amber" />
                  <dt className="sr-only">Calificación</dt>
                  <dd>
                    <span className="font-display font-bold text-vaony-ink">
                      {profile.ratingAvg > 0 ? profile.ratingAvg.toFixed(1) : "—"}
                    </span>
                    <span className="ml-1 text-vaony-ink/50">
                      ({profile.ratingCount} reseñas)
                    </span>
                  </dd>
                </div>

                {profile.yearsExperience !== null && (
                  <div className="flex items-center gap-1.5 text-vaony-ink/70">
                    <ClockIcon className="h-4.5 w-4.5 text-vaony-ink/40" />
                    <dt className="sr-only">Experiencia</dt>
                    <dd>
                      <span className="font-semibold text-vaony-ink">
                        {profile.yearsExperience} años
                      </span>{" "}
                      de experiencia
                    </dd>
                  </div>
                )}

                {languages.length > 0 && (
                  <div className="flex items-center gap-1.5 text-vaony-ink/70">
                    <LanguageIcon className="h-4.5 w-4.5 text-vaony-ink/40" />
                    <dt className="sr-only">Idiomas</dt>
                    <dd>{languages.join(" · ")}</dd>
                  </div>
                )}
              </dl>

              {/* Actions */}
              <div className="mt-7 flex flex-col gap-3 border-t border-vaony-ink/8 pt-6 sm:flex-row sm:items-center">
                <Link
                  href={bookingHref}
                  className="brand-gradient inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-vaony-blue/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-vaony-blue/40"
                >
                  Reservar una clase
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>

                <div className="sm:w-40">
                  <ContactTeacherDialog
                    teacherName={fullName}
                    specialization={profile.specialization}
                    defaults={
                      session
                        ? {
                            name: `${session.firstName} ${session.lastName}`,
                            email: session.email,
                          }
                        : undefined
                    }
                  />
                </div>

                <div className="sm:ml-auto">
                  <TeacherProfileActions teacherId={profile.userId} teacherName={fullName} />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ---- BODY ---- */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0 space-y-12">

            {/* Sobre mí */}
            {profile.bio && (
              <Reveal>
                <section>
                  <h2 className="font-display text-xl font-bold text-vaony-ink">Sobre mí</h2>
                  <p className="mt-4 whitespace-pre-line leading-relaxed text-vaony-ink/70">
                    {profile.bio}
                  </p>
                </section>
              </Reveal>
            )}

            {/* Especialidades */}
            <Reveal>
              <section>
                <h2 className="flex items-center gap-2 font-display text-xl font-bold text-vaony-ink">
                  <SparklesIcon className="h-5 w-5 text-vaony-blue" />
                  Especialidades
                </h2>

                <div className="mt-5 rounded-2xl border border-vaony-ink/8 bg-white p-6">
                  {profile.specialization && (
                    <>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-vaony-ink/45">
                        Área principal
                      </p>
                      <p className="mt-1.5 font-display text-lg font-bold text-vaony-ink">
                        {profile.specialization}
                      </p>
                    </>
                  )}

                  {categories.length > 0 && (
                    <div className="mt-5 border-t border-vaony-ink/8 pt-5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-vaony-ink/45">
                        Áreas de conocimiento
                      </p>
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {categories.map((name) => (
                          <Badge key={name} tone="blue">{name}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.softwareTags.length > 0 && (
                    <div className="mt-5 border-t border-vaony-ink/8 pt-5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-vaony-ink/45">
                        Software y herramientas
                      </p>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {profile.softwareTags.map((st) => (
                          <SoftwareBadge key={st.tagId} name={st.tag.name} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </Reveal>

            {/* Vídeo de presentación */}
            {videoId && (
              <Reveal>
                <section>
                  <h2 className="flex items-center gap-2 font-display text-xl font-bold text-vaony-ink">
                    <PlayCircleIcon className="h-5 w-5 text-vaony-blue" />
                    Vídeo de presentación
                  </h2>
                  <p className="mt-2 text-sm text-vaony-ink/60">
                    Conoce su forma de explicar antes de reservar.
                  </p>
                  <div className="mt-5">
                    <YouTubePreview videoId={videoId} title={fullName} />
                  </div>
                </section>
              </Reveal>
            )}

            {/* Disponibilidad */}
            <Reveal>
              <section id="disponibilidad" className="scroll-mt-24">
                <h2 className="font-display text-xl font-bold text-vaony-ink">
                  Calendario de disponibilidad
                </h2>
                <p className="mt-2 text-sm text-vaony-ink/60">
                  Elige un hueco libre y reserva tu clase en vivo.
                </p>
                <div className="mt-5">
                  <AvailabilityWeek
                    days={availability}
                    timezoneLabel={timezoneLabel}
                    bookingHref={bookingHref}
                  />
                </div>
              </section>
            </Reveal>

            {/* Certificados */}
            {profile.credentials.length > 0 && (
              <Reveal>
                <section>
                  <h2 className="flex items-center gap-2 font-display text-xl font-bold text-vaony-ink">
                    <AcademicCapIcon className="h-5 w-5 text-vaony-blue" />
                    Certificados y credenciales
                  </h2>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {profile.credentials.map((c) => (
                      <li
                        key={c.id}
                        className="flex gap-4 rounded-2xl border border-vaony-ink/8 bg-white p-5 transition duration-200 hover:border-vaony-blue/25 hover:shadow-md"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vaony-blue/10 text-vaony-blue">
                          <AcademicCapIcon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-vaony-ink">{c.title}</p>
                          <p className="mt-0.5 text-xs text-vaony-ink/55">{c.institution}</p>
                          {c.fileUrl && (
                            <a
                              href={c.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-vaony-blue hover:underline"
                            >
                              Ver certificado
                              <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            )}

            {/* Proyectos */}
            {profile.portfolioItems.length > 0 && (
              <Reveal>
                <section>
                  <h2 className="flex items-center gap-2 font-display text-xl font-bold text-vaony-ink">
                    <BriefcaseIcon className="h-5 w-5 text-vaony-blue" />
                    Proyectos y portafolio
                  </h2>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {profile.portfolioItems.map((p) => (
                      <li key={p.id}>
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex h-full flex-col justify-between rounded-2xl border border-vaony-ink/8 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-vaony-blue/25 hover:shadow-lg hover:shadow-vaony-blue/5"
                        >
                          <div>
                            <Badge tone="neutral">{p.type.toLowerCase()}</Badge>
                            <p className="mt-3 font-semibold text-vaony-ink transition-colors group-hover:text-vaony-blue">
                              {p.title}
                            </p>
                          </div>
                          <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-vaony-blue">
                            Abrir proyecto
                            <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            )}

            {/* Reseñas y comentarios */}
            <Reveal>
              <section id="resenas" className="scroll-mt-24">
                <h2 className="font-display text-xl font-bold text-vaony-ink">
                  Comentarios y reseñas
                </h2>

                {totalReviews > 0 ? (
                  <>
                    <div className="mt-5 grid gap-8 rounded-2xl border border-vaony-ink/8 bg-white p-6 sm:grid-cols-[auto_1fr] sm:gap-10">
                      <div className="text-center sm:text-left">
                        <div className="font-display text-5xl font-extrabold text-vaony-ink">
                          {profile.ratingAvg.toFixed(1)}
                        </div>
                        <div className="mt-1.5 flex justify-center gap-0.5 sm:justify-start">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <StarIcon
                              key={i}
                              className={
                                i <= Math.round(profile.ratingAvg)
                                  ? "h-4 w-4 text-vaony-amber"
                                  : "h-4 w-4 text-vaony-ink/15"
                              }
                            />
                          ))}
                        </div>
                        <p className="mt-1.5 text-xs text-vaony-ink/55">
                          {profile.ratingCount} valoraciones
                        </p>
                      </div>

                      <div className="space-y-2">
                        {ratingRows.map((row) => (
                          <div key={row.stars} className="flex items-center gap-3">
                            <span className="w-10 shrink-0 text-xs font-medium text-vaony-ink/60">
                              {row.stars} ★
                            </span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-vaony-ink/8">
                              <div
                                className="h-full rounded-full bg-vaony-amber"
                                style={{ width: `${row.pct}%` }}
                              />
                            </div>
                            <span className="w-8 shrink-0 text-right text-xs text-vaony-ink/45">
                              {row.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <ul className="mt-5 space-y-3">
                      {reviews.map((r) => (
                        <li
                          key={r.id}
                          className="rounded-2xl border border-vaony-ink/8 bg-white p-5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <span
                                aria-hidden
                                className="brand-gradient flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-xs font-semibold text-white"
                              >
                                {initials(r.student.firstName, r.student.lastName)}
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-vaony-ink">
                                  {r.student.firstName} {r.student.lastName[0]}.
                                </p>
                                <p className="text-[11px] text-vaony-ink/45">
                                  {formatInTimeZone(r.createdAt, profile.user.timezone, "d 'de' MMMM 'de' yyyy", { locale: es })}
                                </p>
                              </div>
                            </div>
                            <div className="flex shrink-0 gap-0.5">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <StarIcon
                                  key={i}
                                  className={
                                    i <= r.rating
                                      ? "h-3.5 w-3.5 text-vaony-amber"
                                      : "h-3.5 w-3.5 text-vaony-ink/15"
                                  }
                                />
                              ))}
                            </div>
                          </div>
                          {r.comment && (
                            <p className="mt-3 text-sm leading-relaxed text-vaony-ink/70">
                              {r.comment}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <div className="mt-5 rounded-2xl border border-dashed border-vaony-ink/15 bg-white p-8 text-center">
                    <p className="font-medium text-vaony-ink">Todavía no hay reseñas</p>
                    <p className="mt-1.5 text-sm text-vaony-ink/60">
                      Reserva la primera clase y deja tu valoración al terminar.
                    </p>
                  </div>
                )}
              </section>
            </Reveal>
          </div>

          {/* ---- SIDEBAR ---- */}
          <aside className="h-fit space-y-6 lg:sticky lg:top-24">
            {/* Booking card */}
            <div className="rounded-2xl border border-vaony-ink/8 bg-white p-6 shadow-sm">
              {minPrice !== null ? (
                <>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-vaony-ink/45">
                    Costo por clase
                  </p>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="font-display text-3xl font-extrabold text-vaony-ink">
                      {formatMoney(minPrice, currency)}
                    </span>
                    <span className="text-sm text-vaony-ink/55">/clase</span>
                  </div>
                </>
              ) : (
                <p className="font-display text-lg font-bold text-vaony-ink">
                  Consulta la tarifa
                </p>
              )}

              <Link
                href={bookingHref}
                className="brand-gradient mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-vaony-blue/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-vaony-blue/40"
              >
                Reservar una clase
                <ArrowRightIcon className="h-4 w-4" />
              </Link>

              <a
                href="#disponibilidad"
                className="mt-3 block text-center text-xs font-semibold text-vaony-blue hover:underline"
              >
                Ver horarios disponibles
              </a>

              <p className="mt-5 border-t border-vaony-ink/8 pt-4 text-xs leading-relaxed text-vaony-ink/55">
                Reprogramación sin coste hasta 24 h antes de la clase.
              </p>
            </div>

            {/* Materias que imparte */}
            {profile.courses.length > 0 && (
              <div>
                <h2 className="flex items-center gap-2 font-display text-base font-bold text-vaony-ink">
                  <BookOpenIcon className="h-4.5 w-4.5 text-vaony-blue" />
                  Materias que imparte
                </h2>
                <div className="mt-3 space-y-2.5">
                  {profile.courses.map(({ course }) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.slug}`}
                      className="block rounded-xl border border-vaony-ink/8 bg-white p-4 transition hover:border-vaony-blue/30 hover:shadow-md"
                    >
                      <Badge tone="blue">{course.category.name}</Badge>
                      <p className="mt-2 text-sm font-semibold text-vaony-ink">
                        {course.title}
                      </p>
                      <p className="mt-1 text-sm text-vaony-deep">
                        {formatMoney(course.price, course.currency)}
                        <span className="text-vaony-ink/45"> /clase</span>
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Materias adicionales */}
            {extraSubjects.length > 0 && (
              <div>
                <h2 className="font-display text-base font-bold text-vaony-ink">
                  Materias adicionales
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-vaony-ink/55">
                  Temas que también prepara a petición.
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {extraSubjects.map((subject) => (
                    <li
                      key={subject}
                      className="rounded-lg border border-vaony-ink/10 bg-white px-3 py-1.5 text-xs font-medium text-vaony-ink/75"
                    >
                      {subject}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Enlaces */}
            {links.length > 0 && (
              <div>
                <h2 className="flex items-center gap-2 font-display text-base font-bold text-vaony-ink">
                  <LinkIcon className="h-4.5 w-4.5 text-vaony-blue" />
                  Enlaces
                </h2>
                <ul className="mt-3 space-y-2">
                  {links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-xl border border-vaony-ink/8 bg-white px-4 py-3 text-sm font-medium text-vaony-ink/80 transition hover:border-vaony-blue/30 hover:text-vaony-blue"
                      >
                        {l.label}
                        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
