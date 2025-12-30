import { resolveToken } from "./templateTokens";

export function applyPreviewTokens(html: string) {
  if (!html) return "";

  return html.replace(/\{\{([A-Z_]+)\}\}/g, (_, tokenName) => {
    const result = resolveToken(tokenName);

    if (result.valid) {
      return `
        <span
          data-token="{{${tokenName}}}"
          title="${escapeHtmlAttr(result.value)}"
        >
          ${escapeHtml(result.value)}
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
  // para usar com segurança em title=""
  return escapeHtml(s).replaceAll("\n", " ");
}
