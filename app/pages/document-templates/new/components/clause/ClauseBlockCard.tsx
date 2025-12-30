"use client";

import { useMemo, useState } from "react";
import { ContractBlock } from "../types";
import { BlockMenu } from "./BlockMenu";
import { EditChoiceModal } from "./edit/EditChoiceModal";
import { EditIncisosModal } from "./edit/EditIncisosModal";
import { EditClauseModal } from "./edit/EditClauseModal";

function isHtmlEmpty(html?: string) {
  const plain = (html || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  return plain.length === 0;
}

export function ClauseBlockCard({
  block,
  onUpdate,
  onDelete,
}: {
  block: Extract<ContractBlock, { type: "clause" }>;
  onUpdate: (next: Extract<ContractBlock, { type: "clause" }>) => void;
  onDelete: () => void;
}) {
  const hasIncisos = (block.incisos?.length ?? 0) > 0;

  const [editChoiceOpen, setEditChoiceOpen] = useState(false);
  const [editClauseOpen, setEditClauseOpen] = useState(false);
  const [editIncisosOpen, setEditIncisosOpen] = useState(false);

  function addIncisoQuick() {
    const next = {
      ...block,
      // ✅ agora inciso tem html
      incisos: [...(block.incisos || []), { id: crypto.randomUUID(), html: "" }],
    };
    onUpdate(next);
    setEditIncisosOpen(true);
  }

  const menuItems = useMemo(
    () => [
      {
        label: "Adicionar inciso",
        onClick: addIncisoQuick,
      },
      {
        label: "Editar",
        onClick: () => {
          if (!hasIncisos) setEditClauseOpen(true);
          else setEditChoiceOpen(true);
        },
      },
      {
        label: "Excluir",
        danger: true,
        onClick: onDelete,
      },
    ],
    [hasIncisos, onDelete, block] // ok
  );

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold tracking-tight text-zinc-900">
            CLÁUSULA {block.clauseNo}
            {block.title ? ` – ${block.title}` : ""}
          </div>

        </div>

        <BlockMenu items={menuItems} />
      </div>

      {block.incisos?.length ? (
        <ol className="mt-4 space-y-2">
          {block.incisos.map((i, idx) => (
            <li key={i.id} className="flex gap-3 text-sm text-zinc-700">
              <span className="w-10 shrink-0 font-semibold">
                {block.clauseNo}.{idx + 1}
              </span>

              {/* ✅ agora renderiza HTML */}
              {isHtmlEmpty(i.html) ? (
                <span className="text-zinc-400">Inciso vazio</span>
              ) : (
                <div
                  className="prose prose-sm max-w-none text-zinc-700"
                  dangerouslySetInnerHTML={{ __html: i.html }}
                />
              )}
            </li>
          ))}
        </ol>
      ) : null}

      {/* Modais */}
      <EditChoiceModal
        open={editChoiceOpen}
        onClose={() => setEditChoiceOpen(false)}
        onEditClause={() => {
          setEditChoiceOpen(false);
          setEditClauseOpen(true);
        }}
        onEditIncisos={() => {
          setEditChoiceOpen(false);
          setEditIncisosOpen(true);
        }}
      />

      <EditClauseModal
        open={editClauseOpen}
        clauseNo={block.clauseNo}
        initialTitle={block.title}
        initialText={block.text}
        onClose={() => setEditClauseOpen(false)}
        onSave={({ title, text }) => {
          onUpdate({ ...block, title, text });
          setEditClauseOpen(false);
        }}
      />

      <EditIncisosModal
        open={editIncisosOpen}
        clauseNo={block.clauseNo}
        initialIncisos={block.incisos || []}
        onClose={() => setEditIncisosOpen(false)}
        onSave={(nextIncisos) => {
          onUpdate({ ...block, incisos: nextIncisos });
          setEditIncisosOpen(false);
        }}
      />
    </div>
  );
}
