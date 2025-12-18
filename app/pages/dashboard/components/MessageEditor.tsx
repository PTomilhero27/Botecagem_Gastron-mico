"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Token = { label: string; value: string };

export function MessageEditor({
  message,
  setMessage,
}: {
  message: string;
  setMessage: (v: string) => void;
}) {
  const TOKENS: Token[] = [
    { label: "Nome fantasia", value: "{nome_fantasia}" },
    { label: "Nome responsável", value: "{nome_responsavel}" },
    { label: "Telefone", value: "{telefone}" },
    { label: "Tipo operação", value: "{tipo_operacao}" },
    { label: "Produto principal", value: "{produto_principal}" },
    { label: "Ticket médio", value: "{ticket_medio}" },
    { label: "Tenda", value: "{tenda}" },
    { label: "Energia", value: "{energia}" },
    { label: "Gás", value: "{gas}" },
  ];

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  // onde inserir (range do texto que substitui o "/texto")
  const [range, setRange] = useState<{ start: number; end: number } | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = !q
      ? TOKENS
      : TOKENS.filter(
          (t) =>
            t.label.toLowerCase().includes(q) ||
            t.value.toLowerCase().includes(q)
        );

    return list;
  }, [query]);

  useEffect(() => {
    // reseta seleção quando muda resultado
    setActive(0);
  }, [query, open]);

  function closeMenu() {
    setOpen(false);
    setQuery("");
    setActive(0);
    setRange(null);
  }

  function insertToken(token: string) {
    const el = taRef.current;
    if (!el) return;

    const start = range?.start ?? (el.selectionStart ?? 0);
    const end = range?.end ?? (el.selectionEnd ?? start);

    const v = el.value;
    const next = v.slice(0, start) + token + v.slice(end);
    setMessage(next);

    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });

    closeMenu();
  }

  // fecha clicando fora
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (!open) return;
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target) && wrapRef.current && !wrapRef.current.contains(target)) {
        closeMenu();
      }
    }
    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  return (
    <div ref={wrapRef} className="relative mt-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-zinc-900">Mensagem padrão do WhatsApp</div>
          <div className="mt-1 text-xs text-zinc-500">
            Digite <span className="font-semibold">/</span> para inserir referência (ex: {"{nome_fantasia}"}).
          </div>
        </div>
      </div>

      <textarea
        ref={taRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="mt-3 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-200"
        rows={3}
        onKeyDown={(e) => {
          const el = e.currentTarget;

          // abre com "/" (não grava o / no texto)
          if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();

            const cursor = el.selectionStart ?? 0;
            // range começa no cursor (onde seria o "/"), e vai até cursor (por enquanto)
            setRange({ start: cursor, end: cursor });
            setOpen(true);
            setQuery("");
            setActive(0);
            return;
          }

          if (!open) return;

          if (e.key === "Escape") {
            e.preventDefault();
            closeMenu();
            return;
          }

          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(filtered.length - 1, a + 1));
            return;
          }

          if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(0, a - 1));
            return;
          }

          if (e.key === "Enter") {
            // Enter no menu: insere token selecionado
            e.preventDefault();
            const item = filtered[active];
            if (item) insertToken(item.value);
            return;
          }

          // enquanto o menu está aberto, capturamos texto digitado como "query"
          // (inclui letras, números, espaço, backspace)
          if (e.key === "Backspace") {
            e.preventDefault();
            setQuery((q) => q.slice(0, -1));
            return;
          }

          // caracteres normais
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            setQuery((q) => q + e.key);
            return;
          }
        }}
      />

      {/* dropdown estilo VSCode */}
      {open ? (
        <div
          ref={menuRef}
          className="absolute left-4 right-4 top-[calc(100%-6px)] z-50 mt-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2">
            <div className="text-xs text-zinc-500">
              <span className="font-semibold text-zinc-700">/</span>
              {query ? <span className="ml-1 text-zinc-700">{query}</span> : <span className="ml-1">buscar referência…</span>}
            </div>
            <div className="text-[11px] text-zinc-400">↑↓ navegar • Enter inserir • Esc fechar</div>
          </div>

          {filtered.length === 0 ? (
            <div className="px-3 py-3 text-sm text-zinc-500">Nenhuma referência encontrada.</div>
          ) : (
            <ul className="max-h-56 overflow-auto py-1">
              {filtered.map((t, idx) => (
                <li key={t.value}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => insertToken(t.value)}
                    className={
                      "flex w-full items-center justify-between px-3 py-2 text-left " +
                      (idx === active ? "bg-zinc-100" : "hover:bg-zinc-50")
                    }
                  >
                    <div>
                      <div className="text-sm font-semibold text-zinc-900">{t.label}</div>
                      <div className="text-xs text-zinc-500">{t.value}</div>
                    </div>
                    <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-700">
                      inserir
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
