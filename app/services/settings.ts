// app/services/settings.ts
import { supabase } from "@/app/lib/supabase/client";

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
