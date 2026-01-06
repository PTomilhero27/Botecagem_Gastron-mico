import { supabase } from "@/app/lib/supabase/client";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type TemplateRow = {
  id: string;
  title: string;
};

export function AddendaModal({
  open,
  onClose,
  baseTemplateId,
  initialSelectedIds,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  baseTemplateId: string | null;
  initialSelectedIds: string[];
  onSave: (nextIds: string[]) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<TemplateRow[]>([]);
  const [localSelected, setLocalSelected] = useState<string[]>([]);

  // sempre que abrir, carrega seleção inicial
  useEffect(() => {
    if (!open) return;
    setLocalSelected(Array.isArray(initialSelectedIds) ? initialSelectedIds : []);
  }, [open, initialSelectedIds]);

  // carrega addenda publicados
  useEffect(() => {
    if (!open) return;

    let mounted = true;
    (async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("document_templates")
          .select("id, title")
          .eq("status", "published")
          .eq("is_addendum", true);

        if (!mounted) return;
        if (error) throw error;

        const list = (data ?? []).filter((t: any) => t.id !== baseTemplateId);
        setRows(list as any);
      } catch (e) {
        console.error(e);
        setRows([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [open, baseTemplateId]);

  const sortedRows = useMemo(() => {
    const set = new Set(localSelected);
    return [...rows].sort((a, b) => {
      const aSel = set.has(a.id) ? 0 : 1;
      const bSel = set.has(b.id) ? 0 : 1;
      if (aSel !== bSel) return aSel - bSel;
      return a.title.localeCompare(b.title);
    });
  }, [rows, localSelected]);

  if (!open) return null;

  function toggle(id: string) {
    setLocalSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  }

  async function handleSave() {
    try {
      setLoading(true);

      // mantém ordem do clique e remove duplicados
      const unique = Array.from(new Set(localSelected));

      await onSave(unique);
      onClose();
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Erro ao salvar aditivos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 md:items-center">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-200 p-4">
          <div>
            <div className="text-sm font-extrabold text-zinc-900">Aditivos</div>
            <div className="text-xs text-zinc-500">
              Marque os aditivos que entram no PDF. Desmarcar remove.
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-zinc-100"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-auto p-4">
          {loading ? (
            <div className="py-8 text-center text-sm text-zinc-500">
              Carregando…
            </div>
          ) : sortedRows.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-500">
              Nenhum aditivo publicado encontrado.
            </div>
          ) : (
            <div className="space-y-2">
              {sortedRows.map((t) => {
                const checked = localSelected.includes(t.id);

                return (
                  <label
                    key={t.id}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-200 p-3 hover:bg-zinc-50"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-zinc-900">
                        {t.title}
                      </div>
                      <div className="text-xs text-zinc-500">ID: {t.id}</div>
                    </div>

                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(t.id)}
                      className="h-4 w-4"
                    />
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-zinc-200 p-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
