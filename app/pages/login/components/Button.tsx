"use client";

import * as React from "react";

export function Button({
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={[
        "w-full rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white",
        "hover:bg-zinc-800 disabled:opacity-50",
        props.className ?? "",
      ].join(" ")}
    >
      {loading ? "Entrando..." : props.children}
    </button>
  );
}
