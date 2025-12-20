"use client";

import { useEffect, useMemo, useRef } from "react";
import { VendorSelected } from "@/lib/types";

function normalize(s: string) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function digitsOnly(s: string) {
  return (s || "").replace(/\D/g, "");
}

function getSearchHaystack(v: VendorSelected) {
  const name =
    v.pf_brand_name ||
    v.pj_brand_name ||
    v.pf_full_name ||
    v.pj_legal_representative_name ||
    "";

  const cpf =
    v.pf_cpf ||
    v.pj_legal_representative_cpf ||
    "";

  const cnpj = v.pj_cnpj || "";
  const phone = v.contact_phone || "";

  // texto normal (com acento removido)
  const hayText = normalize([name, cpf, cnpj, phone].join(" "));

  // só dígitos (pra buscar 503251... e achar mesmo se tiver pontuação)
  const hayDigits = digitsOnly([cpf, cnpj, phone].join(" "));

  return { hayText, hayDigits };
}

export function SearchOverlaySelected({
  open,
  value,
  onChange,
  onCloseKeepFilter, // clique fora fecha e mantém
  onCloseAndClear,   // ESC limpa e fecha
  rows,
  onPick,            // opcional: clicar em sugestão
}: {
  open: boolean;
  value: string;
  onChange: (v: string) => void;
  onCloseKeepFilter: () => void;
  onCloseAndClear: () => void;
  rows: VendorSelected[];
  onPick?: (row: VendorSelected) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  const suggestions = useMemo(() => {
    const qRaw = (value || "").trim();
    if (!qRaw) return rows.slice(0, 8);

    const qText = normalize(qRaw);
    const qDigits = digitsOnly(qRaw);

    return rows
      .filter((r) => {
        const { hayText, hayDigits } = getSearchHaystack(r);

        // Se o usuário digitou números (cpf/cnpj/telefone), busca em digits
        if (qDigits.length >= 3) {
          return hayDigits.includes(qDigits);
        }

        // Se digitou texto, busca no texto
        return hayText.includes(qText);
      })
      .slice(0, 8);
  }, [rows, value]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <button
        aria-label="Fechar busca"
        className="absolute inset-0 cursor-default bg-black/40"
        onClick={onCloseKeepFilter}
      />

      <div className="relative mx-auto mt-24 w-[min(720px,92vw)]">
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-2xl">
          <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3">
            <div className="text-xs font-semibold text-zinc-500">
              BUSCA RÁPIDA
            </div>
            <div className="ml-auto text-[11px] text-zinc-500">
              Clique fora: fecha •{" "}
              <span className="font-semibold">Esc:</span> limpa
            </div>
          </div>

          <div className="p-4">
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Buscar por nome, CPF/CNPJ ou telefone…"
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-zinc-900"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  onCloseAndClear();
                }
              }}
            />

            {/* Sugestões */}
            {!!suggestions.length && (
              <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-200">
                {suggestions.map((r) => {
                  const title =
                    r.pf_brand_name ||
                    r.pj_brand_name ||
                    r.pf_full_name ||
                    r.pj_legal_representative_name ||
                    "Sem nome";

                  const doc =
                    r.pf_cpf ||
                    r.pj_cnpj ||
                    r.pj_legal_representative_cpf ||
                    "";

                  return (
                    <button
                      key={r.vendor_id ?? `${title}-${doc}-${r.contact_phone}`}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-zinc-50"
                      onClick={() => onPick?.(r)}
                      type="button"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-zinc-900">
                          {title}
                        </div>
                        <div className="truncate text-xs text-zinc-500">
                          {doc ? `Doc: ${doc} • ` : ""}
                          Tel: {r.contact_phone}
                        </div>
                      </div>

                      <div className="text-xs text-zinc-400">Enter</div>
                    </button>
                  );
                })}
              </div>
            )}

            {!suggestions.length && (
              <div className="mt-3 rounded-2xl border border-dashed border-zinc-200 p-4 text-sm text-zinc-500">
                Nenhum resultado.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
