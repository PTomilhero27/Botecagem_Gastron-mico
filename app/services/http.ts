import ky from "ky";
import Papa from "papaparse";
import { supabase } from "../lib/supabase/client";
import { ZodSchema } from "zod";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseRest = ky.create({
  prefixUrl: `${SUPABASE_URL}/rest/v1/`,
  timeout: 180000,
  hooks: {
    beforeRequest: [
      async (request, options) => {
        request.headers.set("apikey", ANON_KEY);

        const { data } = await supabase.auth.getSession();
        const accessToken = data.session?.access_token;

        request.headers.set("Authorization", `Bearer ${accessToken ?? ANON_KEY}`);
        request.headers.set("Content-Type", "application/json");
        request.headers.set("Accept", "application/json");
      },
    ],
  },
});



export async function fetchFromSheetsCsv<T>(
  url: string,
  schema: ZodSchema<T>
): Promise<T> {
  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Erro ao buscar CSV");
  }

  const csv = await res.text();

  const parsed = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
  });

  return schema.parse(parsed.data);
}
