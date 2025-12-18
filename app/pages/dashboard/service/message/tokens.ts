export const TOKENS = [
  { label: "Nome fantasia", value: "{nome_fantasia}" },
  { label: "Nome responsável", value: "{nome_responsavel}" },
  { label: "Telefone", value: "{telefone}" },
  { label: "Tipo operação", value: "{tipo_operacao}" },
  { label: "Produto principal", value: "{produto_principal}" },
  { label: "Ticket médio", value: "{ticket_medio}" },
  { label: "Tenda", value: "{tenda}" },
  { label: "Energia", value: "{energia}" },
  { label: "Gás", value: "{gas}" },
] as const;

export const ALLOWED_TOKEN_SET = new Set(
  TOKENS.map((t) => t.value.replace(/[{}]/g, "")) // nome_fantasia, telefone, etc
);

export function extractTokens(message: string) {
  // pega {qualquer_coisa} incluindo underline
  const re = /\{([a-zA-Z0-9_]+)\}/g;
  const out: { raw: string; key: string; start: number; end: number }[] = [];
  let m: RegExpExecArray | null;

  while ((m = re.exec(message)) !== null) {
    out.push({
      raw: m[0],
      key: m[1],
      start: m.index,
      end: m.index + m[0].length,
    });
  }
  return out;
}
