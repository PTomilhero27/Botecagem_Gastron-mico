import { Vendor } from "@/lib/types";

const tokenMap: Record<string, (v: Vendor) => string> = {
  nome_fantasia: (v) => v.nome_fantasia ?? "",
  nome_responsavel: (v) => (v as any).nome_responsavel ?? v.responsavel ?? "",
  telefone: (v) => v.telefone ?? "",
  tipo_operacao: (v) => v.tipo_operacao ?? "",
  produto_principal: (v) => v.produto_principal ?? "",
  ticket_medio: (v) => v.ticket_medio ?? "",
  tenda: (v) => v.tenda ?? "",
  energia: (v) => v.energia ?? "",
  gas: (v) => v.gas ?? "",
};

export function renderMessage(template: string, vendor: Vendor) {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => {
    const fn = tokenMap[key];
    const value = fn ? fn(vendor) : `{${key}}`; // mantém se não existir
    return String(value ?? "");
  });
}
