export function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 p-3">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 text-sm text-zinc-900">{value}</div>
    </div>
  );
}
