"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthGuard } from "@/app/lib/auth/useAuthGuard";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

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
import { StatusStats } from "./components/StatusStats";

import { SelectContractModal } from "./components/SelectContractModal";
import { useToast } from "@/app/pages/dashboard/components/ui/toast/use-toast";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type SelectedTemplate = {
  id: string;
  title: string;
  status?: string | null;
  has_registration?: boolean | null;
};

export default function SelecionadosPage() {
  useAuthGuard({
    redirectTo: "/pages/login",
    toastMessage: "Sessão encerrada por segurança.",
  });

  const router = useRouter();
  const toast = useToast();
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

  // ✅ contrato global
  const [contractOpen, setContractOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<SelectedTemplate | null>(null);

  // ✅ opções do select em "label bonito"
  const statusOptionsLabels = useMemo(() => {
    return STATUS_OPTIONS.map((s) => STATUS_LABEL[s]);
  }, []);

  // ✅ carrega vendors + statuses
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

  // ✅ NOVO: ao entrar na tela, busca o contrato selected
  useEffect(() => {
    let mounted = true;

    async function loadSelectedTemplate() {
      const { data, error } = await supabase
        .from("document_templates")
        .select("id,title,status,has_registration")
        .eq("status", "selected")
        .limit(1)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.error(error);
        // opcional: toast só se quiser
        // toast.toast({ variant: "error", title: "Erro ao carregar contrato selecionado" });
        return;
      }

      setSelectedTemplate((data as any) ?? null);
    }

    loadSelectedTemplate();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
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
    if (!selectedTemplate) {
      toast.toast({
        variant: "error",
        title: "Selecione um contrato antes de baixar",
      });
      return;
    }

    // por enquanto: só navega pro preview (depois a gente passa templateId no context)
    setVendor(v as any);
    router.push("/pages/selected/contract-preview");
  }

  async function handleChangeStatus(vendorId: string, status: VendorStatus) {
    await updateVendorStatus(vendorId, status);
    setStatusByKey((prev) => ({ ...prev, [vendorId]: status }));
  }

  const filteredVendors = useMemo(() => {
    const selectedLabel = (filters.status || "").trim();

    if (!selectedLabel) {
      return filteredBySearch.filter((v) => {
        const id = v.vendor_id;
        if (!id) return false;
        return statusByKey[id] !== "desistente";
      });
    }

    const wantedStatus = STATUS_VALUE_BY_LABEL[selectedLabel];
    if (!wantedStatus) return filteredBySearch;

    return filteredBySearch.filter((v) => {
      const id = v.vendor_id;
      if (!id) return false;
      return statusByKey[id] === wantedStatus;
    });
  }, [filteredBySearch, statusByKey, filters.status]);

  const statusCounts = useMemo(() => {
    const counts: Record<VendorStatus, number> = {
      aguardando_assinatura: 0,
      aguardando_pagamento: 0,
      confirmado: 0,
      desistente: 0,
    };

    vendors.forEach((v) => {
      const id = v.vendor_id;
      if (!id) return;

      const status = statusByKey[id] ?? "aguardando_assinatura";
      counts[status]++;
    });

    return counts;
  }, [vendors, statusByKey]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/pages/home" },
          { label: "Selecionados" },
        ]}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-3xl font-extrabold tracking-tight text-zinc-900">
            Selecionados <span className="text-orange-500">Botecagem</span>
          </div>
          <div className="mt-1 text-sm text-zinc-600">
            {filteredVendors.length} registros
          </div>

          <div className="mt-3 text-sm text-zinc-700">
            <span className="font-semibold">Contrato selecionado:</span>{" "}
            {selectedTemplate ? (
              <span className="font-semibold text-zinc-900">
                {selectedTemplate.title}
              </span>
            ) : (
              <span className="text-zinc-500 italic">
                nenhum (clique em “Selecionar contrato”)
              </span>
            )}
          </div>
        </div>

        {/* ✅ só o botão de selecionar */}
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => setContractOpen(true)}
            className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-extrabold text-white shadow hover:bg-orange-600"
          >
            Selecionar contrato
          </button>
        </div>
      </div>

      <StatusStats total={vendors.length} byStatus={statusCounts} />

      <Filters
        filters={filters}
        setFilters={setFilters}
        items={[
          {
            key: "status",
            label: "Status",
            options: statusOptionsLabels,
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
          setSearchOpen(false);
          openDetails(row);
        }}
      />

      <SelectContractModal
        open={contractOpen}
        onClose={() => setContractOpen(false)}
        selectedTemplateId={selectedTemplate?.id ?? null}
        onSelected={(tpl) => setSelectedTemplate(tpl)}
      />
    </main>
  );
}
