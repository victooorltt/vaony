import type { Metadata } from "next";
import {
  BanknotesIcon,
  UserGroupIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { TeacherApplicationForm } from "@/components/forms/TeacherApplicationForm";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Conviértete en profesor — Vaony",
  description:
    "Postúlate para enseñar en Vaony: fija tu tarifa, publica tu disponibilidad y da clases online a estudiantes de todo el mundo.",
};

const reasons = [
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

const steps = [
  {
    title: "Envías tu postulación",
    description: "Nos cuentas qué enseñas y adjuntas tu CV en PDF.",
  },
  {
    title: "Revisamos tu perfil",
    description:
      "Validamos tus credenciales una por una. Respondemos en pocos días.",
  },
  {
    title: "Publicas tu perfil",
    description:
      "Completas tus materias, tarifas y horarios, y empiezas a recibir reservas.",
  },
];

export default function ApplyTeacherPage() {
  return (
    <div className="pb-24">
      {/* ---- HEADER ---- */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_320px]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                ENSEÑA EN VAONY
              </p>
              <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-vaony-ink sm:text-5xl">
                Enseña lo que dominas
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-vaony-ink/75">
                Los profesores de Vaony son ingenieros y especialistas a quienes les
                gusta explicar. Da clases online desde donde estés, conserva tu
                trabajo actual y cobra por sesión.
              </p>

              <ul className="mt-9 space-y-5">
                {reasons.map((r) => (
                  <li key={r.title} className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-vaony-amber/20 text-amber-700">
                      <r.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="font-display text-base font-bold text-vaony-ink">
                        {r.title}
                      </h2>
                      <p className="mt-0.5 text-sm leading-relaxed text-vaony-ink/70">
                        {r.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Process — a real sequence, so it is numbered */}
            <div className="rounded-2xl border border-vaony-amber/30 bg-vaony-amber/8 p-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                Cómo es el proceso
              </p>
              <ol className="mt-5 space-y-5">
                {steps.map((step, i) => (
                  <li key={step.title} className="flex gap-3.5">
                    <span
                      aria-hidden
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white font-display text-xs font-extrabold text-amber-700 shadow-sm"
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-vaony-ink">{step.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-vaony-ink/65">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ---- FORM ---- */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <div className="rounded-3xl border border-vaony-ink/8 bg-white p-6 shadow-sm sm:p-10">
            <h2 className="font-display text-2xl font-bold text-vaony-ink">
              Tu postulación
            </h2>
            <p className="mt-1.5 text-sm text-vaony-ink/60">
              Revisamos cada solicitud a mano. Te escribimos en pocos días.
            </p>
            <div className="mt-8">
              <TeacherApplicationForm />
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
