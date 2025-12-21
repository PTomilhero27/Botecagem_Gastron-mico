// pages/api/contracts/create-document.ts
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

type ContractRow = {
  id: string;
  vendor_id: string;
  status: string | null;
  sign_url: string | null;
  pdf_path: string | null;
  assinafy_document_id: string
  signer_id: string;
};

async function assinafyCreateSigner(params: {
  name: string;
  email: string;
  contractId: string;
}) {
  const ASSINAFY_API_URL = mustEnv("ASSINAFY_API_URL").replace(/\/$/, "");
  const ASSINAFY_API_KEY = mustEnv("ASSINAFY_API_KEY");
  const ASSINAFY_ACCOUNT_ID = mustEnv("ASSINAFY_ACCOUNT_ID");

  const res = await fetch(
    `${ASSINAFY_API_URL}/accounts/${ASSINAFY_ACCOUNT_ID}/signers`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ASSINAFY_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        full_name: params.name,
        email: params.email,
      }),
    }
  );

  const text = await res.text();
  let data: any = {};
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    throw new Error(
      data?.message || data?.error || `Assinafy error (${res.status})`
    );
  }

  // ⚠️ sua API parece variar entre data.id e data.data[0].id
  const signerId = data?.id ?? data?.data?.[0]?.id ?? data?.data?.id;
  if (!signerId) throw new Error("Assinafy não retornou signer id.");

  // salva signer_id no contrato (se existir coluna signer_id)
  await supabase
    .from("contracts")
    .update({ signer_id: String(signerId) })
    .eq("id", params.contractId);

  return { signerId: String(signerId), raw: data };
}

async function assinafyFindSignerByEmail(params: {
  email: string;
  contractId: string;
}) {
  const ASSINAFY_API_URL = mustEnv("ASSINAFY_API_URL").replace(/\/$/, "");
  const ASSINAFY_API_KEY = mustEnv("ASSINAFY_API_KEY");
  const ASSINAFY_ACCOUNT_ID = mustEnv("ASSINAFY_ACCOUNT_ID");

  const url = `${ASSINAFY_API_URL}/accounts/${ASSINAFY_ACCOUNT_ID}/signers?email=${encodeURIComponent(
    params.email.trim()
  )}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${ASSINAFY_API_KEY}`,
      Accept: "application/json",
    },
  });

  const text = await res.text();
  let data: any = {};
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    throw new Error(
      data?.message || data?.error || `Assinafy list signers error (${res.status})`
    );
  }

  const list = Array.isArray(data) ? data : data.items || data.data || [];
  const found = list.find(
    (s: any) =>
      String(s?.email || "").toLowerCase() === params.email.toLowerCase()
  );

  if (!found?.id) return null;

  await supabase
    .from("contracts")
    .update({ signer_id: String(found.id) })
    .eq("id", params.contractId);

  return { signerId: String(found.id), raw: found };
}

async function assinafyGetOrCreateSigner(params: {
  name: string;
  email: string;
  contractId: string;
}) {
  try {
    const created = await assinafyCreateSigner(params);
    return { signerId: created.signerId, created: true };
  } catch (e: any) {
    const msg = String(e?.message || "");
    if (msg.toLowerCase().includes("já existe") || msg.toLowerCase().includes("already")) {
      const found = await assinafyFindSignerByEmail({
        email: params.email,
        contractId: params.contractId,
      });
      if (found?.signerId) return { signerId: found.signerId, created: false };
    }
    throw e;
  }
}


async function getSignedPdfUrlFromStorage(pdfPath: string) {
  // pdfPath tem que ser o caminho dentro do bucket (ex: contracts/4090.../arquivo.pdf)


  const { data, error } = await supabase.storage
    .from("contracts")
    .createSignedUrl(pdfPath, 60 * 5);




  if (error) throw new Error(error.message);
  if (!data?.signedUrl) throw new Error("Não consegui gerar signedUrl do PDF.");

  return data.signedUrl;
}

async function fetchPdfAsBuffer(pdfUrl: string) {
  const pdfRes = await fetch(pdfUrl);
  if (!pdfRes.ok) throw new Error("Não consegui baixar o PDF do Storage.");

  const ab = await pdfRes.arrayBuffer();
  return Buffer.from(ab);
}

// ✅ cria documento na Assinafy via form-data (file)
async function assinafyCreateDocumentFromPdf(params: {
  title: string;
  pdfBuffer: any;
  filename?: string;
}) {
  const ASSINAFY_API_URL = mustEnv("ASSINAFY_API_URL").replace(/\/$/, "");
  const ASSINAFY_API_KEY = mustEnv("ASSINAFY_API_KEY");
  const ASSINAFY_ACCOUNT_ID = mustEnv("ASSINAFY_ACCOUNT_ID");

  // ✅ FormData nativo (Node/Next) + Blob
  const fd = new FormData();
  const blob = new Blob([params.pdfBuffer], { type: "application/pdf" });
  fd.append("file", blob, params.filename || `${params.title}.pdf`);

  const res = await fetch(`${ASSINAFY_API_URL}/accounts/${ASSINAFY_ACCOUNT_ID}/documents`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ASSINAFY_API_KEY}`,
      Accept: "application/json",
    },
    body: fd,
  });

  const text = await res.text();
  let data: any = {};
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  if (!res.ok) {
    throw new Error(data?.message || data?.error || `Erro ao criar documento (${res.status})`);
  }

  // ✅ ajuste conforme retorno real da Assinafy
  const documentId = data?.id ?? data?.data?.id ?? data?.data?.[0]?.id;
  if (!documentId) throw new Error("Assinafy não retornou document id.");

  return { documentId: String(documentId), raw: data };
}

async function assinafyWaitDocumentReady(documentId: string, timeoutMs = 60000) {
  const ASSINAFY_API_URL = mustEnv("ASSINAFY_API_URL").replace(/\/$/, "");
  const ASSINAFY_API_KEY = mustEnv("ASSINAFY_API_KEY");

  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const res = await fetch(`${ASSINAFY_API_URL}/documents/${documentId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${ASSINAFY_API_KEY}`,
        Accept: "application/json",
      },
    });

    const payload = await res.json().catch(() => ({}));

    // ✅ status REAL do documento (conforme seu console.log)
    const docStatus =
      payload?.data?.status ??
      payload?.status ?? // fallback (caso a API mude)
      payload?.document?.status ??
      null;

    // Enquanto estiver processando, espera.
    if (docStatus && docStatus !== "metadata_processing") {
      return docStatus;
    }

    await new Promise((r) => setTimeout(r, 1000));
  }

  throw new Error("Timeout aguardando documento sair de metadata_processing");
}



async function assinafyCreateAssignmentVirtual(params: {
  documentId: string;
  signerId: string;
  expirationISO?: string;
}) {
  const ASSINAFY_API_URL = mustEnv("ASSINAFY_API_URL").replace(/\/$/, "");
  const ASSINAFY_API_KEY = mustEnv("ASSINAFY_API_KEY");

  const res = await fetch(
    `${ASSINAFY_API_URL}/documents/${params.documentId}/assignments`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ASSINAFY_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        signerIds: [params.signerId],
        method: "virtual",
        expiration: params.expirationISO ?? undefined,
      }),
    }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || "Erro ao criar assignment na Assinafy.");
  }

  // ✅ O LINK É DERIVADO DO DOCUMENT ID
  const signUrl = `https://app.assinafy.com.br/sign/${params.documentId}`;

  return {
    signUrl,
    assignmentId: data?.id ?? null,
    raw: data,
  };
}

function normalizeKey(s: string) {
  return (s || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 60);
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const vendorId = String(req.body?.vendorId || "").trim();
    const nameRaw = String(req.body?.name || "").trim();
    const emailRaw = String(req.body?.email || "").trim();

    const name = nameRaw || "Expositor";
    const email = emailRaw.trim();


    // 1) busca contrato (agora também precisa do pdf_path)
    const { data: existing, error: findErr } = await supabase
      .from("contracts")
      .select("id,vendor_id,status,sign_url,pdf_path,assinafy_document_id,signer_id")
      .eq("vendor_id", vendorId)
      .maybeSingle<ContractRow>();



    let documentId = existing?.assinafy_document_id || null;
    let signer = existing?.signer_id || null;


    if (findErr) throw findErr;

    // 2) se já tem link e não está assinado, reaproveita
    if (existing?.sign_url && existing.status !== "assinado") {
      return res.status(200).json({ signUrl: existing.sign_url, reused: true });
    }

    // 3) cria contrato se não existir (mas atenção: para assinar precisa ter pdf_path depois)
    let contractId = existing?.id as string | undefined;

    if (!contractId) {
      const { data: created, error: insErr } = await supabase
        .from("contracts")
        .insert({
          vendor_id: vendorId,
          cpf_cnpj: vendorId,
          email,
          status: "aguardando_assinatura",
          sign_provider: "assinafy",
        })
        .select("id,vendor_id,status,sign_url,pdf_path")
        .single<ContractRow>();

      if (insErr) throw insErr;

      contractId = created.id;
      // passa a usar o created como "existing"
    }

    if (!documentId) {
      if (!vendorId) return res.status(400).json({ error: "vendorId obrigatório" });
      if (!email) return res.status(400).json({ error: "email obrigatório" });


      // 4) precisamos do pdf_path pra criar documento
      const pdfPath =
        existing?.pdf_path ??
        (
          await supabase
            .from("contracts")
            .select("pdf_path")
            .eq("id", contractId!)
            .single()
        ).data?.pdf_path;

      if (!pdfPath) {
        // sem PDF ainda, não dá pra criar doc na Assinafy
        return res.status(400).json({
          error: "pdf_path ainda está vazio. Gere e envie o PDF para o Storage antes de criar o documento na Assinafy.",
        });
      }

      // 5) signer
      const { signerId } = await assinafyGetOrCreateSigner({ name, email, contractId: contractId! });


      signer = signerId

      // 6) pega URL assinada do PDF e baixa como buffer
      const signedPdfUrl = await getSignedPdfUrlFromStorage(pdfPath);



      const pdfBuffer = await fetchPdfAsBuffer(signedPdfUrl);


      const safeName = normalizeKey(name || "Expositor");
      const safeBrand = normalizeKey(req.body.brend);
      const filename = `Contrato_${vendorId}_${safeBrand}_${safeName}.pdf`;

      const created = await assinafyCreateDocumentFromPdf({
        title: `Contrato_${vendorId}`,
        pdfBuffer,
        filename,
      });

      documentId = created.documentId;



      // 🔒 salva o ID para nunca duplicar
      const { error } = await supabase
        .from("contracts")
        .update({
          assinafy_document_id: documentId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", contractId!);

      if (error) throw error;


    }


    await assinafyWaitDocumentReady(documentId);


    const { signUrl } = await assinafyCreateAssignmentVirtual({
      documentId,
      signerId: signer || "",
      expirationISO: "2026-12-31",
    });

    // 9) salva no banco (ajuste os campos conforme seu schema)
    const { error: updErr } = await supabase
      .from("contracts")
      .update({
        sign_url: signUrl,
        status: "aguardando_assinatura",
        updated_at: new Date().toISOString(),
        // ✅ se você criar essa coluna, descomente:
        // assinafy_document_id: documentId,
      })
      .eq("id", contractId!);

    if (updErr) throw updErr;

    return res.status(200).json({ signUrl, documentId, signerId: signer, contractId });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Erro interno" });
  }
}
