"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";

export function BlockMenu({
  items,
}: {
  items: { label: string; danger?: boolean; onClick: () => void }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const el = e.target as Node | null;
      if (!ref.current) return;
      if (el && ref.current.contains(el)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full p-2 hover:bg-zinc-100"
        aria-label="Opções"
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border bg-white shadow-lg z-50">
          {items.map((it, idx) => (
            <button
              key={idx}
              onClick={() => {
                setOpen(false);
                it.onClick();
              }}
              className={[
                "w-full px-3 py-2 text-left text-sm hover:bg-zinc-50",
                it.danger ? "text-red-600" : "text-zinc-700",
              ].join(" ")}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
