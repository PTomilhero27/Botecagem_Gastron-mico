"use client";

import { useEffect, useMemo, useRef } from "react";
import { Vendor } from "@/lib/types";

function normalize(s: string) {
  return (s || "").toLowerCase();
}

export function SearchOverlay({
  open,
  value,
  onChange,
  onCloseKeepFilter,
  onCloseAndClear,
  rows,
}: {
  open: boolean;
  value: string;
  onChange: (v: string) => void;
  onCloseKeepFilter: () => void; // clique fora
  onCloseAndClear: () => void;   // ESC
  rows: Vendor[];
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      // focus no próximo tick
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const suggestions = useMemo(() => {
    const q = normalize(value).trim();
    if (!q) return rows.slice(0, 8);

    return rows
      .filter((r) => {
        const hay = [
          r.nome_fantasia,
          r.telefone,
          r.responsavel, // ou nome_responsavel dependendo do seu type
        ]
          .map(normalize)
          .join(" ");
        return hay.includes(q);
      })
      .slice(0, 8);
  }, [rows, value]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop (clicou fora = fecha mas mantém filtro) */}
      <button
        aria-label="Fechar busca"
        className="absolute inset-0 cursor-default bg-black/40"
        onClick={onCloseKeepFilter}
      />

      {/* Modal */}
      <div className="relative mx-auto mt-24 w-[min(720px,92vw)]">
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-2xl">
          <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3">
            <div className="text-xs font-semibold text-zinc-500">BUSCA RÁPIDA</div>
            <div className="ml-auto text-[11px] text-zinc-500">
              Clique fora: fecha • <span className="font-semibold">Esc:</span> limpa
            </div>
          </div>

          <div className="p-4">
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Buscar por nome fantasia, telefone ou responsável…"
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-zinc-900"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  onCloseAndClear();
                }
              }}
            />



          </div>
        </div>
      </div>
    </div>
  );
}
