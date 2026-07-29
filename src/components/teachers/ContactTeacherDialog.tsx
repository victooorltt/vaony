"use client";

import { useEffect, useRef, useState } from "react";
import { ChatBubbleLeftRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { FieldWrap, Input, Textarea } from "@/components/ui/Field";

interface Props {
  teacherName: string;
  specialization: string | null;
  /** Prefills the form when the visitor is already signed in. */
  defaults?: { name: string; email: string };
}

/** "Contactar" on a public teacher profile: sends the enquiry to the Vaony team,
 *  who route it to the teacher. Works for signed-out visitors too. */
export function ContactTeacherDialog({ teacherName, specialization, defaults }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("input, textarea")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function close() {
    setOpen(false);
    setStatus("idle");
    setError("");
    lastFocused.current?.focus();
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        phone: "",
        subject: `Consulta para ${teacherName}${specialization ? ` — ${specialization}` : ""}`,
        message: form.get("message"),
        website: "",
      }),
    });
    if (res.ok) {
      setStatus("sent");
    } else {
      setStatus("error");
      setError("No pudimos enviar tu mensaje. Revisa los datos e inténtalo de nuevo.");
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={() => {
          lastFocused.current = document.activeElement as HTMLElement | null;
          setOpen(true);
        }}
      >
        <ChatBubbleLeftRightIcon className="h-4.5 w-4.5" />
        Contactar
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-100 flex items-end justify-center bg-vaony-ink/45 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-teacher-title"
            className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-vaony-blue">
                  Escribir al profesor
                </p>
                <h2
                  id="contact-teacher-title"
                  className="mt-1.5 font-display text-2xl font-bold text-vaony-ink"
                >
                  Contactar a {teacherName}
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Cerrar"
                className="-mr-2 -mt-2 cursor-pointer rounded-lg p-2 text-vaony-ink/45 transition hover:bg-vaony-ink/5 hover:text-vaony-ink"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {status === "sent" ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                <p className="font-display text-lg font-bold text-emerald-800">
                  Mensaje enviado
                </p>
                <p className="mt-2 text-sm leading-relaxed text-emerald-800/80">
                  Te responderemos al correo que indicaste, normalmente en menos de
                  24 horas.
                </p>
                <Button type="button" variant="secondary" className="mt-5" onClick={close}>
                  Cerrar
                </Button>
              </div>
            ) : (
              <>
                <p className="mt-3 text-sm leading-relaxed text-vaony-ink/65">
                  Cuéntale qué quieres aprender y cuándo te vendría bien. El equipo de
                  Vaony le hace llegar tu mensaje y te responde por correo.
                </p>

                <form onSubmit={submit} className="mt-6 space-y-4">
                  <FieldWrap label="Tu nombre" htmlFor="ct-name">
                    <Input
                      id="ct-name"
                      name="name"
                      required
                      minLength={2}
                      autoComplete="name"
                      defaultValue={defaults?.name}
                      placeholder="Nombre y apellido"
                    />
                  </FieldWrap>

                  <FieldWrap label="Tu correo" htmlFor="ct-email">
                    <Input
                      id="ct-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      defaultValue={defaults?.email}
                      placeholder="tu@correo.com"
                    />
                  </FieldWrap>

                  <FieldWrap
                    label="Tu mensaje"
                    htmlFor="ct-message"
                    hint="Mínimo 10 caracteres."
                  >
                    <Textarea
                      id="ct-message"
                      name="message"
                      required
                      minLength={10}
                      maxLength={4000}
                      className="min-h-32"
                      placeholder={`Hola ${teacherName.split(" ")[0]}, me gustaría preparar…`}
                    />
                  </FieldWrap>

                  {error && (
                    <p className="text-sm text-red-600" role="alert">
                      {error}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 pt-1">
                    <Button type="submit" disabled={status === "sending"}>
                      {status === "sending" ? "Enviando…" : "Enviar mensaje"}
                    </Button>
                    <Button type="button" variant="ghost" onClick={close}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
