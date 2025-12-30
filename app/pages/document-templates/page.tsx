"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Template = {
  id: string;
  title: string;
  status: "draft" | "published";
  created_at: string;
};

export default function DocumentTemplatesPage() {
  const [items, setItems] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("document_templates")
      .select("id,title,status,created_at")
      .neq("status", "deleted")
      .order("created_at", { ascending: false });

    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/pages/home" },
          { label: "Contratos" },
        ]}
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Contratos</h1>
        {items.length > 0 && (

          <Link
            href="/pages/document-templates/new"
            className="rounded-lg bg-orange-500 px-4 py-2 text-white"
          >
            Novo contrato
          </Link>
        )}

      </div>



      {loading && <p>Carregando...</p>}

      {!loading && items.length === 0 && (
        <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center">
          <p className="text-lg font-medium">Nenhum contrato criado</p>
          <p className="mt-1 text-sm text-zinc-500">
            Crie um contrato para começar a formalizar a participação dos expositores.
          </p>

          <Link
            href="/pages/document-templates/new"
            className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-white"
          >
            Criar primeiro contrato
          </Link>
        </div>
      )}


      {!loading && (
        <div className="space-y-3">
          {items.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-xl border p-4"
            >
              <div>
                <div className="font-semibold">{t.title}</div>
                <div className="text-sm text-zinc-500">
                  {t.status === "draft" ? "Rascunho" : "Publicado"}
                </div>
              </div>

              <Link
                href={`/pages/document-templates/${t.id}/edit`}
                className="text-orange-600 font-medium"
              >
                Editar
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
