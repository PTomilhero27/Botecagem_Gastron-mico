import { NextResponse } from "next/server";
import { fetchFromSheetsCsv } from "./http";
import { VendorPublicListSchema, VendorSelectedListSchema } from "./schema";
import { ensureContract, updateContractSigning } from "./settings";
// import { VendorFormsSchema } from "./schemaForms"; // se quiser o bruto

export async function fetchVendorsSelected() {
  const url = process.env.NEXT_PUBLIC_SHEETS_API_CSV_URL!;
  return fetchFromSheetsCsv(url, VendorSelectedListSchema);
}

export async function fetchVendorsInterested() {
  const url = process.env.NEXT_PUBLIC_SHEETS_CSV_URL!;
  return fetchFromSheetsCsv(url, VendorPublicListSchema); 
}


export async function createSignatureLink(params: {
  vendorId: string;
  name: string;
  email: string;
  brend: string
}) {

  const res = await fetch("/api/sign/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data?.error || "Falha ao gerar link de assinatura.");
  if (!data?.signUrl) throw new Error("A API não retornou signUrl.");

  return data as { signUrl: string };
}
