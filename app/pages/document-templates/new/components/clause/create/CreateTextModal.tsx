"use client";

import { useEffect, useState } from "react";
import { RichTextEditor } from "../../RichTextEditor"; // ajuste o path

export function CreateTextModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (payload: { text: string }) => void; // agora é HTML
}) {
  const [html, setHtml] = useState("");

  // quando abrir, começa limpo (opcional)
  useEffect(() => {
    if (open) setHtml("");
  }, [open]);

  if (!open) return null;

  const canSave = html.replace(/<[^>]*>/g, "").trim().length > 0;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40" onMouseDown={onClose}>
      <div className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl" onMouseDown={(e) => e.stopPropagation()}>
        <div className="text-lg font-semibold">Texto livre</div>

        <RichTextEditor
          value={html}
          onChange={setHtml}
          placeholder="Escreva o texto..."
        />

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => {
              setHtml("");
              onClose();
            }}
            className="rounded-xl border px-4 py-2"
          >
            Cancelar
          </button>

          <button
            disabled={!canSave}
            onClick={() => {
              if (!canSave) return;
              onSave({ text: html });
              setHtml("");
            }}
            className="rounded-xl bg-orange-500 px-4 py-2 text-white disabled:opacity-50"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
