import type { Vendor } from "@/lib/types";

export type VendorFromSheet = {
  source_key: string;
  submitted_at?: string;
  nome_fantasia: string;
  telefone: string;
  tipo_operacao: string;
  produto_principal: string;
  ticket_medio: string;
  ja_participou_eventos: string;
  redes_sociais: string;
  nome_responsavel: string;
  tipo_tenda: string;
  qtd_equipe: string;
  energia_eletrica: string;
  equipamentos: string; // vem como texto no CSV
  gas_glp: string;
  observacoes: string;
};

function toSimNao(v: string | undefined) {
  const s = (v ?? "").trim().toLowerCase();
  if (["sim", "s", "yes", "y", "true", "1"].includes(s)) return "Sim";
  if (["não", "nao", "n", "no", "false", "0"].includes(s)) return "Não";
  return v ? (v as any) : "—";
}

function parseEquipamentos(v: string | undefined): string[] {
  const s = (v ?? "").trim();
  if (!s) return [];
  // suporta "Chapa, Fritadeira" ou "Chapa; Fritadeira" ou "Chapa | Fritadeira"
  return s
    .split(/[,;|]/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

export function mapSheetToVendor(row: VendorFromSheet): Vendor {
  return {
    // campos do seu Vendor "completo"
    timestamp: row.submitted_at ?? "",
    nome_empresarial: "", // não existe na tabela pública
    nome_fantasia: row.nome_fantasia ?? "",
    cnpj: "", // não existe na tabela pública
    redes_sociais: row.redes_sociais ?? "",
    responsavel: row.nome_responsavel ?? "",
    telefone: row.telefone ?? "",
    tipo_operacao: row.tipo_operacao ?? "",
    produto_principal: row.produto_principal ?? "",
    ticket_medio: row.ticket_medio ?? "",
    ja_participou: row.ja_participou_eventos ?? "",
    tenda: row.tipo_tenda ?? "",
    equipe: row.qtd_equipe ?? "",
    energia: toSimNao(row.energia_eletrica),
    equipamentos: parseEquipamentos(row.equipamentos),
    gas: toSimNao(row.gas_glp),
    observacoes: row.observacoes ?? "",
  };
}
