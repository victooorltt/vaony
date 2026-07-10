"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FieldWrap, Input, Select } from "@/components/ui/Field";

export function ResourceUploadForm({
  courses,
  students,
}: {
  courses: { id: string; title: string }[];
  students: { id: string; name: string }[];
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setDone(false);
    const res = await fetch("/api/materials", {
      method: "POST",
      body: new FormData(e.currentTarget),
    });
    setBusy(false);
    if (res.ok) {
      setDone(true);
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } else {
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      setError(json.error ?? "Upload failed");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FieldWrap label="Title" htmlFor="rs-title">
        <Input id="rs-title" name="title" placeholder="Week 3 — Integrals exercise set" required />
      </FieldWrap>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldWrap label="For course group" htmlFor="rs-course" hint="All enrolled students get access.">
          <Select id="rs-course" name="courseId" defaultValue="">
            <option value="">— none —</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </Select>
        </FieldWrap>
        <FieldWrap label="Or a specific student" htmlFor="rs-student" hint="Only this student sees it.">
          <Select id="rs-student" name="studentId" defaultValue="">
            <option value="">— none —</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
        </FieldWrap>
      </div>
      <FieldWrap label="File" htmlFor="rs-file" hint="PDF, DOCX, XLSX, JPG, PNG, MP4 or ZIP — up to 10 MB.">
        <Input
          id="rs-file"
          name="file"
          type="file"
          required
          accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png,.mp4,.zip"
          className="file:mr-3 file:rounded-lg file:border-0 file:bg-vaony-blue/10 file:px-3 file:py-1.5 file:text-vaony-blue"
        />
      </FieldWrap>
      {done && <p className="text-sm text-emerald-600">Resource uploaded.</p>}
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <Button type="submit" disabled={busy}>{busy ? "Uploading…" : "Upload resource"}</Button>
    </form>
  );
}
