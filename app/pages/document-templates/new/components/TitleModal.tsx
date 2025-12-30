"use client";

import { useState } from "react";

export function TitleModal({
  open,
  onSave,
}: {
  open: boolean;
  onSave: (title: string) => void;
}) {
  const [value, setValue] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 space-y-4">
        <h2 className="text-lg font-semibold">Título do contrato</h2>

        <input
          className="w-full rounded-lg border p-3"
          placeholder="Ex: Contrato de Expositor – Festival Botecagem"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />

        <div className="flex justify-end">
          <button
            onClick={() => value.trim() && onSave(value.trim())}
            className="rounded-lg bg-orange-500 px-4 py-2 text-white"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
