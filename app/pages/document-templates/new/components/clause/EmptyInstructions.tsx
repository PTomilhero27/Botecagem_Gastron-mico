"use client";

export function EmptyInstructions() {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">
      <div className="text-sm font-medium text-zinc-700">
        Nenhum bloco no contrato ainda
      </div>
      <div className="mt-1 text-sm text-zinc-500">
        Clique no botão <b>+</b> para adicionar uma cláusula ou texto livre.
      </div>
    </div>
  );
}
