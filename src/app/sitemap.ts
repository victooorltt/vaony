import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courses, teachers] = await Promise.all([
    db.course.findMany({ where: { published: true }, select: { slug: true } }),
    db.teacherProfile.findMany({ select: { userId: true } }),
  ]);

  const staticPages = ["", "/courses", "/teachers", "/about", "/contact", "/apply-teacher"].map(
    (p) => ({ url: `${BASE}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.8 })
  );

  return [
    ...staticPages,
    ...courses.map((c) => ({
      url: `${BASE}/courses/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...teachers.map((t) => ({
      url: `${BASE}/teachers/${t.userId}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
