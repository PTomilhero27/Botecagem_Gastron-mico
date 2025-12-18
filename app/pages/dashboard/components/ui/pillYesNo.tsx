export function PillYesNo({ value }: { value: string }) {
  const yes = value === "Sim";
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium " +
        (yes
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-zinc-100 text-zinc-700 border border-zinc-200")
      }
    >
      {value || "—"}
    </span>
  );
}
