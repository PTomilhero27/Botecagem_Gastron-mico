import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { updateVendorStatus } from "@/app/services/settings";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

const supabase = createClient(
  mustEnv("NEXT_PUBLIC_SUPABASE_URL"),
  mustEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  { auth: { persistSession: false } }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const payload = req.body;

    const event = String(payload?.event || "").toLowerCase();
    if (event !== "document_ready") {
      return res.status(200).json({ ok: true, ignored: true, event });
    }

    // ✅ O document_id vem em object.id (type Document)
    const assinafyDocumentId = String(payload?.object?.id || "").trim();
    if (!assinafyDocumentId) {
      return res.status(200).json({ ok: true, updated: false, reason: "missing_object_id" });
    }

    // 1) acha contrato pelo document_id
    const { data: contract, error: findErr } = await supabase
      .from("contracts")
      .select("id,vendor_id,assinafy_document_id,status")
      .eq("assinafy_document_id", assinafyDocumentId)
      .maybeSingle();

    if (findErr) throw findErr;

    if (!contract?.id) {
      // não retorna 400 pra não ficar retentando
      return res.status(200).json({
        ok: true,
        updated: false,
        reason: "contract_not_found",
        assinafyDocumentId,
      });
    }

    const update = await updateVendorStatus(contract.vendor_id, "aguardando_pagamento");



    return res.status(200).json({
      ok: true,
      updated: true,
      assinafyDocumentId,
      contractId: contract.id,
      vendorId: contract.vendor_id,
      vendorStatusRow: update ?? null,
    });
  } catch (e: any) {
    console.error("WEBHOOK ERROR:", e);
    return res.status(500).json({ error: e?.message || "Erro interno" });
  }
}