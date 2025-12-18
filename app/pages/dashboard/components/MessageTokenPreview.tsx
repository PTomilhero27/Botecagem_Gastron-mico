"use client";

import { Vendor } from "@/lib/types";
import { renderMessagePreviewParts } from "../service/message/format";

export function MessageTokenPreview({ message, vendor }: { message: string; vendor: Vendor }) {
  const parts = renderMessagePreviewParts(message, vendor);

  return (
    <span className="text-sm text-zinc-800 whitespace-pre-wrap">
      {parts.map((p, i) => {
        if (p.type === "text") return <span key={i}>{p.value}</span>;

        if (p.type === "bad") {
          return (
            <span
              key={i}
              className="inline-flex items-center rounded-md px-1.5 py-0.5 font-mono text-sm bg-rose-50 text-rose-800 ring-1 ring-rose-200"
              title="Token inválido"
            >
              {p.value}
            </span>
          );
        }

        // ok
        return (
          <span
            key={i}
            className="inline-flex items-center rounded-md px-1.5 py-0.5 font-medium bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
            title="Valor do cadastro"
          >
            {p.value}
          </span>
        );
      })}
    </span>
  );
}
