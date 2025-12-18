"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase/client";
import { useToast } from "@/app/pages/dashboard/components/ui/toast/use-toast";

type GuardOptions = {
    redirectTo?: string;
    toastMessage?: string;
};

export function useAuthGuard(options?: GuardOptions) {
    const router = useRouter();
    const toast = useToast();
    console.log("'askdjs")
    useEffect(() => {
        let mounted = true;

        async function checkSession() {
            const { data, error } = await supabase.auth.getSession();

            if (!mounted) return;

            if (error || !data.session) {
                // Limpa tudo
                await supabase.auth.signOut();

                toast.toast(
                    {
                        variant: "error",
                        title: options?.toastMessage ??
                            "Você foi desconectado por segurança. Faça login novamente."
                    }
                );

                router.replace(options?.redirectTo ?? "/pages/login");
            }
        }

        checkSession();

        return () => {
            mounted = false;
        };
    }, [router, options]);
}
