import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-vaony-ink/8 bg-white p-6 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Stat tile with mono figure — used across dashboards */
export function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <Card className="p-5">
      <p className="font-mono text-xs uppercase tracking-wider text-vaony-ink/50">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold text-vaony-ink">{value}</p>
      {sub && <p className="mt-1 text-xs text-vaony-ink/50">{sub}</p>}
    </Card>
  );
}
