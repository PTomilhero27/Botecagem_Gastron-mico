"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Download } from "lucide-react";

import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { useAuthGuard } from "@/app/lib/auth/useAuthGuard";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type BannerRow = {
  id: string;
  merchant_id: string | null;
  banner_name: string;
  theme: string | null;
  accent: string | null;
  created_at?: string | null;
};

function slugifyFilename(s: string) {
  return (s || "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 60);
}

export default function BarracasPage() {
  useAuthGuard({
    redirectTo: "/pages/login",
    toastMessage: "Sessão encerrada por segurança.",
  });

  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [rows, setRows] = useState<BannerRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("vendor_banners")
          .select("id,merchant_id,banner_name,theme,accent,created_at")
          .order("banner_name", { ascending: true });

        if (error) throw error;
        if (!mounted) return;

        setRows((data as BannerRow[]) ?? []);
      } catch (e: any) {
        console.error(e);
        if (!mounted) return;
        setError(e?.message ?? "Erro ao carregar banners.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const count = useMemo(() => rows.length, [rows]);

  async function downloadPdf() {
    if (downloading) return;
    if (!containerRef.current) return;
    if (rows.length === 0) return;

    try {
      setDownloading(true);

      // ✅ garante render completo antes de capturar
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      await new Promise((r) => setTimeout(r, 120));
      if (document?.fonts?.ready) await document.fonts.ready;

      const html2pdf = (await import("html2pdf.js")).default;

      const filename = `Banners_Botecagem_${slugifyFilename(
        new Date().toISOString().slice(0, 10)
      )}.pdf`;

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
          pagebreak: { mode: ["css", "legacy"] },
        })
        .from(el);

      await worker.save();
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Erro ao gerar PDF.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/pages/home" },
          { label: "Selecionados", href: "/pages/selected" },
          { label: "Banners" },
        ]}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-3xl font-extrabold tracking-tight text-zinc-900">
            Banners <span className="text-orange-500">Botecagem</span>
          </div>
          <div className="mt-1 text-sm text-zinc-600">
            {loading ? "Carregando..." : `${count} banners`}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-extrabold text-zinc-900 shadow hover:bg-zinc-200"
          >
            Voltar
          </button>
        </div>
      </div>

      {/* ✅ Botão flutuante para baixar PDF (mesmo padrão do contrato) */}
      <button
        data-html2canvas-ignore
        onClick={downloadPdf}
        disabled={downloading || loading || rows.length === 0 || !!error}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-white shadow-lg hover:bg-orange-600 disabled:opacity-60"
      >
        <Download size={18} />
        {downloading ? "Gerando..." : "Baixar PDF"}
      </button>

      {/* ✅ ESTE container é o que vai virar PDF */}
      <div
        ref={containerRef}
        className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        {error ? (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : loading ? (
          <div className="text-sm text-zinc-600">Carregando lista...</div>
        ) : rows.length === 0 ? (
          <div className="text-sm text-zinc-600">Nenhum banner encontrado.</div>
        ) : (
          <>
            {/* ✅ Cabeçalho bonitinho no PDF */}
            <div className="mb-4">
              <div className="text-lg font-extrabold text-zinc-900">
                Lista de Banners
              </div>
              <div className="text-sm text-zinc-600">
                Total: {rows.length}
              </div>
            </div>

            <ol className="list-decimal space-y-3 pl-6">
              {rows.map((b) => (
                <li key={b.id} className="text-zinc-900">
                  <div className="font-semibold">{b.banner_name}</div>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </main>
  );
}
