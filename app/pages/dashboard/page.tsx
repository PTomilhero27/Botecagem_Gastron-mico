"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Vendor } from "@/lib/types";

import { Header } from "@/app/pages/dashboard/components/Header";
import { MessageEditor } from "@/app/pages/dashboard/components/MessageEditor";
import { Filters, FiltersState } from "@/app/pages/dashboard/components/Filters";
import { Stats } from "@/app/pages/dashboard/components/Stats";
import { VendorsTable } from "@/app/pages/dashboard/components/table/VendorsTable";
import { VendorDetailsModal } from "@/app/pages/dashboard/components/modals/VendorDetailsModal";
import { WhatsappQrModal } from "@/app/pages/dashboard/components/modals/WhatsappQrModal";
import { fetchVendorsFromSheets } from "@/app/services/http";
import { mapSheetToVendor } from "@/app/services/mapper/mapVendedor";
import { SearchOverlay } from "./components/SearchOverlay";
import { useAuthGuard } from "@/app/lib/auth/useAuthGuard";
import { getWhatsappTemplate, saveWhatsappTemplate } from "@/app/services/settings";
import { toast } from "./components/ui/toast/use-toast";

export default function Dashboard() {

  useAuthGuard({
    redirectTo: "/pages/login",
    toastMessage: "Sessão encerrada por segurança.",
  });


  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);


  useEffect(() => {
    fetchVendorsFromSheets()
      .then((data) => {
        console.log("DADOS VINDOS DA PLANILHA:", data);
        setVendors(data.map(mapSheetToVendor));
      })
      .catch((err) => {
        console.error("ERRO AO BUSCAR PLANILHA:", err);
      });
  }, []);

  const [filters, setFilters] = useState<FiltersState>({
    q: "",
    tipo: "",
    tenda: "",
    energia: "",
    gas: "",
    equip: "",
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName?.toLowerCase();
      const isTyping = tag === "input" || tag === "textarea" || tag === "select";

      // "/" abre o modal (não abre se já estiver digitando em outro input)
      if (e.key === "/" && !isTyping) {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }

      // Esc: fecha e limpa filtro (mesmo se o modal não estiver aberto)
      if (e.key === "Escape") {
        if (searchOpen || filters.q) {
          e.preventDefault();
          setSearchOpen(false);
          setFilters((prev) => ({ ...prev, q: "" }));
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchOpen, filters.q]);


  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const lastSavedRef = useRef<string>("");

  useEffect(() => { getWhatsappTemplate() .then((row) => setMessage(row.value)) .catch(console.error); }, []);

  const setLastSaved = (v: string) => {
    lastSavedRef.current = v;
  };

  async function saveIfDirty(next: string) {
    if (isSaving) return;

    const normalized = next.replace(/\r\n/g, "\n");

    if (normalized === lastSavedRef.current) return;

    try {
      setIsSaving(true);
      await saveWhatsappTemplate(normalized);
      setLastSaved(normalized);

    } catch (e) {
      toast({
        variant: "error",
        title: "Erro ao salvar mensagem.",
      });

    } finally {
      setIsSaving(false);
    }
  }

  const [selected, setSelected] = useState<Vendor | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const tipos = useMemo(() => Array.from(new Set(vendors.map((s) => s.tipo_operacao))).sort(), [vendors]);
  const tendas = useMemo(() => Array.from(new Set(vendors.map((s) => s.tenda))).sort(), [vendors]);

  const filtered = useMemo(() => {
    const q = filters.q.toLowerCase();
    const equip = filters.equip.toLowerCase();

    return vendors.filter((r) => {
      const matchQ =
        !q ||
        [r.nome_empresarial, r.nome_fantasia, r.cnpj, r.telefone, r.responsavel, r.redes_sociais, r.produto_principal].some((x) =>
          (x || "").toLowerCase().includes(q)
        );

      const matchTipo = !filters.tipo || r.tipo_operacao === filters.tipo;
      const matchTenda = !filters.tenda || r.tenda === filters.tenda;
      const matchEnergia = !filters.energia || r.energia === filters.energia;
      const matchGas = !filters.gas || r.gas === filters.gas;
      const matchEquip = !equip || (r.equipamentos.join(" ") || "").toLowerCase().includes(equip);

      return matchQ && matchTipo && matchTenda && matchEnergia && matchGas && matchEquip;
    });
  }, [filters, vendors]);


  const total = vendors.length;
  const totalFiltered = filtered.length;

  const countByTipo = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((r) => map.set(r.tipo_operacao, (map.get(r.tipo_operacao) || 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const energiaSim = useMemo(() => filtered.filter((r) => r.energia === "Sim").length, [filtered]);
  const gasSim = useMemo(() => filtered.filter((r) => r.gas === "Sim").length, [filtered]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <Header
        total={total}
        filtered={totalFiltered}
        onClear={() =>
          setFilters({
            q: "",
            tipo: "",
            tenda: "",
            energia: "",
            gas: "",
            equip: "",
          })
        }
      />

      <MessageEditor
        message={message}
        setMessage={setMessage}
        onBlurSave={saveIfDirty}
        saving={isSaving}
      />

      <Stats
        total={total}
        filtered={totalFiltered}
        tiposCount={countByTipo.length}
        topTiposHint={countByTipo.slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(" • ") || "—"}
        energiaSim={energiaSim}
        gasSim={gasSim}
      />

      <Filters filters={filters} setFilters={setFilters} tipos={tipos} tendas={tendas} />

      <VendorsTable
        rows={filtered}
        onQr={(v) => {
          setSelected(v);
          setQrOpen(true);
          setDetailsOpen(false);
        }}
        onDetails={(v) => {
          setSelected(v);
          setDetailsOpen(true);
          setQrOpen(false);
        }}
      />

      <VendorDetailsModal vendor={selected} open={detailsOpen} onClose={() => setDetailsOpen(false)} />

      <WhatsappQrModal vendor={selected} message={message} open={qrOpen} onClose={() => setQrOpen(false)} />

      <SearchOverlay
        open={searchOpen}
        value={filters.q}
        onChange={(v) => setFilters((prev) => ({ ...prev, q: v }))}
        onCloseKeepFilter={() => setSearchOpen(false)}
        onCloseAndClear={() => {
          setSearchOpen(false);
          setFilters((prev) => ({ ...prev, q: "" }));
        }}
        rows={vendors}
      />

    </main>
  );
}
