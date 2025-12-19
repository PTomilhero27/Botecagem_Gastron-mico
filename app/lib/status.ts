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
