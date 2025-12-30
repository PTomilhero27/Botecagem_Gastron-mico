"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { X, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/app/pages/dashboard/components/ui/toast/use-toast";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Template = {
  id: string;
  title: string;
  status?: string | null;
  has_registration?: boolean | null;
};

function translateStatus(status?: string | null) {
  switch (status) {
    case "published":
      return "Publicado";
    case "selected":
      return "Selecionável";
    case "draft":
      return "Rascunho";
    case "deleted":
      return "Excluído";
    case "archived":
      return "Arquivado";
    default:
      return status || "—";
  }
}

export function SelectContractModal({
  open,
  onClose,
  onSelected,
  selectedTemplateId,
}: {
  open: boolean;
  onClose: () => void;
  onSelected?: (template: Template) => void;
  selectedTemplateId?: string | null; // ✅ atual selecionado
}) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [q, setQ] = useState("");

  // ✅ confirmação
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState<Template | null>(null);

  useEffect(() => {
    if (!open) return;

    let mounted = true;

    async function load() {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("document_templates")
          .select("id,title,status,has_registration")
          .in("status", ["selected", "published"])
          .order("created_at", { ascending: false });

        if (!mounted) return;

        if (error) {
          toast.toast({ variant: "error", title: "Erro ao carregar contratos" });
          setTemplates([]);
          return;
        }

        setTemplates((data as any) ?? []);
      } catch {
        if (!mounted) return;
        toast.toast({
          variant: "error",
          title: "Falha inesperada ao carregar contratos",
        });
        setTemplates([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [open]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    const base = !query
      ? templates
      : templates.filter((t) =>
        (t.title || "").toLowerCase().includes(query)
      );

    // ✅ 1º: o selecionado atual vai primeiro
    return [...base].sort((a, b) => {
      const aSel = selectedTemplateId && a.id === selectedTemplateId ? 1 : 0;
      const bSel = selectedTemplateId && b.id === selectedTemplateId ? 1 : 0;
      if (aSel !== bSel) return bSel - aSel;
      return 0;
    });
  }, [templates, q, selectedTemplateId]);

  function askConfirm(template: Template) {
    // se clicar no mesmo, não precisa trocar
    if (selectedTemplateId && template.id === selectedTemplateId) {
      toast.toast({ title: "Esse contrato já está selecionado." });
      return;
    }
    setPending(template);
    setConfirmOpen(true);
  }

async function confirmPick() {
  if (!pending) return;

  try {
    setLoading(true);

    // 1) primeiro marca o escolhido como selected
    const { error: e1 } = await supabase
      .from("document_templates")
      .update({ status: "selected" })
      .eq("id", pending.id);

    if (e1) {
      toast.toast({ variant: "error", title: "Erro ao selecionar contrato" });
      return;
    }

    // 2) depois desmarca os outros selected -> published
    // (garante que só 1 fica selected)
    const { error: e2 } = await supabase
      .from("document_templates")
      .update({ status: "published" })
      .eq("status", "selected")
      .neq("id", pending.id);

    if (e2) {
      // rollback: se falhar, tenta voltar o escolhido para published
      await supabase
        .from("document_templates")
        .update({ status: "published" })
        .eq("id", pending.id);

      toast.toast({
        variant: "error",
        title: "Erro ao atualizar os outros contratos",
      });
      return;
    }

    toast.toast({
      title: "Contrato selecionado com sucesso",
      description: pending.title,
    });

    onSelected?.({ ...pending, status: "selected" });
    setConfirmOpen(false);
    setPending(null);
    onClose();
  } catch {
    toast.toast({ variant: "error", title: "Falha ao atualizar contrato" });
  } finally {
    setLoading(false);
  }
}



  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <div>
            <div className="text-base font-extrabold text-zinc-900">
              Selecionar contrato
            </div>
            <div className="mt-0.5 text-sm text-zinc-600">
              Mostrando: <span className="font-semibold">Selecionável</span> e{" "}
              <span className="font-semibold">Publicado</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-600 hover:bg-zinc-100"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar contrato..."
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
          />

          <div className="mt-4 space-y-2">
            {loading ? (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                Carregando...
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                Nenhum contrato disponível.
              </div>
            ) : (
              filtered.map((tpl) => {
                const isCurrent = selectedTemplateId && tpl.id === selectedTemplateId;

                return (
                  <button
                    key={tpl.id}
                    onClick={() => askConfirm(tpl)}
                    className={[
                      "flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition",
                      isCurrent
                        ? "border-orange-300 bg-orange-50"
                        : "border-zinc-200 hover:bg-zinc-50",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={[
                          "mt-0.5 rounded-lg p-2",
                          isCurrent ? "bg-orange-100 text-orange-700" : "bg-orange-50 text-orange-600",
                        ].join(" ")}
                      >
                        <FileText size={18} />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold text-zinc-900">
                            {tpl.title}
                          </div>

                          {isCurrent ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-200/60 px-2 py-0.5 text-xs font-bold text-orange-800">
                              <CheckCircle2 size={14} />
                              Selecionado
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                          <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5">
                            status: <b>{translateStatus(tpl.status)}</b>
                          </span>

                          <span>
                            {tpl.has_registration
                              ? "Inclui ficha cadastral"
                              : "Sem ficha cadastral"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={[
                        "text-sm font-semibold",
                        isCurrent ? "text-orange-800" : "text-orange-600",
                      ].join(" ")}
                    >
                      {isCurrent ? "Selecionado" : "Selecionar"}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-zinc-100 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* ✅ Modal de confirmação */}
      {confirmOpen && pending ? (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-zinc-900">
                    Confirmar seleção
                  </div>
                  <div className="mt-0.5 text-xs text-zinc-600">
                    Esse contrato será aplicado para todos.
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setConfirmOpen(false);
                  setPending(null);
                }}
                className="rounded-xl p-2 text-zinc-600 hover:bg-zinc-100"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 py-4">
              <div className="text-sm text-zinc-700">
                Você quer selecionar:
              </div>
              <div className="mt-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900">
                {pending.title}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-zinc-100 px-5 py-4">
              <button
                onClick={() => {
                  setConfirmOpen(false);
                  setPending(null);
                }}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
              >
                Cancelar
              </button>

              <button
                onClick={confirmPick}
                className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-extrabold text-white hover:bg-orange-600"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
