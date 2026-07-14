"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  UsersIcon,
  AcademicCapIcon,
  ClockIcon,
  HeartIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid, StarIcon } from "@heroicons/react/24/solid";
import { Avatar } from "@/components/ui/Avatar";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  // Favorites state
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Search input bind (separated for input commit vs real-time)
  const [searchInput, setSearchInput] = useState("");

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

  // Helper static metadata mapping for each teacher
  const teacherMetadata = useMemo(() => {
    const map: Record<
      string,
      {
        yearsExp: number;
        status: "available" | "reservation";
        statusText: string;
        dotColor: string;
        microStatusText: string;
        microDotColor: string;
        topTeacher: boolean;
        image: string;
      }
    > = {
      "elena.rios@vaony.com": {
        yearsExp: 9,
        status: "available",
        statusText: "Disponible ahora",
        dotColor: "bg-emerald-500",
        microStatusText: "Disponible hoy",
        microDotColor: "bg-emerald-500",
        topTeacher: true,
        image: "/teacher_female.jpg",
      },
      "daniel.mora@vaony.com": {
        yearsExp: 7,
        status: "available",
        statusText: "Disponible ahora",
        dotColor: "bg-emerald-500",
        microStatusText: "Responde en 2h",
        microDotColor: "bg-blue-500",
        topTeacher: false,
        image: "/teacher_male.jpg",
      },
      "sofia.leal@vaony.com": {
        yearsExp: 8,
        status: "reservation",
        statusText: "Reserva próxima",
        dotColor: "bg-amber-500",
        microStatusText: "Responde en 2h",
        microDotColor: "bg-blue-500",
        topTeacher: false,
        image: "/teacher_sofia.jpg",
      },
      "marco.vega@vaony.com": {
        yearsExp: 6,
        status: "available",
        statusText: "Disponible ahora",
        dotColor: "bg-emerald-500",
        microStatusText: "Disponible hoy",
        microDotColor: "bg-emerald-500",
        topTeacher: true,
        image: "/teacher_marco.jpg",
      },
    };

    return map;
  }, []);

  const getMetadata = (email: string) => {
    return (
      teacherMetadata[email] || {
        yearsExp: 5,
        status: "available",
        statusText: "Disponible ahora",
        dotColor: "bg-emerald-500",
        microStatusText: "Disponible hoy",
        microDotColor: "bg-emerald-500",
        topTeacher: false,
        image: "/brand/vaony_solo_logo.svg",
      }
    );
  };

  // Perform search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    // Smooth scroll down to directory section
    const el = document.getElementById("directory-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Main filter function
  const filteredTeachers = useMemo(() => {
    return initialTeachers
      .filter((teacher) => {
        const meta = getMetadata(teacher.user.email);

        // 1. Search Query (name, title, specialization, tags, bio, courses)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const fullName = `${teacher.user.firstName} ${teacher.user.lastName}`.toLowerCase();
          const title = (teacher.title || "").toLowerCase();
          const spec = (teacher.specialization || "").toLowerCase();
          const bio = (teacher.bio || "").toLowerCase();
          const tagsMatch = teacher.softwareTags.some((st) =>
            st.tag.name.toLowerCase().includes(q)
          );
          const coursesMatch = teacher.courses.some((tc) =>
            tc.course.title.toLowerCase().includes(q)
          );

          if (
            !fullName.includes(q) &&
            !title.includes(q) &&
            !spec.includes(q) &&
            !bio.includes(q) &&
            !tagsMatch &&
            !coursesMatch
          ) {
            return false;
          }
        }

        // 2. Category Filter
        if (selectedCategoryId !== "all") {
          const hasCourseInCategory = teacher.courses.some(
            (tc) => tc.course.categoryId === selectedCategoryId
          );
          if (!hasCourseInCategory) return false;
        }

        // 3. Level Filter
        if (selectedLevel !== "all") {
          const hasCourseInLevel = teacher.courses.some(
            (tc) => tc.course.level === selectedLevel
          );
          if (!hasCourseInLevel) return false;
        }

        // 4. Language Filter
        if (selectedLanguage !== "all") {
          const langs = teacher.languages.toLowerCase();
          if (!langs.includes(selectedLanguage.toLowerCase())) return false;
        }

        // 5. Availability Filter
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
    searchQuery,
    selectedCategoryId,
    selectedLevel,
    selectedLanguage,
    selectedAvailability,
    sortBy,
    teacherMetadata,
  ]);

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

              {/* Search Bar Form */}
              <Reveal delay={300}>
                <form
                  onSubmit={handleSearchSubmit}
                  className="mt-8 flex max-w-lg items-center gap-2 rounded-2xl border border-vaony-ink/10 bg-white p-2 shadow-xl shadow-vaony-ink/3 focus-within:border-vaony-blue/50 focus-within:ring-2 focus-within:ring-vaony-blue/15 transition-all duration-300"
                >
                  <div className="flex flex-1 items-center gap-2 pl-3">
                    <MagnifyingGlassIcon className="h-5 w-5 text-vaony-ink/40" />
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="¿Qué querés aprender hoy?"
                      className="w-full bg-transparent py-2 text-sm text-vaony-ink outline-none placeholder:text-vaony-ink/40"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-vaony-blue text-white shadow-md shadow-vaony-blue/20 hover:bg-vaony-deep hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </button>
                </form>
              </Reveal>

              {/* Buttons */}
              <Reveal delay={350}>
                <div className="mt-5 flex flex-wrap items-center gap-3">
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
      <section id="directory-section" className="scroll-mt-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
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
              <label className="text-xs font-semibold text-vaony-ink/50 uppercase tracking-wider">Categoría</label>
              <select
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
              <label className="text-xs font-semibold text-vaony-ink/50 uppercase tracking-wider">Nivel</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full bg-white border border-vaony-ink/10 rounded-xl px-4 py-2.5 text-sm text-vaony-ink/75 font-medium focus:outline-none focus:ring-2 focus:ring-vaony-blue/30 focus:border-vaony-blue transition-all duration-200 cursor-pointer"
              >
                <option value="all">Todos los niveles</option>
                <option value="BEGINNER">Principiante (Beginner)</option>
                <option value="INTERMEDIATE">Intermedio (Intermediate)</option>
                <option value="ADVANCED">Avanzado (Advanced)</option>
              </select>
            </div>

            {/* Language Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-vaony-ink/50 uppercase tracking-wider">Idioma</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full bg-white border border-vaony-ink/10 rounded-xl px-4 py-2.5 text-sm text-vaony-ink/75 font-medium focus:outline-none focus:ring-2 focus:ring-vaony-blue/30 focus:border-vaony-blue transition-all duration-200 cursor-pointer"
              >
                <option value="all">Todos los idiomas</option>
                <option value="Spanish">Español</option>
                <option value="English">Inglés</option>
              </select>
            </div>

            {/* Availability Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-vaony-ink/50 uppercase tracking-wider">Disponibilidad</label>
              <select
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
              <label className="text-xs font-semibold text-vaony-ink/50 uppercase tracking-wider">Ordenar por</label>
              <select
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

          {/* Search Result Information */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-vaony-ink">
                {filteredTeachers.length} {filteredTeachers.length === 1 ? "profesor encontrado" : "profesores encontrados"}
              </h2>
              <p className="text-xs text-vaony-ink/55 mt-0.5">
                Encuentra el mentor ideal según tu nivel, objetivos y disponibilidad.
              </p>
            </div>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchInput("");
                }}
                className="self-start sm:self-center text-xs font-semibold text-vaony-blue hover:text-vaony-deep hover:underline cursor-pointer"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        </div>

        {/* Teachers Grid */}
        {filteredTeachers.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTeachers.map((teacher, index) => {
              const meta = getMetadata(teacher.user.email);
              const isFav = favorites.has(teacher.id);

              // Calculate minimum price among their courses
              const coursePrices = teacher.courses.map((tc) => tc.course.price);
              const minPrice = coursePrices.length > 0 ? Math.min(...coursePrices) : 25;
              const currency = teacher.courses[0]?.course.currency || "USD";

              return (
                <Reveal key={teacher.id} delay={(index % 4) * 80}>
                  <div className="h-full bg-white rounded-3xl border border-vaony-ink/8 shadow-sm overflow-hidden flex flex-col group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-vaony-blue/5">
                    
                    {/* Top Image block */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-vaony-paper">
                      {/* Teacher photo */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={meta.image}
                        alt={`${teacher.user.firstName} ${teacher.user.lastName}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Top Teacher Badge */}
                      {meta.topTeacher && (
                        <span className="absolute top-3.5 left-3.5 bg-[#ff3366] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                          Top profesor
                        </span>
                      )}

                      {/* Favorite Heart Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(teacher.id);
                        }}
                        className="absolute top-3.5 right-3.5 h-8 w-8 rounded-full bg-white shadow-md flex items-center justify-center border border-vaony-ink/5 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer text-vaony-ink/40 hover:text-red-500"
                      >
                        {isFav ? (
                          <HeartIconSolid className="h-4.5 w-4.5 text-red-500" />
                        ) : (
                          <HeartIcon className="h-4.5 w-4.5" />
                        )}
                      </button>

                      {/* Availability status badge */}
                      <div className="absolute bottom-3.5 left-3.5 bg-white/90 backdrop-blur-sm shadow-md border border-vaony-ink/5 rounded-full px-2.5 py-0.5 flex items-center gap-1.5 text-[9px] text-vaony-ink font-bold">
                        <span className={`h-1.5 w-1.5 rounded-full ${meta.dotColor}`} />
                        <span className="capitalize">{meta.statusText}</span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Name and verified mark */}
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-display font-bold text-vaony-ink group-hover:text-vaony-blue transition-colors duration-200">
                            {teacher.user.firstName} {teacher.user.lastName}
                          </h3>
                          <svg className="h-4.5 w-4.5 text-blue-500 fill-current shrink-0" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                          </svg>
                        </div>

                        {/* Title/Position */}
                        <p className="mt-1.5 text-xs font-semibold text-vaony-ink/75 line-clamp-1">
                          {teacher.title || teacher.specialization}
                        </p>

                        {/* Ratings and Experience */}
                        <div className="mt-2.5 flex items-center gap-2">
                          <div className="flex items-center gap-0.5 text-vaony-amber">
                            <StarIcon className="h-3.5 w-3.5 fill-current" />
                            <span className="text-xs font-bold text-vaony-ink">
                              {teacher.ratingAvg.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-[11px] text-vaony-ink/40">
                            ({teacher.ratingCount})
                          </span>
                          <span className="text-[11px] text-vaony-ink/30 font-bold">·</span>
                          <span className="text-xs text-vaony-ink/60 font-medium">
                            {meta.yearsExp} años exp.
                          </span>
                        </div>

                        {/* Micro status below experience (response time etc.) */}
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-vaony-ink/50 font-medium">
                          <span className={`h-1 w-1 rounded-full ${meta.microDotColor}`} />
                          <span>{meta.microStatusText}</span>
                        </div>

                        {/* Tech Stack tags */}
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {teacher.softwareTags.map((st) => (
                            <SoftwareBadge key={st.tag.id} name={st.tag.name} />
                          ))}
                        </div>
                      </div>

                      {/* Bottom area: Price and Button */}
                      <div className="mt-6 pt-4 border-t border-vaony-ink/8 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-bold text-vaony-ink/45 uppercase tracking-wider">Tarifa</div>
                          <div className="flex items-baseline gap-0.5">
                            <span className="font-display font-extrabold text-vaony-ink text-base">
                              {formatMoney(minPrice, currency)}
                            </span>
                            <span className="text-[11px] text-vaony-ink/55 font-medium">/hora</span>
                          </div>
                        </div>

                        <Link
                          href={`/teachers/${teacher.userId}`}
                          className="inline-flex items-center justify-center rounded-xl bg-vaony-blue px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-vaony-blue/10 hover:bg-vaony-deep hover:shadow-vaony-blue/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
                        >
                          Ver disponibilidad
                        </Link>
                      </div>

                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <div className="mt-12 bg-white border border-vaony-ink/8 rounded-3xl p-12 text-center max-w-lg mx-auto">
            <div className="text-4xl">🔍</div>
            <h3 className="mt-4 text-lg font-bold text-vaony-ink">No se encontraron profesores</h3>
            <p className="mt-2 text-sm text-vaony-ink/60">
              Prueba a cambiar tus filtros o realiza otra búsqueda (ej. "calculus", "CNC", "python").
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchInput("");
                setSelectedCategoryId("all");
                setSelectedLevel("all");
                setSelectedLanguage("all");
                setSelectedAvailability("all");
                setSortBy("popular");
              }}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-vaony-blue px-5 py-2.5 text-xs font-semibold text-white hover:bg-vaony-deep transition-all duration-200 cursor-pointer"
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
