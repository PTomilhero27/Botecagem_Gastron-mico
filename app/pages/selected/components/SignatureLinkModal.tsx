"use client";

import { X } from "lucide-react";
import { useState } from "react";

export function SignatureLinkModal({
  open,
  onClose,
  title,
  loading,
  link,
  error,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  loading: boolean;
  link: string | null;
  error: string | null;
}) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  async function copy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-zinc-200">
        <div className="flex items-center justify-between p-4 border-b border-zinc-100">
          <div className="font-semibold text-zinc-900">{title}</div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-zinc-50 text-zinc-700"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {loading ? (
            <div className="text-sm text-zinc-600">Gerando link...</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : link ? (
            <>
              <div className="text-sm text-zinc-600"> 
                Copie e envie este link para o expositor assinar:
              </div>

              <input
                value={link}
                readOnly
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />

              <div className="flex gap-2">
                <button
                  onClick={copy}
                  className="rounded-xl border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50"
                >
                  {copied ? "Copiado!" : "Copiar link"}
                </button>

                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50"
                >
                  Abrir
                </a>
              </div>
            </>
          ) : (
            <div className="text-sm text-zinc-600">Nenhum link gerado.</div>
          )}
        </div>
      </div>
    </div>
  );
}
