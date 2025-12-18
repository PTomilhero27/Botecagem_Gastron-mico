"use client";

import * as React from "react";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none",
        "focus:ring-2 focus:ring-zinc-200",
        props.className ?? "",
      ].join(" ")}
    />
  );
}
