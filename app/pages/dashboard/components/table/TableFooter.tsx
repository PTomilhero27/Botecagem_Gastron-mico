"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

export type PageSize = 10 | 20 | 50 | 100 | "all";

export function TableFooter({
  total,
  showing,
  pageSize,
  setPageSize,
  page,
  totalPages,
  prevPage,
  nextPage,
}: {
  total: number;
  showing: number;
  pageSize: PageSize;
  setPageSize: (v: PageSize) => void;
  page: number;
  totalPages: number;
  prevPage: () => void;
  nextPage: () => void;
}) {
  return (
    <div className="flex w-full flex-col gap-3 border-t border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-zinc-700">
        Mostrando <span className="font-semibold text-zinc-900">{showing}</span> de{" "}
        <span className="font-semibold text-zinc-900">{total}</span> (filtrados)
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-600">Por página</span>
          <select
            value={pageSize}
            onChange={(e) => {
              const v =
                e.target.value === "all"
                  ? "all"
                  : (Number(e.target.value) as PageSize);
              setPageSize(v);
            }}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="all">Todas</option>
          </select>
        </div>

        {pageSize !== "all" ? (
          <div className="flex items-center gap-2">
            <button
              onClick={prevPage}
              disabled={page <= 1}
              className="rounded-xl border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-800 disabled:opacity-40"
              aria-label="Página anterior"
            >
              <ArrowLeft width={15} />
            </button>

            <span className="text-xs text-zinc-700">
              Página <span className="font-semibold">{page}</span> de{" "}
              <span className="font-semibold">{totalPages}</span>
            </span>

            <button
              onClick={nextPage}
              disabled={page >= totalPages}
              className="rounded-xl border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-800 disabled:opacity-40"
              aria-label="Próxima página"
            >
              <ArrowRight width={15} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
