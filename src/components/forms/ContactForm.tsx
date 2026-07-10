"use client";

import { useState } from "react";
import { contactSchema } from "@/lib/validators";
import { Button } from "@/components/ui/Button";
import { FieldWrap, Input, Textarea } from "@/components/ui/Field";

type Errors = Partial<Record<string, string>>;

export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors: Errors = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setStatus("sending");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    if (res.ok) {
      setStatus("sent");
      form.reset();
    } else {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <p className="font-display text-lg font-semibold text-emerald-800">Message sent</p>
        <p className="mt-1 text-sm text-emerald-700">
          We&apos;ll reply within 24 hours. Check your inbox for a confirmation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldWrap label="Full name" error={errors.name} htmlFor="name">
          <Input id="name" name="name" autoComplete="name" placeholder="Ada Lovelace" />
        </FieldWrap>
        <FieldWrap label="Email" error={errors.email} htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" />
        </FieldWrap>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldWrap label="Phone (optional)" error={errors.phone} htmlFor="phone">
          <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+52 55 0000 0000" />
        </FieldWrap>
        <FieldWrap label="Subject" error={errors.subject} htmlFor="subject">
          <Input id="subject" name="subject" placeholder="I need help with Calculus II" />
        </FieldWrap>
      </div>
      <FieldWrap label="Message" error={errors.message} htmlFor="message">
        <Textarea id="message" name="message" placeholder="Tell us what you're working on and when you'd like to start." />
      </FieldWrap>
      {/* Honeypot — invisible to humans, bots fill it */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px] h-0 w-0 opacity-0" />
      {status === "error" && (
        <p className="text-sm text-red-600" role="alert">
          Something went wrong sending your message. Please try again.
        </p>
      )}
      <Button type="submit" size="lg" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
