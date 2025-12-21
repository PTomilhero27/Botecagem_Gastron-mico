"use client";

import { useMemo, useState, useEffect } from "react";
import { VendorSelected } from "@/lib/types";
import { VendorStatus } from "@/app/lib/status";
import { StatusPill } from "./StatusPill";
import { RowActions } from "./RowActions";
import { SignatureLinkModal } from "./SignatureLinkModal";
import { PageSize, TableFooter } from "../../dashboard/components/table/TableFooter";
import { ensureContract, updateContractSigning } from "@/app/services/settings";
import { createSignatureLink } from "@/app/services";

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

function safeTrim(s: any) {
  return String(s ?? "").trim();
}

// ✅ gera uma key ÚNICA por linha (preferência: contract uuid)
function getRowKey(r: any, idx: number) {
  const contractId = safeTrim(r?.contract_id);
  if (contractId) return contractId;

  const id = safeTrim(r?.id);
  if (id) return id;

  // ⚠️ fallback temporário (evita warning, mas o ideal é vir uuid do backend)
  return `${safeTrim(r?.vendor_id)}-${idx}`;
}

export function SelectedTable({
  rows,
  statusByKey,
  onDetails,
  onDownloadContract,
  onOpenStatus,
}: {
  rows: VendorSelected[];
  statusByKey: Record<string, VendorStatus | undefined>;
  onDetails: (v: VendorSelected) => void;
  onDownloadContract: (v: VendorSelected) => void;
  onOpenStatus: (v: VendorSelected) => void;
}) {
  const [pageSize, setPageSize] = useState<PageSize>(20);
  const [page, setPage] = useState(1);

  // ✅ modal assinatura
  const [signOpen, setSignOpen] = useState(false);
  const [signLoading, setSignLoading] = useState(false);
  const [signUrl, setSignUrl] = useState<string | null>(null);
  const [signError, setSignError] = useState<string | null>(null);
  const [signTitle, setSignTitle] = useState("Link de assinatura");

  // quando mudar filtros (rows), volta pra página 1
  useEffect(() => {
    setPage(1);
  }, [rows, pageSize]);

  const total = rows.length;

  const totalPages = useMemo(() => {
    if (pageSize === "all") return 1;
    return Math.max(1, Math.ceil(total / pageSize));
  }, [total, pageSize]);

  const safePage = Math.min(Math.max(page, 1), totalPages);

  const pageRows = useMemo(() => {
    if (pageSize === "all") return rows;
    const start = (safePage - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, pageSize, safePage]);

  const showing = pageRows.length;

  function prevPage() {
    setPage((p) => Math.max(1, p - 1));
  }

  function nextPage() {
    setPage((p) => Math.min(totalPages, p + 1));
  }

  // ✅ abre modal + gera (ou pega) link
  async function openSignatureLink(v: VendorSelected) {
    const name = safeTrim(displayName(v) || brandName(v) || "Expositor");
    const email = safeTrim((v as any).contact_email);
    const brend = brandName(v)

    setSignOpen(true);
    setSignTitle(`Link de assinatura • ${name}`);
    setSignUrl(null);
    setSignError(null);

    if (!email) {
      setSignError("Esse expositor está sem e-mail.");
      return;
    }

    setSignLoading(true);

    try {
      const { signUrl } = await createSignatureLink({
        vendorId: safeTrim((v as any).vendor_id),
        name,
        email,
        brend,
  
      });

      setSignUrl(signUrl);
    } catch (e: any) {
      setSignError(e?.message || "Erro desconhecido");
    } finally {
      setSignLoading(false);
    }
  }
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-600">
            <tr>
              <th className="w-14 px-4 py-3">#</th>
              <th className="px-4 py-3">Nome / Responsável</th>
              <th className="px-4 py-3">Marca</th>
              <th className="px-4 py-3">CPF/CNPJ</th>
              <th className="px-4 py-3">Contato</th>
              <th className="px-4 py-3">Cidade/UF</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>

          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-zinc-500">
                  Nenhum selecionado.
                </td>
              </tr>
            ) : (
              pageRows.map((r, idx) => {
                const rowKey = getRowKey(r as any, idx);

                // ✅ tenta status por key nova; se não achar, cai no vendor_id
                const vendorKey = safeTrim((r as any).vendor_id);
                const status =
                  statusByKey[rowKey] ??
                  statusByKey[vendorKey] ??
                  (((r as any).status as VendorStatus) || "aguardando_assinatura");

                const globalIndex =
                  pageSize === "all"
                    ? idx + 1
                    : (safePage - 1) * (pageSize as number) + idx + 1;

                const name = displayName(r);
                const brand = brandName(r);

                return (
                  <tr key={rowKey} className="border-t border-zinc-100 hover:bg-zinc-50">
                    <td className="px-4 py-3 text-zinc-500">{globalIndex}</td>

                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {name || "—"}
                      <div className="text-xs text-zinc-500">
                        {r.person_type === "pf" ? "PF" : "PJ"}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-zinc-700">{brand || "—"}</td>

                    <td className="px-4 py-3 text-zinc-700">
                      {formatCpfCnpj((r as any).vendor_id)}
                    </td>

                    <td className="px-4 py-3 text-zinc-700">
                      {formatPhoneBR((r as any).contact_phone)}
                      {(r as any).contact_email ? (
                        <div className="text-xs text-zinc-500 break-words">
                          {safeTrim((r as any).contact_email)}
                        </div>
                      ) : (
                        <div className="text-xs text-red-600">Sem e-mail</div>
                      )}
                    </td>

                    <td className="px-4 py-3 text-zinc-700">
                      {(((r as any).address_city || "—") as string) +
                        ((r as any).address_state ? `/${(r as any).address_state}` : "")}
                    </td>

                    <td className="px-4 py-3 w-8 text-center">
                      <StatusPill value={status} />
                    </td>

                    <td className="px-4 py-3 text-right">
                      <RowActions
                        onDownload={() => onDownloadContract(r)}
                        onSignatureLink={() => openSignatureLink(r)}
                        onDetails={() => onDetails(r)}
                        onChangeStatus={() => onOpenStatus(r)}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <TableFooter
        total={total}
        showing={showing}
        pageSize={pageSize}
        setPageSize={setPageSize}
        page={safePage}
        totalPages={totalPages}
        prevPage={prevPage}
        nextPage={nextPage}
      />

      <SignatureLinkModal
        open={signOpen}
        onClose={() => setSignOpen(false)}
        title={signTitle}
        loading={signLoading}
        link={signUrl}
        error={signError}
      />
    </div>
  );
}
