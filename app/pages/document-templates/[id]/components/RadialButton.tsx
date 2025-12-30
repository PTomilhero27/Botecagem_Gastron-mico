"use client";

import React from "react";

export function RadialButton({
  show,
  dx,
  dy,
  icon,
  label,
  onClick,
}: {
  show: boolean;
  // deslocamento relativo (sem trig)
  // ex: dx="-90%" dy="-10%"
  dx: string;
  dy: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "absolute right-0 bottom-0",
        "flex items-center gap-2",
        "rounded-full bg-white px-4 py-2 text-sm font-medium",
        "text-zinc-700 shadow-lg",
        "transition-all duration-300 ease-out",
        show ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none",
      ].join(" ")}
      style={{
        // Raio responsivo (quanto o menu “abre”)
        // - min 72px
        // - ideal 10vw
        // - max 120px
        // Você pode ajustar esses valores.
        ["--r" as any]: "clamp(72px, 10vw, 120px)",
        // dx/dy em % (coerente em telas diferentes)
        ["--dx" as any]: dx,
        ["--dy" as any]: dy,

        transform: show
          ? `translate(calc(var(--r) * (var(--dx) / 100)), calc(var(--r) * (var(--dy) / 100)))`
          : "translate(0,0)",
      }}
    >
      <span className="text-orange-500">{icon}</span>
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}
