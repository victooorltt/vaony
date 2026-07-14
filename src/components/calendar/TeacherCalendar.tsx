"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";

export interface TeacherCalendarEvent {
  id: string;
  courseTitle: string;
  studentName: string;
  startsAt: string;
  endsAt: string;
  status: string;
}

/**
 * Teacher's week/month view of their booked classes.
 * Confirmed classes render in brand blue; pending (unpaid) in amber.
 */
export function TeacherCalendar({ events }: { events: TeacherCalendarEvent[] }) {
  const calendarEvents = events.map((e) => {
    const pending = e.status === "PENDING";
    return {
      id: e.id,
      title: `${e.courseTitle} · ${e.studentName}`,
      start: e.startsAt,
      end: e.endsAt,
      backgroundColor: pending ? "#FFB020" : "#2924FD",
      borderColor: pending ? "#FFB020" : "#2924FD",
      textColor: pending ? "#000B36" : "#FFFFFF",
    };
  });

  return (
    <div className="rounded-2xl border border-vaony-ink/8 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-vaony-ink/60">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-vaony-blue" />
          Confirmed class
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-vaony-amber" />
          Awaiting student payment
        </span>
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek",
        }}
        events={calendarEvents}
        height="auto"
        slotMinTime="07:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        nowIndicator
      />
    </div>
  );
}
