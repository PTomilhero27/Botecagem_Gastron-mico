"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { BlockType, ContractBlock } from "../../new/components/types";
import { EmptyInstructions } from "../../new/components/clause/EmptyInstructions";
import { ContractBlocksList } from "../../new/components/clause/ContractBlocksList";
import { CreateClauseModal } from "../../new/components/clause/create/CreateClauseModal";
import { CreateTextModal } from "../../new/components/clause/create/CreateTextModal";
import { ContractPreviewModal } from "../../new/components/preview/ContractPreviewModal";
import { FloatingDock } from "../components/FloatingDock";
import { useToast } from "@/app/pages/dashboard/components/ui/toast/use-toast";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function safeParseBlocks(raw: string | null | undefined): ContractBlock[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ContractBlock[]) : [];
  } catch {
    return [];
  }
}

export default function EditTemplatePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  const id = params?.id;

  useEffect(() => {
    if (!id) router.push("/pages/document-templates");
  }, [id, router]);

  const [loading, setLoading] = useState(true);
  const [configOpen, setConfigOpen] = useState(false);

  const [title, setTitle] = useState<string>("");
  const [status, setStatus] = useState<"draft" | "published" | "deleted">("draft");
  const [blocks, setBlocks] = useState<ContractBlock[]>([]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // ✅ flag da ficha cadastral (coluna has_registration)
  const [hasRegistration, setHasRegistration] = useState(false);

  const [createClauseOpen, setCreateClauseOpen] = useState(false);
  const [createTextOpen, setCreateTextOpen] = useState(false);

  const nextClauseNo = useMemo(() => {
    return blocks.filter((b) => b.type === "clause").length + 1;
  }, [blocks]);

  // ✅ LOAD SEM LOOP + SEM TRAVAR EM "CARREGANDO..."
  useEffect(() => {
    if (!id) return;

    let mounted = true;

    async function load() {
      try {
        if (!mounted) return;
        setLoading(true);

        const { data: tpl, error: tplErr } = await supabase
          .from("document_templates")
          .select("title,status,has_registration")
          .eq("id", id)
          .single();

        if (tplErr || !tpl) {
          toast.toast({
            variant: "error",
            title: "Erro ao carregar o contrato",
          });
          router.push("/pages/document-templates");
          return;
        }

        const { data: v, error: verErr } = await supabase
          .from("document_template_versions")
          .select("content,version_number")
          .eq("template_id", id)
          .order("version_number", { ascending: false })
          .limit(1)
          .single();

        if (verErr) {
          toast.toast({
            variant: "error",
            title: "Erro ao carregar a versão do contrato",
          });
        }

        if (!mounted) return;

        setTitle(tpl.title || "");
        setHasRegistration(!!tpl.has_registration);
        setStatus((tpl.status as any) || "draft");
        setBlocks(safeParseBlocks(v?.content));
      } catch {
        toast.toast({
          variant: "error",
          title: "Falha inesperada ao carregar",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };

    // ⚠️ não coloca `toast` aqui pra não entrar em loop
  }, [id, router]);

  function onAdd(type: BlockType) {
    if (type === "clause") setCreateClauseOpen(true);
    if (type === "text") setCreateTextOpen(true);
  }

  function addClause(payload: { title: string; text: string }) {
    setBlocks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: "clause",
        clauseNo: nextClauseNo,
        title: payload.title,
        text: payload.text,
        incisos: [],
      } as any,
    ]);
    setCreateClauseOpen(false);
  }

  function addText(payload: { text: string }) {
    setBlocks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type: "text", text: payload.text },
    ]);
    setCreateTextOpen(false);
  }

  async function saveDraft() {
    if (!id) return;

    if (!title.trim()) {
      toast.toast({
        variant: "error",
        title: "Informe um título para salvar",
      });
      return;
    }

    setSaving(true);

    try {
      const { error: upErr } = await supabase
        .from("document_templates")
        .update({ title: title.trim() })
        .eq("id", id);

      if (upErr) {
        toast.toast({ variant: "error", title: "Erro ao salvar título" });
        return;
      }

      const { data: last, error: lastErr } = await supabase
        .from("document_template_versions")
        .select("version_number")
        .eq("template_id", id)
        .order("version_number", { ascending: false })
        .limit(1)
        .single();

      if (lastErr) {
        toast.toast({ variant: "error", title: "Erro ao obter última versão" });
        return;
      }

      const nextVersion = (last?.version_number ?? 0) + 1;

      const { error: insErr } = await supabase
        .from("document_template_versions")
        .insert({
          template_id: id,
          version_number: nextVersion,
          content: JSON.stringify(blocks),
        });

      if (insErr) {
        toast.toast({ variant: "error", title: "Erro ao salvar rascunho" });
        return;
      }

      toast.toast({ title: "Rascunho salvo" });
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    if (!id) return;

    const { error } = await supabase
      .from("document_templates")
      .update({ status: "published" })
      .eq("id", id);

    if (error) {
      toast.toast({ variant: "error", title: "Erro ao publicar" });
      return;
    }

    setStatus("published");
    toast.toast({ title: "Publicado" });
  }

  async function softDelete() {
    if (!id) return;

    const { error } = await supabase
      .from("document_templates")
      .update({ status: "deleted" })
      .eq("id", id);

    if (error) {
      toast.toast({ variant: "error", title: "Erro ao excluir" });
      return;
    }

    toast.toast({ title: "Contrato excluído" });
    router.push("/pages/document-templates");
  }

  // ✅ toggle true/false com toast
  async function toggleRegistration() {
    if (!id) return;

    const next = !hasRegistration;
    setHasRegistration(next); // otimista

    const { error } = await supabase
      .from("document_templates")
      .update({ has_registration: next })
      .eq("id", id);

    if (error) {
      setHasRegistration(!next); // rollback
      toast.toast({
        variant: "error",
        title: "Erro ao atualizar ficha cadastral",
      });
      return;
    }

    toast.toast({
      title: next ? "Ficha cadastral ativada" : "Ficha cadastral desativada",
    });
  }

  if (!id) return null;

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/pages/home" },
          { label: "Contratos", href: "/pages/document-templates" },
          { label: "Editar contrato" },
        ]}
      />

      {loading ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
          Carregando...
        </div>
      ) : (
        <>
          <input
            className="w-full text-2xl font-bold outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do contrato..."
          />

          {blocks.length === 0 ? (
            <EmptyInstructions />
          ) : (
            <ContractBlocksList blocks={blocks} setBlocks={setBlocks} />
          )}

          <CreateClauseModal
            open={createClauseOpen}
            clauseNo={nextClauseNo}
            onClose={() => setCreateClauseOpen(false)}
            onSave={addClause}
          />

          <CreateTextModal
            open={createTextOpen}
            onClose={() => setCreateTextOpen(false)}
            onSave={addText}
          />

          <ContractPreviewModal
            open={previewOpen}
            onClose={() => setPreviewOpen(false)}
            title={title}
            blocks={blocks}
            // se você quiser mostrar no preview:
            // hasRegistration={hasRegistration}
          />

          <FloatingDock
            addOpen={menuOpen}
            setAddOpen={setMenuOpen}
            onAdd={(type) => {
              setMenuOpen(false);
              onAdd(type);
            }}
            // ✅ novos props (precisa atualizar FloatingDock/RadialAddMenu)
            hasRegistration={hasRegistration}
            onToggleRegistration={toggleRegistration}
            configOpen={configOpen}
            setConfigOpen={setConfigOpen}
            onPreview={() => setPreviewOpen(true)}
            onSaveDraft={saveDraft}
            onPublish={publish}
            onDelete={softDelete}
          />
        </>
      )}
    </main>
  );
}
