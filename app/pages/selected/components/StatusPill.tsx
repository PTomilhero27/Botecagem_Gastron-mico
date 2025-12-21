"use client";

import { VendorStatus } from "@/app/lib/status";

const STATUS_UI: Record<VendorStatus, { label: string; cls: string }> = {
  aguardando_assinatura: {
    label: "Aguardando assinatura",
    cls: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  aguardando_pagamento: {
    label: "Aguardando pagamento",
    cls: "bg-orange-50 text-orange-700 ring-orange-200",

  },
  confirmado: {
    label: "Confirmado",
    cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  desistente: {
    label: "Desistente",
    cls: "bg-zinc-100 text-zinc-600 ring-zinc-200",

  },
};


export function StatusPill({ value }: { value: VendorStatus }) {
  const ui =
    STATUS_UI[value] ?? ({
      label: String(value),
      cls: "bg-zinc-100 text-zinc-700 ring-zinc-200",
    } as any);

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1",
        ui.cls,
      ].join(" ")}
    >
      {ui.label}
    </span>
  );
}
