"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthGuard } from "@/app/lib/auth/useAuthGuard";
import { useRouter } from "next/navigation";

import {
  STATUS_LABEL,
  STATUS_OPTIONS,
  STATUS_VALUE_BY_LABEL,
  VendorStatus,
} from "@/app/lib/status";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";

import { SelectedTable } from "./components/SelectedTable";
import { fetchVendorsSelected } from "@/app/services";
import { mapRegistrySheetToVendor } from "@/app/services/mapper/mapVendedrsSelected";
import { VendorSelected } from "@/lib/types";
import { VendorDetailsModalSelected } from "./components/VendorDetailsModalSelected";

import { useContractPreview } from "@/app/lib/contractPreview/ContractPreviewContext";
import {
  fetchStatusesByVendorIds,
  syncVendorsFromSheetIds,
  updateVendorStatus,
} from "@/app/services/settings";
import { VendorStatusModal } from "./components/VendorStatusModal";
import { Filters, FiltersState } from "./components/Filters";
import { SearchOverlaySelected } from "./components/SearchOverlaySelected";

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

  const [statusByKey, setStatusByKey] = useState<
    Record<string, VendorStatus | undefined>
  >({});
  const [statusOpen, setStatusOpen] = useState(false);

  const [filters, setFilters] = useState<FiltersState>({
    status: "",
  });

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");


  // ✅ opções do select em "label bonito"
  const statusOptionsLabels = useMemo(() => {
    return STATUS_OPTIONS.map((s) => STATUS_LABEL[s]);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchVendorsSelected();
        const mapped = data.map(mapRegistrySheetToVendor);

        const sheetIds = mapped.map((v) => v.vendor_id).filter(Boolean);

        const result = await syncVendorsFromSheetIds(sheetIds);
        console.log("SYNC RESULT:", result);

        const statusRows = await fetchStatusesByVendorIds(sheetIds);

        const map: Record<string, VendorStatus> = {};
        for (const row of statusRows) map[row.vendor_id] = row.status;

        setStatusByKey(map);
        setVendors(mapped);
      } catch (e) {
        console.error(e);
      }
    }

    load();
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // se estiver digitando em input/textarea, não abre
      const el = e.target as HTMLElement | null;
      const isTyping =
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.getAttribute("contenteditable") === "true");

      if (isTyping) return;

      if (e.key === "/") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filteredBySearch = useMemo(() => {
    const q = searchValue.trim();
    if (!q) return vendors;

    const qText = q
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");

    const qDigits = q.replace(/\D/g, "");

    return vendors.filter((v) => {
      const name =
        v.pf_brand_name ||
        v.pj_brand_name ||
        v.pf_full_name ||
        v.pj_legal_representative_name ||
        "";

      const cpf = v.pf_cpf || v.pj_legal_representative_cpf || "";
      const cnpj = v.pj_cnpj || "";
      const phone = v.contact_phone || "";

      const hayText = [name, cpf, cnpj, phone]
        .join(" ")
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");

      const hayDigits = [cpf, cnpj, phone].join(" ").replace(/\D/g, "");

      if (qDigits.length >= 3) return hayDigits.includes(qDigits);
      return hayText.includes(qText);
    });
  }, [vendors, searchValue]);



  function openDetails(v: VendorSelected) {
    setSelected(v);
    setDetailsOpen(true);
  }

  function openStatus(v: VendorSelected) {
    setSelected(v);
    setStatusOpen(true);
  }

  function downloadContract(v: VendorSelected) {
    setVendor(v);
    router.push("/pages/selected/contract-preview");
  }

  async function handleChangeStatus(vendorId: string, status: VendorStatus) {
    await updateVendorStatus(vendorId, status);
    setStatusByKey((prev) => ({ ...prev, [vendorId]: status }));
  }

  // ✅ aplica filtro (label -> status -> compara com statusByKey)
  const filteredVendors = useMemo(() => {
    const selectedLabel = (filters.status || "").trim();
    if (!selectedLabel) return vendors;

    const wantedStatus = STATUS_VALUE_BY_LABEL[selectedLabel];
    if (!wantedStatus) return vendors;

    return vendors.filter((v) => {
      const id = v.vendor_id;
      if (!id) return false;

      const current = statusByKey[id];
      return current === wantedStatus;
    });
  }, [vendors, statusByKey, filters.status]);

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
            {filteredVendors.length} registros
          </div>
        </div>
      </div>

      <Filters
        filters={filters}
        setFilters={setFilters}
        items={[
          {
            key: "status",
            label: "Status",
            options: statusOptionsLabels, // ✅ agora é string[]
            placeholder: "Todos",
          },
        ]}
        columns={6}
      />

      <SelectedTable
        rows={filteredVendors}
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

      <VendorStatusModal
        vendor={selected}
        open={statusOpen}
        onClose={() => setStatusOpen(false)}
        currentStatus={
          selected?.vendor_id
            ? statusByKey[selected.vendor_id] ?? "aguardando_assinatura"
            : "aguardando_assinatura"
        }
        onSave={handleChangeStatus}
      />

      <SearchOverlaySelected
        open={searchOpen}
        value={searchValue}
        onChange={setSearchValue}
        onCloseKeepFilter={() => setSearchOpen(false)}
        onCloseAndClear={() => {
          setSearchValue("");
          setSearchOpen(false);
        }}
        rows={vendors}
        onPick={(row) => {
          // opcional: ao clicar, já abre detalhes
          setSearchOpen(false);
          openDetails(row);
        }}
      />
    </main>
  );
}
