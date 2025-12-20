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


export const VendorSelectedSchema = z.object({
  // =========================
  // 1️⃣ IDENTIFICAÇÃO
  // =========================
  person_type: z.string(),

  // =========================
  // 2️⃣ PESSOA FÍSICA
  // =========================
  pf_full_name: z.string().optional(),
  pf_cpf: z.string().optional(),
  pf_brand_name: z.string().optional(),

  // =========================
  // 3️⃣ PESSOA JURÍDICA
  // =========================
  pj_cnpj: z.string().optional(),
  pj_legal_representative_name: z.string().optional(),
  pj_legal_representative_cpf: z.string().optional(),
  pj_state_registration: z.string().optional(),
  pj_brand_name: z.string().optional(),

  // =========================
  // 4️⃣ CONTATO
  // =========================
  contact_phone: z.string(),
  contact_email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Email inválido"),

  // =========================
  // 5️⃣ ENDEREÇO
  // =========================
  address_full: z.string(),
  address_zipcode: z.string(),
  address_city: z.string(),
  address_state: z.string(),

  // =========================
  // 6️⃣ DADOS FINANCEIROS
  // =========================
  bank_name: z.string().optional(),
  bank_agency: z.string().optional(),
  bank_account: z.string().optional(),

  pix_key: z.string(),
  pix_favored_name: z.string(),

  // =========================
  // 7️⃣ TERMOS / CONTROLE
  // =========================
  terms_accepted: z.string(),

  status: z.enum(["selecionado", "ativo", "inativo", "cancelado"]).default("selecionado"),
  source_form: z.enum(["google_forms", "admin", "api"]).default("google_forms"),
  form_submitted_at: z.string().optional(),
});

export const VendorSelectedListSchema = z.array(VendorSelectedSchema);
