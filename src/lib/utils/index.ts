import { formatInTimeZone } from "date-fns-tz";

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatMoney(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function formatInTz(date: Date | string, tz: string, pattern = "EEE, MMM d yyyy · HH:mm"): string {
  return formatInTimeZone(new Date(date), tz, pattern);
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

/** Extracts the 11-char video id from watch, youtu.be, embed and shorts URLs. */
export function parseYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1);
      return /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      const v = parsed.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return v;
      const match = parsed.pathname.match(/^\/(?:embed|shorts|v)\/([\w-]{11})/);
      return match?.[1] ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
