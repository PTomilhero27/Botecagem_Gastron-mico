"use client";

import { useEffect, useMemo, useState } from "react";
import { VendorSelected } from "@/lib/types";
import { VendorStatus, STATUS_LABEL } from "@/app/lib/status";
import { Modal } from "@/app/pages/dashboard/components/ui/Modal";
import { Field } from "@/app/pages/dashboard/components/ui/Field";
import { Badge } from "@/app/pages/dashboard/components/ui/Badge";

function formatCpfCnpj(v: string) {
  const s = (v ?? "").replace(/\D/g, "");
  if (s.length === 11) return s.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  if (s.length === 14) return s.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  return v ?? "—";
}

function displayName(v: VendorSelected) {
  return v.person_type === "pf"
    ? v.pf_full_name ?? ""
    : v.pj_legal_representative_name ?? "";
}

function brandName(v: VendorSelected) {
  return v.person_type === "pf"
    ? v.pf_brand_name ?? ""
    : v.pj_brand_name ?? "";
}

export function VendorStatusModal({
  vendor,
  open,
  onClose,
  currentStatus,
  onSave,
}: {
  vendor: VendorSelected | null;
  open: boolean;
  onClose: () => void;

  // status atual vindo do seu statusByKey (ou fallback)
  currentStatus: VendorStatus;

  // ação do pai: atualiza supabase e depois atualiza statusByKey no state
  onSave: (vendorId: string, status: VendorStatus) => Promise<void>;
}) {
  const initial = useMemo<VendorStatus>(() => currentStatus ?? "aguardando_assinatura", [currentStatus]);
  const [status, setStatus] = useState<VendorStatus>(initial);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // sempre que abrir/trocar vendor, reseta estado
  useEffect(() => {
    if (!open) return;
    setStatus(initial);
    setErrorMsg(null);
    setSaving(false);
  }, [open, initial, vendor?.vendor_id]);

  async function handleSave() {
    if (!vendor?.vendor_id) return;

    try {
      setSaving(true);
      setErrorMsg(null);

      await onSave(vendor.vendor_id, status);

      onClose();
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Não foi possível atualizar o status.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Alterar status do expositor">
      {vendor ? (
        <div className="grid gap-4">
          <div className="rounded-xl border border-zinc-200 p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-zinc-700">Expositor</div>
              <Badge>{vendor.person_type === "pf" ? "PF" : "PJ"}</Badge>
            </div>

            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Field
                label={vendor.person_type === "pf" ? "Nome completo" : "Responsável legal"}
                value={<div className="font-semibold">{displayName(vendor) || "—"}</div>}
              />
              <Field label="Marca / Nome comercial" value={brandName(vendor) || "—"} />
              <Field label="CPF/CNPJ" value={formatCpfCnpj(vendor.vendor_id)} />
              <Field label="Status atual" value={STATUS_LABEL[currentStatus] ?? currentStatus} />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 p-3">
            <div className="text-xs font-semibold text-zinc-700">Novo status</div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-zinc-600">Selecione</label>
                <select
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-60"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as VendorStatus)}
                  disabled={saving}
                >
                  {Object.entries(STATUS_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || status === currentStatus}
                  className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                >
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>

            {errorMsg ? (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMsg}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
