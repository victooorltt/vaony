import { cn } from "@/lib/utils";

type Tone = "blue" | "amber" | "green" | "red" | "neutral";

const tones: Record<Tone, string> = {
  blue: "bg-vaony-blue/10 text-vaony-blue",
  amber: "bg-vaony-amber/15 text-amber-700",
  green: "bg-emerald-100 text-emerald-700",
  red: "bg-red-100 text-red-700",
  neutral: "bg-vaony-ink/8 text-vaony-ink/70",
};

export function Badge({
  tone = "blue",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/** Software / tool tag rendered in mono — part of the technical identity */
export function SoftwareBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-vaony-blue/20 bg-vaony-blue/5 px-2 py-0.5 text-[11px] text-vaony-deep">
      {name}
    </span>
  );
}
