// RadialAddMenu.tsx
"use client";

import { useEffect, useState } from "react";
import { FileText, AlignLeft, Plus, X, ClipboardList } from "lucide-react";
import { BlockType } from "../../new/components/types";
import { RadialButton } from "./RadialButton";

export function RadialAddMenu({
  open,
  onToggle,
  onAdd,
  // ✅ novo
  hasRegistration,
  onToggleRegistration,
}: {
  open: boolean;
  onToggle: () => void;
  onAdd: (type: BlockType) => void;

  // ✅ novo
  hasRegistration: boolean;
  onToggleRegistration: () => void;
}) {
  const BASE = 0;
  const SPINS = 1080;
  const X_OFFSET = 45;

  const [step, setStep] = useState(0);
  const [rotation, setRotation] = useState(BASE);

  useEffect(() => setStep((s) => s + 1), [open]);

  useEffect(() => {
    const target = BASE + step * SPINS + (open ? X_OFFSET : 0);
    setRotation(target);
  }, [open, step]);

  return (
    <div className="relative h-14 w-14">
      {/* ✅ agora é toggle e label muda */}
      <RadialButton
        show={open}
        dx="-5"
        dy="-95"
        label={hasRegistration ? "Desativar ficha cadastral" : "Ativar ficha cadastral"}
        icon={<ClipboardList size={16} />}
        onClick={() => {
          onToggle(); // opcional: fecha o menu ao clicar
          onToggleRegistration();
        }}
      />

      <RadialButton
        show={open}
        dx="-80"
        dy="-55"
        label="Cláusula"
        icon={<FileText size={16} />}
        onClick={() => onAdd("clause")}
      />

      <RadialButton
        show={open}
        dx="-60"
        dy="-15"
        label="Texto livre"
        icon={<AlignLeft size={16} />}
        onClick={() => onAdd("text")}
      />

      <button
        onClick={onToggle}
        className={[
          "absolute right-0 bottom-0",
          "flex h-14 w-14 items-center justify-center rounded-full",
          "bg-orange-500 text-white shadow-xl",
          "transition-transform duration-700 ease-in-out",
        ].join(" ")}
        style={{ transform: `rotate(${rotation}deg)` }}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
      >
        {open ? <X size={22} /> : <Plus size={26} />}
      </button>
    </div>
  );
}
