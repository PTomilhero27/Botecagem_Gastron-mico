"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Plus } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

import { ContractHtml } from "./ContractHtml";
import { AddendaModal } from "../components/AddendaModal";

import { useContractPreview } from "@/app/lib/contractPreview/ContractPreviewContext";
import { updateVendorStatus } from "@/app/services/settings";

function slugifyFilename(s: string) {
  return (s || "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 60);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUCKET = "contracts";

type EnsureContractResponse = {
  contract: { id: string; vendor_id: string };
  created: boolean;
};

type SelectedTemplate = {
  id: string;
  title: string;
  has_registration?: boolean | null;
};

/* =========================
   Normalização: JSON blocks -> HTML
========================= */
type ContractBlock =
  | { id: string; type: "text"; text?: string }
  | {
    id: string;
    type: "clause";
    clauseNo?: number;
    title?: string;
    text?: string;
    incisos?: { id: string; html?: string }[];
  }
  | { id: string; type: string;[k: string]: any };

function escapeHtml(s: string) {
  return (s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

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

function blocksToHtml(blocks: ContractBlock[]) {
  const parts: string[] = [];

  for (const b of blocks) {
    if (!b) continue;

    if (b.type === "text") {
      const text = (b as any).text ?? "";
      const isHtml = /<\/?[a-z][\s\S]*>/i.test(text);
      parts.push(
        `<div class="mb-3">${isHtml ? text : escapeHtml(text).replaceAll("\n", "<br/>")
        }</div>`
      );
      continue;
    }

    if (b.type === "clause") {
      const no = (b as any).clauseNo;
      const title = (b as any).title ?? "";
      const text = (b as any).text ?? "";
      const incisos = (b as any).incisos ?? [];

      parts.push(`<hr class="my-4 border-zinc-200"/>`);

      // ✅ marca as cláusulas (pode quebrar depois, se quiser)
      parts.push(
        `<h3 class="pdf-clause-title mt-2 text-sm font-extrabold uppercase">
          CLÁUSULA ${escapeHtml(String(no ?? ""))} – ${escapeHtml(String(title))}
        </h3>`
      );

      if (text) {
        const isHtml = /<\/?[a-z][\s\S]*>/i.test(text);
        parts.push(
          `<div class="mt-2 text-sm leading-relaxed">${isHtml ? text : escapeHtml(text).replaceAll("\n", "<br/>")
          }</div>`
        );
      }

      if (Array.isArray(incisos) && incisos.length) {
        parts.push(`<div class="mt-2 space-y-2 text-sm leading-relaxed">`);
        for (const it of incisos) {
          const html = (it?.html ?? "").trim();
          if (!html) continue;
          parts.push(`<div>${html}</div>`);
        }
        parts.push(`</div>`);
      }

      continue;
    }

    const html = (b as any).html ?? "";
    const text = (b as any).text ?? "";
    if (html) parts.push(`<div class="mb-3">${html}</div>`);
    else if (text)
      parts.push(
        `<div class="mb-3">${escapeHtml(text).replaceAll("\n", "<br/>")}</div>`
      );
  }

  return parts.join("\n");
}

function normalizeTemplateToHtml(raw: string) {
  const blocks = tryParseBlocks(raw);
  return blocks ? blocksToHtml(blocks) : String(raw || "");
}

/* =========================
   Helper: evita adicionar aditivo vazio
========================= */
function hasMeaningfulHtml(html: string) {
  const s = String(html || "")
    .replace(/<br\s*\/?>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!s) return false;

  const text = s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  if (text.length >= 5) return true;

  if (/<img\b|<table\b|<svg\b/i.test(s)) return true;

  return false;
}

/* =========================
   Helpers DB templates
========================= */
async function fetchLatestTemplateContent(templateId: string) {
  const { data, error } = await supabase
    .from("document_template_versions")
    .select("content,version_number")
    .eq("template_id", templateId)
    .order("version_number", { ascending: false })
    .limit(1)
    .single();

  if (error) throw error;
  return String(data?.content ?? "");
}

async function fetchTemplateTitle(templateId: string) {
  const { data, error } = await supabase
    .from("document_templates")
    .select("title")
    .eq("id", templateId)
    .single();

  if (error) throw error;
  return String((data as any)?.title ?? "");
}

function addendumTitleBlock(title: string) {
  const t = (title || "").trim();
  if (!t) return "";
  return `
    <div class="mb-4 text-center pdf-addendum-header">
      <div class="text-base font-extrabold text-zinc-900 uppercase">
        ${escapeHtml(t)}
      </div>
      <div class="mt-1 text-xs text-zinc-500">ADITIVO</div>
    </div>
  `;
}

export default function ContractPreviewPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { vendor, clear } = useContractPreview();

  const [downloading, setDownloading] = useState(false);

  // base template
  const [tplLoading, setTplLoading] = useState(true);
  const [template, setTemplate] = useState<SelectedTemplate | null>(null);
  const [hasRegistration, setHasRegistration] = useState(false);

  // addenda state (vem do vendor_status)
  const initialAddendaIds = useMemo<string[]>(() => {
    const ids = (vendor as any)?.addendum_template_ids;
    return Array.isArray(ids) ? (ids as string[]) : [];
  }, [vendor]);

  const [addendaIds, setAddendaIds] = useState<string[]>(initialAddendaIds);
  const [addendaModalOpen, setAddendaModalOpen] = useState(false);

  // html final (base + addenda)
  const [finalTemplateHtml, setFinalTemplateHtml] = useState<string | null>(null);

  useEffect(() => {
    if (!vendor) router.replace("/pages/selected");
  }, [vendor, router]);

  useEffect(() => {
    setAddendaIds(initialAddendaIds);
  }, [initialAddendaIds]);

  // 1) carrega contrato selecionado (status=selected)
  useEffect(() => {
    let mounted = true;

    async function loadSelectedTemplate() {
      try {
        setTplLoading(true);

        const { data: tpl, error: tplErr } = await supabase
          .from("document_templates")
          .select("id,title,has_registration")
          .eq("status", "selected")
          .single();

        if (!mounted) return;

        if (tplErr || !tpl) {
          console.error(tplErr);
          setTemplate(null);
          setHasRegistration(false);
          return;
        }

        setTemplate(tpl as any);
        setHasRegistration(!!tpl.has_registration);
      } catch (e) {
        console.error(e);
        setTemplate(null);
        setHasRegistration(false);
      } finally {
        if (mounted) setTplLoading(false);
      }
    }

    loadSelectedTemplate();
    return () => {
      mounted = false;
    };
  }, []);

  // 2) build final html (base + addenda) SEM inserir <div class="page-break">
  useEffect(() => {
    let mounted = true;

    async function buildFinalHtml() {
      try {
        if (!template?.id) {
          if (mounted) setFinalTemplateHtml(null);
          return;
        }

        // base
        const baseRaw = await fetchLatestTemplateContent(template.id);
        const baseHtml = normalizeTemplateToHtml(baseRaw);

        const chunks: string[] = [
          `<div class="pdf-section pdf-base">${baseHtml}</div>`,
        ];

        // addenda
        for (const addendumId of addendaIds) {
          if (!addendumId) continue;

          const [title, raw] = await Promise.all([
            fetchTemplateTitle(addendumId),
            fetchLatestTemplateContent(addendumId),
          ]);

          const html = normalizeTemplateToHtml(raw);

          // ✅ ignora aditivo vazio (evita página branca com só "ADITIVO")
          if (!hasMeaningfulHtml(html)) {
            console.warn("Ignorando aditivo vazio:", addendumId, title);
            continue;
          }

          chunks.push(`
            <div class="pdf-section pdf-addendum">
              ${addendumTitleBlock(title)}
              ${html}
            </div>
          `);
        }

        const merged = chunks.join("\n");

        if (!mounted) return;
        setFinalTemplateHtml(merged);
      } catch (e) {
        console.error(e);
        if (mounted) setFinalTemplateHtml(null);
      }
    }

    buildFinalHtml();

    return () => {
      mounted = false;
    };
  }, [template?.id, addendaIds]);

  async function ensureContract(params: {
    vendorId: string;
    email?: string;
    cpfCnpj?: string;
  }) {
    const r = await fetch("/api/contracts/ensure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendorId: params.vendorId,
        cpf_cnpj: params.cpfCnpj ?? params.vendorId,
        email: (params.email || "").trim(),
      }),
    });

    const data = (await r.json().catch(() => ({}))) as Partial<
      EnsureContractResponse
    > & { error?: string };

    if (!r.ok) throw new Error(data?.error || "Falha ao criar/garantir contrato");

    const contractId = data?.contract?.id;
    if (!contractId) throw new Error("ensure não retornou contract.id");

    return { contractId };
  }

   async function uploadPdfDirect(params: {
    vendorId: string;
    pdfBlob: Blob;
    filename: string;
  }) {
    const r = await fetch("/api/contracts/signed-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendor_id: params.vendorId,
        filename: params.filename,
      }),
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data?.error || "Falha ao gerar signed upload URL");

    const { token, path } = data as { token?: string; path?: string };
    if (!token || !path) {
      throw new Error("Resposta inválida do signed-upload (faltou token/path)");
    }

    const { error } = await supabase.storage
      .from(BUCKET)
      .uploadToSignedUrl(path, token, params.pdfBlob, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (error) throw error;

    return { path };
  }

  async function savePdfPathInDb(contractId: string, pdfPath: string) {
    const { error } = await supabase
      .from("contracts")
      .update({
        pdf_path: pdfPath,
        updated_at: new Date().toISOString(),
      })
      .eq("id", contractId);

    if (error) throw error;
  }

  // ✅ salva addenda no vendor_status e atualiza state local
  async function saveAddendaIds(nextIds: string[]) {
    if (!vendor) return;
    const vendorId = String((vendor as any)?.vendor_id || "").trim();
    if (!vendorId) return;

    const unique = Array.from(new Set(nextIds));

    const { error } = await supabase
      .from("vendor_status")
      .update({ addendum_template_ids: unique })
      .eq("vendor_id", vendorId);

    if (error) throw error;

    setAddendaIds(unique);
  }

  async function downloadPdf() {
    if (!vendor || !containerRef.current) return;
    if (downloading) return;

    const vendorId = String((vendor as any)?.vendor_id || "").trim();
    if (!vendorId) {
      alert("vendor_id não encontrado. Volte e selecione o expositor novamente.");
      return;
    }

    if (!finalTemplateHtml) {
      alert("Nenhum contrato selecionado para gerar o PDF.");
      return;
    }

    try {
      setDownloading(true);

      const email = String(
        (vendor as any)?.contact_email || (vendor as any)?.email || ""
      ).trim();

      const {contractId} = await ensureContract({
        vendorId,
        email,
        cpfCnpj: vendorId,
      });

      // ✅ garante render completo antes de capturar
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      await new Promise((r) => setTimeout(r, 120));
      if (document?.fonts?.ready) await document.fonts.ready;

      const html2pdf = (await import("html2pdf.js")).default;

      const safeDoc = vendorId.replace(/\D/g, "") || "sem_doc";
      const brand =
        vendor.person_type === "pf" ? vendor.pf_brand_name : vendor.pj_brand_name;
      const personName =
        vendor.person_type === "pf"
          ? vendor.pf_full_name
          : vendor.pj_legal_representative_name;

      const safeName = slugifyFilename(brand || personName || "expositor");
      const filename = `Contrato_Botecagem_${safeName}_${safeDoc}.pdf`;

      const el = containerRef.current;

      const worker = (html2pdf() as any)
        .set({
          margin: [12, 12, 12, 12],
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            backgroundColor: "#ffffff",
            useCORS: true,
            scrollY: -window.scrollY,
            windowWidth: el.scrollWidth || 794,
            windowHeight: el.scrollHeight || el.getBoundingClientRect().height,
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: {
            mode: ["css", "legacy"],
            before: [".pdf-addendum"],
          },

        })
        .from(el);

   // 1) gera blob do PDF
      const pdfBlob: Blob =
        typeof worker.outputPdf === "function"
          ? await worker.outputPdf("blob")
          : await worker.output("blob");

      // 2) upload no Storage
      const { path } = await uploadPdfDirect({
        vendorId,
        pdfBlob,
        filename,
      });

      // 3) salva pdf_path no contrato
      await savePdfPathInDb(contractId, path);

      // 4) baixa local pro usuário (opcional, mas você queria)
      await worker.save();

 // 5) atualiza status do vendor
      await updateVendorStatus(vendorId, "aguardando_pagamento" as any);

      // 6) volta
      clear();
      router.push("/pages/selected");
    } catch (e) {
      console.error(e);
      alert(
        e instanceof Error ? e.message : "Erro ao gerar/enviar PDF. Veja o console."
      );
    } finally {
      setDownloading(false);
    }
  }

  if (!vendor) return <div className="p-10 text-center">Carregando contrato…</div>;

  return (
    <main className="relative mx-auto max-w-[794px] bg-white">
      <button
        data-html2canvas-ignore
        onClick={() => setAddendaModalOpen(true)}
        disabled={tplLoading || !template?.id}
        className="fixed bottom-24 right-6 z-50 flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-3 text-white shadow-lg hover:bg-zinc-800 disabled:opacity-60"
      >
        <Plus size={18} />
        Aditivos ({addendaIds.length})
      </button>

      <button
        data-html2canvas-ignore
        onClick={downloadPdf}
        disabled={downloading || tplLoading || !finalTemplateHtml}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-white shadow-lg hover:bg-orange-600 disabled:opacity-60"
      >
        <Download size={18} />
        {downloading ? "Gerando..." : "Baixar PDF"}
      </button>

      <div ref={containerRef} id="contract-preview" className="p-10">
        {tplLoading ? (
          <div className="py-10 text-center text-sm text-zinc-500">
            Carregando contrato selecionado…
          </div>
        ) : !template?.id ? (
          <div className="py-10 text-center text-sm text-zinc-500">
            Nenhum contrato selecionado (status = selected).
          </div>
        ) : !finalTemplateHtml ? (
          <div className="py-10 text-center text-sm text-zinc-500">
            Carregando conteúdo do contrato…
          </div>
        ) : (
          <ContractHtml
            vendor={vendor as any}
            templateTitle={template?.title || ""}
            templateHtml={finalTemplateHtml}
            hasRegistration={hasRegistration}
          />
        )}
      </div>

      <AddendaModal
        open={addendaModalOpen}
        onClose={() => setAddendaModalOpen(false)}
        baseTemplateId={template?.id ?? null}
        initialSelectedIds={addendaIds}
        onSave={saveAddendaIds}
      />
    </main>
  );
}
