"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="mb-4 flex items-center gap-2 text-sm text-zinc-500">
      {items.map((c, i) => (
        <div key={i} className="flex items-center gap-2">
          {c.href ? (
            <Link href={c.href} className="hover:text-zinc-900">
              {c.label}
            </Link>
          ) : (
            <span className="text-zinc-900 font-medium">{c.label}</span>
          )}
          {i < items.length - 1 ? <ChevronRight className="h-4 w-4" /> : null}
        </div>
      ))}
    </nav>
  );
}
