// app/services/settings.ts
import { supabase } from "@/app/lib/supabase/client";
import { VendorStatus } from "../lib/status";
import { ContractRow } from "../types/_db";
import { NextApiRequest, NextApiResponse } from "next";
import { mustEnv } from "./http";

export async function getWhatsappTemplate() {
  const { data, error } = await supabase
    .from("app_settings")
    .select("value, updated_by, updated_at")
    .eq("key", "whatsapp_template")
    .single();

  if (error) throw error;
  return data;
}

export async function saveWhatsappTemplate(value: string) {
  const { data, error } = await supabase
    .from("app_settings")
    .upsert({ key: "whatsapp_template", value }, { onConflict: "key" })
    .select("value, updated_by, updated_at")
    .single();

  if (error) throw error;
  return data;
}

export async function fetchExistingVendorIds() {
  // pega só vendor_id (de toda a tabela)
  const { data, error } = await supabase
    .from("vendor_status")
    .select("vendor_id");

  if (error) throw error;
  return (data ?? []).map(r => r.vendor_id);
}


export async function insertNewVendorIds(newIds: string[]) {
  if (newIds.length === 0) return { inserted: 0 };

  const rows = newIds.map(vendor_id => ({
    vendor_id,
    status: "aguardando_assinatura" as VendorStatus,
  }));

  const { error } = await supabase
    .from("vendor_status")
    .upsert(rows, { onConflict: "vendor_id", ignoreDuplicates: true });

  if (error) throw error;

  return { inserted: newIds.length };
}


function uniqueStrings(arr: string[]) {
  return Array.from(new Set(arr.map(s => s.trim()).filter(Boolean)));
}

export async function syncVendorsFromSheetIds(sheetVendorIds: string[]) {
  const sheetIds = uniqueStrings(sheetVendorIds);

  const existingIds = await fetchExistingVendorIds();
  const existingSet = new Set(existingIds);

  const newIds = sheetIds.filter(id => !existingSet.has(id));

  const { inserted } = await insertNewVendorIds(newIds);

  return {
    total_sheet: sheetIds.length,
    existing_supabase: existingIds.length,
    inserted,
    skipped: sheetIds.length - inserted,
  };
}

export type VendorStatusRow = { vendor_id: string; status: VendorStatus };

function chunk<T>(arr: T[], size = 800) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function fetchStatusesByVendorIds(vendorIds: string[]) {
  const ids = Array.from(new Set(vendorIds.map(v => (v ?? "").trim()).filter(Boolean)));
  if (ids.length === 0) return [];

  const all: VendorStatusRow[] = [];

  // .in() tem limite prático, então chunk
  for (const part of chunk(ids, 800)) {
    const { data, error } = await supabase
      .from("vendor_status")
      .select("vendor_id,status")
      .in("vendor_id", part);

    if (error) throw error;
    all.push(...((data ?? []) as VendorStatusRow[]));
  }

  return all;
}

export async function updateVendorStatus(vendorId: string, status: VendorStatus) {
  const { data, error } = await supabase
    .from("vendor_status")
    .update({ status })
    .eq("vendor_id", vendorId);

  if (error) throw error;

  return data
}

// 1) buscar contrato por vendor_id
export async function fetchContractByVendorId(vendorId: string) {
  const { data, error } = await supabase
    .from("contracts")
    .select("id,vendor_id,cpf_cnpj,email,status,sign_provider,sign_request_id,sign_url,signed_pdf_url")
    .eq("vendor_id", vendorId)
    .maybeSingle();

  if (error) throw error;
  return data as ContractRow | null;
}

// 2) criar contrato (uuid é gerado pelo banco)
export async function createContract(params: {
  vendorId: string;
  cpfCnpj?: string | null;
  email?: string | null;
  status?: string;
  signProvider?: string;
}) {
  const {
    vendorId,
    cpfCnpj = vendorId,
    email = null,
    status = "aguardando_assinatura",
    signProvider = "assinafy",
  } = params;

  const { data, error } = await supabase
    .from("contracts")
    .insert({
      vendor_id: vendorId,
      cpf_cnpj: cpfCnpj,
      email,
      status,
      sign_provider: signProvider,
    })
    .select("id,vendor_id,cpf_cnpj,email,status,sign_provider,sign_request_id,sign_url,signed_pdf_url")
    .single();

  if (error) throw error;
  return data as ContractRow;
}

// 3) salvar retorno da assinatura (link/id)
export async function updateContractSigning(params: {
  contractId: string;
  signUrl: string;
  signRequestId?: string | null;
  status?: string;
}) {
  const { contractId, signUrl, signRequestId = null, status = "aguardando_assinatura" } = params;

  const { data, error } = await supabase
    .from("contracts")
    .update({
      sign_url: signUrl,
      sign_request_id: signRequestId,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", contractId)
    .select("id,vendor_id,cpf_cnpj,email,status,sign_provider,sign_request_id,sign_url,signed_pdf_url")
    .single();

  if (error) throw error;
  return data as ContractRow;
}

// 4) helper: garante contrato (acha ou cria)
export async function ensureContract(params: { vendorId: string; email?: string | null }) {
  const { vendorId, email = null } = params;

  const existing = await fetchContractByVendorId(vendorId);
  if (existing) return existing;

  return createContract({ vendorId, email });
}
