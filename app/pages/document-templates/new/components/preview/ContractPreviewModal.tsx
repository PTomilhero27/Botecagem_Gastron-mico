"use client";

import { X } from "lucide-react";
import { ContractBlock } from "../types";
import { ContractPreview } from "./ContractPreview";

export function ContractPreviewModal({
  open,
  onClose,
  title,
  blocks,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  blocks: ContractBlock[];
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="text-sm font-semibold text-zinc-800">Preview do contrato</div>

          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 hover:bg-zinc-50"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body (scroll) */}
        <div className="max-h-[80vh] overflow-auto bg-zinc-50 p-6">
          <div className="mx-auto max-w-[820px] rounded-2xl bg-white px-10 py-10 shadow-sm">
            <ContractPreview title={title} blocks={blocks} />
          </div>
        </div>
      </div>
    </div>
  );
}
