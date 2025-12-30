"use client";
export const dynamic = "force-dynamic";

import React, { useMemo } from "react";
import { VendorSelected } from "@/lib/types";
import { renderForPreview } from "@/app/lib/contractPreview/templateRender";

type ContractBlock =
  | { id: string; type: "text"; text?: string }
  | { id: string; type: "clause"; clauseNo?: number; title?: string; text?: string; incisos?: { id: string; html?: string }[] }
  | { id: string; type: string; [k: string]: any };

function formatCpfCnpj(doc?: string) {
  const d = (doc ?? "").replace(/\D/g, "");
  if (d.length === 11) return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  if (d.length === 14) return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  return doc ?? "";
}

function escapeHtml(s: string) {
  return (s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/** tenta detectar se a string é um JSON array de blocos */
function tryParseBlocks(raw: string): ContractBlock[] | null {
  const t = (raw || "").trim();
  if (!t) return null;
  if (!t.startsWith("[") || !t.endsWith("]")) return null;
  try {
    const parsed = JSON.parse(t);
    if (Array.isArray(parsed)) return parsed as ContractBlock[];
    return null;
  } catch {
    return null;
  }
}

/** Converte blocks -> HTML simples (bem formatado) */
function blocksToHtml(blocks: ContractBlock[]) {
  const parts: string[] = [];

  for (const b of blocks) {
    if (!b) continue;

    if (b.type === "text") {
      const text = (b as any).text ?? "";
      // se já vier com HTML no text, respeita; senão, escapa + quebra linha
      const isHtml = /<\/?[a-z][\s\S]*>/i.test(text);
      parts.push(
        `<div class="mb-3">${isHtml ? text : escapeHtml(text).replaceAll("\n", "<br/>")}</div>`
      );
      continue;
    }

    if (b.type === "clause") {
      const no = (b as any).clauseNo;
      const title = (b as any).title ?? "";
      const text = (b as any).text ?? "";
      const incisos = (b as any).incisos ?? [];

      parts.push(`<hr class="my-4 border-zinc-200"/>`);

      parts.push(
        `<h3 class="mt-2 text-sm font-extrabold uppercase">
          CLÁUSULA ${escapeHtml(String(no ?? ""))} – ${escapeHtml(String(title))}
        </h3>`
      );

      if (text) {
        const isHtml = /<\/?[a-z][\s\S]*>/i.test(text);
        parts.push(
          `<div class="mt-2 text-sm leading-relaxed">${
            isHtml ? text : escapeHtml(text).replaceAll("\n", "<br/>")
          }</div>`
        );
      }

      if (Array.isArray(incisos) && incisos.length) {
        parts.push(`<div class="mt-2 space-y-2 text-sm leading-relaxed">`);
        for (const it of incisos) {
          const html = (it?.html ?? "").trim();
          if (!html) continue;
          // incisos já vem em html normalmente
          parts.push(`<div>${html}</div>`);
        }
        parts.push(`</div>`);
      }

      continue;
    }

    // fallback para outros tipos: tenta "html" ou "text"
    const html = (b as any).html ?? "";
    const text = (b as any).text ?? "";
    if (html) parts.push(`<div class="mb-3">${html}</div>`);
    else if (text) parts.push(`<div class="mb-3">${escapeHtml(text).replaceAll("\n", "<br/>")}</div>`);
  }

  return parts.join("\n");
}

export function ContractHtml({
  vendor,
  templateTitle,
  templateHtml, // <- pode ser HTML OU JSON string
  hasRegistration,
}: {
  vendor: VendorSelected;
  templateTitle?: string;
  templateHtml: string;
  hasRegistration: boolean;
}) {
  const isPf = vendor.person_type === "pf";

  const displayName = isPf
    ? vendor.pf_full_name ?? ""
    : vendor.pj_legal_representative_name ?? "";

  const brandName = isPf ? vendor.pf_brand_name ?? "" : vendor.pj_brand_name ?? "";

  const mainDoc = formatCpfCnpj(vendor.vendor_id);

  const pjCnpj = formatCpfCnpj(vendor.pj_cnpj);
  const pjRepCpf = formatCpfCnpj(vendor.pj_legal_representative_cpf);

  const phone = vendor.contact_phone ?? "";
  const email = vendor.contact_email ?? "";

  const addressFull = vendor.address_full ?? "";
  const city = vendor.address_city ?? "";
  const state = vendor.address_state ?? "";
  const zipcode = vendor.address_zipcode ?? "";

  const bankName = vendor.bank_name ?? "";
  const bankAgency = vendor.bank_agency ?? "";
  const bankAccount = vendor.bank_account ?? "";
  const pixKey = vendor.pix_key ?? "";
  const pixFavored = vendor.pix_favored_name ?? "";

  // ✅ aqui está o ponto: JSON -> HTML e depois tokens -> preview
  const finalHtml = useMemo(() => {
    const raw = templateHtml || "";

    const blocks = tryParseBlocks(raw);
    const html = blocks ? blocksToHtml(blocks) : raw; // se não for JSON, assume HTML

    // ✅ resolve {{DATA_LONGA}} etc
    return renderForPreview(html);
  }, [templateHtml]);

  return (
    <div className="doc">
      {/* Preview REAL do contrato selecionado */}
      <div className="tiptap prose prose-sm max-w-none leading-relaxed">
        {templateTitle ? (
          <div className="mb-4 text-center">
            <div className="text-lg font-extrabold text-zinc-900 uppercase">
              {templateTitle}
            </div>
          </div>
        ) : null}

        <div dangerouslySetInnerHTML={{ __html: finalHtml }} />
      </div>

      {/* ✅ FICHA CADASTRAL só se estiver habilitado no template */}
      {hasRegistration && (
        <>
          <div className="page-break" />

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-center">
              <div className="text-sm font-extrabold tracking-tight text-zinc-900">
                FICHA CADASTRAL DO EXPOSITOR
              </div>
              <div className="mt-1 text-xs font-bold text-zinc-700">
                FESTIVAL GASTRONÔMICO BOTECAGEM
              </div>
            </div>

            <div className="mt-6">
              <div className="text-[12px] font-extrabold text-zinc-900">
                DADOS DO EXPOSITOR
              </div>

              <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-[11px] font-medium text-zinc-500">
                    {isPf ? "Nome Completo" : "Responsável Legal"}
                  </div>
                  <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900">
                    {displayName || "—"}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-zinc-500">
                    Nome da Marca
                  </div>
                  <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900">
                    {brandName || "—"}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-zinc-500">
                    {isPf ? "CPF" : "CNPJ"}
                  </div>
                  <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900">
                    {mainDoc || "—"}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-zinc-500">
                    Inscrição Estadual / Municipal
                  </div>
                  <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900">
                    {(isPf ? "" : vendor.pj_state_registration) || "—"}
                  </div>
                </div>

                {!isPf && (
                  <>
                    <div>
                      <div className="text-[11px] font-medium text-zinc-500">
                        CPF do Responsável Legal
                      </div>
                      <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900">
                        {pjRepCpf || "—"}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-medium text-zinc-500">
                        CNPJ
                      </div>
                      <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900">
                        {pjCnpj || "—"}
                      </div>
                    </div>
                  </>
                )}

                <div className="col-span-2">
                  <div className="text-[11px] font-medium text-zinc-500">
                    Endereço Completo
                  </div>
                  <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900">
                    {addressFull || "—"}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-zinc-500">Cidade</div>
                  <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900">
                    {city || "—"}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-zinc-500">
                    Estado / CEP
                  </div>
                  <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900">
                    {(state || "—") + "  •  " + (zipcode || "—")}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-zinc-500">
                    Telefone / WhatsApp
                  </div>
                  <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900">
                    {phone || "—"}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-zinc-500">E-mail</div>
                  <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900 break-words">
                    {email || "—"}
                  </div>
                </div>

                <div />
              </div>
            </div>

            <div className="mt-6">
              <div className="text-[12px] font-extrabold text-zinc-900">
                DADOS FINANCEIROS PARA REPASSE
              </div>

              <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-[11px] font-medium text-zinc-500">Banco</div>
                  <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900">
                    {bankName || "—"}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-zinc-500">
                    Agência
                  </div>
                  <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900">
                    {bankAgency || "—"}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-zinc-500">Conta</div>
                  <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900">
                    {bankAccount || "—"}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-zinc-500">
                    Chave PIX
                  </div>
                  <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900 break-words">
                    {pixKey || "—"}
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="text-[11px] font-medium text-zinc-500">
                    Nome do Favorecido
                  </div>
                  <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900">
                    {pixFavored || "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-zinc-200 pt-4">
              <p className="text-[10.5px] leading-relaxed text-zinc-700">
                {vendor.terms_accepted ||
                  "Declaro que as informações acima são verdadeiras e completas, responsabilizando-me civil e criminalmente por sua veracidade, bem como declaro ciência e concordância com o Contrato de Participação como Expositor do Festival Gastronômico Botecagem."}
              </p>

              <div className="mt-3 grid gap-2 text-[11px] text-zinc-800">
                <div>
                  <span className="font-bold">Local e Data:</span>{" "}
                  _________________________________________________
                </div>
                <div>
                  <span className="font-bold">
                    Assinatura do Expositor / Responsável Legal:
                  </span>{" "}
                  _________________________________________________
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
