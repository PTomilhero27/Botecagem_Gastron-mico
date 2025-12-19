import { fetchFromSheetsCsv } from "./http";
import { VendorPublicListSchema, VendorSelectedListSchema } from "./schema";
// import { VendorFormsSchema } from "./schemaForms"; // se quiser o bruto

export async function fetchVendorsSelected() {
  const url = process.env.NEXT_PUBLIC_SHEETS_API_CSV_URL!;
  console.log(url)
  return fetchFromSheetsCsv(url, VendorSelectedListSchema);
}

export async function fetchVendorsInterested() {
  const url = process.env.NEXT_PUBLIC_SHEETS_CSV_URL!;
  return fetchFromSheetsCsv(url, VendorPublicListSchema); 
}
