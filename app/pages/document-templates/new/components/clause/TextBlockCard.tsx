"use client";

import { useMemo, useState } from "react";
import { ContractBlock } from "../types";
import { BlockMenu } from "./BlockMenu";
import { EditTextModal } from "./edit/EditTextModal";
import { applyTokenBadges } from "@/app/lib/contractPreview/tokenBadges";

export function TextBlockCard({
  block,
  onUpdate,
  onDelete,
}: {
  block: Extract<ContractBlock, { type: "text" }>;
  onUpdate: (next: Extract<ContractBlock, { type: "text" }>) => void;
  onDelete: () => void;
}) {
  const [editOpen, setEditOpen] = useState(false);

  const menuItems = [
    { label: "Editar texto", onClick: () => setEditOpen(true) },
    { label: "Excluir bloco", danger: true, onClick: onDelete },
  ];

  const htmlWithBadges = useMemo(() => {
    return applyTokenBadges(block.text || "");
  }, [block.text]);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Texto livre
          </div>

          <div
            className="mt-2 tiptap prose prose-sm max-w-none text-zinc-700"
            dangerouslySetInnerHTML={{ __html: htmlWithBadges }}
          />
        </div>

        <BlockMenu items={menuItems} />
      </div>

      <EditTextModal
        open={editOpen}
        initialText={block.text}
        onClose={() => setEditOpen(false)}
        onSave={({ text }) => {
          onUpdate({ ...block, text });
          setEditOpen(false);
        }}
      />
    </div>
  );
}
