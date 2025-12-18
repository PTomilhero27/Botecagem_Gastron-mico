export type FiltersState = {
  q: string;
  tipo: string;
  tenda: string;
  energia: string;
  gas: string;
  equip: string;
};

export function Filters({
  filters,
  setFilters,
  tipos,
  tendas,
}: {
  filters: FiltersState;
  setFilters: (v: FiltersState) => void;
  tipos: string[];
  tendas: string[];
}) {
  return (
    <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-6">
        {/* <div className="lg:col-span-2">
          <label className="text-xs font-medium text-zinc-600">Busca</label>
          <input
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            placeholder="Nome, telefone, responsável…"
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </div> */}

        <div>
          <label className="text-xs font-medium text-zinc-600">Tipo</label>
          <select
            value={filters.tipo}
            onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {tipos.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-600">Tenda</label>
          <select
            value={filters.tenda}
            onChange={(e) => setFilters({ ...filters, tenda: e.target.value })}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          >
            <option value="">Todas</option>
            {tendas.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-600">Energia</label>
          <select
            value={filters.energia}
            onChange={(e) => setFilters({ ...filters, energia: e.target.value })}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            <option value="Sim">Sim</option>
            <option value="Não">Não</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-600">Gás</label>
          <select
            value={filters.gas}
            onChange={(e) => setFilters({ ...filters, gas: e.target.value })}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            <option value="Sim">Sim</option>
            <option value="Não">Não</option>
          </select>
        </div>

        {/* <div className="lg:col-span-2">
          <label className="text-xs font-medium text-zinc-600">Equipamento (contém)</label>
          <input
            value={filters.equip}
            onChange={(e) => setFilters({ ...filters, equip: e.target.value })}
            placeholder="ex: fritadeira, chapa, freezer…"
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </div> */}
      </div>
    </div>
  );
}
