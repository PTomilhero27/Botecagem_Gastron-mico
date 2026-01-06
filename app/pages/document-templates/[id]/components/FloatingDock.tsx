// FloatingDock.tsx
"use client";

import { useEffect } from "react";
import { RadialAddMenu } from "./RadialAddMenu";
import { RadialConfigMenu } from "./RadialConfigMenu";
import { BlockType } from "../../new/components/types";

export function FloatingDock({
  addOpen,
  setAddOpen,
  onAdd,

  // ✅ ficha cadastral
  hasRegistration,
  onToggleRegistration,

  // ✅ config
  configOpen,
  setConfigOpen,
  onPreview,
  onSaveDraft,
  onPublish,
  onDelete,

  // ✅ NOVO: aditivo
  isAddendum,
  onToggleAddendum,

  rightClassName = "right-6",
  bottomClassName = "bottom-10",
}: {
  addOpen: boolean;
  setAddOpen: (v: boolean) => void;
  onAdd: (type: BlockType) => void;

  // ✅ ficha cadastral
  hasRegistration: boolean;
  onToggleRegistration: () => void;

  // ✅ config
  configOpen: boolean;
  setConfigOpen: (v: boolean) => void;

  onPreview?: () => void;
  onSaveDraft?: () => void;
  onPublish?: () => void;
  onDelete?: () => void;

  // ✅ NOVO: aditivo
  isAddendum?: boolean;
  onToggleAddendum?: () => void;

  rightClassName?: string;
  bottomClassName?: string;
}) {
  const hasConfigActions =
    typeof onPreview === "function" ||
    typeof onSaveDraft === "function" ||
    typeof onPublish === "function" ||
    typeof onDelete === "function" ||
    typeof onToggleAddendum === "function"; // ✅ inclui aditivo

  useEffect(() => {
    if (addOpen) setConfigOpen(false);
  }, [addOpen, setConfigOpen]);

  useEffect(() => {
    if (configOpen) setAddOpen(false);
  }, [configOpen, setAddOpen]);

  useEffect(() => {
    if (!hasConfigActions && configOpen) setConfigOpen(false);
  }, [hasConfigActions, configOpen, setConfigOpen]);

  return (
    <div className={["fixed z-[999]", bottomClassName, rightClassName].join(" ")}>
      <div className="relative flex flex-col items-end gap-3">
        {hasConfigActions && (
          <RadialConfigMenu
            open={configOpen}
            onToggle={() => setConfigOpen(!configOpen)}
            onPreview={onPreview}
            onSaveDraft={onSaveDraft}
            onPublish={onPublish}
            onDelete={onDelete}
            // ✅ NOVO: aditivo
            isAddendum={isAddendum}
            onToggleAddendum={onToggleAddendum}
          />
        )}

        <RadialAddMenu
          open={addOpen}
          onToggle={() => setAddOpen(!addOpen)}
          onAdd={(type) => onAdd(type)}
          // ✅ ficha cadastral
          hasRegistration={hasRegistration}
          onToggleRegistration={onToggleRegistration}
        />
      </div>
    </div>
  );
}
