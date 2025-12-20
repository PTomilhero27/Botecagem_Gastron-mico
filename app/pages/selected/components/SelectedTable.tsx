"use client";

import { useMemo, useState, useEffect } from "react";
import { VendorSelected } from "@/lib/types";
import { VendorStatus } from "@/app/lib/status";
import { StatusPill } from "./StatusPill";
import { RowActions } from "./RowActions";
import { PageSize, TableFooter } from "../../dashboard/components/table/TableFooter";

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

  // quando mudar filtros (rows), volta pra página 1
  useEffect(() => {
    setPage(1);
  }, [rows, pageSize]);

  const withKey = useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        __key: r.vendor_id, // ✅ chave única: cpf/cnpj
      })),
    [rows]
  );

  const total = withKey.length;

  const totalPages = useMemo(() => {
    if (pageSize === "all") return 1;
    return Math.max(1, Math.ceil(total / pageSize));
  }, [total, pageSize]);

  const safePage = Math.min(Math.max(page, 1), totalPages);

  const pageRows = useMemo(() => {
    if (pageSize === "all") return withKey;
    const start = (safePage - 1) * pageSize;
    return withKey.slice(start, start + pageSize);
  }, [withKey, pageSize, safePage]);

  const showing = pageRows.length;

  function prevPage() {
    setPage((p) => Math.max(1, p - 1));
  }

  function nextPage() {
    setPage((p) => Math.min(totalPages, p + 1));
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-600">
            <tr>
              <th className="w-14 px-4 py-3">#</th>
              <th className="px-4 py-3">{/* PF: Nome / PJ: Responsável */}Nome / Responsável</th>
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
                const key = (r as any).__key as string;

                const status =
                  statusByKey[key] ??
                  ((r.status as VendorStatus) || "aguardando_assinatura");

                // índice global (respeita paginação)
                const globalIndex =
                  pageSize === "all"
                    ? idx + 1
                    : (safePage - 1) * (pageSize as number) + idx + 1;

                const name = displayName(r);
                const brand = brandName(r);

                return (
                  <tr key={key} className="border-t border-zinc-100 hover:bg-zinc-50">
                    <td className="px-4 py-3 text-zinc-500">{globalIndex}</td>

                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {name || "—"}
                      <div className="text-xs text-zinc-500">
                        {r.person_type === "pf" ? "PF" : "PJ"}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-zinc-700">
                      {brand || "—"}
                    </td>

                    <td className="px-4 py-3 text-zinc-700">
                      {formatCpfCnpj(r.vendor_id)}
                    </td>

                    <td className="px-4 py-3 text-zinc-700">
                      {formatPhoneBR(r.contact_phone)}
                      {r.contact_email ? (
                        <div className="text-xs text-zinc-500 break-words">{r.contact_email}</div>
                      ) : null}
                    </td>

                    <td className="px-4 py-3 text-zinc-700">
                      {(r.address_city || "—") + (r.address_state ? `/${r.address_state}` : "")}
                    </td>

                    <td className="px-4 py-3 w-8 text-center">
                      <StatusPill value={status} />
                    </td>

                    <td className="px-4 py-3 text-right">
                      <RowActions
                        onDownload={() => onDownloadContract(r)}
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

      {/* Footer de paginação */}
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
    </div>
  );
}
