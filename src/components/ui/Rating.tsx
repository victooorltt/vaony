import { StarIcon } from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";

export function Rating({
  value,
  count,
  className,
}: {
  value: number;
  count?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <StarIcon
            key={i}
            className={cn(
              "h-4 w-4",
              i <= Math.round(value) ? "text-vaony-amber" : "text-vaony-ink/15"
            )}
          />
        ))}
      </span>
      <span className="text-xs text-vaony-ink/60">
        {value > 0 ? value.toFixed(1) : "—"}
        {typeof count === "number" && count > 0 && ` (${count})`}
      </span>
      <span className="sr-only">{`Rated ${value.toFixed(1)} out of 5${count ? ` from ${count} reviews` : ""}`}</span>
    </span>
  );
}
