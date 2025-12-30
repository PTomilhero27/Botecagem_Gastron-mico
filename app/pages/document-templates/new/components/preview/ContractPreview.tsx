"use client";

import { ContractBlock } from "../types";
import { applyPreviewTokens } from "@/app/lib/contractPreview/templatePreview";

export function ContractPreview({
  title,
  blocks,
}: {
  title: string;
  blocks: ContractBlock[];
}) {
  return (
    <div className="text-zinc-900">
      {/* Título central */}
      <div className="text-center">
        <div className="text-xl font-bold tracking-tight uppercase">
          {title || "Contrato"}
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {blocks.map((b) => (
          <div key={b.id} className="space-y-4">
            <BlockRenderer block={b} />

            {/* Separador */}
            <div className="pt-2">
              <div className="h-px w-full bg-zinc-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BlockRenderer({ block }: { block: ContractBlock }) {
  // ===== TEXT =====
  if (block.type === "text") {
    const html = applyPreviewTokens(block.text || "");
    return (
      <div
        className="tiptap prose prose-sm max-w-none leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  // ===== CLAUSE =====
  const clauseTitle = `CLÁUSULA ${block.clauseNo} – ${block.title || ""}`.trim();

  const clauseTextHtml = block.text?.trim()
    ? applyPreviewTokens(block.text || "")
    : "";

  return (
    <div className="space-y-3">
      {/* título à esquerda */}
      <div className="text-sm font-bold uppercase tracking-wide">
        {clauseTitle}
      </div>

      {/* texto geral da cláusula */}
      {clauseTextHtml ? (
        <div
          className="tiptap prose prose-sm max-w-none leading-relaxed"
          dangerouslySetInnerHTML={{ __html: clauseTextHtml }}
        />
      ) : null}

      {/* incisos */}
      <div className="space-y-2 text-sm leading-relaxed">
        {block.incisos?.length ? (
          block.incisos.map((it, idx) => {
            const incisoNo = `${block.clauseNo}.${idx + 1}`;
            const incisoHtml = applyPreviewTokens(it.html || "");

            return (
              <div key={it.id} className="grid grid-cols-[56px_1fr] gap-3">
                <div className="font-semibold">{incisoNo}</div>

                <div
                  className="tiptap prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: incisoHtml }}
                />
              </div>
            );
          })
        ) : (
          <div className="text-zinc-500 italic">Cláusula sem itens.</div>
        )}
      </div>
    </div>
  );
}
