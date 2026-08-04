import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const teachers = await db.teacherProfile.findMany({ select: { userId: true } });

  const staticPages = ["", "/teachers", "/about", "/contact", "/apply-teacher"].map(
    (p) => ({ url: `${BASE}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.8 })
  );

  return [
    ...staticPages,
    ...teachers.map((t) => ({
      url: `${BASE}/teachers/${t.userId}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
