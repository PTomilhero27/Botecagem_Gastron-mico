
export type ContractRow = {
  id: string;
  vendor_id: string;
  cpf_cnpj: string | null;
  email: string | null;
  status: string | null;
  sign_provider: string | null;
  sign_request_id: string | null;
  sign_url: string | null;
  signed_pdf_url: string | null;
};