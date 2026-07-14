"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { FieldWrap, Input, Select } from "@/components/ui/Field";
import { Card } from "@/components/ui/Card";
import { formatInTz } from "@/lib/utils";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface Slot { id: string; weekday: number; startTime: string; endTime: string }
interface Block { id: string; startsAt: string; endsAt: string; reason: string | null }

export function ScheduleManager({
  slots,
  blocks,
  timezone,
}: {
  slots: Slot[];
  blocks: Block[];
  timezone: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function post(payload: Record<string, unknown>) {
    setError("");
    const res = await fetch("/api/teacher/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      setError(json.error ?? "Could not save");
    }
    router.refresh();
  }

  async function remove(kind: "slot" | "block", id: string) {
    await fetch(`/api/teacher/availability?kind=${kind}&id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Weekly template */}
      <Card>
        <h2 className="font-display text-lg font-semibold text-vaony-ink">Weekly availability</h2>
        <p className="mt-1 text-xs text-vaony-ink/55">
          Times are in your timezone (<span className="font-medium text-vaony-ink/80">{timezone}</span>).
          Students see them converted to theirs.
        </p>
        <ul className="mt-4 space-y-2">
          {slots
            .slice()
            .sort((a, b) => a.weekday - b.weekday || a.startTime.localeCompare(b.startTime))
            .map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded-xl border border-vaony-ink/8 p-3">
                <span className="text-sm text-vaony-ink">
                  <strong>{WEEKDAYS[s.weekday]}</strong>{" "}
                  <span className="text-xs">{s.startTime}–{s.endTime}</span>
                </span>
                <button
                  onClick={() => remove("slot", s.id)}
                  className="rounded-lg p-1.5 text-vaony-ink/40 hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove ${WEEKDAYS[s.weekday]} ${s.startTime} slot`}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          {slots.length === 0 && (
            <li className="text-sm text-vaony-ink/50">No availability set — students can&apos;t book you yet.</li>
          )}
        </ul>
        <form
          className="mt-4 grid grid-cols-[1fr_auto_auto_auto] items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            void post({
              kind: "slot",
              weekday: Number(fd.get("weekday")),
              startTime: String(fd.get("startTime")),
              endTime: String(fd.get("endTime")),
            });
          }}
        >
          <FieldWrap label="Day" htmlFor="sm-day">
            <Select id="sm-day" name="weekday" defaultValue="1">
              {WEEKDAYS.map((d, i) => (
                <option key={d} value={i}>{d}</option>
              ))}
            </Select>
          </FieldWrap>
          <FieldWrap label="From" htmlFor="sm-from">
            <Input id="sm-from" name="startTime" type="time" defaultValue="16:00" required />
          </FieldWrap>
          <FieldWrap label="To" htmlFor="sm-to">
            <Input id="sm-to" name="endTime" type="time" defaultValue="20:00" required />
          </FieldWrap>
          <Button type="submit" variant="secondary">Add</Button>
        </form>
      </Card>

      {/* Blocked times */}
      <Card>
        <h2 className="font-display text-lg font-semibold text-vaony-ink">Blocked dates</h2>
        <p className="mt-1 text-xs text-vaony-ink/55">
          Vacations or one-off unavailability — these override your weekly template.
        </p>
        <ul className="mt-4 space-y-2">
          {blocks.map((b) => (
            <li key={b.id} className="flex items-center justify-between rounded-xl border border-vaony-ink/8 p-3">
              <span className="text-sm text-vaony-ink">
                <span className="text-xs">
                  {formatInTz(b.startsAt, timezone, "MMM d HH:mm")} → {formatInTz(b.endsAt, timezone, "MMM d HH:mm")}
                </span>
                {b.reason && <span className="ml-2 text-xs text-vaony-ink/55">({b.reason})</span>}
              </span>
              <button
                onClick={() => remove("block", b.id)}
                className="rounded-lg p-1.5 text-vaony-ink/40 hover:bg-red-50 hover:text-red-600"
                aria-label="Remove blocked period"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </li>
          ))}
          {blocks.length === 0 && <li className="text-sm text-vaony-ink/50">No blocked periods.</li>}
        </ul>
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const starts = String(fd.get("startsAt"));
            const ends = String(fd.get("endsAt"));
            if (!starts || !ends) return;
            void post({
              kind: "block",
              startsAt: new Date(starts).toISOString(),
              endsAt: new Date(ends).toISOString(),
              reason: String(fd.get("reason") ?? "") || undefined,
            });
          }}
        >
          <div className="grid grid-cols-2 gap-2">
            <FieldWrap label="From" htmlFor="bl-from">
              <Input id="bl-from" name="startsAt" type="datetime-local" required />
            </FieldWrap>
            <FieldWrap label="To" htmlFor="bl-to">
              <Input id="bl-to" name="endsAt" type="datetime-local" required />
            </FieldWrap>
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <FieldWrap label="Reason (optional)" htmlFor="bl-reason">
                <Input id="bl-reason" name="reason" placeholder="Vacation" />
              </FieldWrap>
            </div>
            <Button type="submit" variant="secondary">Block</Button>
          </div>
        </form>
        {error && <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>}
      </Card>
    </div>
  );
}
