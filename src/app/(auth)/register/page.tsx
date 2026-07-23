import type { Metadata } from "next";
import Link from "next/link";
import { AcademicCapIcon, BriefcaseIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

export const metadata: Metadata = { title: "Crear cuenta" };

const paths = [
  {
    href: "/register/student",
    label: "Soy estudiante",
    description: "Reserva clases con profesores expertos y aprende a tu ritmo.",
    Icon: AcademicCapIcon,
  },
  {
    href: "/apply-teacher",
    label: "Soy profesor",
    description: "Comparte lo que dominas, define tu horario y gana enseñando.",
    Icon: BriefcaseIcon,
  },
];

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-vaony-ink">Crea tu cuenta</h1>
        <p className="mt-1 text-sm text-vaony-ink/60">¿Cómo quieres empezar en Vaony?</p>
      </div>

      <div className="space-y-3">
        {paths.map(({ href, label, description, Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 rounded-2xl border border-vaony-ink/10 bg-white p-4 transition hover:border-vaony-blue/40 hover:shadow-md hover:shadow-vaony-blue/10"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-vaony-blue/10 text-vaony-blue transition group-hover:bg-vaony-blue group-hover:text-white">
              <Icon className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-vaony-ink">{label}</span>
              <span className="block text-xs text-vaony-ink/60">{description}</span>
            </span>
            <ArrowRightIcon className="h-5 w-5 shrink-0 text-vaony-ink/30 transition group-hover:translate-x-0.5 group-hover:text-vaony-blue" />
          </Link>
        ))}
      </div>

      <p className="text-center text-xs text-vaony-ink/60">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-vaony-blue hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
