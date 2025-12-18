import { StatCard } from "@/app/pages/dashboard/components/ui/StatCard";

export function Stats({
  total,
  filtered,
  tiposCount,
  topTiposHint,
  energiaSim,
  gasSim,
}: {
  total: number;
  filtered: number;
  tiposCount: number;
  topTiposHint: string;
  energiaSim: number;
  gasSim: number;
}) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Cadastros" value={filtered} hint={`Filtrados / total: ${filtered}/${total}`} />
      <StatCard label="Tipos (no filtro)" value={tiposCount} hint={topTiposHint} />
      <StatCard label='Energia "Sim"' value={energiaSim} />
      <StatCard label='Gás (GLP) "Sim"' value={gasSim} />
    </div>
  );
}
