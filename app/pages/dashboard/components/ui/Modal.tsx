"use client";

import { useEffect } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* OVERLAY — clique aqui fecha */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* CENTRALIZAÇÃO */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        {/* MODAL — impede propagação */}
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
          className="
            w-full max-w-3xl
            rounded-2xl bg-white shadow-xl
            overflow-hidden
          "
        >
          {/* HEADER FIXO */}
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
            <div className="text-base font-semibold text-zinc-900">
              {title ?? "Detalhes"}
            </div>

            <button
              onClick={onClose}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
            >
              Fechar
            </button>
          </div>

          {/* CONTEÚDO COM SCROLL */}
          <div className="max-h-[80vh] overflow-y-auto px-5 py-4">
            {children}
          </div>

        </div>
      </div>
    </div>
  );
}
