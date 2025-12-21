"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { ContractHtml } from "./ContractHtml";
import { useContractPreview } from "@/app/lib/contractPreview/ContractPreviewContext";
import { updateVendorStatus } from "@/app/services/settings";
import { createClient } from "@supabase/supabase-js";
import { VendorSelected } from "@/lib/types";

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

export default function ContractPreviewPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { vendor, clear } = useContractPreview();

  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!vendor) router.replace("/pages/selected");
  }, [vendor, router]);

  async function ensureContract(params: {
    vendorId: string;
    email?: string;
    cpfCnpj?: string;
    brend?: string;
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

    const data = (await r.json().catch(() => ({}))) as Partial<EnsureContractResponse> & {
      error?: string;
    };

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

  async function downloadPdf() {
    if (!vendor || !containerRef.current) return;
    if (downloading) return;

    const vendorId = String((vendor as any)?.vendor_id || "").trim();
    if (!vendorId) {
      alert("vendor_id não encontrado. Volte e selecione o expositor novamente.");
      return;
    }

    try {
      setDownloading(true);

      // ✅ pega email do vendor (ajuste se seu campo tiver outro nome)
      const email =
        String((vendor as any)?.contact_email || (vendor as any)?.email || "").trim();


      // 0) garante que existe linha em public.contracts e pega o contractId
      const { contractId } = await ensureContract({
        vendorId,
        email,
        cpfCnpj: vendorId, // se você tiver CPF/CNPJ real, manda aqui
      });

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

      const worker = (html2pdf() as any)
        .set({
          margin: [12, 12, 12, 12],
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, backgroundColor: "#ffffff", useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .from(containerRef.current);

      const pdfBlob: Blob =
        typeof worker.outputPdf === "function"
          ? await worker.outputPdf("blob")
          : await worker.output("blob");

      // 1) upload no Storage
      const { path } = await uploadPdfDirect({
        vendorId,
        pdfBlob,
        filename,
      });

      // 2) salva pdf_path no contrato certo (por id uuid)
      await savePdfPathInDb(contractId, path);

      // 3) opcional: baixar local pro usuário
      await worker.save();

      // 4) atualiza status
      await updateVendorStatus(vendorId, "aguardando_pagamento" as any);

      console.log("PDF enviado para o Storage em:", path);

      

      clear();
      router.push("/pages/selected");
    } catch (e) {
      console.error(e);
      alert(
        e instanceof Error
          ? e.message
          : "Erro ao gerar/enviar PDF. Veja o console."
      );
    } finally {
      setDownloading(false);
    }
  }

  if (!vendor) return <div className="p-10 text-center">Carregando contrato…</div>;

  return (
    <main className="relative mx-auto max-w-[794px] bg-white">
      <button
        onClick={downloadPdf}
        disabled={downloading}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-white shadow-lg hover:bg-orange-600 disabled:opacity-60"
      >
        <Download size={18} />
        {downloading ? "Gerando..." : "Baixar PDF"}
      </button>

      <div ref={containerRef} id="contract-preview" className="p-10">
        <ContractHtml vendor={vendor} />
      </div>
    </main>
  );
}
