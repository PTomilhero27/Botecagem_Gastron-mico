export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <div className="text-sm font-semibold text-zinc-900">{title}</div>
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50"
          >
            Fechar
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
