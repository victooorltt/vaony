"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  UsersIcon,
  AcademicCapIcon,
  ClockIcon,
  HeartIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartIconSolid,
  StarIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/solid";
import { SoftwareBadge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { formatMoney } from "@/lib/utils";

export interface TeacherWithDetails {
  id: string;
  userId: string;
  title: string | null;
  specialization: string | null;
  bio: string | null;
  languages: string;
  ratingAvg: number;
  ratingCount: number;
  featured: boolean;
  yearsExperience: number | null;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  softwareTags: {
    tag: {
      id: string;
      name: string;
    };
  }[];
  courses: {
    course: {
      id: string;
      title: string;
      slug: string;
      price: number;
      currency: string;
      categoryId: string;
      level: string;
    };
  }[];
  _count: { credentials: number };
}

export interface CategoryWithDetails {
  id: string;
  name: string;
  slug: string;
  order: number;
}

interface TeachersDirectoryClientProps {
  initialTeachers: TeacherWithDetails[];
  categories: CategoryWithDetails[];
}

export default function TeachersDirectoryClient({
  initialTeachers,
  categories,
}: TeachersDirectoryClientProps) {
  // Filters & State
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  // Favorites state
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (teacherId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(teacherId)) {
        next.delete(teacherId);
      } else {
        next.add(teacherId);
      }
      return next;
    });
  };

  // Presentation-only status metadata, keyed by teacher email
  const teacherMetadata = useMemo(() => {
    const map: Record<
      string,
      {
        status: "available" | "reservation";
        statusText: string;
        dotColor: string;
        microStatusText: string;
        microDotColor: string;
        topTeacher: boolean;
      }
    > = {
      "elena.rios@vaony.com": {
        status: "available",
        statusText: "Disponible ahora",
        dotColor: "bg-emerald-500",
        microStatusText: "Disponible hoy",
        microDotColor: "bg-emerald-500",
        topTeacher: true,
      },
      "daniel.mora@vaony.com": {
        status: "available",
        statusText: "Disponible ahora",
        dotColor: "bg-emerald-500",
        microStatusText: "Responde en 2 h",
        microDotColor: "bg-blue-500",
        topTeacher: false,
      },
      "sofia.leal@vaony.com": {
        status: "reservation",
        statusText: "Reserva próxima",
        dotColor: "bg-amber-500",
        microStatusText: "Responde en 2 h",
        microDotColor: "bg-blue-500",
        topTeacher: false,
      },
      "marco.vega@vaony.com": {
        status: "available",
        statusText: "Disponible ahora",
        dotColor: "bg-emerald-500",
        microStatusText: "Disponible hoy",
        microDotColor: "bg-emerald-500",
        topTeacher: true,
      },
    };

    return map;
  }, []);

  const getMetadata = (email: string) => {
    return (
      teacherMetadata[email] || {
        status: "available" as const,
        statusText: "Disponible ahora",
        dotColor: "bg-emerald-500",
        microStatusText: "Disponible hoy",
        microDotColor: "bg-emerald-500",
        topTeacher: false,
      }
    );
  };

  // Main filter function
  const filteredTeachers = useMemo(() => {
    return initialTeachers
      .filter((teacher) => {
        const meta = getMetadata(teacher.user.email);

        // 1. Category Filter
        if (selectedCategoryId !== "all") {
          const hasCourseInCategory = teacher.courses.some(
            (tc) => tc.course.categoryId === selectedCategoryId
          );
          if (!hasCourseInCategory) return false;
        }

        // 2. Level Filter
        if (selectedLevel !== "all") {
          const hasCourseInLevel = teacher.courses.some(
            (tc) => tc.course.level === selectedLevel
          );
          if (!hasCourseInLevel) return false;
        }

        // 3. Language Filter
        if (selectedLanguage !== "all") {
          const langs = teacher.languages.toLowerCase();
          if (!langs.includes(selectedLanguage.toLowerCase())) return false;
        }

        // 4. Availability Filter
        if (selectedAvailability !== "all") {
          if (meta.status !== selectedAvailability) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Helper to get minimum course price
        const getMinPrice = (t: TeacherWithDetails) => {
          const prices = t.courses.map((tc) => tc.course.price);
          return prices.length > 0 ? Math.min(...prices) : 25;
        };

        if (sortBy === "price-asc") {
          return getMinPrice(a) - getMinPrice(b);
        }
        if (sortBy === "price-desc") {
          return getMinPrice(b) - getMinPrice(a);
        }
        if (sortBy === "rating") {
          return b.ratingAvg - a.ratingAvg;
        }
        // "popular" default: ratingAvg, then ratingCount
        return b.ratingAvg * b.ratingCount - a.ratingAvg * a.ratingCount;
      });
  }, [
    initialTeachers,
    selectedCategoryId,
    selectedLevel,
    selectedLanguage,
    selectedAvailability,
    sortBy,
    teacherMetadata,
  ]);

  const resetFilters = () => {
    setSelectedCategoryId("all");
    setSelectedLevel("all");
    setSelectedLanguage("all");
    setSelectedAvailability("all");
    setSortBy("popular");
  };

  // Sync category tab selection with select input and vice-versa
  const handleTabChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    // Smooth scroll down to directory section on tab click
    const el = document.getElementById("directory-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-20">

            {/* Left Info Column */}
            <div className="relative z-10 lg:col-span-11">
              <Reveal delay={100}>
                <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-vaony-ink leading-[1.1]">
                  Aprende con{" "}
                  <span className="brand-gradient-text">profesores expertos,</span> en
                  vivo y a tu ritmo
                </h1>
              </Reveal>

              <Reveal delay={200}>
                <p className="mt-4 max-w-xl text-base sm:text-lg text-vaony-ink/70 leading-relaxed">
                  Encuentra el mentor ideal según tu nivel, objetivos y disponibilidad. Clases personalizadas diseñadas por ingenieros y especialistas.
                </p>
              </Reveal>

              {/* Buttons */}
              <Reveal delay={300}>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <a
                    href="#directory-section"
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById("directory-section");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-vaony-blue px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-vaony-blue/20 hover:bg-vaony-deep hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                  >
                    Explorar profesores <span className="text-base">→</span>
                  </a>
                  <Link
                    href="/courses"
                    className="inline-flex items-center justify-center rounded-xl border border-vaony-ink/10 bg-white px-6 py-3 text-sm font-semibold text-vaony-ink/80 hover:bg-vaony-ink/[0.02] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                  >
                    Ver cursos
                  </Link>
                </div>
              </Reveal>

              {/* Stats Cards */}
              <Reveal delay={400}>
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Stat 1 */}
                  <div className="glass flex items-center gap-4 rounded-2xl border border-vaony-ink/5 p-4 shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-vaony-blue/10 text-vaony-blue">
                      <UsersIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-display font-bold text-vaony-blue text-lg">1250+</div>
                      <div className="text-[11px] text-vaony-ink/55 font-medium">Profesores expertos</div>
                    </div>
                  </div>

                  {/* Stat 2 */}
                  <div className="glass flex items-center gap-4 rounded-2xl border border-vaony-ink/5 p-4 shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <AcademicCapIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-display font-bold text-emerald-600 text-lg">25.000+</div>
                      <div className="text-[11px] text-vaony-ink/55 font-medium">Estudiantes activos</div>
                    </div>
                  </div>

                  {/* Stat 3 */}
                  <div className="glass flex items-center gap-4 rounded-2xl border border-vaony-ink/5 p-4 shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                      <ClockIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-display font-bold text-amber-500 text-lg">45.000+</div>
                      <div className="text-[11px] text-vaony-ink/55 font-medium">Horas de clase</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Right Column with Hero Image */}
            <div className="relative lg:col-span-9 flex justify-center items-center">
              <Reveal delay={200} className="w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/Hero-teachers.webp"
                  alt="Profesores"
                  className="w-full h-auto select-none"
                />
              </Reveal>
            </div>

          </div>
        </div>
      </section>

      {/* DIRECTORY SECTION */}
      <section id="directory-section" className="scroll-mt-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Categories Tab Bar */}
        <div className="w-full border-b border-vaony-ink/10 flex justify-center">
          <div className="flex overflow-x-auto no-scrollbar gap-8 pb-px">
            <button
              onClick={() => handleTabChange("all")}
              className={`pb-4 text-sm font-semibold tracking-wide border-b-2 transition-all duration-300 whitespace-nowrap cursor-pointer ${
                selectedCategoryId === "all"
                  ? "border-vaony-blue text-vaony-blue font-bold"
                  : "border-transparent text-vaony-ink/60 hover:text-vaony-ink/90"
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleTabChange(cat.id)}
                className={`pb-4 text-sm font-semibold tracking-wide border-b-2 transition-all duration-300 whitespace-nowrap cursor-pointer ${
                  selectedCategoryId === cat.id
                    ? "border-vaony-blue text-vaony-blue font-bold"
                    : "border-transparent text-vaony-ink/60 hover:text-vaony-ink/90"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Card Container */}
        <div className="mt-8 bg-white border border-vaony-ink/8 shadow-md rounded-3xl p-6 md:p-8">

          {/* Dropdown Filters row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 items-end">

            {/* Category Select */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="filter-category" className="text-xs font-semibold text-vaony-ink/50 uppercase tracking-wider">Categoría</label>
              <select
                id="filter-category"
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full bg-white border border-vaony-ink/10 rounded-xl px-4 py-2.5 text-sm text-vaony-ink/75 font-medium focus:outline-none focus:ring-2 focus:ring-vaony-blue/30 focus:border-vaony-blue transition-all duration-200 cursor-pointer"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Select */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="filter-level" className="text-xs font-semibold text-vaony-ink/50 uppercase tracking-wider">Nivel</label>
              <select
                id="filter-level"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full bg-white border border-vaony-ink/10 rounded-xl px-4 py-2.5 text-sm text-vaony-ink/75 font-medium focus:outline-none focus:ring-2 focus:ring-vaony-blue/30 focus:border-vaony-blue transition-all duration-200 cursor-pointer"
              >
                <option value="all">Todos los niveles</option>
                <option value="BEGINNER">Principiante</option>
                <option value="INTERMEDIATE">Intermedio</option>
                <option value="ADVANCED">Avanzado</option>
              </select>
            </div>

            {/* Language Select */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="filter-language" className="text-xs font-semibold text-vaony-ink/50 uppercase tracking-wider">Idioma</label>
              <select
                id="filter-language"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full bg-white border border-vaony-ink/10 rounded-xl px-4 py-2.5 text-sm text-vaony-ink/75 font-medium focus:outline-none focus:ring-2 focus:ring-vaony-blue/30 focus:border-vaony-blue transition-all duration-200 cursor-pointer"
              >
                <option value="all">Todos los idiomas</option>
                <option value="Español">Español</option>
                <option value="Inglés">Inglés</option>
              </select>
            </div>

            {/* Availability Select */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="filter-availability" className="text-xs font-semibold text-vaony-ink/50 uppercase tracking-wider">Disponibilidad</label>
              <select
                id="filter-availability"
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="w-full bg-white border border-vaony-ink/10 rounded-xl px-4 py-2.5 text-sm text-vaony-ink/75 font-medium focus:outline-none focus:ring-2 focus:ring-vaony-blue/30 focus:border-vaony-blue transition-all duration-200 cursor-pointer"
              >
                <option value="all">Cualquiera</option>
                <option value="available">Disponible hoy</option>
                <option value="reservation">Reserva próxima</option>
              </select>
            </div>

            {/* Sorting Select */}
            <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-4 xl:col-span-1">
              <label htmlFor="filter-sort" className="text-xs font-semibold text-vaony-ink/50 uppercase tracking-wider">Ordenar por</label>
              <select
                id="filter-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-white border border-vaony-ink/10 rounded-xl px-4 py-2.5 text-sm text-vaony-ink/75 font-medium focus:outline-none focus:ring-2 focus:ring-vaony-blue/30 focus:border-vaony-blue transition-all duration-200 cursor-pointer"
              >
                <option value="popular">Más populares</option>
                <option value="price-asc">Precio: de menor a mayor</option>
                <option value="price-desc">Precio: de mayor a menor</option>
                <option value="rating">Mejor calificados</option>
              </select>
            </div>

          </div>

          {/* Divider */}
          <div className="my-6 border-t border-vaony-ink/8" />

          {/* Result Information */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-vaony-ink">
                {filteredTeachers.length} {filteredTeachers.length === 1 ? "profesor encontrado" : "profesores encontrados"}
              </h2>
              <p className="text-xs text-vaony-ink/55 mt-0.5">
                Encuentra el mentor ideal según tu nivel, objetivos y disponibilidad.
              </p>
            </div>
            {filteredTeachers.length !== initialTeachers.length && (
              <button
                onClick={resetFilters}
                className="self-start sm:self-center text-xs font-semibold text-vaony-blue hover:text-vaony-deep hover:underline cursor-pointer"
              >
                Restaurar filtros
              </button>
            )}
          </div>
        </div>

        {/* Teachers list — horizontal cards */}
        {filteredTeachers.length > 0 ? (
          <div className="mt-10 flex flex-col gap-5">
            {filteredTeachers.map((teacher, index) => {
              const meta = getMetadata(teacher.user.email);
              const isFav = favorites.has(teacher.id);
              const fullName = `${teacher.user.firstName} ${teacher.user.lastName}`;
              const certified = teacher._count.credentials > 0;

              // Cost per class = lowest price among the subjects they teach
              const coursePrices = teacher.courses.map((tc) => tc.course.price);
              const minPrice = coursePrices.length > 0 ? Math.min(...coursePrices) : 25;
              const currency = teacher.courses[0]?.course.currency || "USD";

              return (
                <Reveal key={teacher.id} delay={Math.min(index, 3) * 70}>
                  <article className="group relative grid grid-cols-1 overflow-hidden rounded-3xl border border-vaony-ink/8 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-vaony-blue/25 hover:shadow-xl hover:shadow-vaony-blue/8 sm:grid-cols-[minmax(0,208px)_1fr]">

                    {/* Photo */}
                    <div className="relative h-52 w-full overflow-hidden bg-vaony-paper sm:h-full sm:min-h-[236px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={teacher.user.avatarUrl || "/brand/vaony_solo_logo.svg"}
                        alt={fullName}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {meta.topTeacher && (
                        <span className="absolute left-3.5 top-3.5 rounded-full bg-[#ff3366] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm">
                          Top profesor
                        </span>
                      )}

                      <div className="absolute bottom-3.5 left-3.5 flex items-center gap-1.5 rounded-full border border-vaony-ink/5 bg-white/90 px-2.5 py-0.5 text-[9px] font-bold text-vaony-ink shadow-md backdrop-blur-sm">
                        <span className={`h-1.5 w-1.5 rounded-full ${meta.dotColor}`} />
                        <span>{meta.statusText}</span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto]">

                      {/* Main info */}
                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-display text-lg font-bold text-vaony-ink transition-colors duration-200 group-hover:text-vaony-blue">
                              <Link href={`/teachers/${teacher.userId}`} className="before:absolute before:inset-0 before:content-['']">
                                {fullName}
                              </Link>
                            </h3>
                            <p className="mt-1 text-sm font-semibold text-vaony-blue">
                              {teacher.specialization || teacher.title}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleFavorite(teacher.id)}
                            aria-pressed={isFav}
                            aria-label={
                              isFav
                                ? `Quitar a ${fullName} de favoritos`
                                : `Guardar a ${fullName} en favoritos`
                            }
                            className="relative z-10 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-vaony-ink/8 bg-white text-vaony-ink/40 shadow-sm transition-all duration-200 hover:scale-105 hover:text-red-500 active:scale-95 lg:hidden"
                          >
                            {isFav ? (
                              <HeartIconSolid className="h-4.5 w-4.5 text-red-500" />
                            ) : (
                              <HeartIcon className="h-4.5 w-4.5" />
                            )}
                          </button>
                        </div>

                        {certified && (
                          <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-vaony-amber/35 bg-vaony-amber/12 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                            <CheckBadgeIcon className="h-3.5 w-3.5" />
                            Profesor certificado
                          </span>
                        )}

                        {teacher.bio && (
                          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-vaony-ink/65">
                            {teacher.bio}
                          </p>
                        )}

                        {teacher.softwareTags.length > 0 && (
                          <div className="mt-3.5 flex flex-wrap gap-1.5">
                            {teacher.softwareTags.slice(0, 5).map((st) => (
                              <SoftwareBadge key={st.tag.id} name={st.tag.name} />
                            ))}
                            {teacher.softwareTags.length > 5 && (
                              <span className="inline-flex items-center rounded-md border border-vaony-ink/10 px-2 py-0.5 text-[11px] text-vaony-ink/50">
                                +{teacher.softwareTags.length - 5}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-vaony-ink/60">
                          {teacher.yearsExperience !== null && (
                            <span className="inline-flex items-center gap-1.5 font-medium">
                              <ClockIcon className="h-3.5 w-3.5 text-vaony-ink/40" />
                              {teacher.yearsExperience} años de experiencia
                            </span>
                          )}
                          <span aria-hidden className="text-vaony-ink/20">·</span>
                          <span className="inline-flex items-center gap-1.5 font-medium">
                            <span className={`h-1.5 w-1.5 rounded-full ${meta.microDotColor}`} />
                            {meta.microStatusText}
                          </span>
                        </div>
                      </div>

                      {/* Rating · price · CTA */}
                      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-vaony-ink/8 pt-4 lg:w-52 lg:flex-col lg:flex-nowrap lg:items-stretch lg:justify-between lg:gap-3 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                        <div className="lg:flex lg:items-start lg:justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <StarIcon className="h-4 w-4 text-vaony-amber" />
                              <span className="font-display text-base font-bold text-vaony-ink">
                                {teacher.ratingAvg.toFixed(1)}
                              </span>
                              <span className="text-xs text-vaony-ink/45">
                                ({teacher.ratingCount})
                              </span>
                            </div>
                            <p className="mt-0.5 hidden text-[11px] text-vaony-ink/45 lg:block">
                              {teacher.ratingCount === 1 ? "reseña" : "reseñas"} verificadas
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleFavorite(teacher.id)}
                            aria-pressed={isFav}
                            aria-label={
                              isFav
                                ? `Quitar a ${fullName} de favoritos`
                                : `Guardar a ${fullName} en favoritos`
                            }
                            className="relative z-10 hidden h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-vaony-ink/8 bg-white text-vaony-ink/40 shadow-sm transition-all duration-200 hover:scale-105 hover:text-red-500 active:scale-95 lg:flex"
                          >
                            {isFav ? (
                              <HeartIconSolid className="h-4.5 w-4.5 text-red-500" />
                            ) : (
                              <HeartIcon className="h-4.5 w-4.5" />
                            )}
                          </button>
                        </div>

                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-vaony-ink/45">
                            Costo por clase
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="font-display text-2xl font-extrabold text-vaony-ink">
                              {formatMoney(minPrice, currency)}
                            </span>
                            <span className="text-[11px] font-medium text-vaony-ink/55">
                              /clase
                            </span>
                          </div>
                        </div>

                        <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-vaony-blue px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-vaony-blue/10 transition-all duration-200 group-hover:bg-vaony-deep group-hover:shadow-vaony-blue/20 sm:w-auto lg:w-full">
                          Ver perfil
                          <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <div className="mx-auto mt-12 max-w-lg rounded-3xl border border-vaony-ink/8 bg-white p-12 text-center">
            <div className="text-4xl">🎯</div>
            <h3 className="mt-4 text-lg font-bold text-vaony-ink">
              Ningún profesor coincide con estos filtros
            </h3>
            <p className="mt-2 text-sm text-vaony-ink/60">
              Prueba con otra categoría, nivel o idioma para ver más resultados.
            </p>
            <button
              onClick={resetFilters}
              className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-xl bg-vaony-blue px-5 py-2.5 text-xs font-semibold text-white transition-all duration-200 hover:bg-vaony-deep"
            >
              Restaurar filtros
            </button>
          </div>
        )}

      </section>

      {/* TRUST SECTION (Aprende con total confianza) */}
      <section className="mt-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-vaony-ink">
            Aprende con total confianza
          </h2>
          <p className="mt-2 text-sm text-vaony-ink/60">
            Creamos la mejor experiencia para que te enfoques en lo que importa: tu crecimiento.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white/80 border border-vaony-ink/5 p-6 rounded-2xl shadow-sm flex flex-col gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 flex text-base">
              🛡️
            </div>
            <div>
              <h3 className="font-bold text-sm text-vaony-ink">Profesores verificados</h3>
              <p className="text-[11px] text-vaony-ink/55 mt-1 leading-relaxed">
                Todos pasan por un riguroso proceso de validación de credenciales y entrevista.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white/80 border border-vaony-ink/5 p-6 rounded-2xl shadow-sm flex flex-col gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 flex text-base">
              📅
            </div>
            <div>
              <h3 className="font-bold text-sm text-vaony-ink">Reserva flexible</h3>
              <p className="text-[11px] text-vaony-ink/55 mt-1 leading-relaxed">
                Clases cuando quieras, con reprogramación sin coste hasta 24h antes.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white/80 border border-vaony-ink/5 p-6 rounded-2xl shadow-sm flex flex-col gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-50 text-pink-600 flex text-base">
              💬
            </div>
            <div>
              <h3 className="font-bold text-sm text-vaony-ink">Comunicación sencilla</h3>
              <p className="text-[11px] text-vaony-ink/55 mt-1 leading-relaxed">
                Chat directo integrado en la plataforma para resolver cualquier duda.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white/80 border border-vaony-ink/5 p-6 rounded-2xl shadow-sm flex flex-col gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 flex text-base">
              📈
            </div>
            <div>
              <h3 className="font-bold text-sm text-vaony-ink">Aprendizaje efectivo</h3>
              <p className="text-[11px] text-vaony-ink/55 mt-1 leading-relaxed">
                Métodos de enseñanza prácticos orientados a resultados y proyectos reales.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
