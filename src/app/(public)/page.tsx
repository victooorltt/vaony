import type { Metadata } from "next";
import Link from "next/link";
import {
  AcademicCapIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  UserGroupIcon,
  BriefcaseIcon,
  BuildingOffice2Icon,
  UserPlusIcon,
  SparklesIcon,
  StarIcon,
  MagnifyingGlassIcon,
  UserIcon,
  ClockIcon,
  BookOpenIcon,
  ArrowRightIcon,
  CheckBadgeIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";
import { Badge, SoftwareBadge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";
import { Avatar } from "@/components/ui/Avatar";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { Reveal } from "@/components/ui/Reveal";
import { FaqAccordion, FaqItem } from "@/components/ui/FaqAccordion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "VAONY | Aprende habilidades especializadas con expertos de todo el mundo",
  description:
    "Plataforma de aprendizaje online donde puedes aprender programación, ingeniería, CNC, cálculo, mecánica de fluidos y otras especialidades con profesores expertos de distintos países.",
};

const trustItems = [
  { icon: GlobeAltIcon, text: "Profesores internacionales" },
  { icon: CheckBadgeIcon, text: "Clases 100% online" },
  { icon: ClockIcon, text: "Horarios flexibles" },
  { icon: AcademicCapIcon, text: "Aprendizaje personalizado" },
];

const benefits = [
  {
    icon: AcademicCapIcon,
    title: "Experiencia real en la industria",
    description: "Profesores con experiencia real en la industria.",
    detail: "Cada docente trabaja activamente en su especialidad, aplicando en el mundo real lo que te enseña en clase.",
  },
  {
    icon: UserGroupIcon,
    title: "Atención individual",
    description: "Clases individuales y personalizadas.",
    detail: "Sesiones en vivo 1 a 1 adaptadas exactamente a tu ritmo de estudio, necesidades y metas específicas.",
  },
  {
    icon: GlobeAltIcon,
    title: "Acceso global",
    description: "Aprende desde cualquier parte del mundo.",
    detail: "Conéctate sin fronteras ni barreras geográficas a clases online interactivas en tu propio horario.",
  },
  {
    icon: SparklesIcon,
    title: "Dominio técnico",
    description: "Formación en temas técnicos y especializados.",
    detail: "Especialización profunda en áreas complejas de ingeniería, ciencias exactas, software y manufactura.",
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: "Acompañamiento continuo",
    description: "Seguimiento y acompañamiento continuo.",
    detail: "Mantiene la comunicación activa con tu profesor entre clases para resolver dudas y mantener el impulso.",
  },
];

const targetAudiences = [
  {
    icon: AcademicCapIcon,
    title: "Estudiantes universitarios.",
    badge: "Universidad y Grado",
    description:
      "Supera las materias más complejas con tutorías 1 a 1 en cálculo, física, programación y materias técnicas de ingeniería.",
  },
  {
    icon: BriefcaseIcon,
    title: "Ingenieros y profesionales que desean especializarse.",
    badge: "Especialización",
    description:
      "Domina herramientas avanzadas como CNC, mecánica de fluidos, automatización y desarrollo de software de nivel industrial.",
  },
  {
    icon: UserPlusIcon,
    title: "Personas que buscan cambiar de carrera.",
    badge: "Reinvención Profesional",
    description:
      "Adquiere habilidades prácticas de alta demanda laboral con una guía paso a paso desde los fundamentos.",
  },
  {
    icon: BuildingOffice2Icon,
    title: "Empresas que desean capacitar a sus equipos.",
    badge: "Formación Corporativa",
    description:
      "Capacitación personalizada y enfocada en proyectos reales para actualizar los conocimientos técnicos de tu equipo.",
  },
];

const steps = [
  {
    number: "01",
    icon: MagnifyingGlassIcon,
    title: "Busca la especialidad que deseas aprender.",
    description:
      "Explora nuestro catálogo de materias técnicas como programación, CNC, cálculo, mecánica de fluidos e ingeniería.",
  },
  {
    number: "02",
    icon: UserIcon,
    title: "Encuentra al profesor ideal.",
    description:
      "Revisa los perfiles de expertos internacionales, su trayectoria en la industria, metodologías y opiniones de alumnos.",
  },
  {
    number: "03",
    icon: CalendarDaysIcon,
    title: "Agenda una sesión según tu horario.",
    description:
      "Elige el día y la hora que mejor se adapten a tu rutina diaria con nuestra reserva en vivo.",
  },
  {
    number: "04",
    icon: AcademicCapIcon,
    title: "Aprende de manera personalizada.",
    description:
      "Disfruta de clases 100% online y particulares centradas en tus objetivos, ejercicios prácticos y consultas individuales.",
  },
];

const testimonials = [
  {
    quote: "Encontré un experto en CNC que no existía en mi ciudad.",
    author: "Carlos M.",
    role: "Ingeniero Mecánico",
    rating: 5,
  },
  {
    quote: "Las clases de mecánica de fluidos me ayudaron enormemente en mi trabajo.",
    author: "Elena R.",
    role: "Ingeniera de Procesos",
    rating: 5,
  },
  {
    quote: "Aprendí programación con un profesor internacional.",
    author: "Mateo S.",
    role: "Desarrollador Software",
    rating: 5,
  },
];

const teacherReasons = [
  {
    icon: BanknotesIcon,
    title: "Tú fijas tu tarifa y tu horario",
    description:
      "Publicas tu disponibilidad semanal y cobras por sesión. Sin exclusividad ni mínimo de horas.",
  },
  {
    icon: UserGroupIcon,
    title: "Estudiantes que ya te buscan",
    description:
      "Apareces en el directorio con tu especialidad, tus certificados y tus proyectos a la vista.",
  },
  {
    icon: CalendarDaysIcon,
    title: "Agenda y pagos resueltos",
    description:
      "Gestionamos reservas, cobros y recordatorios. Tú te ocupas de dar la clase.",
  },
];

const faqItems: FaqItem[] = [
  {
    question: "¿Las clases son online?",
    answer: "Sí, todas las clases son completamente online.",
  },
  {
    question: "¿Qué temas se pueden aprender?",
    answer:
      "Programación, CNC, automatización, cálculo, mecánica de fluidos, ingeniería, manufactura, ciencia de datos y muchas otras especialidades.",
  },
  {
    question: "¿Puedo aprender con profesores de otros países?",
    answer: "Sí, VAONY está diseñado para conectar estudiantes con expertos internacionales.",
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
      {/* ---- HERO SECTION ---- */}
      <section className="grid-pattern relative overflow-hidden bg-vaony-paper pb-14 pt-16 sm:pt-20 lg:pt-24 lg:pb-14 lg:min-h-[660px] lg:flex lg:items-center">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 w-full">
          <div className="lg:col-span-6 relative z-30">
            <h1 className="font-display text-3xl font-bold leading-tight text-vaony-ink sm:text-4xl lg:text-5xl tracking-tight max-w-xl">
              Desarrolla tus habilidades con los{" "}
              <span className="brand-gradient-text">
                mejores profesores <br className="hidden sm:inline" />
                del mundo
              </span>
            </h1>
            <p className="mt-4 max-w-lg text-base sm:text-lg text-vaony-ink/75 leading-relaxed">
              Conecta con profesores y profesionales internacionales para aprender programación, ingeniería, manufactura, ciencias exactas y otras áreas técnicas mediante clases online personalizadas.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <ButtonLink href="/register/student" size="lg">
                Reservar tu primera clase <ArrowRightIcon className="h-4 w-4 ml-1" />
              </ButtonLink>
              <ButtonLink href="/teachers" variant="secondary" size="lg">
                Explorar materias
              </ButtonLink>
            </div>

            {/* Sección de confianza (Trust Badges) - compactas y flotando sobre degradado */}
            <div className="mt-9 pt-7 border-t border-vaony-ink/10 relative z-30">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {trustItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-xl bg-white/95 backdrop-blur-xs p-2.5 shadow-sm border border-vaony-ink/8 min-w-0"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-vaony-blue/10 text-vaony-blue shrink-0">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-vaony-ink leading-tight min-w-0">
                      + {item.text.replace("+ ", "")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:left-[45%] lg:w-[55%] xl:left-[44%] xl:w-[56%] mt-8 lg:mt-0 relative w-full h-[400px] sm:h-[480px] lg:h-full overflow-hidden z-10">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none hero-image-overlay" />
            <img
              src="/Hero.webp"
              alt="Clases particulares con expertos de todo el mundo en VAONY"
              className="h-full w-full object-cover object-[70%_center] sm:object-[68%_center] lg:object-[65%_center] xl:object-[68%_center]"
            />
          </div>
        </div>
      </section>

      {/* ---- COUNTERS SECTION ---- */}
      <section className="bg-vaony-paper py-14 border-y border-vaony-ink/5">
        <Reveal>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 sm:grid-cols-3">
            <AnimatedCounter target={520} suffix="+" label="estudiantes ayudados" />
            <AnimatedCounter target={4300} suffix="+" label="horas impartidas" />
            <AnimatedCounter target={12} suffix="+" label="especialidades activas" />
          </div>
        </Reveal>
      </section>

      {/* ---- SECCIÓN: ¿POR QUÉ ELEGIR VAONY? ---- */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="max-w-3xl">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-vaony-blue">
                VENTAJAS EXCLUSIVAS
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold text-vaony-ink sm:text-4xl">
                ¿Por qué elegir VAONY?
              </h2>
              <p className="mt-4 text-lg text-vaony-ink/75 leading-relaxed">
                VAONY conecta estudiantes y profesionales con expertos de diferentes países para aprender habilidades de alta especialización que normalmente son difíciles de encontrar de manera local.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b, i) => (
              <Reveal key={b.title} delay={i * 80}>
                <div className="group h-full rounded-2xl border border-vaony-ink/8 bg-vaony-paper/50 p-6 transition duration-200 hover:-translate-y-1 hover:border-vaony-blue/30 hover:bg-white hover:shadow-lg hover:shadow-vaony-blue/5 flex flex-col justify-between">
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl brand-gradient text-white shadow-md shadow-[#2924fd]/20">
                      <b.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 font-display text-lg font-bold text-vaony-ink group-hover:text-vaony-blue transition-colors">
                      {b.description}
                    </h3>
                    <p className="mt-2 text-sm text-vaony-ink/70 leading-relaxed">
                      {b.detail}
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-vaony-ink/5 flex items-center gap-1 text-xs font-semibold text-vaony-blue">
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Beneficio verificado VAONY</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- SECCIÓN: CATÁLOGO DESTACADO (DB) ---- */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-vaony-blue">
                ÁREAS DE CONOCIMIENTO
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-vaony-ink sm:text-4xl">
                Cursos y materias populares
              </h2>
            </div>
            <Link
              href="/teachers"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-vaony-blue hover:underline"
            >
              Ver todos los profesores <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredCourses.map((course, i) => (
            <Reveal key={course.id} delay={i * 90}>
              <Link
                href="/teachers"
                className="group flex h-full flex-col rounded-2xl border border-vaony-ink/8 bg-white p-6 shadow-xs transition duration-200 hover:-translate-y-1 hover:border-vaony-blue/30 hover:shadow-xl hover:shadow-vaony-blue/10"
              >
                <Badge tone="blue">{course.category.name}</Badge>
                <h3 className="mt-4 font-display text-lg font-bold text-vaony-ink group-hover:text-vaony-blue transition-colors">
                  {course.title}
                </h3>
                <p className="mt-2 flex-1 text-sm text-vaony-ink/65 line-clamp-3">
                  {course.shortDesc}
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-vaony-ink/8 pt-4">
                  <span className="font-display text-sm font-bold text-vaony-deep">
                    {formatMoney(course.price, course.currency)}
                    <span className="font-normal text-vaony-ink/50"> /h</span>
                  </span>
                  <span className="text-xs font-semibold text-vaony-blue flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Ver profesores <ArrowRightIcon className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- SECCIÓN: ¿A QUIÉN AYUDAMOS? ---- */}
      <section className="grid-pattern-dark section-cut-top section-cut-bottom bg-vaony-ink py-28 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-vaony-amber">
                SOLUCIONES A MEDIDA
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
                ¿A quién ayudamos?
              </h2>
              <p className="mt-4 text-white/75 text-lg leading-relaxed">
                Nuestra plataforma está adaptada para impulsar a cada perfil en su camino de aprendizaje técnico y profesional.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {targetAudiences.map((item, i) => (
              <Reveal key={item.title} delay={i * 90}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xs flex flex-col justify-between hover:bg-white/10 transition duration-200">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vaony-amber/20 text-vaony-amber">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span className="text-[11px] font-semibold text-vaony-amber bg-vaony-amber/10 px-2.5 py-1 rounded-full border border-vaony-amber/20">
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-white mb-2">
                      {item.title.replace("• ", "")}
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <Link
                      href="/register"
                      className="text-xs font-semibold text-vaony-amber hover:text-white inline-flex items-center gap-1 transition-colors"
                    >
                      Comenzar ahora <ArrowRightIcon className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- SECCIÓN: ¿CÓMO FUNCIONA? ---- */}
      <section className="bg-vaony-paper py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-vaony-blue">
                PASO A PASO
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold text-vaony-ink sm:text-4xl">
                ¿Cómo funciona?
              </h2>
              <p className="mt-3 text-lg text-vaony-ink/75">
                Empieza tu aprendizaje en cuatro sencillos pasos con acompañamiento personalizado.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4 relative">
            {steps.map((step, i) => (
              <Reveal key={step.number} delay={i * 90}>
                <div className="relative h-full rounded-2xl border border-vaony-ink/8 bg-white p-6 shadow-xs flex flex-col justify-between hover:shadow-lg transition-all duration-200">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-display text-3xl font-extrabold text-vaony-blue/20">
                        {step.number}
                      </span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vaony-blue/10 text-vaony-blue">
                        <step.icon className="h-5 w-5" />
                      </div>
                    </div>
                    <h3 className="font-display text-base font-bold text-vaony-ink mb-2 leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-sm text-vaony-ink/65 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- SECCIÓN: PROFESORES DESTACADOS (DB) ---- */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-vaony-blue">
                EXPERTOS VERIFICADOS
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-vaony-ink sm:text-4xl">
                Aprende de especialistas de todo el mundo
              </h2>
            </div>
            <Link
              href="/teachers"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-vaony-blue hover:underline"
            >
              Ver todos los profesores <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {featuredTeachers.map((t, i) => (
            <Reveal key={t.id} delay={i * 90}>
              <Link
                href={`/teachers/${t.userId}`}
                className="group block h-full rounded-2xl border border-vaony-ink/8 bg-white p-6 shadow-xs transition hover:-translate-y-1 hover:border-vaony-blue/30 hover:shadow-xl hover:shadow-vaony-blue/10"
              >
                <div className="flex items-center gap-4">
                  <Avatar firstName={t.user.firstName} lastName={t.user.lastName} src={t.user.avatarUrl} size="lg" />
                  <div>
                    <h3 className="font-display font-bold text-vaony-ink group-hover:text-vaony-blue transition-colors">
                      {t.user.firstName} {t.user.lastName}
                    </h3>
                    <p className="text-xs font-medium text-vaony-ink/60">{t.title}</p>
                    <Rating value={t.ratingAvg} count={t.ratingCount} className="mt-1" />
                  </div>
                </div>
                <p className="mt-4 text-sm text-vaony-ink/70 line-clamp-3 leading-relaxed">{t.bio}</p>
                <div className="mt-5 flex flex-wrap gap-1.5 pt-4 border-t border-vaony-ink/6">
                  {t.softwareTags.map((st) => (
                    <SoftwareBadge key={st.tagId} name={st.tag.name} />
                  ))}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- SECCIÓN: CONVIÉRTETE EN PROFESOR ---- */}
      <section id="ensena-en-vaony" className="scroll-mt-24 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-vaony-amber/30 bg-vaony-amber/8 px-6 py-12 sm:px-12 sm:py-14">
              {/* The V-angle of the logo, drawn once as a quiet amber rule */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-24 -top-32 hidden h-[520px] w-px rotate-[30deg] bg-linear-to-b from-transparent via-vaony-amber/40 to-transparent lg:block"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-32 hidden h-[520px] w-px rotate-[30deg] bg-linear-to-b from-transparent via-vaony-amber/25 to-transparent lg:block"
              />

              <div className="relative grid items-center gap-12 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                    ENSEÑA EN VAONY
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-bold text-vaony-ink sm:text-4xl">
                    ¿Y si el experto eres tú?
                  </h2>
                  <p className="mt-4 max-w-xl text-lg leading-relaxed text-vaony-ink/75">
                    Cada semana llegan estudiantes buscando exactamente lo que tú
                    dominas. Comparte tu experiencia en clases online, a tu ritmo y
                    desde donde estés.
                  </p>

                  <ul className="mt-8 space-y-5">
                    {teacherReasons.map((r) => (
                      <li key={r.title} className="flex gap-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vaony-amber/25 text-amber-700">
                          <r.icon className="h-5 w-5" />
                        </span>
                        <div>
                          <h3 className="font-display text-base font-bold text-vaony-ink">
                            {r.title}
                          </h3>
                          <p className="mt-0.5 text-sm leading-relaxed text-vaony-ink/70">
                            {r.description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-9 flex flex-wrap items-center gap-4">
                    <ButtonLink href="/apply-teacher" variant="amber" size="lg" className="shadow-lg shadow-vaony-amber/25">
                      Postúlate como profesor <ArrowRightIcon className="ml-1 h-4 w-4" />
                    </ButtonLink>
                    <Link
                      href="/contact"
                      className="text-sm font-semibold text-vaony-ink/70 underline-offset-4 hover:text-vaony-ink hover:underline"
                    >
                      Hablar con el equipo
                    </Link>
                  </div>
                </div>

                {/* Illustrative earnings ledger — a real calculation, so it's laid out as one */}
                <div className="lg:col-span-5">
                  <div className="rounded-2xl border border-vaony-ink/8 bg-white p-6 shadow-xl shadow-vaony-amber/10 sm:p-7">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-vaony-ink/45">
                      Tú pones el precio
                    </p>
                    <div className="mt-4 flex items-baseline gap-1.5">
                      <span className="font-display text-5xl font-extrabold text-vaony-ink">$25</span>
                      <span className="text-sm font-medium text-vaony-ink/55">USD / hora</span>
                    </div>

                    <dl className="mt-6 space-y-3 border-t border-vaony-ink/8 pt-5 text-sm">
                      <div className="flex items-center justify-between">
                        <dt className="text-vaony-ink/60">Clases por semana</dt>
                        <dd className="font-semibold text-vaony-ink">3</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-vaony-ink/60">Clases al mes</dt>
                        <dd className="font-semibold text-vaony-ink">12</dd>
                      </div>
                      <div className="flex items-center justify-between border-t border-vaony-ink/8 pt-3">
                        <dt className="font-semibold text-vaony-ink">Ingreso estimado</dt>
                        <dd className="font-display text-xl font-extrabold text-amber-700">
                          $300 USD
                        </dd>
                      </div>
                    </dl>

                    <p className="mt-5 text-[11px] leading-relaxed text-vaony-ink/45">
                      Ejemplo ilustrativo. Tú decides tu tarifa, tus materias y cuántas
                      clases das cada semana.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- SECCIÓN: TESTIMONIOS ---- */}
      <section className="bg-white py-20 sm:py-24 border-t border-vaony-ink/5">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-vaony-blue">
                EXPERIENCIAS REALES
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold text-vaony-ink sm:text-4xl">
                Testimonios
              </h2>
              <p className="mt-3 text-lg text-vaony-ink/75">
                Estudiantes y profesionales de diversos países comparten su aprendizaje con VAONY.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={i} delay={i * 90}>
                <div className="h-full rounded-2xl border border-vaony-ink/8 bg-vaony-paper/60 p-6 flex flex-col justify-between shadow-xs hover:border-vaony-blue/30 hover:bg-white transition duration-200">
                  <div>
                    <div className="flex items-center gap-1 text-vaony-amber mb-4">
                      {[...Array(t.rating)].map((_, idx) => (
                        <StarIcon key={idx} className="h-5 w-5 fill-current" />
                      ))}
                    </div>
                    <blockquote className="font-display font-semibold text-lg text-vaony-ink leading-snug italic">
                      {t.quote}
                    </blockquote>
                  </div>
                  <div className="mt-6 pt-4 border-t border-vaony-ink/10 flex items-center justify-between">
                    <div>
                      <p className="font-display text-sm font-bold text-vaony-ink">{t.author}</p>
                      <p className="text-xs text-vaony-ink/60">{t.role}</p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-vaony-blue/10 flex items-center justify-center text-vaony-blue font-bold text-xs">
                      {t.author.charAt(0)}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- SECCIÓN: PREGUNTAS FRECUENTES ---- */}
      <section className="bg-vaony-paper py-20 sm:py-24 border-t border-vaony-ink/5">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-vaony-blue">
                INFORMACIÓN RELEVANTE
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold text-vaony-ink sm:text-4xl">
                Preguntas frecuentes
              </h2>
              <p className="mt-3 text-lg text-vaony-ink/75">
                Respuesta directa a las consultas más comunes sobre nuestras clases particulares online.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <FaqAccordion items={faqItems} />
          </Reveal>
        </div>
      </section>

      {/* ---- CTA FINAL SECTION ---- */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <div className="brand-gradient grid-pattern-dark relative overflow-hidden rounded-3xl px-6 py-16 text-center text-white sm:px-12 shadow-2xl shadow-vaony-blue/20">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-vaony-amber mb-3">
              TU APRENDIZAJE SIN FRONTERAS
            </p>
            <h2 className="mx-auto max-w-3xl font-display text-3xl font-extrabold sm:text-4xl lg:text-5xl leading-tight">
              Comienza hoy a aprender con expertos de todo el mundo.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/85 leading-relaxed">
              Encuentra al profesor ideal para desarrollar tus habilidades profesionales y técnicas.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <ButtonLink href="/register/student" variant="amber" size="lg" className="shadow-lg">
                Reservar tu primera clase <ArrowRightIcon className="h-4 w-4 ml-1" />
              </ButtonLink>
              <ButtonLink
                href="/teachers"
                variant="ghost"
                size="lg"
                className="text-white hover:bg-white/10 hover:text-white border border-white/20"
              >
                Encontrar al profesor ideal
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
