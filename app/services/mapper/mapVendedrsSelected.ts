import { VendorSelected } from "@/lib/types";

export type VendorRegistryFromSheet = {
  person_type: string;

  pf_full_name?: string;
  pf_cpf?: string;
  pf_brand_name?: string;

  pj_cnpj?: string;
  pj_legal_representative_name?: string;
  pj_legal_representative_cpf?: string;
  pj_state_registration?: string;
  pj_brand_name?: string;

  contact_phone?: string;
  contact_email?: string;

  address_full?: string;
  address_zipcode?: string;
  address_city?: string;
  address_state?: string;

  bank_name?: string;
  bank_agency?: string;
  bank_account?: string;

  pix_key?: string;
  pix_favored_name?: string;

  terms_accepted?: string;
  assinafy_document_id ?: string;
  signerId?: string;
};

function onlyNumbers(v?: string) {
  return (v ?? "").replace(/\D/g, "");
}

function normalizePersonType(raw?: string): "pf" | "pj" {
  const s = (raw ?? "").toUpperCase();
  if (s.includes("JUR") || s.includes("PJ")) return "pj";
  return "pf";
}

function getVendorId(row: {
  pf_cpf?: string;
  pj_cnpj?: string;
}): string {
  const cpf = onlyNumbers(row.pf_cpf);
  const cnpj = onlyNumbers(row.pj_cnpj);
  return cpf || cnpj; // se for PF usa CPF, senão CNPJ
}

export function mapRegistrySheetToVendor(
  row: VendorRegistryFromSheet
): VendorSelected {
  const person_type = normalizePersonType(row.person_type);
  
  const pf_cpf = onlyNumbers(row.pf_cpf);
  const pj_cnpj = onlyNumbers(row.pj_cnpj);

  const vendor_id = getVendorId({ pf_cpf, pj_cnpj });

  // telefones e pix por segurança como só números (pix pode ser email também,
  // mas no seu exemplo está vindo telefone, então normalizamos apenas se for número)
  const contact_phone = onlyNumbers(row.contact_phone);
  const pix_key_raw = (row.pix_key ?? "").trim();
  const pix_key =
    /\D/.test(pix_key_raw) && pix_key_raw.includes("@")
      ? pix_key_raw // email pix
      : onlyNumbers(pix_key_raw); // telefone/cpf/cnpj/aleatória numérica

  return {
    // =========================
    // ID / TIPO
    // =========================
    vendor_id,
    person_type,

    // =========================
    // PF
    // =========================
    pf_full_name: person_type === "pf" ? (row.pf_full_name ?? "").trim() : undefined,
    pf_cpf: person_type === "pf" ? pf_cpf : undefined,
    pf_brand_name: person_type === "pf" ? (row.pf_brand_name ?? "").trim() : undefined,

    // =========================
    // PJ
    // =========================
    pj_cnpj: person_type === "pj" ? pj_cnpj : undefined,
    pj_legal_representative_name:
      person_type === "pj" ? (row.pj_legal_representative_name ?? "").trim() : undefined,
    pj_legal_representative_cpf:
      person_type === "pj" ? onlyNumbers(row.pj_legal_representative_cpf) : undefined,
    pj_state_registration:
      person_type === "pj" ? (row.pj_state_registration ?? "").trim() : undefined,
    pj_brand_name: person_type === "pj" ? (row.pj_brand_name ?? "").trim() : undefined,

    // =========================
    // CONTATO
    // =========================
    contact_phone: contact_phone,
    contact_email: (row.contact_email ?? "").trim(),

    // =========================
    // ENDEREÇO
    // =========================
    address_full: (row.address_full ?? "").trim(),
    address_zipcode: onlyNumbers(row.address_zipcode),
    address_city: (row.address_city ?? "").trim(),
    address_state: (row.address_state ?? "").trim(),

    // =========================
    // FINANCEIRO
    // =========================
    bank_name: (row.bank_name ?? "").trim() || undefined,
    bank_agency: onlyNumbers(row.bank_agency) || undefined,
    bank_account: (row.bank_account ?? "").trim() || undefined,

    pix_key,
    pix_favored_name: (row.pix_favored_name ?? "").trim(),

    // =========================
    // TERMOS / INTERNOS
    // =========================
    terms_accepted: (row.terms_accepted ?? "").trim(),
    status: "selecionado",

    assinafy_document_id: row.assinafy_document_id ?? "",
    signerId: row.signerId ?? ""

  };
}
