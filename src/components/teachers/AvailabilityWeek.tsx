"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDaysIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

export interface AvailabilityDay {
  /** yyyy-MM-dd in the teacher's timezone */
  key: string;
  /** e.g. "jue" */
  weekdayLabel: string;
  /** e.g. "30 jul" */
  dayLabel: string;
  /** e.g. ["16:00", "17:00"] */
  times: string[];
}

const INITIAL_DAYS = 4;

/**
 * Read-only preview of a teacher's free slots for the next two weeks.
 * Times are pre-formatted on the server in the teacher's timezone, so the
 * markup is identical on both sides of hydration.
 */
export function AvailabilityWeek({
  days,
  timezoneLabel,
  bookingHref,
}: {
  days: AvailabilityDay[];
  timezoneLabel: string;
  bookingHref: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? days : days.slice(0, INITIAL_DAYS);

  if (days.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-vaony-ink/15 bg-vaony-paper/60 p-6 text-center">
        <p className="text-sm font-medium text-vaony-ink">
          Sin horarios libres publicados por ahora
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-vaony-ink/60">
          Escríbele para acordar un horario a medida.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-vaony-ink/8 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-vaony-ink">
          <CalendarDaysIcon className="h-4.5 w-4.5 text-vaony-blue" />
          Próximos horarios libres
        </span>
        <span className="rounded-full bg-vaony-ink/5 px-2.5 py-1 text-[11px] font-medium text-vaony-ink/55">
          {timezoneLabel}
        </span>
      </div>

      <ul className="mt-5 divide-y divide-vaony-ink/8">
        {visible.map((day) => (
          <li key={day.key} className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:gap-5">
            <div className="flex w-24 shrink-0 items-baseline gap-2 sm:flex-col sm:gap-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-vaony-blue">
                {day.weekdayLabel}
              </span>
              <span className="font-display text-sm font-bold text-vaony-ink">
                {day.dayLabel}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {day.times.map((time) => (
                <Link
                  key={time}
                  href={bookingHref}
                  className="rounded-lg border border-vaony-blue/25 bg-vaony-blue/5 px-3 py-1.5 text-xs font-semibold text-vaony-deep transition-all duration-200 hover:-translate-y-0.5 hover:border-vaony-blue hover:bg-vaony-blue hover:text-white"
                >
                  {time}
                </Link>
              ))}
            </div>
          </li>
        ))}
      </ul>

      {days.length > INITIAL_DAYS && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 cursor-pointer text-xs font-semibold text-vaony-blue hover:text-vaony-deep hover:underline"
        >
          {expanded
            ? "Ver menos días"
            : `Ver ${days.length - INITIAL_DAYS} días más`}
        </button>
      )}

      <Link
        href={bookingHref}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-vaony-blue px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-vaony-blue/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-vaony-deep"
      >
        Reservar una clase
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}
