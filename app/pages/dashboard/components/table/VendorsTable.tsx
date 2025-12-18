"use client";

import { useEffect, useMemo, useState } from "react";
import { Vendor } from "@/lib/types";
import { Badge } from "@/app/pages/dashboard/components/ui/Badge";
import { PillYesNo } from "@/app/pages/dashboard/components/ui/pillYesNo";
import { TableFooter, PageSize } from "./TableFooter";

export function VendorsTable({
  rows,
  onQr,
  onDetails,
}: {
  rows: Vendor[];
  onQr: (v: Vendor) => void;
  onDetails: (v: Vendor) => void;
}) {
  const [pageSize, setPageSize] = useState<PageSize>(20);
  const [page, setPage] = useState(1);

  // Quando rows muda (filtro), volta pra página 1
  useEffect(() => setPage(1), [rows]);

  const total = rows.length;

  const totalPages = useMemo(() => {
    if (pageSize === "all") return 1;
    return Math.max(1, Math.ceil(total / pageSize));
  }, [total, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pagedRows = useMemo(() => {
    if (pageSize === "all") return rows;
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  const startIndex = pageSize === "all" ? 0 : (page - 1) * pageSize;

  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const nextPage = () => setPage((p) => Math.min(totalPages, p + 1));
  const firstPage = () => setPage(1);
  const lastPage = () => setPage(totalPages);

  // ✅ Paginação por teclado
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // não interferir quando o usuário está digitando em input/textarea/select
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      if (pageSize === "all") return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevPage();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nextPage();
      } else if (e.key === "Home") {
        e.preventDefault();
        firstPage();
      } else if (e.key === "End") {
        e.preventDefault();
        lastPage();
      } else if (e.key.toLowerCase() === "j") {
        // opcional: J = próxima página
        nextPage();
      } else if (e.key.toLowerCase() === "k") {
        // opcional: K = página anterior
        prevPage();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pageSize, totalPages]);

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {/* Table */}
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-600">
            <tr>
              <th className="w-14 px-4 py-3">#</th>
              <th className="px-4 py-3">Nome fantasia</th>
              <th className="px-4 py-3">Telefone</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Tenda</th>
              <th className="px-4 py-3">Energia</th>
              <th className="px-4 py-3">Gás</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>

          <tbody>
            {pagedRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-zinc-500">
                  Nenhum resultado.
                </td>
              </tr>
            ) : (
              pagedRows.map((r, idx) => (
                <tr
                  key={(r as any).source_key ?? idx}
                  className="border-t border-zinc-100 hover:bg-zinc-50"
                >
                  <td className="px-4 py-3 text-zinc-500">{startIndex + idx + 1}</td>

                  <td className="px-4 py-3 font-medium text-zinc-900">{r.nome_fantasia}</td>
                  <td className="px-4 py-3 text-zinc-700">{r.telefone}</td>
                  <td className="px-4 py-3">
                    {r.tipo_operacao ? <Badge>{r.tipo_operacao}</Badge> : "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{r.tenda}</td>
                  <td className="px-4 py-3"><PillYesNo value={r.energia} /></td>
                  <td className="px-4 py-3"><PillYesNo value={r.gas} /></td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onQr(r)}
                        className="rounded-xl bg-green-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-800"
                      >
                        WhatsApp
                      </button>
                      <button
                        onClick={() => onDetails(r)}
                        className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-50"
                      >
                        Detalhes
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TableFooter
        total={total}
        showing={pagedRows.length}
        pageSize={pageSize}
        setPageSize={(v) => {
          setPageSize(v);
          setPage(1);
        }}
        page={page}
        totalPages={totalPages}
        prevPage={prevPage}
        nextPage={nextPage}
      />
    </div>
  );
}
