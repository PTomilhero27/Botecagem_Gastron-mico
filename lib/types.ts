export type Vendor = {
  timestamp: string;
  nome_empresarial: string;
  nome_fantasia: string;
  cnpj: string;
  redes_sociais: string;
  responsavel: string;
  telefone: string;
  tipo_operacao: string;
  produto_principal: string;
  ticket_medio: string;
  ja_participou: string;
  tenda: string;
  equipe: string;
  energia: "Sim" | "Não";
  equipamentos: string[];
  gas: "Sim" | "Não";
  observacoes: string;
};


export type VendorSelected = {
  // =========================
  // ID (derivado)
  // =========================
  vendor_id: string; // cpf ou cnpj (só números, ideal)
  status: string;
  // =========================
  // TIPO
  // =========================
  person_type: "pf" | "pj" ;

  // =========================
  // PF
  // =========================
  pf_full_name?: string;
  pf_cpf?: string;
  pf_brand_name?: string;

  // =========================
  // PJ
  // =========================
  pj_cnpj?: string;
  pj_legal_representative_name?: string;
  pj_legal_representative_cpf?: string;
  pj_state_registration?: string;
  pj_brand_name?: string;

  // =========================
  // CONTATO
  // =========================
  contact_phone: string;
  contact_email: string;

  // =========================
  // ENDEREÇO
  // =========================
  address_full: string;
  address_zipcode: string;
  address_city: string;
  address_state: string;

  // =========================
  // FINANCEIRO
  // =========================
  bank_name?: string;
  bank_agency?: string;
  bank_account?: string;
  pix_key: string;
  pix_favored_name: string;

  // =========================
  // TERMOS
  // =========================
  terms_accepted: string; // vem como texto do forms (pode virar boolean depois)
};
