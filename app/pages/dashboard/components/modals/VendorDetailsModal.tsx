import { Vendor } from "@/lib/types";
import { Modal } from "@/app/pages/dashboard/components/ui/Modal";
import { Field } from "@/app/pages/dashboard/components/ui/Field";
import { Badge } from "@/app/pages/dashboard/components/ui/Badge";
import { PillYesNo } from "@/app/pages/dashboard/components/ui/pillYesNo";

export function VendorDetailsModal({
  vendor,
  open,
  onClose,
}: {
  vendor: Vendor | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Detalhes do cadastro">
      {vendor ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome fantasia" value={<div className="font-semibold">{vendor.nome_fantasia}</div>} />
          <Field label="Carimbo" value={vendor.timestamp} />
          <Field label="Responsável" value={vendor.responsavel} />
          <Field label="Telefone" value={vendor.telefone} />
          <Field label="Redes sociais" value={vendor.redes_sociais} />
          <Field label="Tipo" value={<Badge>{vendor.tipo_operacao}</Badge>} />
          <Field label="Produto principal" value={vendor.produto_principal} />
          <Field label="Ticket médio" value={vendor.ticket_medio} />
          <Field label="Tenda" value={vendor.tenda} />
          <Field label="Energia" value={<PillYesNo value={vendor.energia} />} />
          <Field label="Gás" value={<PillYesNo value={vendor.gas} />} />

          <div className="sm:col-span-2 rounded-xl border border-zinc-200 p-3">
            <div className="text-xs text-zinc-500">Observações</div>
            <div className="mt-1 whitespace-pre-wrap text-sm text-zinc-800">{vendor.observacoes || "—"}</div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
