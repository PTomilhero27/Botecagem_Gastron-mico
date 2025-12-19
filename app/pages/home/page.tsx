"use client";

import Link from "next/link";
import { useMemo } from "react";
import { LayoutGrid, Users, FileSignature, Settings } from "lucide-react";

import { useAuthGuard } from "@/app/lib/auth/useAuthGuard";
import { supabase } from "@/app/lib/supabase/client";

function CardLink({
  href,
  title,
  desc,
  icon,
  badge,
}: {
  href: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-zinc-100 text-zinc-800">
            {icon}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
              {badge ? badge : null}
            </div>
            <p className="mt-1 text-sm text-zinc-600">{desc}</p>
          </div>
        </div>

        <div className="text-zinc-300 transition group-hover:text-zinc-400">→</div>
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
        <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-zinc-100 blur-2xl" />
      </div>
    </Link>
  );
}

export default function HomePage() {
  useAuthGuard({
    redirectTo: "/pages/login",
    toastMessage: "Sessão encerrada por segurança.",
  });

  const today = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    // seu auth guard já vai redirecionar quando a sessão cair
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-zinc-900 text-white">
            <LayoutGrid width={20} />
          </div>

          <div>
            <h1 className="text-xl font-semibold text-zinc-900">Painel Botecagem</h1>
            <p className="text-sm text-zinc-600 capitalize">{today}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-fit rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
        >
          Sair
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CardLink
          href="/pages/dashboard"
          title="Dashboard cadastrados"
          desc="Todos que preencheram o primeiro formulário."
          icon={<Users width={18} />}
          badge={
            <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-700">
              principal
            </span>
          }
        />

        <CardLink
          href="/pages/selected"
          title="Dashboard Selecionados"
          desc="selecionados para fazer parte dos expositores"
          icon={<FileSignature width={18} />}
          badge={
            <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-700">
              em breve
            </span>
          }
        />

      </div>


    </main>
  );
}
