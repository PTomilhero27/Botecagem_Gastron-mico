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
import { fetchStatusesByVendorIds, updateVendorStatus } from "@/app/services/settings";
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

const YESNO_OPTIONS = ["Com cadastro", "Sem cadastro"] as const;

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

  const [statusByKey, setStatusByKey] = useState<Record<string, VendorStatus | undefined>>({});
  const [statusOpen, setStatusOpen] = useState(false);

  // ✅ NOVO: filtros menu/equip também
  const [filters, setFilters] = useState<FiltersState>({
    status: "",
    menu: "",
  });

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [contractOpen, setContractOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SelectedTemplate | null>(null);

  const statusOptionsLabels = useMemo(() => {
    return STATUS_OPTIONS.map((s) => STATUS_LABEL[s]);
  }, []);

  async function ensureVendorStatusRows(vendorIds: string[]) {
    const ids = Array.from(new Set(vendorIds.filter(Boolean)));
    if (!ids.length) return;

    const { data: existing, error: exErr } = await supabase
      .from("vendor_status")
      .select("vendor_id")
      .in("vendor_id", ids);

    if (exErr) throw exErr;

    const existingSet = new Set((existing ?? []).map((r: any) => String(r.vendor_id)));
    const missing = ids.filter((id) => !existingSet.has(id));

    if (missing.length) {
      const payload = missing.map((vendor_id) => ({
        vendor_id,
        status: "selecionado",
        addendum_template_ids: [],
      }));

      const { error: insErr } = await supabase.from("vendor_status").upsert(payload, {
        onConflict: "vendor_id",
      });

      if (insErr) throw insErr;
    }
  }

  // ✅ carrega vendors + status
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await fetchVendorsSelected();
        const mapped = data.map(mapRegistrySheetToVendor);

        const sheetIds = mapped.map((v) => v.vendor_id).filter(Boolean);

        await ensureVendorStatusRows(sheetIds);

        const statusRows = await fetchStatusesByVendorIds(sheetIds);

        const mapStatus: Record<
          string,
          {
            status: VendorStatus;
            addendum_template_ids: string[];
            merchant_id: string | null;
            equipment_profile_id: string | null;
          }
        > = {};

        for (const row of statusRows) {
          mapStatus[row.vendor_id] = {
            status: row.status as VendorStatus,
            addendum_template_ids: row.addendum_template_ids ?? [],
            merchant_id: row.merchant_id ?? null,
            equipment_profile_id: row.equipment_profile_id ?? null,
          };
        }

        if (!mounted) return;

        const enriched = mapped.map((v) => {
          const vs = mapStatus[v.vendor_id];

          return {
            ...v,
            status: vs?.status ?? "selecionado",
            addendum_template_ids: vs?.addendum_template_ids ?? [],
            merchant_id: vs?.merchant_id ?? null,
            equipment_profile_id: vs?.equipment_profile_id ?? null,
          };
        });

        const nextStatusByKey: Record<string, VendorStatus> = {};
        for (const v of enriched) {
          if (v.vendor_id) nextStatusByKey[v.vendor_id] = v.status as VendorStatus;
        }

        setStatusByKey(nextStatusByKey);
        setVendors(enriched);
      } catch (e) {
        console.error(e);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  // ✅ contrato selected
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

    setVendor(v as any);
    router.push("/pages/selected/contract-preview");
  }

  async function handleChangeStatus(vendorId: string, status: VendorStatus) {
    await updateVendorStatus(vendorId, status);
    setStatusByKey((prev) => ({ ...prev, [vendorId]: status }));
  }

  // ✅ APLICA: status + menu + equip
  const filteredVendors = useMemo(() => {
    // 1) status
    const selectedLabel = (filters.status || "").trim();

    let base = filteredBySearch;

    if (!selectedLabel) {
      base = base.filter((v) => {
        const id = v.vendor_id;
        if (!id) return false;
        return statusByKey[id] !== "desistente";
      });
    } else {
      const wantedStatus = STATUS_VALUE_BY_LABEL[selectedLabel];
      if (wantedStatus) {
        base = base.filter((v) => {
          const id = v.vendor_id;
          if (!id) return false;
          return statusByKey[id] === wantedStatus;
        });
      }
    }

    // 2) menu
    const menuFilter = (filters.menu || "").trim();
    if (menuFilter === "Com cadastro") {
      base = base.filter((v) => Boolean((v as any).merchant_id));
    } else if (menuFilter === "Sem cadastro") {
      base = base.filter((v) => !Boolean((v as any).merchant_id));
    }

    // 3) equip
    const equipFilter = (filters.equip || "").trim();
    if (equipFilter === "Com cadastro") {
      base = base.filter((v) => Boolean((v as any).equipment_profile_id));
    } else if (equipFilter === "Sem cadastro") {
      base = base.filter((v) => !Boolean((v as any).equipment_profile_id));
    }

    return base;
  }, [filteredBySearch, statusByKey, filters.status, filters.menu, filters.equip]);

  const statusCounts = useMemo(() => {
    const counts: Record<VendorStatus, number> = {
      aguardando_assinatura: 0,
      aguardando_pagamento: 0,
      confirmado: 0,
      desistente: 0,
      selecionado: 0,
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
          {
            key: "menu",
            label: "Menu",
            options: Array.from(YESNO_OPTIONS),
            placeholder: "Todos",
          }

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
