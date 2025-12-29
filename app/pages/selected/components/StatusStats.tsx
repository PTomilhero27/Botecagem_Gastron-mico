import { StatCard } from "@/app/pages/dashboard/components/ui/StatCard";
import { VendorStatus, STATUS_LABEL } from "@/app/lib/status";

export function StatusStats({
  total,
  byStatus,
}: {
  total: number;
  byStatus: Record<VendorStatus, number>;
}) {
  return (
    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        label="Total"
        value={total}
      />

      <StatCard
        label={STATUS_LABEL.aguardando_assinatura}
        value={byStatus.aguardando_assinatura || 0}
      />

      <StatCard
        label={STATUS_LABEL.aguardando_pagamento}
        value={byStatus.aguardando_pagamento || 0}
      />

      <StatCard
        label={STATUS_LABEL.confirmado}
        value={byStatus.confirmado || 0}
      />

      <StatCard
        label={STATUS_LABEL.desistente}
        value={byStatus.desistente || 0}
      />
    </div>
  );
}
