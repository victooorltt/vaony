import type { Metadata } from "next";
import { EnvelopeIcon, ClockIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Ask us anything about courses, teachers, pricing or scheduling.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="grid gap-12 lg:grid-cols-[380px_1fr]">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-vaony-blue">contact</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-vaony-ink">
            Ask us anything
          </h1>
          <p className="mt-3 text-vaony-ink/65">
            Not sure which course fits? Want a specific schedule? Write to us —
            a real person answers within 24 hours.
          </p>
          <ul className="mt-8 space-y-4 text-sm text-vaony-ink/70">
            <li className="flex items-center gap-3">
              <EnvelopeIcon className="h-5 w-5 text-vaony-blue" /> hello@vaony.com
            </li>
            <li className="flex items-center gap-3">
              <ClockIcon className="h-5 w-5 text-vaony-blue" /> Mon–Sat, 9:00–20:00 (CST)
            </li>
            <li className="flex items-center gap-3">
              <GlobeAltIcon className="h-5 w-5 text-vaony-blue" /> 100% online — we teach worldwide
            </li>
          </ul>
          <div className="grid-pattern mt-8 rounded-2xl border border-vaony-ink/8 bg-white p-5">
            <p className="font-mono text-xs text-vaony-blue">response_time</p>
            <p className="mt-1 font-display text-2xl font-bold text-vaony-ink">&lt; 24 h</p>
          </div>
        </div>
        <div className="rounded-3xl border border-vaony-ink/8 bg-white p-6 shadow-sm sm:p-10">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
