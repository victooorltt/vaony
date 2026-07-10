"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, EventSourceFuncArg } from "@fullcalendar/core";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Select, FieldWrap } from "@/components/ui/Field";
import { formatInTz } from "@/lib/utils";

interface TeacherOption {
  id: string;
  name: string;
  courses: { id: string; title: string }[];
}

/**
 * Student booking calendar: month/week views of a teacher's free slots.
 * Slots come from the server in UTC; FullCalendar renders them in the
 * student's timezone via local Date objects.
 */
export function BookingCalendar({
  teachers,
  timezone,
}: {
  teachers: TeacherOption[];
  timezone: string;
}) {
  const [teacherId, setTeacherId] = useState(teachers[0]?.id ?? "");
  const [courseId, setCourseId] = useState(teachers[0]?.courses[0]?.id ?? "");
  const [selected, setSelected] = useState<{ startsAt: string; endsAt: string } | null>(null);
  const [status, setStatus] = useState<"idle" | "booking" | "error">("idle");
  const [error, setError] = useState("");
  const calendarRef = useRef<FullCalendar>(null);
  const router = useRouter();

  const teacher = useMemo(
    () => teachers.find((t) => t.id === teacherId),
    [teachers, teacherId]
  );

  const fetchSlots = useCallback(
    async (info: EventSourceFuncArg) => {
      if (!teacherId) return [];
      const params = new URLSearchParams({
        teacherId,
        from: info.start.toISOString(),
        to: info.end.toISOString(),
      });
      const res = await fetch(`/api/availability?${params}`);
      if (!res.ok) return [];
      const { slots } = (await res.json()) as { slots: { startsAt: string; endsAt: string }[] };
      return slots.map((s) => ({
        id: s.startsAt,
        title: "Available",
        start: s.startsAt,
        end: s.endsAt,
        backgroundColor: "rgba(41,36,253,0.12)",
        borderColor: "#2924FD",
        textColor: "#060D90",
      }));
    },
    [teacherId]
  );

  function onEventClick(arg: EventClickArg) {
    if (!arg.event.start || !arg.event.end) return;
    setSelected({
      startsAt: arg.event.start.toISOString(),
      endsAt: arg.event.end.toISOString(),
    });
    setError("");
  }

  async function book() {
    if (!selected || !courseId || !teacherId) return;
    setStatus("booking");
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherId, courseId, startsAt: selected.startsAt }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string; bookingId?: string };
    if (res.ok && json.bookingId) {
      router.push(`/checkout?booking=${json.bookingId}`);
    } else {
      setStatus("error");
      setError(json.error ?? "Could not book that slot.");
      calendarRef.current?.getApi().refetchEvents();
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <FieldWrap label="Teacher" htmlFor="cal-teacher">
          <Select
            id="cal-teacher"
            value={teacherId}
            onChange={(e) => {
              setTeacherId(e.target.value);
              const t = teachers.find((x) => x.id === e.target.value);
              setCourseId(t?.courses[0]?.id ?? "");
              setSelected(null);
              // refetch after state settles
              setTimeout(() => calendarRef.current?.getApi().refetchEvents(), 0);
            }}
          >
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
        </FieldWrap>
        <FieldWrap label="Course" htmlFor="cal-course">
          <Select id="cal-course" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            {teacher?.courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </Select>
        </FieldWrap>
        <FieldWrap label="Timezone" htmlFor="cal-tz" hint="Change it in Settings.">
          <input
            id="cal-tz"
            disabled
            value={timezone}
            className="w-full rounded-xl border border-vaony-ink/10 bg-vaony-ink/3 px-4 py-2.5 font-mono text-xs text-vaony-ink/60"
          />
        </FieldWrap>
      </div>

      <div className="rounded-2xl border border-vaony-ink/8 bg-white p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek",
          }}
          events={fetchSlots}
          eventClick={onEventClick}
          height="auto"
          slotMinTime="07:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          nowIndicator
        />
      </div>

      {selected && (
        <div className="glass-card flex flex-col items-start justify-between gap-4 rounded-2xl p-5 sm:flex-row sm:items-center">
          <div>
            <p className="font-mono text-xs text-vaony-blue">selected slot</p>
            <p className="mt-1 font-display text-lg font-semibold text-vaony-ink">
              {formatInTz(selected.startsAt, timezone)}
            </p>
            <p className="text-xs text-vaony-ink/55">
              {teacher?.name} · {teacher?.courses.find((c) => c.id === courseId)?.title}
            </p>
            {error && <p className="mt-1 text-sm text-red-600" role="alert">{error}</p>}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setSelected(null)}>Clear</Button>
            <Button onClick={book} disabled={status === "booking"}>
              {status === "booking" ? "Booking…" : "Book & pay"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
