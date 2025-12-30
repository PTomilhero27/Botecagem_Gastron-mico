"use client";

import { useEffect, useState } from "react";
import { ClauseInciso } from "../../types";
import { RichTextEditor } from "../../RichTextEditor";
import { ModalShell } from "@/app/components/ModalShell";

export function EditIncisosModal({
  open,
  clauseNo,
  initialIncisos,
  onClose,
  onSave,
}: {
  open: boolean;
  clauseNo: number;
  initialIncisos: ClauseInciso[];
  onClose: () => void;
  onSave: (next: ClauseInciso[]) => void;
}) {
  const [items, setItems] = useState<ClauseInciso[]>([]);

  useEffect(() => {
    if (!open) return;
    setItems(initialIncisos || []);
  }, [open, initialIncisos]);

  function addOne() {
    setItems((prev) => [...prev, { id: crypto.randomUUID(), html: "" }]);
  }

  function updateHtml(id: string, html: string) {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, html } : x)));
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  function handleSave() {
    const cleaned = items
      .map((x) => ({ ...x, html: (x.html || "").trim() }))
      .filter((x) => x.html.replace(/<[^>]*>/g, "").trim().length > 0);

    onSave(cleaned);
  }

  return (
    <ModalShell
      open={open}
      title={`Editar incisos • CLÁUSULA ${clauseNo}`}
      onClose={onClose}
      maxWidthClass="max-w-3xl"
      closeOnBackdrop
      closeOnEsc
      footer={
        <div className="flex items-center justify-between">
          <button onClick={addOne} className="rounded-xl border px-4 py-2 text-sm">
            Adicionar inciso
          </button>

          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-xl border px-4 py-2">
              Cancelar
            </button>

            <button
              onClick={handleSave}
              className="rounded-xl bg-orange-500 px-4 py-2 text-white"
            >
              Salvar
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-sm text-zinc-500">
            Nenhum inciso ainda. Clique em “Adicionar inciso”.
          </div>
        ) : (
          items.map((i, idx) => (
            <div key={i.id} className="flex items-start gap-3">
              <div className="w-14 shrink-0 pt-2 text-sm font-semibold text-zinc-700">
                {clauseNo}.{idx + 1}
              </div>

              <div className="flex-1">
                <RichTextEditor
                  value={i.html}
                  onChange={(html) => updateHtml(i.id, html)}
                  placeholder="Texto do inciso..."
                />
              </div>

              <button
                type="button"
                onClick={() => remove(i.id)}
                className="rounded-xl border px-3 py-2 text-sm text-red-600 hover:bg-zinc-50"
              >
                Remover
              </button>
            </div>
          ))
        )}
      </div>
    </ModalShell>
  );
}
