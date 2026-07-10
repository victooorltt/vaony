import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { GalleryUploadForm } from "@/components/admin/GalleryUploadForm";

export default async function AdminGalleryPage() {
  const items = await db.galleryItem.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <h1 className="font-display text-3xl font-bold text-vaony-ink">Gallery</h1>

      <Card>
        <h2 className="font-display text-lg font-semibold text-vaony-ink">Add item</h2>
        <div className="mt-4">
          <GalleryUploadForm />
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <Card key={item.id} className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-vaony-ink">{item.title}</p>
              <p className="font-mono text-[11px] text-vaony-ink/50">
                {item.category} · {item.type.toLowerCase()}
                {item.mediaUrl.startsWith("placeholder:") && " · css placeholder"}
              </p>
            </div>
            <AdminActionButton
              endpoint={`/api/admin/gallery?id=${item.id}`}
              method="DELETE"
              label="Delete"
              variant="danger"
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
