"use client";

import { X, Store, UtensilsCrossed, PlugZap, CheckCircle } from "lucide-react";

type Props = {
    open: boolean;
    onClose: () => void;
    loading?: boolean;
    error?: string | null;
    data?: any | null;
};

function moneyBR(v: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0);
}

export function RegistrationModal({ open, onClose, loading, error, data }: Props) {
    if (!open) return null;

    const merchant = data?.merchant;
    const menu = data?.menu ?? [];
    const equipment = data?.equipment;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
                aria-hidden="true"
            />

            <div className="relative w-full max-w-3xl rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-zinc-200 p-5">
                    <div className="min-w-0">
                        <p className="text-xs font-medium text-zinc-500">Cadastro enviado</p>
                        <h3 className="truncate text-lg font-extrabold text-zinc-900">
                            {merchant?.pdv_name ?? "Detalhes do cadastro"}
                        </h3>
                        {merchant?.cpf_cnpj && (
                            <p className="mt-1 text-sm text-zinc-600">
                                Documento: <span className="font-medium text-zinc-800">{merchant.cpf_cnpj}</span>
                            </p>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 text-zinc-600 hover:bg-zinc-100"
                        aria-label="Fechar"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="max-h-[75vh] overflow-auto p-5">
                    {loading && (
                        <div className="rounded-2xl bg-zinc-50 p-6 ring-1 ring-zinc-200">
                            <p className="text-sm font-semibold text-zinc-900">Carregando…</p>
                            <p className="mt-1 text-sm text-zinc-600">Buscando informações do cadastro.</p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="rounded-2xl bg-red-50 p-6 ring-1 ring-red-100">
                            <p className="text-sm font-semibold text-red-900">Não foi possível carregar</p>
                            <p className="mt-1 text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    {!loading && !error && data && (
                        <div className="space-y-4">
                            {/* Merchant */}
                            <section className="rounded-2xl bg-white p-5 ring-1 ring-zinc-200">
                                {/* Header */}
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-2xl bg-zinc-50 p-3 ring-1 ring-zinc-200">
                                            <Store className="h-5 w-5 text-zinc-700" />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                                Dados do PDV
                                                {merchant?.person_type ? (
                                                    <span className="rounded-full bg-emerald-50 ml-4 px-2 py-0.5 text-xs font-semibold text-zinc-700">
                                                        {String(merchant.person_type).toUpperCase()}
                                                    </span>
                                                ) : null}
                                            </p>

                                            <h4 className="truncate text-lg font-extrabold text-zinc-900">
                                                {merchant?.pdv_name ?? "—"}
                                            </h4>

                                        </div>
                                    </div>

                                    <div className="rounded-xl flex items-center gap-3 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100">
                                        Cadastro recebido <CheckCircle width={18} height={18} />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    {/* Responsável */}
                                    <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
                                        <p className="text-xs font-medium text-zinc-500">Responsável</p>
                                        <p className="mt-1 text-sm font-semibold text-zinc-900">
                                            {merchant?.full_name ?? "—"}
                                        </p>
                                    </div>

                                    {/* Contato */}
                                    <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
                                        <p className="text-xs font-medium text-zinc-500">Contato</p>
                                        <p className="mt-1 text-sm text-zinc-900">
                                            <span className="font-semibold">{merchant?.phone ?? "—"}</span>
                                            {merchant?.email ? (
                                                <span className="text-zinc-500"> • {merchant.email}</span>
                                            ) : null}
                                        </p>
                                    </div>

                                    {/* Qtd maquininhas */}
                                    <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
                                        <p className="text-xs font-medium text-zinc-500">Qtd. Maquininhas</p>
                                        <p className="mt-1 text-sm font-extrabold text-zinc-900">
                                            {merchant?.machines_qty ?? 0}
                                        </p>
                                    </div>

                                    {/* Pix */}
                                    <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
                                        <p className="text-xs font-medium text-zinc-500">Pix</p>
                                        <p className="mt-1 break-all text-sm font-semibold text-zinc-900">
                                            {merchant?.pix_key ?? "—"}
                                        </p>
                                    </div>

                                    {/* Endereço */}
                                    <div className="sm:col-span-2 rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
                                        <p className="text-xs font-medium text-zinc-500">Endereço</p>
                                        <p className="mt-1 text-sm text-zinc-900">
                                            {merchant?.address_full ?? "—"}
                                        </p>
                                        <p className="mt-1 text-xs text-zinc-600">
                                            {(merchant?.address_city ?? "—") +
                                                (merchant?.address_state ? `/${merchant.address_state}` : "")}
                                            {merchant?.address_zipcode ? ` • CEP ${merchant.address_zipcode}` : ""}
                                        </p>
                                    </div>
                                </div>
                            </section>


                            {/* Menu */}
                            <section className="rounded-2xl bg-white p-5 ring-1 ring-zinc-200">
                                <div className="mb-3 flex items-center gap-2">
                                    <div className="rounded-xl bg-zinc-50 p-2 ring-1 ring-zinc-200">
                                        <UtensilsCrossed className="h-5 w-5 text-zinc-700" />
                                    </div>
                                    <h4 className="text-sm font-extrabold text-zinc-900">Cardápio</h4>
                                </div>

                                {menu.length === 0 ? (
                                    <p className="text-sm text-zinc-600">Nenhuma categoria cadastrada.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {menu.map((c: any) => (
                                            <div key={c.id} className="rounded-xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
                                                <p className="text-sm font-extrabold text-zinc-900">{c.name}</p>

                                                {(c.products ?? []).length === 0 ? (
                                                    <p className="mt-2 text-sm text-zinc-600">Sem produtos.</p>
                                                ) : (
                                                    <ul className="mt-2 space-y-1">
                                                        {c.products.map((p: any) => (
                                                            <li key={p.id} className="flex items-center justify-between gap-3">
                                                                <span className="text-sm text-zinc-800">{p.name}</span>
                                                                <span className="text-sm font-semibold text-zinc-900">
                                                                    {moneyBR(p.price)}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Equipment */}
                            <section className="rounded-2xl bg-white p-5 ring-1 ring-zinc-200">
                                <div className="mb-3 flex items-center gap-2">
                                    <div className="rounded-xl bg-zinc-50 p-2 ring-1 ring-zinc-200">
                                        <PlugZap className="h-5 w-5 text-zinc-700" />
                                    </div>
                                    <h4 className="text-sm font-extrabold text-zinc-900">Equipamentos</h4>
                                </div>

                                {!equipment ? (
                                    <p className="text-sm text-zinc-600">Nenhuma informação de equipamentos cadastrada.</p>
                                ) : (
                                    <>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div>
                                                <p className="text-xs font-medium text-zinc-500">Tomadas 110V</p>
                                                <p className="text-sm font-semibold text-zinc-900">
                                                    {equipment.profile?.outlets110 ?? 0}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-zinc-500">Tomadas 220V</p>
                                                <p className="text-sm font-semibold text-zinc-900">
                                                    {equipment.profile?.outlets220 ?? 0}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-zinc-500">Outras</p>
                                                <p className="text-sm font-semibold text-zinc-900">
                                                    {equipment.profile?.other_outlets_qty ?? 0}{" "}
                                                    {equipment.profile?.other_outlets_label
                                                        ? `(${equipment.profile.other_outlets_label})`
                                                        : ""}
                                                </p>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <p className="text-xs font-medium text-zinc-500">Observações</p>
                                                <p className="text-sm text-zinc-900">{equipment.profile?.notes ?? "—"}</p>
                                            </div>
                                        </div>

                                        {(equipment.items ?? []).length > 0 && (
                                            <div className="mt-4 rounded-xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
                                                <p className="text-xs font-bold uppercase tracking-wide text-zinc-600">
                                                    Itens
                                                </p>
                                                <ul className="mt-2 space-y-1">
                                                    {equipment.items.map((it: any) => (
                                                        <li key={it.id} className="flex items-center justify-between gap-3">
                                                            <span className="text-sm text-zinc-800">{it.name}</span>
                                                            <span className="text-sm font-semibold text-zinc-900">x{it.qty}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </>
                                )}
                            </section>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
