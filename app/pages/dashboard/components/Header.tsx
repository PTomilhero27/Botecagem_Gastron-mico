export function Header({
  total,
  filtered,
  onClear,
}: {
  total: number;
  filtered: number;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
          Dashboard <span className="text-amber-600">Botecagem Gastronômico</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
         <span className="font-medium text-zinc-800">{filtered}</span> de {total} registros
        </p>
      </div>

      <button
        onClick={onClear}
        className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm shadow-sm hover:bg-zinc-50"
      >
        Limpar filtros
      </button>
    </div>
  );
}
