"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import type { Editor } from "@tiptap/react";
import type { Range } from "@tiptap/core";
import type { SlashItem } from "./slashItems";

export type SlashMenuRef = {
  onKeyDown: (e: KeyboardEvent) => boolean;
};

function clampIndex(i: number, len: number) {
  if (len <= 0) return 0;
  return ((i % len) + len) % len;
}

export const SlashMenu = forwardRef<
  SlashMenuRef,
  {
    items: SlashItem[];
    editor: Editor;
    range: Range;
    command: (item: SlashItem) => void;
  }
>(function SlashMenuInner({ items, command }, ref) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => setSelectedIndex(0), [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: (e: KeyboardEvent) => {
      if (!items.length) return false;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => clampIndex(i + 1, items.length));
        return true;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => clampIndex(i - 1, items.length));
        return true;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        command(items[selectedIndex]);
        return true;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        return true;
      }
      return false;
    },
  }));

  return (
    <div className="w-80 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl">
      {items.length === 0 ? (
        <div className="px-3 py-2 text-sm text-zinc-500">Nenhum comando</div>
      ) : (
        items.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            onMouseEnter={() => setSelectedIndex(idx)}
            onClick={() => command(item)}
            className={[
              "w-full px-3 py-2 text-left",
              idx === selectedIndex ? "bg-orange-50" : "bg-white",
              "hover:bg-orange-50",
            ].join(" ")}
          >
            <div className="text-sm font-semibold text-zinc-900">{item.title}</div>
            {item.description ? (
              <div className="text-xs text-zinc-500">{item.description}</div>
            ) : null}
          </button>
        ))
      )}
    </div>
  );
});
