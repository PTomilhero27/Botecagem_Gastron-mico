"use client";

import React, { useEffect, useState } from "react";
import { Eye, Save, UploadCloud, Trash2, Settings, X } from "lucide-react";
import { RadialButton } from "./RadialButton";

export function RadialConfigMenu({
  open,
  onToggle,
  onPreview,
  onSaveDraft,
  onPublish,
  onDelete,
}: {
  open: boolean;
  onToggle: () => void;

  onPreview?: () => void;
  onSaveDraft?: () => void;
  onPublish?: () => void;
  onDelete?: () => void;
}) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (open) {
      // 3 voltas + 45° pra “parar em X”
      setRotation((r) => r + 1080 + 70);
    } else {
      // fecha girando (suave)
      setRotation((r) => r + 1080);
    }
  }, [open]);

  const actions = [
    onPreview
      ? {
          key: "preview",
          label: "Preview",
          icon: <Eye size={16} />,
          onClick: onPreview,
          dx: "-10",
          dy: "-70",
        }
      : null,
    onSaveDraft
      ? {
          key: "save",
          label: "Salvar rascunho",
          icon: <Save size={16} />,
          onClick: onSaveDraft,
          dx: "-70",
          dy: "-30",
        }
      : null,
    onPublish
      ? {
          key: "publish",
          label: "Publicar",
          icon: <UploadCloud size={16} />,
          onClick: onPublish,
          dx: "-90",
          dy: "20",
        }
      : null,
    onDelete
      ? {
          key: "delete",
          label: "Excluir",
          icon: <Trash2 size={16} />,
          onClick: onDelete,
          dx: "-50",
          dy: "60",
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    dx: string;
    dy: string;
  }>;

  if (actions.length === 0) return null;

  return (
    <div className="relative h-14 w-14">
      {actions.map((a) => (
        <RadialButton
          key={a.key}
          show={open}
          dx={a.dx}
          dy={a.dy}
          label={a.label}
          icon={a.icon}
          onClick={a.onClick}
        />
      ))}

      <button
        onClick={onToggle}
        className={[
          "flex h-14 w-14 items-center justify-center rounded-full",
          "bg-zinc-900 text-white shadow-xl",
          "transition-transform duration-700 ease-in-out",
        ].join(" ")}
        style={{ transform: `rotate(${rotation}deg)` }}
        aria-label={open ? "Fechar menu" : "Configurações"}
      >
        {open ? <X size={22} /> : <Settings size={22} />}
      </button>
    </div>
  );
}
