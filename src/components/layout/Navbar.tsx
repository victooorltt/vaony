"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  AcademicCapIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/courses", label: "Cursos" },
  { href: "/teachers", label: "Profesores" },
  { href: "/about", label: "Sobre nosotros" },
  { href: "/contact", label: "Contacto" },
];

const registerOptions = [
  {
    href: "/register/student",
    label: "Como estudiante",
    description: "Aprende con clases a tu medida",
    Icon: AcademicCapIcon,
  },
  {
    href: "/apply-teacher",
    label: "Como profesor",
    description: "Enseña lo que dominas y gana dinero",
    Icon: BriefcaseIcon,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const registerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setRegisterOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!registerOpen) return;
    const onClick = (e: MouseEvent) => {
      if (registerRef.current && !registerRef.current.contains(e.target as Node)) {
        setRegisterOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setRegisterOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [registerOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled ? "bg-vaony-paper shadow-sm" : "glass"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Inicio de Vaony" className="flex items-center gap-2">
          <Image src="/brand/vaony_con_letra.svg" alt="" width={100} height={100} priority />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition",
                pathname.startsWith(l.href)
                  ? "text-vaony-blue"
                  : "text-vaony-ink/70 hover:text-vaony-blue"
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ButtonLink href="/login" variant="ghost" size="sm">
            Iniciar sesión
          </ButtonLink>

          <div className="relative" ref={registerRef}>
            <button
              type="button"
              onClick={() => setRegisterOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={registerOpen}
              className="brand-gradient inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white shadow-lg shadow-[#2924fd]/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[#2924fd]/40"
            >
              Registrarse
              <ChevronDownIcon
                className={cn("h-4 w-4 transition-transform", registerOpen && "rotate-180")}
              />
            </button>

            {registerOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-vaony-ink/8 bg-white p-1.5 shadow-xl shadow-vaony-blue/10"
              >
                {registerOptions.map(({ href, label, description, Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    role="menuitem"
                    className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-vaony-blue/5"
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-vaony-blue/10 text-vaony-blue">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-vaony-ink">{label}</span>
                      <span className="block text-xs text-vaony-ink/60">{description}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          className="rounded-lg p-2 text-vaony-ink md:hidden"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-vaony-ink/8 bg-vaony-paper px-4 pb-6 pt-2 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-vaony-ink/80 hover:bg-vaony-blue/5"
            >
              {l.label}
            </Link>
          ))}

          <p className="mt-4 px-3 text-xs font-semibold uppercase tracking-[0.14em] text-vaony-ink/40">
            Registrarse
          </p>
          <div className="mt-1 space-y-1">
            {registerOptions.map(({ href, label, description, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-vaony-blue/5"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-vaony-blue/10 text-vaony-blue">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-vaony-ink">{label}</span>
                  <span className="block text-xs text-vaony-ink/60">{description}</span>
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-4">
            <ButtonLink href="/login" variant="secondary" size="sm" className="w-full">
              Iniciar sesión
            </ButtonLink>
          </div>
        </div>
      )}
    </header>
  );
}
