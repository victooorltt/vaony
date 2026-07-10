"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit() {
    if (!rating) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, rating, comment: comment || undefined }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else {
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      setError(json.error ?? "Could not submit review");
    }
  }

  if (!open) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Rate this session
      </Button>
    );
  }

  return (
    <div className="w-full space-y-3 rounded-xl border border-vaony-ink/8 bg-vaony-paper p-4">
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            role="radio"
            aria-checked={rating === i}
            aria-label={`${i} star${i > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(i)}
          >
            <StarIcon
              className={cn(
                "h-7 w-7 transition",
                i <= (hover || rating) ? "text-vaony-amber" : "text-vaony-ink/15"
              )}
            />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="What did you think of the class? (optional)"
        rows={2}
        className="w-full rounded-xl border border-vaony-ink/12 px-3 py-2 text-sm outline-none focus:border-vaony-blue"
      />
      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={submit} disabled={busy || !rating}>
          {busy ? "Sending…" : "Submit review"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
}
