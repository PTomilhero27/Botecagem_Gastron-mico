import { z } from "zod";

export const VendorPublicSchema = z.object({
  source_key: z.string().min(1),
  submitted_at: z.string().optional(), // ou z.coerce.date() se vier como data ok
  nome_fantasia: z.string().optional().default(""),
  telefone: z.string().optional().default(""),
  tipo_operacao: z.string().optional().default(""),
  produto_principal: z.string().optional().default(""),
  ticket_medio: z.string().optional().default(""),
  ja_participou_eventos: z.string().optional().default(""),
  redes_sociais: z.string().optional().default(""),
  nome_responsavel: z.string().optional().default(""),
  tipo_tenda: z.string().optional().default(""),
  qtd_equipe: z.string().optional().default(""),
  energia_eletrica: z.string().optional().default(""),
  equipamentos: z.string().optional().default(""),
  gas_glp: z.string().optional().default(""),
  observacoes: z.string().optional().default(""),
});

export const VendorPublicListSchema = z.array(VendorPublicSchema);
