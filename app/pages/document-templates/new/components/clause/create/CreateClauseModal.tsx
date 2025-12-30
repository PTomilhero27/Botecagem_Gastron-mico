"use client";

import { ModalShell } from "@/app/components/ModalShell";
import { useEffect, useState } from "react";

export function CreateClauseModal({
  open,
  clauseNo,
  onClose,
  onSave,
}: {
  open: boolean;
  clauseNo: number;
  onClose: () => void;
  onSave: (payload: { title: string; text: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    if (open) {
      setTitle("");
      setText("");
    }
  }, [open]);

  const canSave = !!title.trim();

  return (
    <ModalShell
      open={open}
      title={`CLÁUSULA ${clauseNo}`}
      onClose={onClose}
      maxWidthClass="max-w-3xl"
      footer={
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              setTitle("");
              setText("");
              onClose();
            }}
            className="rounded-xl border px-4 py-2"
          >
            Cancelar
          </button>

          <button
            disabled={!canSave}
            onClick={() => {
              onSave({ title: title.trim(), text: text.trim() });
              setTitle("");
              setText("");
            }}
            className="rounded-xl bg-orange-500 px-4 py-2 text-white disabled:opacity-50"
          >
            Salvar
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-zinc-600">Título da cláusula</label>
          <input
            className="w-full rounded-xl border p-3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: DO EVENTO"
            autoFocus
          />
        </div>

        {/* Aqui entra editor dos incisos, se quiser já criar eles dentro */}
      </div>
    </ModalShell>
  );
}
