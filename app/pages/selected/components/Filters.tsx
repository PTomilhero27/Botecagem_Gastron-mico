"use client";

export type FilterItem = {
  key: string; // ex: "status"
  label: string; // ex: "Status"
  options: string[]; // ex: ["Aprovado", "Pendente", ...]
  placeholder?: string; // ex: "Todos"
};

export type FiltersState = Record<string, string>;

function gridColsClass(columns: 2 | 3 | 4 | 5 | 6) {
  // Tailwind não compila string dinâmica tipo `lg:grid-cols-${columns}`
  switch (columns) {
    case 2:
      return "lg:grid-cols-2";
    case 3:
      return "lg:grid-cols-3";
    case 4:
      return "lg:grid-cols-4";
    case 5:
      return "lg:grid-cols-5";
    case 6:
    default:
      return "lg:grid-cols-6";
  }
}

export function Filters({
  filters,
  setFilters,
  items,
  columns = 6,
}: {
  filters: FiltersState;
  setFilters: (v: FiltersState) => void;
  items: FilterItem[];
  columns?: 2 | 3 | 4 | 5 | 6;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className={`grid gap-3 ${gridColsClass(columns)}`}>
        {items.map((item) => (
          <div key={item.key}>
            <label className="text-xs font-medium text-zinc-600">
              {item.label}
            </label>

            <select
              value={filters[item.key] ?? ""}
              onChange={(e) =>
                setFilters({ ...filters, [item.key]: e.target.value })
              }
              className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
            >
              <option value="">{item.placeholder ?? "Todos"}</option>
              {item.options.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
