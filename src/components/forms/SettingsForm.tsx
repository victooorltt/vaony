"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FieldWrap, Input, Select } from "@/components/ui/Field";
import type { SessionUser } from "@/types";

const TIMEZONES = [
  "America/Mexico_City", "America/Monterrey", "America/Tijuana", "America/Bogota",
  "America/Lima", "America/Argentina/Buenos_Aires", "America/Santiago",
  "America/New_York", "America/Chicago", "America/Los_Angeles",
  "Europe/Madrid", "Europe/London", "UTC",
];

export function SettingsForm({ user }: { user: SessionUser }) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/account", { method: "PATCH", body: formData });
    setBusy(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    } else {
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      setError(json.error ?? "Could not save changes");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldWrap label="First name" htmlFor="firstName">
          <Input id="firstName" name="firstName" defaultValue={user.firstName} />
        </FieldWrap>
        <FieldWrap label="Last name" htmlFor="lastName">
          <Input id="lastName" name="lastName" defaultValue={user.lastName} />
        </FieldWrap>
      </div>
      <FieldWrap label="Timezone" htmlFor="timezone" hint="Class times everywhere are shown in this timezone.">
        <Select id="timezone" name="timezone" defaultValue={user.timezone}>
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </Select>
      </FieldWrap>
      <FieldWrap label="Avatar" htmlFor="avatar" hint="PNG or JPG, up to 10 MB.">
        <Input id="avatar" name="avatar" type="file" accept=".png,.jpg,.jpeg,.webp" className="file:mr-3 file:rounded-lg file:border-0 file:bg-vaony-blue/10 file:px-3 file:py-1.5 file:text-vaony-blue" />
      </FieldWrap>
      <hr className="border-vaony-ink/8" />
      <FieldWrap label="New password (optional)" htmlFor="newPassword" hint="Leave blank to keep your current password.">
        <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" />
      </FieldWrap>
      {saved && <p className="text-sm text-emerald-600">Changes saved.</p>}
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button>
    </form>
  );
}
