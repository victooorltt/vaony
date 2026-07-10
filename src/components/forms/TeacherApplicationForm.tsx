"use client";

import { useState } from "react";
import { teacherApplicationSchema } from "@/lib/validators";
import { Button } from "@/components/ui/Button";
import { FieldWrap, Input, Textarea } from "@/components/ui/Field";

export function TeacherApplicationForm() {
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const parsed = teacherApplicationSchema.safeParse(
      Object.fromEntries(formData.entries())
    );
    if (!parsed.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    const cv = formData.get("cv");
    if (!(cv instanceof File) || cv.size === 0 || !cv.name.toLowerCase().endsWith(".pdf")) {
      setErrors({ cv: "Attach your CV as a PDF file" });
      return;
    }
    setErrors({});
    setStatus("sending");
    const res = await fetch("/api/applications", { method: "POST", body: formData });
    if (res.ok) {
      setStatus("sent");
      form.reset();
    } else setStatus("error");
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <p className="font-display text-lg font-semibold text-emerald-800">Application received</p>
        <p className="mt-1 text-sm text-emerald-700">
          Our team reviews every application manually. We&apos;ll email you once your
          teacher account is activated.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldWrap label="Full name" error={errors.fullName} htmlFor="fullName">
          <Input id="fullName" name="fullName" autoComplete="name" />
        </FieldWrap>
        <FieldWrap label="Email" error={errors.email} htmlFor="app-email">
          <Input id="app-email" name="email" type="email" autoComplete="email" />
        </FieldWrap>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldWrap label="Area of specialization" error={errors.specialization} htmlFor="specialization">
          <Input id="specialization" name="specialization" placeholder="e.g. Fluid Mechanics, Python, CNC" />
        </FieldWrap>
        <FieldWrap label="Years of experience" error={errors.yearsExperience} htmlFor="yearsExperience">
          <Input id="yearsExperience" name="yearsExperience" type="number" min={0} max={60} />
        </FieldWrap>
      </div>
      <FieldWrap label="Brief bio" error={errors.bio} htmlFor="bio" hint="Academic background, professional experience, and what you'd teach.">
        <Textarea id="bio" name="bio" />
      </FieldWrap>
      <FieldWrap label="CV (PDF)" error={errors.cv} htmlFor="cv">
        <Input id="cv" name="cv" type="file" accept=".pdf" className="file:mr-3 file:rounded-lg file:border-0 file:bg-vaony-blue/10 file:px-3 file:py-1.5 file:text-vaony-blue" />
      </FieldWrap>
      {status === "error" && (
        <p className="text-sm text-red-600" role="alert">Something went wrong. Please try again.</p>
      )}
      <Button type="submit" size="lg" disabled={status === "sending"}>
        {status === "sending" ? "Submitting…" : "Submit application"}
      </Button>
    </form>
  );
}
