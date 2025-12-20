"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { ContractHtml } from "./ContractHtml";
import { useContractPreview } from "@/app/lib/contractPreview/ContractPreviewContext";
import { VendorStatus } from "@/app/lib/status";
import { updateVendorStatus } from "@/app/services/settings";

function slugifyFilename(s: string) {
  return (s || "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 40);
}

export default function ContractPreviewPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { vendor, clear } = useContractPreview();

  const [downloading, setDownloading] = useState(false);

  // ✅ se entrar sem context (refresh / link direto), volta pra lista
  useEffect(() => {
    if (!vendor) router.replace("/pages/selected");
  }, [vendor, router]);

  async function downloadPdf() {
    if (!vendor || !containerRef.current) return;
    if (downloading) return;

    try {
      setDownloading(true);

      // ✅ IMPORT DINÂMICO (evita "self is not defined" no build/SSR)
      const html2pdf = (await import("html2pdf.js")).default;

      // ✅ doc = cpf/cnpj
      const safeDoc = (vendor.vendor_id ?? "").replace(/\D/g, "") || "sem_doc";

      // ✅ nome para arquivo: marca -> senão nome -> fallback
      const brand =
        vendor.person_type === "pf" ? vendor.pf_brand_name : vendor.pj_brand_name;

      const personName =
        vendor.person_type === "pf"
          ? vendor.pf_full_name
          : vendor.pj_legal_representative_name;

      const safeName = slugifyFilename(brand || personName || "expositor");

      // ✅ gera e salva o pdf
      await (html2pdf() as any)
        .set({
          margin: [12, 12, 12, 12],
          filename: `Contrato_Botecagem_${safeName}_${safeDoc}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            backgroundColor: "#ffffff",
            useCORS: true,
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .from(containerRef.current)
        .save();

      // ✅ depois de salvar: muda status para aguardando_pagamento
      // (se quiser, você pode só mudar se ainda estiver aguardando_assinatura)
      await updateVendorStatus(vendor.vendor_id, "aguardando_pagamento" as VendorStatus);

      // ✅ limpa e volta
      clear();
      router.push("/pages/selected");
    } catch (err) {
      console.error(err);
      // opcional: mostrar toast/alert
      // alert("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setDownloading(false);
    }
  }

  if (!vendor) {
    return <div className="p-10 text-center">Carregando contrato…</div>;
  }

  return (
    <main className="relative mx-auto max-w-[794px] bg-white">
      {/* Botão flutuante */}
      <button
        onClick={downloadPdf}
        disabled={downloading}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-white shadow-lg hover:bg-orange-600 disabled:opacity-60"
      >
        <Download size={18} />
        {downloading ? "Gerando..." : "Baixar PDF"}
      </button>

      {/* Preview */}
      <div ref={containerRef} id="contract-preview" className="p-10">
        <ContractHtml vendor={vendor} />
      </div>
    </main>
  );
}
