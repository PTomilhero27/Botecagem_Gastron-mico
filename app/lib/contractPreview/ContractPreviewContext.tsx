"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import type { VendorSelected } from "@/lib/types";

type ContractPreviewState = {
  vendor: VendorSelected | null;
  setVendor: (v: VendorSelected | null) => void;
  clear: () => void;
};

const ContractPreviewContext = createContext<ContractPreviewState | null>(null);

export function ContractPreviewProvider({ children }: { children: React.ReactNode }) {
  const [vendor, setVendor] = useState<VendorSelected | null>(null);

  const value = useMemo(
    () => ({
      vendor,
      setVendor,
      clear: () => setVendor(null),
    }),
    [vendor]
  );

  return <ContractPreviewContext.Provider value={value}>{children}</ContractPreviewContext.Provider>;
}

export function useContractPreview() {
  const ctx = useContext(ContractPreviewContext);
  if (!ctx) throw new Error("useContractPreview must be used inside ContractPreviewProvider");
  return ctx;
}
