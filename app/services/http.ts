import ky from "ky";
import Papa from "papaparse";
import { VendorPublicListSchema } from "./schema";
import { supabase } from "../lib/supabase/client";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseRest = ky.create({
  prefixUrl: `${SUPABASE_URL}/rest/v1/`,
  timeout: 180000,
  hooks: {
    beforeRequest: [
      async (request) => {
        // apikey sempre vai
        request.headers.set("apikey", ANON_KEY);

        // se tiver usuário logado, pega o JWT dele
        const { data } = await supabase.auth.getSession();
        const accessToken = data.session?.access_token;

        // Authorization: user token (se tiver), senão anon
        request.headers.set("Authorization", `Bearer ${accessToken ?? ANON_KEY}`);

        // opcional, mas geralmente útil no REST do supabase:
        request.headers.set("Content-Type", "application/json");
        request.headers.set("Accept", "application/json");
      },
    ],
  },
});

export async function fetchVendorsFromSheets() {
  const url = process.env.NEXT_PUBLIC_SHEETS_CSV_URL!;


  const csv = await ky.get(url, { cache: "no-store" }).text();


  const parsed = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
  });

  return VendorPublicListSchema.parse(parsed.data);
}