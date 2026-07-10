"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FieldWrap, Input } from "@/components/ui/Field";

export function GalleryUploadForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = e.currentTarget;
    const res = await fetch("/api/admin/gallery", {
      method: "POST",
      body: new FormData(form),
    });
    setBusy(false);
    if (res.ok) {
      form.reset();
      router.refresh();
    } else {
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      setError(json.error ?? "Failed");
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
      <Input name="title" placeholder="Title" required aria-label="Title" />
      <Input name="category" placeholder="Category (e.g. Mathematics)" required aria-label="Category" />
      <FieldWrap label="" htmlFor="g-file">
        <Input id="g-file" name="file" type="file" accept=".jpg,.jpeg,.png,.mp4,.pdf" aria-label="Media file" className="file:mr-2 file:rounded-lg file:border-0 file:bg-vaony-blue/10 file:px-2 file:py-1 file:text-xs file:text-vaony-blue" />
      </FieldWrap>
      <Button type="submit" variant="secondary" disabled={busy}>
        {busy ? "…" : "Add"}
      </Button>
      {error && <p className="col-span-full text-sm text-red-600" role="alert">{error}</p>}
    </form>
  );
}
