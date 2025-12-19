"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase/client";
import { registerAuthListener } from "@/app/lib/auth/authListener";
import { ContractPreviewProvider } from "../lib/contractPreview/ContractPreviewContext";

function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 grid place-items-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
        <div className="text-sm text-zinc-600">Carregando…</div>
      </div>
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  const isPublicRoute = useMemo(() => {
    const p = pathname ?? "";
    if (!p) return false;
    return p === "/pages/login" || p.startsWith("/pages/login/");
  }, [pathname]);

  useEffect(() => {
    const nav = {
      push: (url: string) => router.push(url),
      replace: (url: string) => router.replace(url),
    };

    const unsubscribe = registerAuthListener(nav as any);

    if (isPublicRoute) {
      setReady(true);
      return () => unsubscribe?.();
    }

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!data.session) {
          router.replace("/pages/login");
          return;
        }
        setReady(true);
      })
      .catch(() => router.replace("/pages/login"));

    return () => unsubscribe?.();
  }, [router, isPublicRoute]);

  return (
    <ContractPreviewProvider>
      {!ready ? <FullScreenLoader /> : children}
    </ContractPreviewProvider>
  );
}
