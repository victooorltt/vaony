import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Sessions, materials and student results at Vaony.",
};

/** CSS-only placeholder art until the client provides real photos/videos —
 *  each category gets its own geometric treatment on the coordinate grid. */
const placeholderArt: Record<string, string> = {
  Mathematics: "from-vaony-blue/15 to-vaony-deep/25",
  CNC: "from-vaony-amber/20 to-vaony-blue/15",
  Programming: "from-vaony-deep/20 to-vaony-blue/10",
  Engineering: "from-vaony-blue/10 to-vaony-amber/20",
  Results: "from-emerald-200/40 to-vaony-blue/10",
};

const glyphs: Record<string, string> = {
  Mathematics: "∫ dx",
  CNC: "G01 X Y",
  Programming: "def f():",
  Engineering: "ρv²/2",
  Results: "10/10",
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const items = await db.galleryItem.findMany({
    where: { published: true, ...(category ? { category } : {}) },
    orderBy: { createdAt: "desc" },
  });
  const categories = [...new Set((await db.galleryItem.findMany({ where: { published: true }, select: { category: true } })).map((i) => i.category))];

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-wider text-vaony-blue">gallery</p>
      <h1 className="mt-2 font-display text-4xl font-bold text-vaony-ink">
        Sessions, materials &amp; results
      </h1>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/gallery"
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition",
            !category ? "brand-gradient text-white" : "border border-vaony-ink/15 bg-white text-vaony-ink/70"
          )}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c}
            href={`/gallery?category=${encodeURIComponent(c)}`}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition",
              category === c ? "brand-gradient text-white" : "border border-vaony-ink/15 bg-white text-vaony-ink/70"
            )}
          >
            {c}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <figure
            key={item.id}
            className="group overflow-hidden rounded-2xl border border-vaony-ink/8 bg-white shadow-sm"
          >
            {item.mediaUrl.startsWith("placeholder:") ? (
              <div
                className={cn(
                  "grid-pattern flex aspect-video items-center justify-center bg-gradient-to-br transition group-hover:scale-[1.02]",
                  placeholderArt[item.category] ?? "from-vaony-blue/10 to-vaony-deep/20"
                )}
              >
                <span className="font-mono text-2xl text-vaony-deep/60">
                  {glyphs[item.category] ?? "vaony"}
                </span>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.mediaUrl}
                alt={item.title}
                loading="lazy"
                className="aspect-video w-full object-cover transition group-hover:scale-[1.02]"
              />
            )}
            <figcaption className="flex items-center justify-between p-4">
              <span className="text-sm font-medium text-vaony-ink">{item.title}</span>
              <span className="font-mono text-[11px] text-vaony-blue">{item.category}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      {items.length === 0 && (
        <p className="mt-12 text-center text-vaony-ink/50">Nothing here yet.</p>
      )}
    </div>
  );
}
