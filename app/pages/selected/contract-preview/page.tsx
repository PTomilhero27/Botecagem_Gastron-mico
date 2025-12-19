"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import html2pdf from "html2pdf.js";
import { Download } from "lucide-react";
import { ContractHtml } from "./ContractHtml";
import { useContractPreview } from "@/app/lib/contractPreview/ContractPreviewContext";

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

  // ✅ se entrar sem context (refresh / link direto), volta pra lista
  useEffect(() => {
    if (!vendor) router.replace("/pages/selected");
  }, [vendor, router]);

  async function downloadPdf() {
    if (!vendor || !containerRef.current) return;

    // ✅ doc = vendor_id (cpf ou cnpj)
    const safeDoc = (vendor.vendor_id ?? "").replace(/\D/g, "") || "sem_doc";

    // ✅ nome para arquivo: marca (pf/pj) -> senão nome -> fallback
    const brand =
      vendor.person_type === "pf"
        ? vendor.pf_brand_name
        : vendor.pj_brand_name;

    const personName =
      vendor.person_type === "pf"
        ? vendor.pf_full_name
        : vendor.pj_legal_representative_name;

    const safeName = slugifyFilename(brand || personName || "expositor");

    await (html2pdf() as any)
      .set({
        margin: [12, 12, 12, 12],
        filename: `Contrato_Botecagem_${safeName}_${safeDoc}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, backgroundColor: "#ffffff", useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      })
      .from(containerRef.current)
      .save();

    // ✅ limpa e volta
    clear();
    router.push("/pages/selected");
  }

  if (!vendor) {
    return <div className="p-10 text-center">Carregando contrato…</div>;
  }

  return (
    <main className="relative mx-auto max-w-[794px] bg-white">
      {/* Botão flutuante */}
      <button
        onClick={downloadPdf}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-white shadow-lg hover:bg-orange-600"
      >
        <Download size={18} />
        Baixar PDF
      </button>

      {/* Preview */}
      <div ref={containerRef} id="contract-preview" className="p-10">
        <ContractHtml vendor={vendor} />
      </div>
    </main>
  );
}
