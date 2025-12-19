import { VendorSelected } from "@/lib/types";
import { Modal } from "@/app/pages/dashboard/components/ui/Modal";
import { Field } from "@/app/pages/dashboard/components/ui/Field";
import { Badge } from "@/app/pages/dashboard/components/ui/Badge";

function formatCpfCnpj(v: string) {
  const s = (v ?? "").replace(/\D/g, "");
  if (s.length === 11) return s.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  if (s.length === 14) return s.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  return v ?? "—";
}

function formatPhoneBR(v: string) {
  const s = (v ?? "").replace(/\D/g, "");
  if (s.length === 11) return s.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (s.length === 10) return s.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
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

export function VendorDetailsModalSelected({
  vendor,
  open,
  onClose,
}: {
  vendor: VendorSelected | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Detalhes do cadastro oficial">
      {vendor ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {/* ===== Expositor ===== */}
          <div className="sm:col-span-2 rounded-xl border border-zinc-200 p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-zinc-700">1) Dados do expositor</div>
              <Badge>{vendor.person_type === "pf" ? "PF" : "PJ"}</Badge>
            </div>

            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Field
                label={vendor.person_type === "pf" ? "Nome completo" : "Responsável legal"}
                value={<div className="font-semibold">{displayName(vendor) || "—"}</div>}
              />

              <Field label="Marca / Nome comercial" value={brandName(vendor) || "—"} />

              <Field label="CPF/CNPJ" value={formatCpfCnpj(vendor.vendor_id)} />

              {/* Campos PJ extras */}
              {vendor.person_type === "pj" ? (
                <>
                  <Field label="CNPJ" value={formatCpfCnpj(vendor.pj_cnpj || "") || "—"} />
                  <Field
                    label="CPF do responsável legal"
                    value={formatCpfCnpj(vendor.pj_legal_representative_cpf || "") || "—"}
                  />
                  <Field
                    label="Inscrição Estadual"
                    value={vendor.pj_state_registration || "—"}
                  />
                </>
              ) : (
                <>
                  <Field label="CPF" value={formatCpfCnpj(vendor.pf_cpf || "") || "—"} />
                  <Field label=" " value=" " />
                </>
              )}

              <Field label="E-mail" value={vendor.contact_email || "—"} />
              <Field label="Telefone / WhatsApp" value={formatPhoneBR(vendor.contact_phone || "") || "—"} />

              <Field label="Endereço completo" value={vendor.address_full || "—"} />
              <Field label="CEP" value={vendor.address_zipcode || "—"} />
              <Field label="Cidade" value={vendor.address_city || "—"} />
              <Field label="Estado" value={vendor.address_state || "—"} />
            </div>
          </div>

          {/* ===== Financeiro ===== */}
          <div className="sm:col-span-2 rounded-xl border border-zinc-200 p-3">
            <div className="text-xs font-semibold text-zinc-700">2) Dados financeiros para repasse</div>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Field label="Banco" value={vendor.bank_name || "—"} />
              <Field label="Agência" value={vendor.bank_agency || "—"} />
              <Field label="Conta" value={vendor.bank_account || "—"} />
              <Field label="Chave PIX" value={vendor.pix_key || "—"} />
              <Field label="Favorecido (PIX)" value={vendor.pix_favored_name || "—"} />
            </div>
          </div>

          {/* ===== Termos ===== */}
          <div className="sm:col-span-2 rounded-xl border border-zinc-200 p-3">
            <div className="text-xs text-zinc-500">Declaração / Aceite</div>
            <div className="mt-1 whitespace-pre-wrap text-sm text-zinc-800">
              {vendor.terms_accepted || "—"}
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
