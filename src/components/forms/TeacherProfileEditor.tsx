"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { FieldWrap, Input, Textarea } from "@/components/ui/Field";
import { SoftwareBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

interface ProfileData {
  userId: string;
  title: string;
  specialization: string;
  bio: string;
  languages: string;
  linkedinUrl: string;
  githubUrl: string;
  websiteUrl: string;
  youtubeUrl: string;
  extraSubjects: string;
  yearsExperience: string;
  softwareTags: string[];
  credentials: { id: string; title: string; institution: string; fileUrl: string | null }[];
  portfolioItems: { id: string; title: string; type: string; url: string }[];
}

export function TeacherProfileEditor({ profile }: { profile: ProfileData }) {
  const [tags, setTags] = useState<string[]>(profile.softwareTags);
  const [tagInput, setTagInput] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function addTag() {
    const name = tagInput.trim();
    if (name && !tags.includes(name) && tags.length < 30) {
      setTags((t) => [...t, name]);
    }
    setTagInput("");
  }

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const res = await fetch("/api/teacher/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, softwareTags: tags }),
    });
    setBusy(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    } else setError("Could not save the profile.");
  }

  async function addItem(endpoint: string, form: HTMLFormElement) {
    const res = await fetch(endpoint, { method: "POST", body: new FormData(form) });
    if (res.ok) {
      form.reset();
      router.refresh();
    }
  }

  async function removeItem(endpoint: string, id: string) {
    await fetch(`${endpoint}?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={saveProfile} className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-vaony-ink">Profile details</h2>
            <Link
              href={`/teachers/${profile.userId}`}
              target="_blank"
              className="text-xs text-vaony-blue hover:underline"
            >
              View public page ↗
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <FieldWrap label="Academic title" htmlFor="tp-title" hint='e.g. "M.Sc. Mechanical Engineering"'>
              <Input id="tp-title" name="title" defaultValue={profile.title} />
            </FieldWrap>
            <FieldWrap label="Area of specialization" htmlFor="tp-spec">
              <Input id="tp-spec" name="specialization" defaultValue={profile.specialization} />
            </FieldWrap>
          </div>
          <FieldWrap label="Biography" htmlFor="tp-bio" hint="Academic and professional background — this is your showcase.">
            <Textarea id="tp-bio" name="bio" defaultValue={profile.bio} className="min-h-36" />
          </FieldWrap>
          <div className="grid gap-5 sm:grid-cols-2">
            <FieldWrap label="Languages of instruction" htmlFor="tp-lang" hint='Comma-separated, e.g. "Spanish, English"'>
              <Input id="tp-lang" name="languages" defaultValue={profile.languages} />
            </FieldWrap>
            <FieldWrap label="Years of experience" htmlFor="tp-years" hint="Shown on your card in the teacher directory.">
              <Input
                id="tp-years"
                name="yearsExperience"
                type="number"
                min={0}
                max={60}
                defaultValue={profile.yearsExperience}
              />
            </FieldWrap>
          </div>

          <FieldWrap
            label="Additional subjects"
            htmlFor="tp-extra"
            hint='Comma-separated topics you also prepare on request, e.g. "Blueprint reading, Metrology"'
          >
            <Input id="tp-extra" name="extraSubjects" defaultValue={profile.extraSubjects} />
          </FieldWrap>

          <FieldWrap
            label="Intro video (YouTube)"
            htmlFor="tp-yt"
            hint="Paste the video link — students see it on your public page."
          >
            <Input
              id="tp-yt"
              name="youtubeUrl"
              type="url"
              defaultValue={profile.youtubeUrl}
              placeholder="https://www.youtube.com/watch?v=…"
            />
          </FieldWrap>

          <FieldWrap label="Software & tools" htmlFor="tp-tag" hint="Press Enter or Add after each tool (AutoCAD, MATLAB, Python…).">
            <div>
              <div className="flex gap-2">
                <Input
                  id="tp-tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" variant="secondary" onClick={addTag}>Add</Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTags(tags.filter((x) => x !== t))}
                    title="Remove tag"
                    className="group"
                  >
                    <SoftwareBadge name={`${t} ×`} />
                  </button>
                ))}
              </div>
            </div>
          </FieldWrap>

          <div className="grid gap-5 sm:grid-cols-3">
            <FieldWrap label="LinkedIn" htmlFor="tp-li">
              <Input id="tp-li" name="linkedinUrl" type="url" defaultValue={profile.linkedinUrl} placeholder="https://…" />
            </FieldWrap>
            <FieldWrap label="GitHub" htmlFor="tp-gh">
              <Input id="tp-gh" name="githubUrl" type="url" defaultValue={profile.githubUrl} placeholder="https://…" />
            </FieldWrap>
            <FieldWrap label="Website" htmlFor="tp-web">
              <Input id="tp-web" name="websiteUrl" type="url" defaultValue={profile.websiteUrl} placeholder="https://…" />
            </FieldWrap>
          </div>

          {saved && <p className="text-sm text-emerald-600">Profile saved.</p>}
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save profile"}</Button>
        </form>
      </Card>

      {/* Credentials */}
      <Card>
        <h2 className="font-display text-lg font-semibold text-vaony-ink">
          Certificates &amp; credentials
        </h2>
        <ul className="mt-4 space-y-2">
          {profile.credentials.map((c) => (
            <li key={c.id} className="flex items-center justify-between rounded-xl border border-vaony-ink/8 p-3">
              <div>
                <p className="text-sm font-medium text-vaony-ink">{c.title}</p>
                <p className="text-xs text-vaony-ink/55">
                  {c.institution}
                  {c.fileUrl && (
                    <>
                      {" · "}
                      <a href={c.fileUrl} target="_blank" rel="noopener noreferrer" className="text-vaony-blue hover:underline">file ↗</a>
                    </>
                  )}
                </p>
              </div>
              <button
                onClick={() => removeItem("/api/teacher/credentials", c.id)}
                className="rounded-lg p-2 text-vaony-ink/40 hover:bg-red-50 hover:text-red-600"
                aria-label={`Delete credential ${c.title}`}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            void addItem("/api/teacher/credentials", e.currentTarget);
          }}
        >
          <Input name="title" placeholder="Certificate title" required aria-label="Certificate title" />
          <Input name="institution" placeholder="Issuing institution" required aria-label="Issuing institution" />
          <Input name="file" type="file" accept=".pdf,.jpg,.jpeg,.png" aria-label="Certificate file" className="file:mr-2 file:rounded-lg file:border-0 file:bg-vaony-blue/10 file:px-2 file:py-1 file:text-xs file:text-vaony-blue" />
          <Button type="submit" variant="secondary">Add</Button>
        </form>
      </Card>

      {/* Portfolio */}
      <Card>
        <h2 className="font-display text-lg font-semibold text-vaony-ink">Projects &amp; portfolio</h2>
        <ul className="mt-4 space-y-2">
          {profile.portfolioItems.map((p) => (
            <li key={p.id} className="flex items-center justify-between rounded-xl border border-vaony-ink/8 p-3">
              <div>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-vaony-blue hover:underline">
                  {p.title} ↗
                </a>
                <p className="text-[11px] text-vaony-ink/45">{p.type.toLowerCase()}</p>
              </div>
              <button
                onClick={() => removeItem("/api/teacher/portfolio", p.id)}
                className="rounded-lg p-2 text-vaony-ink/40 hover:bg-red-50 hover:text-red-600"
                aria-label={`Delete portfolio item ${p.title}`}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            void addItem("/api/teacher/portfolio", e.currentTarget);
          }}
        >
          <Input name="title" placeholder="Project title" required aria-label="Project title" />
          <Input name="url" type="url" placeholder="External link (optional if file)" aria-label="Project link" />
          <Input name="file" type="file" accept=".pdf,.jpg,.jpeg,.png" aria-label="Project file" className="file:mr-2 file:rounded-lg file:border-0 file:bg-vaony-blue/10 file:px-2 file:py-1 file:text-xs file:text-vaony-blue" />
          <Button type="submit" variant="secondary">Add</Button>
        </form>
      </Card>
    </div>
  );
}
