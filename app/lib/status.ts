export const STATUS_OPTIONS = [
  "aguardando_assinatura",
  "aguardando_pagamento",
  "confirmado",
  "desistente",
] as const;

export type VendorStatus = (typeof STATUS_OPTIONS)[number];

export const STATUS_LABEL: Record<VendorStatus, string> = {
  aguardando_assinatura: "Aguardando assinatura",
  aguardando_pagamento: "Aguardando pagamento",
  confirmado: "Confirmado",
  desistente: "Desistente",
};

// ✅ inverso: "Aguardando assinatura" -> "aguardando_assinatura"
export const STATUS_VALUE_BY_LABEL: Record<string, VendorStatus> =
  Object.fromEntries(
    Object.entries(STATUS_LABEL).map(([status, label]) => [
      label,
      status as VendorStatus,
    ])
  );
