import { Vendor } from "@/lib/types";
import { ALLOWED_TOKEN_SET, extractTokens } from "./tokens";

export function resolveTokenValue(vendor: Vendor, key: string): string | null {
  // mapeia token -> campo do Vendor
  const map: Record<string, keyof Vendor> = {
    nome_fantasia: "nome_fantasia",
    nome_responsavel: "responsavel", // ajuste se no seu Vendor for outro nome
    telefone: "telefone",
    tipo_operacao: "tipo_operacao",
    produto_principal: "produto_principal",
    ticket_medio: "ticket_medio",
    tenda: "tenda",
    energia: "energia",
    gas: "gas",
  };

  const field = map[key];
  if (!field) return null;

  const val = vendor[field];
  if (val == null) return "";
  if (Array.isArray(val)) return val.join(", ");
  return String(val);
}

export function renderMessagePreviewParts(message: string, vendor: Vendor) {
  const tokens = extractTokens(message);
  const parts: { type: "text" | "ok" | "bad"; value: string }[] = [];

  let cursor = 0;

  tokens.forEach((t) => {
    if (cursor < t.start) {
      parts.push({ type: "text", value: message.slice(cursor, t.start) });
    }

    const ok = ALLOWED_TOKEN_SET.has(t.key);
    if (!ok) {
      parts.push({ type: "bad", value: t.raw });
    } else {
      const v = resolveTokenValue(vendor, t.key);
      if (v === null) parts.push({ type: "bad", value: t.raw }); // token permitido mas sem mapping
      else parts.push({ type: "ok", value: v });
    }

    cursor = t.end;
  });

  if (cursor < message.length) {
    parts.push({ type: "text", value: message.slice(cursor) });
  }

  return parts;
}
