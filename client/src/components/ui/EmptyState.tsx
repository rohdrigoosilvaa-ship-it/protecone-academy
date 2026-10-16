import type { ReactNode } from "react";

export function EmptyState({ icone, titulo, descricao, acao, className = "" }: { icone?: ReactNode; titulo: string; descricao?: string; acao?: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-[var(--radius-card-lg)] border border-dashed border-[var(--color-gray-light)] bg-white px-6 py-16 text-center ${className}`}>
      {icone && <div className="mb-4 text-[var(--color-gray-mid)]">{icone}</div>}
      <h3 className="text-base font-bold text-[var(--color-ink)]">{titulo}</h3>
      {descricao && <p className="mt-1 max-w-sm text-sm text-[var(--color-gray-mid)]">{descricao}</p>}
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  );
}
