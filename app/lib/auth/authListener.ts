import { supabase } from "@/app/lib/supabase/client";
import { toast } from "@/app/pages/dashboard/components/ui/toast/use-toast";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function registerAuthListener(router: AppRouterInstance) {

  const { data } = supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      toast({
        variant: "warning",
        title: "Você foi desconectado por segurança.",
        description: "Faça login novamente para continuar.",
      });

      router.replace("/pages/login");
    }
  });

  return () => data.subscription.unsubscribe();
}
