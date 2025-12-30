"use client";

import { ContractBlock } from "../types";
import { ClauseBlockCard } from "./ClauseBlockCard";
import { TextBlockCard } from "./TextBlockCard";

export function ContractBlocksList({
  blocks,
  setBlocks,
}: {
  blocks: ContractBlock[];
  setBlocks: (updater: (prev: ContractBlock[]) => ContractBlock[]) => void;
}) {
  function updateBlock(id: string, next: ContractBlock) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? next : b)));
  }

  function deleteBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div className="space-y-4">
      {blocks.map((b) => {
        if (b.type === "clause") {
          return (
            <ClauseBlockCard
              key={b.id}
              block={b}
              onUpdate={(next) => updateBlock(b.id, next)}
              onDelete={() => deleteBlock(b.id)}
            />
          );
        }

        if (b.type === "text") {
          return (
            <TextBlockCard
              key={b.id}
              block={b}
              onUpdate={(next) => updateBlock(b.id, next)}
              onDelete={() => deleteBlock(b.id)}
            />
          );
        }

        return null;
      })}
    </div>
  );
}
