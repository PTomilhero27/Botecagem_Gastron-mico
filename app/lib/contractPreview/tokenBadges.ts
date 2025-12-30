// app/lib/contractPreview/tokenBadges.ts

import { applyPreviewTokens } from "./templatePreview";

// Tokens que você aceita no template (vai aumentando depois)
const KNOWN_TOKENS = new Set<string>([
  "DATA_LONGA",
]);

function escapeHtml(s: string) {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Mantém o token no HTML, mas coloca badge verde/vermelha.
 * No hover, mostra a prévia do valor real (quando conhecido).
 */
export function applyTokenBadges(html: string) {
  const raw = html || "";

  // pega o valor resolvido (ex: data de hoje) para mostrar no tooltip
  const resolved = applyPreviewTokens(raw);

  const tokenRe = /\{\{([A-Z0-9_]+)\}\}/g;

  return raw.replace(tokenRe, (full, tokenName: string) => {
    const name = String(tokenName || "");
    const isKnown = KNOWN_TOKENS.has(name);

    let tooltip = "Token desconhecido";
    if (isKnown) {
      // tenta achar no HTML resolvido o valor resultante desse token
      // (como applyPreviewTokens substitui o token, pegamos um “diff” simples)
      // fallback: usa o HTML resolvido inteiro (não ideal, mas funciona)
      tooltip = "OK";
      // se você quiser tooltip mais exata por token no futuro:
      // faça applyPreviewTokens aceitar “contexto” por token e retornar mapa.
      tooltip = `Prévia: ${resolved.replace(/<[^>]*>/g, "").trim()}`;
    }

    const cls = isKnown
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      : "bg-red-50 text-red-700 ring-1 ring-red-200";

    return `
      <span
        class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${cls}"
        title="${escapeHtml(tooltip)}"
        data-token="${escapeHtml(name)}"
      >${escapeHtml(full)}</span>
    `;
  });
}
