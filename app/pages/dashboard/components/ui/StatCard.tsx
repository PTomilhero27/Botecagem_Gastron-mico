export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="text-sm text-zinc-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">{value}</div>
      {hint ? <div className="mt-2 text-xs text-zinc-500">{hint}</div> : null}
    </div>
  );
}
