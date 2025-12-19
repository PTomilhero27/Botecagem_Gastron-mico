"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Download, Info, CheckCircle2 } from "lucide-react";

export function RowActions({
  onDownload,
  onDetails,
  onChangeStatus,
}: {
  onDownload: () => void;
  onDetails: () => void;
  onChangeStatus: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  // Fecha clicando fora
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node;
      if (wrapRef.current && !wrapRef.current.contains(t)) setOpen(false);
    }
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  // Fecha com ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function run(action: () => void) {
    action();
    setOpen(false);
  }

  return (
    <div
      ref={wrapRef}
      className="relative inline-flex justify-end"
      onMouseEnter={() => setOpen(true)} // hover abre (desktop)
      onMouseLeave={() => setOpen(false)} // hover fecha (desktop)
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)} // click alterna (mobile/desktop)
        className="rounded-xl border border-zinc-200 bg-white p-2 text-zinc-700 hover:bg-zinc-50"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Ações"
      >
        <MoreHorizontal size={18} />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => run(onDownload)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-50"
          >
            <Download size={16} />
            Baixar contrato
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => run(onDetails)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-50"
          >
            <Info size={16} />
            Detalhes
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => run(onChangeStatus)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-50"
          >
            <CheckCircle2 size={16} />
            Mudar status
          </button>
        </div>
      ) : null}
    </div>
  );
}
