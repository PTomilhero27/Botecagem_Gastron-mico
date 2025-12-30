"use client";

export function EditChoiceModal({
  open,
  onClose,
  onEditClause,
  onEditIncisos,
}: {
  open: boolean;
  onClose: () => void;
  onEditClause: () => void;
  onEditIncisos: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
        <div className="text-lg font-semibold">O que você quer editar?</div>

        <div className="space-y-2">
          <button
            onClick={() => {
              onClose();
              onEditClause();
            }}
            className="w-full rounded-xl border px-4 py-3 text-left hover:bg-zinc-50"
          >
            Cláusula (título e texto)
          </button>

          <button
            onClick={() => {
              onClose();
              onEditIncisos();
            }}
            className="w-full rounded-xl border px-4 py-3 text-left hover:bg-zinc-50"
          >
            Incisos
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="rounded-xl border px-4 py-2">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
