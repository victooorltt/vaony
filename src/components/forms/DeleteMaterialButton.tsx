"use client";

import { useRouter } from "next/navigation";
import { TrashIcon } from "@heroicons/react/24/outline";

export function DeleteMaterialButton({ id }: { id: string }) {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch(`/api/materials?id=${id}`, { method: "DELETE" });
        router.refresh();
      }}
      className="rounded-lg p-2 text-vaony-ink/40 hover:bg-red-50 hover:text-red-600"
      aria-label="Delete material"
    >
      <TrashIcon className="h-4 w-4" />
    </button>
  );
}
