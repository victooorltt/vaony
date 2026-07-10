"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

/** Generic small action button that hits an admin endpoint and refreshes. */
export function AdminActionButton({
  endpoint,
  method = "PATCH",
  payload,
  label,
  variant = "secondary",
}: {
  endpoint: string;
  method?: "PATCH" | "POST" | "DELETE";
  payload?: Record<string, unknown>;
  label: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function run() {
    setBusy(true);
    setError("");
    const res = await fetch(endpoint, {
      method,
      headers: payload ? { "Content-Type": "application/json" } : undefined,
      body: payload ? JSON.stringify(payload) : undefined,
    });
    setBusy(false);
    if (!res.ok) {
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      setError(json.error ?? "Failed");
      return;
    }
    router.refresh();
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <Button size="sm" variant={variant} onClick={run} disabled={busy}>
        {busy ? "…" : label}
      </Button>
      {error && <span className="text-[11px] text-red-600">{error}</span>}
    </span>
  );
}
