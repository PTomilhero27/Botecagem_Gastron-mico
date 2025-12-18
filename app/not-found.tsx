"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase/client";
import { toast } from "@/app/pages/dashboard/components/ui/toast/use-toast";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // toast + logoff por segurança (se você quiser mesmo "limpar tudo")
    toast({
      variant: "warning",
      title: "Você foi desconectado por segurança.",
      description: "Página inválida detectada. Faça login novamente.",
    });

    // opcional: encerra sessão no supabase
    supabase.auth.signOut();

    // redireciona pro login
    router.replace("/pages/login");
  }, [router]);

  return null;
}
