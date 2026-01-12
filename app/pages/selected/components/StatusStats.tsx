import { StatCard } from "@/app/pages/dashboard/components/ui/StatCard";
import { VendorStatus, STATUS_LABEL } from "@/app/lib/status";
import { VendorSelected } from "@/lib/types";

export function StatusStats({
  total,
  byStatus,
  confirmedVendors,
}: {
  total: number;
  byStatus: Record<VendorStatus, number>;
  confirmedVendors: VendorSelected[];
}) {
  const totalConfirmados = byStatus.confirmado || 0;

  const menuEquipConfirmados = confirmedVendors.filter(
    (v) => Boolean((v as any).merchant_id) && Boolean((v as any).equipment_profile_id)
  ).length;

  const bannerConfirmados = confirmedVendors.filter(
    (v) => Boolean((v as any).banner_profile_id)
  ).length;

  return (
    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
      {total > 0 && <StatCard label="Total" value={total} />}

      {(byStatus.selecionado || 0) > 0 && (
        <StatCard label={STATUS_LABEL.selecionado} value={byStatus.selecionado} />
      )}

      {(byStatus.aguardando_assinatura || 0) > 0 && (
        <StatCard
          label={STATUS_LABEL.aguardando_assinatura}
          value={byStatus.aguardando_assinatura}
        />
      )}

      {(byStatus.aguardando_pagamento || 0) > 0 && (
        <StatCard
          label={STATUS_LABEL.aguardando_pagamento}
          value={byStatus.aguardando_pagamento}
        />
      )}

      {(byStatus.confirmado || 0) > 0 && (
        <StatCard label={STATUS_LABEL.confirmado} value={byStatus.confirmado} />
      )}

      {(byStatus.desistente || 0) > 0 && (
        <StatCard label={STATUS_LABEL.desistente} value={byStatus.desistente} />
      )}

      {totalConfirmados > 0 && menuEquipConfirmados > 0 && (
        <StatCard
          label="Menu/Equip."
          value={`${menuEquipConfirmados} / ${totalConfirmados}`}
        />
      )}

      {totalConfirmados > 0 && bannerConfirmados > 0 && (
        <StatCard
          label="Banner"
          value={`${bannerConfirmados} / ${totalConfirmados}`}
        />
      )}
    </div>
  );
}
