import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

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
    const vendorId = String(req.body?.vendorId || "").trim();
    const cpfCnpj = String(req.body?.cpf_cnpj || vendorId || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();

    if (!vendorId) return res.status(400).json({ error: "vendorId obrigatório" });

    // 1) procura
    const { data: existing, error: findErr } = await supabase
      .from("contracts")
      .select("id,vendor_id,pdf_path,status,email")
      .eq("vendor_id", vendorId)
      .maybeSingle();

    if (findErr) throw findErr;

    if (existing?.id) {
      return res.status(200).json({ contract: existing, created: false });
    }

    // 2) cria
    const { data: created, error: insErr } = await supabase
      .from("contracts")
      .insert({
        vendor_id: vendorId,
        cpf_cnpj: cpfCnpj || vendorId,
        email: email || null,
        status: "aguardando_assinatura",
      })
      .select("id,vendor_id,pdf_path,status,email")
      .single();

    if (insErr) throw insErr;

    return res.status(200).json({ contract: created, created: true });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Erro interno" });
  }
}
