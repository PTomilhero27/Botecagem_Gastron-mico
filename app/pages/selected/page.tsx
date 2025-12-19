"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthGuard } from "@/app/lib/auth/useAuthGuard";
import { useRouter } from "next/navigation";

import { VendorStatus } from "@/app/lib/status";
import { Filters, FiltersState } from "@/app/pages/dashboard/components/Filters";
import { Stats } from "@/app/pages/dashboard/components/Stats";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";

import { SelectedTable } from "./components/SelectedTable";
import { fetchVendorsSelected } from "@/app/services";
import { mapRegistrySheetToVendor } from "@/app/services/mapper/mapVendedrsSelected";
import { VendorSelected } from "@/lib/types";
import { VendorDetailsModalSelected } from "./components/VendorDetailsModalSelected";

import { useContractPreview } from "@/app/lib/contractPreview/ContractPreviewContext";

export default function SelecionadosPage() {
  useAuthGuard({
    redirectTo: "/pages/login",
    toastMessage: "Sessão encerrada por segurança.",
  });

  const router = useRouter();
  const { setVendor } = useContractPreview();

  const [vendors, setVendors] = useState<VendorSelected[]>([]);
  const [selected, setSelected] = useState<VendorSelected | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [statusByKey, setStatusByKey] = useState<Record<string, VendorStatus | undefined>>({});

  const [filters, setFilters] = useState<FiltersState>({
    q: "",
    tipo: "",
    tenda: "",
    energia: "",
    gas: "",
    equip: "",
  });

  useEffect(() => {
    fetchVendorsSelected()
      .then((data) => setVendors(data.map(mapRegistrySheetToVendor)))
      .catch(console.error);
  }, []);


  const selecionados = vendors;

  /**
   * 🔹 Nome da marca (PF ou PJ)
   */
  function brandName(v: VendorSelected) {
    return v.person_type === "pf"
      ? v.pf_brand_name ?? ""
      : v.pj_brand_name ?? "";
  }

  /**
   * 🔹 Nome da pessoa / responsável
   */
  function displayName(v: VendorSelected) {
    return v.person_type === "pf"
      ? v.pf_full_name ?? ""
      : v.pj_legal_representative_name ?? "";
  }

  const filtered = useMemo(() => {
    const q = filters.q.toLowerCase();

    return selecionados.filter((v) => {
      const matchQ =
        !q ||
        [
          displayName(v),
          brandName(v),
          v.vendor_id,
          v.contact_phone,
          v.contact_email,
          v.address_city,
          v.address_state,
        ].some((x) => (x || "").toLowerCase().includes(q));

      return matchQ;
    });
  }, [filters, selecionados]);

  const total = selecionados.length;
  const totalFiltered = filtered.length;

  function openDetails(v: VendorSelected) {
    setSelected(v);
    setDetailsOpen(true);
  }

  function openStatus(v: VendorSelected) {
    openDetails(v);
  }

  function downloadContract(v: VendorSelected) {
    setVendor(v);
    router.push("/pages/selected/contract-preview");
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/pages/home" },
          { label: "Selecionados" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-extrabold tracking-tight text-zinc-900">
            Selecionados <span className="text-orange-500">Botecagem</span>
          </div>
          <div className="mt-1 text-sm text-zinc-600">
            {totalFiltered} de {total} registros
          </div>
        </div>

        <button
          onClick={() =>
            setFilters({
              q: "",
              tipo: "",
              tenda: "",
              energia: "",
              gas: "",
              equip: "",
            })
          }
          className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
        >
          Limpar filtros
        </button>
      </div>

      <Stats
        total={total}
        filtered={totalFiltered}
        tiposCount={0}
        topTiposHint="—"
        energiaSim={0}
        gasSim={0}
      />

      <Filters
        filters={filters}
        setFilters={setFilters}
        tipos={[]}
        tendas={[]}
      />

      <SelectedTable
        rows={filtered}
        statusByKey={statusByKey}
        onDownloadContract={downloadContract}
        onDetails={openDetails}
        onOpenStatus={openStatus}
      />

      <VendorDetailsModalSelected
        vendor={selected}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
    </main>
  );
}
