import { supabase } from "@/app/lib/supabase/client";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { vendorId: string } }
) {
  try {
    const vendorId = (params.vendorId ?? "").trim();
    if (!vendorId) {
      return NextResponse.json({ error: "vendorId obrigatório" }, { status: 400 });
    }

    // 1) pega refs no vendor_status
    const { data: vs, error: vsErr } = await supabase
      .from("vendor_status")
      .select("vendor_id, merchant_id, equipment_profile_id")
      .eq("vendor_id", vendorId)
      .maybeSingle();

    if (vsErr) throw vsErr;

    if (!vs?.merchant_id) {
      return NextResponse.json(
        { error: "Cadastro ainda não foi enviado." },
        { status: 404 }
      );
    }

    const merchantId = vs.merchant_id as string;
    const equipmentProfileId = (vs.equipment_profile_id as string | null) ?? null;

    // 2) merchant
    const { data: merchant, error: mErr } = await supabase
      .from("merchants")
      .select(
        `
        id,
        pdv_name,
        person_type,
        cpf_cnpj,
        full_name,
        email,
        phone,
        address_full,
        address_city,
        address_state,
        address_zipcode,
        bank_name,
        bank_agency,
        bank_account,
        bank_account_type,
        bank_holder_doc,
        bank_holder_name,
        pix_key,
        machines_qty,
        created_at
      `
      )
      .eq("id", merchantId)
      .single();

    if (mErr) throw mErr;

    // 3) menu (categorias + produtos)
    const { data: cats, error: cErr } = await supabase
      .from("menu_categories")
      .select("id, name, position")
      .eq("merchant_id", merchantId)
      .eq("is_active", true)
      .order("position", { ascending: true });

    if (cErr) throw cErr;

    const catIds = (cats ?? []).map((c) => c.id);
    let products: any[] = [];

    if (catIds.length > 0) {
      const { data: prods, error: pErr } = await supabase
        .from("menu_products")
        .select("id, category_id, name, price_cents, position")
        .eq("merchant_id", merchantId)
        .eq("is_active", true)
        .in("category_id", catIds)
        .order("position", { ascending: true });

      if (pErr) throw pErr;
      products = prods ?? [];
    }

    const menu = (cats ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      position: c.position,
      products: products
        .filter((p) => p.category_id === c.id)
        .map((p) => ({
          id: p.id,
          name: p.name,
          price: (p.price_cents ?? 0) / 100,
          position: p.position,
        })),
    }));

    // 4) equipment
    let equipment: any = null;

    if (equipmentProfileId) {
      const { data: profile, error: epErr } = await supabase
        .from("equipment_profiles")
        .select(
          "id, outlets110, outlets220, other_outlets_qty, other_outlets_label, notes, created_at"
        )
        .eq("id", equipmentProfileId)
        .single();

      if (epErr) throw epErr;

      const { data: items, error: eiErr } = await supabase
        .from("equipment_items")
        .select("id, name, qty, position")
        .eq("equipment_profile_id", equipmentProfileId)
        .order("position", { ascending: true });

      if (eiErr) throw eiErr;

      equipment = { profile, items: items ?? [] };
    }

    return NextResponse.json({
      vendor_id: vendorId,
      merchant,
      menu,
      equipment,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message ?? "Erro desconhecido" },
      { status: 500 }
    );
  }
}
