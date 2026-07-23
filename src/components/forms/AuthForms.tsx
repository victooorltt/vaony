"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validators";
import { Button } from "@/components/ui/Button";
import { FieldWrap, Input } from "@/components/ui/Field";

type Errors = Partial<Record<string, string>>;

function GoogleButton() {
  return (
    <a
      href="/api/auth/google"
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-vaony-ink/15 bg-white px-4 py-2.5 text-sm font-medium text-vaony-ink transition hover:border-vaony-blue/40"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
        <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.5h6.5c-.2 1.2-1 2.8-2.7 3.9l4 3.1c2.4-2.2 3.7-5.4 3.7-9.2z" />
        <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-4-3.1c-1 .7-2.4 1.2-4 1.2-3.1 0-5.8-2.1-6.7-5H1.1v3.2C3.1 21.4 7.2 24 12 24z" />
        <path fill="#FBBC05" d="M5.3 14.2c-.3-.7-.4-1.4-.4-2.2s.1-1.5.4-2.2V6.6H1.1C.4 8.2 0 10 0 12s.4 3.8 1.1 5.4l4.2-3.2z" />
        <path fill="#EA4335" d="M12 4.8c1.8 0 3 .7 3.7 1.4l3.5-3.4C17.9 1 15.2 0 12 0 7.2 0 3.1 2.6 1.1 6.6l4.2 3.2c.9-2.9 3.6-5 6.7-5z" />
      </svg>
      Continuar con Google
    </a>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 text-xs text-vaony-ink/40">
      <span className="h-px flex-1 bg-vaony-ink/10" /> o <span className="h-px flex-1 bg-vaony-ink/10" />
    </div>
  );
}

function useFormPost(endpoint: string) {
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function post(data: unknown, onOk?: (json: { redirect?: string }) => void) {
    setBusy(true);
    setServerError("");
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string; redirect?: string };
    setBusy(false);
    if (!res.ok) {
      setServerError(json.error ?? "Algo salió mal. Inténtalo de nuevo.");
      return;
    }
    if (onOk) onOk(json);
    else if (json.redirect) router.push(json.redirect);
  }

  return { errors, setErrors, serverError, busy, post, router };
}

function collectErrors(issues: { path: (string | number)[]; message: string }[]): Errors {
  const out: Errors = {};
  for (const i of issues) out[String(i.path[0])] = i.message;
  return out;
}

export function LoginForm() {
  const { errors, setErrors, serverError, busy, post } = useFormPost("/api/auth/login");
  const params = useSearchParams();
  const oauthError = params.get("error");

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.currentTarget).entries());
        const parsed = loginSchema.safeParse(data);
        if (!parsed.success) return setErrors(collectErrors(parsed.error.issues));
        setErrors({});
        void post(parsed.data);
      }}
    >
      <h1 className="font-display text-2xl font-bold text-vaony-ink">Bienvenido de nuevo</h1>
      <GoogleButton />
      <Divider />
      <FieldWrap label="Correo electrónico" error={errors.email} htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" />
      </FieldWrap>
      <FieldWrap label="Contraseña" error={errors.password} htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" />
      </FieldWrap>
      {(serverError || oauthError) && (
        <p className="text-sm text-red-600" role="alert">
          {serverError ||
            (oauthError === "google_not_configured"
              ? "El inicio de sesión con Google aún no está configurado en este entorno."
              : "Falló el inicio de sesión con Google. Usa tu correo y contraseña.")}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Iniciando sesión…" : "Iniciar sesión"}
      </Button>
      <div className="flex items-center justify-between text-xs">
        <Link href="/forgot-password" className="text-vaony-blue hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
        <Link href="/register" className="text-vaony-blue hover:underline">
          Crear cuenta
        </Link>
      </div>
    </form>
  );
}

export function RegisterForm() {
  const { errors, setErrors, serverError, busy, post } = useFormPost("/api/auth/register");

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const raw = Object.fromEntries(new FormData(e.currentTarget).entries());
        const parsed = registerSchema.safeParse({ ...raw, acceptTerms: raw.acceptTerms === "on" });
        if (!parsed.success) return setErrors(collectErrors(parsed.error.issues));
        setErrors({});
        void post(parsed.data);
      }}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-vaony-blue">
          Cuenta de estudiante
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-vaony-ink">Crea tu cuenta</h1>
      </div>
      <GoogleButton />
      <Divider />
      <div className="grid grid-cols-2 gap-3">
        <FieldWrap label="Nombre" error={errors.firstName} htmlFor="firstName">
          <Input id="firstName" name="firstName" autoComplete="given-name" />
        </FieldWrap>
        <FieldWrap label="Apellidos" error={errors.lastName} htmlFor="lastName">
          <Input id="lastName" name="lastName" autoComplete="family-name" />
        </FieldWrap>
      </div>
      <FieldWrap label="Correo electrónico" error={errors.email} htmlFor="reg-email">
        <Input id="reg-email" name="email" type="email" autoComplete="email" />
      </FieldWrap>
      <FieldWrap label="Contraseña" error={errors.password} htmlFor="reg-password" hint="Al menos 8 caracteres.">
        <Input id="reg-password" name="password" type="password" autoComplete="new-password" />
      </FieldWrap>
      <FieldWrap label="Confirmar contraseña" error={errors.confirmPassword} htmlFor="confirmPassword">
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" />
      </FieldWrap>
      <label className="flex items-start gap-2 text-xs text-vaony-ink/70">
        <input type="checkbox" name="acceptTerms" className="mt-0.5 accent-vaony-blue" />
        <span>
          Acepto los Términos y Condiciones y la Política de Privacidad.
          {errors.acceptTerms && (
            <span className="block text-red-600">{errors.acceptTerms}</span>
          )}
        </span>
      </label>
      {serverError && <p className="text-sm text-red-600" role="alert">{serverError}</p>}
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Creando cuenta…" : "Crear cuenta gratis"}
      </Button>
      <p className="text-center text-xs text-vaony-ink/60">
        ¿Quieres enseñar en Vaony?{" "}
        <Link href="/apply-teacher" className="text-vaony-blue hover:underline">
          Regístrate como profesor
        </Link>
      </p>
      <p className="text-center text-xs text-vaony-ink/60">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-vaony-blue hover:underline">Inicia sesión</Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const { errors, setErrors, serverError, busy, post } = useFormPost("/api/auth/forgot-password");
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="text-center">
        <h1 className="font-display text-xl font-bold text-vaony-ink">Revisa tu correo</h1>
        <p className="mt-2 text-sm text-vaony-ink/60">
          Si existe una cuenta con esa dirección, te enviaremos un enlace para
          restablecer tu contraseña. Caduca en 1 hora.
        </p>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = forgotPasswordSchema.safeParse(
          Object.fromEntries(new FormData(e.currentTarget).entries())
        );
        if (!parsed.success) return setErrors(collectErrors(parsed.error.issues));
        setErrors({});
        void post(parsed.data, () => setSent(true));
      }}
    >
      <h1 className="font-display text-2xl font-bold text-vaony-ink">Restablece tu contraseña</h1>
      <p className="text-sm text-vaony-ink/60">
        Introduce tu correo y te enviaremos un enlace para restablecerla.
      </p>
      <FieldWrap label="Correo electrónico" error={errors.email} htmlFor="fp-email">
        <Input id="fp-email" name="email" type="email" autoComplete="email" />
      </FieldWrap>
      {serverError && <p className="text-sm text-red-600" role="alert">{serverError}</p>}
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Enviando…" : "Enviar enlace"}
      </Button>
      <p className="text-center text-xs">
        <Link href="/login" className="text-vaony-blue hover:underline">← Volver a iniciar sesión</Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  const { errors, setErrors, serverError, busy, post, router } = useFormPost("/api/auth/reset-password");
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const raw = Object.fromEntries(new FormData(e.currentTarget).entries());
        const parsed = resetPasswordSchema.safeParse({ ...raw, token });
        if (!parsed.success) return setErrors(collectErrors(parsed.error.issues));
        setErrors({});
        void post(parsed.data, () => router.push("/login"));
      }}
    >
      <h1 className="font-display text-2xl font-bold text-vaony-ink">Elige una nueva contraseña</h1>
      <FieldWrap label="Nueva contraseña" error={errors.password} htmlFor="rp-password">
        <Input id="rp-password" name="password" type="password" autoComplete="new-password" />
      </FieldWrap>
      <FieldWrap label="Confirmar contraseña" error={errors.confirmPassword} htmlFor="rp-confirm">
        <Input id="rp-confirm" name="confirmPassword" type="password" autoComplete="new-password" />
      </FieldWrap>
      {serverError && <p className="text-sm text-red-600" role="alert">{serverError}</p>}
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Guardando…" : "Guardar nueva contraseña"}
      </Button>
    </form>
  );
}
