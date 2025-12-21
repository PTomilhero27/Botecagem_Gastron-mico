import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

function mustEnv(name: string) {
    const v = process.env[name];
    if (!v) throw new Error(`Missing env: ${name}`);
    return v;
}

function slugifyFilename(s: string) {
    return (s || "")
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "_")
        .slice(0, 60);
}

// ⚠️ Mantendo exatamente como você pediu (ANON KEY).
// Isso SÓ vai funcionar se suas policies do Storage permitirem.
const supabase = createClient(
    mustEnv("NEXT_PUBLIC_SUPABASE_URL"),
    mustEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    { auth: { persistSession: false } }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    try {
        const vendor_id = String(req.body?.vendor_id || req.body?.vendorId || "").trim();
        const filename = String(req.body?.filename || "contrato.pdf").trim();

        if (!vendor_id) return res.status(400).json({ error: "vendor_id obrigatório" });

        const safe = slugifyFilename(filename || "contrato");
        const path = `contracts/${vendor_id}/${safe}.pdf`;

        const { data, error } = await supabase.storage
            .from("contracts") // bucket
            .createSignedUploadUrl(path);

        if (error) return res.status(500).json({ error: error.message });

        // ✅ formato que seu front espera
        return res.status(200).json({
            path,
            signedUrl: data.signedUrl,
            token: data.token,
        });
    } catch (e: any) {
        return res.status(500).json({ error: e?.message || "Erro interno" });
    }
}
