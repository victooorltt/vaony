export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="grid-pattern flex flex-col items-center justify-center rounded-2xl border border-dashed border-vaony-blue/20 px-6 py-14 text-center">
      <h3 className="font-display text-lg font-semibold text-vaony-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-vaony-ink/60">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
