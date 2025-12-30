import { resolveToken } from "./templateTokens";

/**
 * PREVIEW: troca {{TOKEN}} pelo valor final.
 */
export function renderForPreview(html: string) {
  if (!html) return "";

  return html.replace(/\{\{([A-Z_]+)\}\}/g, (_, tokenName) => {
    const r = resolveToken(tokenName);
    // no preview: sempre vira o valor (se inválido, mantém o texto do token)
    return r.valid ? escapeHtml(r.value) : `{{${tokenName}}}`;
  });
}

/**
 * BLOCO/EDITOR (visualização na lista): mantém {{TOKEN}}
 * e envolve com badge verde/vermelho + tooltip do valor.
 */
export function renderForBlock(html: string) {
  if (!html) return "";

  return html.replace(/\{\{([A-Z_]+)\}\}/g, (_, tokenName) => {
    const r = resolveToken(tokenName);

    if (r.valid) {
      return `
        <span class="token-valid" title="${escapeHtmlAttr(r.value)}">
          {{${tokenName}}}
        </span>
      `;
    }

    return `
      <span class="token-invalid" title="Token desconhecido: {{${tokenName}}}">
        {{${tokenName}}}
      </span>
    `;
  });
}

function escapeHtml(s: string) {
  return (s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeHtmlAttr(s: string) {
  return escapeHtml(s).replaceAll("\n", " ");
}
