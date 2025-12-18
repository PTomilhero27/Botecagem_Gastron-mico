"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "./components/AuthCard";
import { AuthForm } from "./components/AuthForm";
import { getSession } from "./service/auth";

export default function Login() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  useEffect(() => {

    (async () => {
      const session = await getSession();
      if (session) {
        router.push("/pages/dashboard");
        router.refresh();
        return;
      }
      setChecking(false);
    })();
  }, [router]);

  if (checking) {
    return (
      <main className="min-h-[calc(100vh-0px)] bg-zinc-50">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
          <div className="text-sm text-zinc-600">Carregando…</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="mb-4 text-center">
            <div className="text-2xl font-semibold text-zinc-900">Botecagem</div>
            <div className="mt-1 text-sm text-zinc-600">Painel de inscrições</div>
          </div>

          <AuthCard>
            <div className="text-sm font-semibold text-zinc-900">Entrar</div>
            <div className="mt-1 text-xs text-zinc-500">
              Acesso restrito para os sócios.
            </div>
            <AuthForm />
          </AuthCard>


        </div>
      </div>
    </main>
  );
}
