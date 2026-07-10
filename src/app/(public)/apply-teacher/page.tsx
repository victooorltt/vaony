import type { Metadata } from "next";
import { TeacherApplicationForm } from "@/components/forms/TeacherApplicationForm";

export const metadata: Metadata = {
  title: "Teach on Vaony",
  description:
    "Apply to teach on Vaony: set your own schedule and earn teaching the subjects you master.",
};

export default function ApplyTeacherPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-wider text-vaony-blue">
        join the team
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold text-vaony-ink">
        Teach what you master
      </h1>
      <p className="mt-3 text-vaony-ink/65">
        Vaony teachers are engineers and specialists who love explaining. Set
        your weekly availability, keep your day job, and get paid per session.
        Applications are reviewed manually — expect a reply within a few days.
      </p>
      <div className="mt-10 rounded-3xl border border-vaony-ink/8 bg-white p-6 shadow-sm sm:p-10">
        <TeacherApplicationForm />
      </div>
    </div>
  );
}
