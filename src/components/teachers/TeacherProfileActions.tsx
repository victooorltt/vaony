"use client";

import { useEffect, useState } from "react";
import { HeartIcon, ShareIcon, CheckIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "vaony:saved-teachers";

function readSaved(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

/** Save (local, per-device) and share controls for a public teacher profile. */
export function TeacherProfileActions({
  teacherId,
  teacherName,
}: {
  teacherId: string;
  teacherName: string;
}) {
  const [saved, setSaved] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");

  useEffect(() => {
    setSaved(readSaved().includes(teacherId));
  }, [teacherId]);

  function toggleSaved() {
    const current = readSaved();
    const next = current.includes(teacherId)
      ? current.filter((id) => id !== teacherId)
      : [...current, teacherId];
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable — the button still reflects this session */
    }
    setSaved(next.includes(teacherId));
  }

  async function share() {
    const url = window.location.href;
    const data = {
      title: `${teacherName} — Vaony`,
      text: `Mira el perfil de ${teacherName} en Vaony.`,
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {
        /* dismissed — fall through to copying the link */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareState("copied");
      window.setTimeout(() => setShareState("idle"), 2200);
    } catch {
      /* clipboard blocked — nothing else to offer */
    }
  }

  const base =
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={toggleSaved}
        aria-pressed={saved}
        className={cn(
          base,
          saved
            ? "border-red-200 bg-red-50 text-red-600"
            : "border-vaony-ink/12 bg-white text-vaony-ink/75 hover:border-vaony-ink/25 hover:text-vaony-ink"
        )}
      >
        {saved ? (
          <HeartIconSolid className="h-4.5 w-4.5" />
        ) : (
          <HeartIcon className="h-4.5 w-4.5" />
        )}
        {saved ? "Guardado" : "Guardar"}
      </button>

      <button
        type="button"
        onClick={share}
        className={cn(
          base,
          "border-vaony-ink/12 bg-white text-vaony-ink/75 hover:border-vaony-ink/25 hover:text-vaony-ink"
        )}
      >
        {shareState === "copied" ? (
          <CheckIcon className="h-4.5 w-4.5 text-emerald-600" />
        ) : (
          <ShareIcon className="h-4.5 w-4.5" />
        )}
        {shareState === "copied" ? "Enlace copiado" : "Compartir"}
      </button>
    </div>
  );
}
