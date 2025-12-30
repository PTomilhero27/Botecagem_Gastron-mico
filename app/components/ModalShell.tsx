"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export function ModalShell({
  open,
  title,
  onClose,
  children,
  footer,
  maxWidthClass = "max-w-3xl",
  closeOnBackdrop = true,
  closeOnEsc = true,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClass?: string;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
}) {
  // ESC fecha
  useEffect(() => {
    if (!open || !closeOnEsc) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeOnEsc, onClose]);

  // ✅ trava scroll da página atrás
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/40 p-4 flex items-start justify-center"
      onMouseDown={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className={[
          "w-full rounded-2xl bg-white shadow-xl",
          "max-h-[85vh] overflow-hidden", // ✅ card não cresce infinito
          "flex flex-col",                // ✅ permite body rolar
          maxWidthClass,
        ].join(" ")}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="text-lg font-semibold">{title}</div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 hover:bg-zinc-50"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* ✅ Body rola aqui (não na página) */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer ? (
          <div className="border-t bg-white px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
